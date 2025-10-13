import { request } from 'undici'
import { retry } from '../util/retry.js'
import { extractByJSONPath } from '../util/jsonpath.js'
type Vars = Record<string, any>
export async function apiAuthClientCredentials(vars:Vars, svcName:string, cfg:{ tokenUrl: string, clientId: string, clientSecret: string, scope?: string }) {
  const body = new URLSearchParams({ grant_type: 'client_credentials', client_id: cfg.clientId, client_secret: cfg.clientSecret, scope: cfg.scope || '' })
  const res = await request(cfg.tokenUrl, { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  if (res.statusCode >= 300) throw new Error(`oauth2 ${svcName} falhou ${res.statusCode}`)
  const json = await res.body.json(); vars.tokens = vars.tokens || {}; vars.tokens[svcName] = (json as any).access_token; return json
}
export async function apiCall(vars:Vars, method:string, url:string, options?:{ headers?: Record<string,string>, body?: any, save?: Record<string,string> }) {
  const res = await retry(async ()=> request(url, { method: method.toUpperCase(), headers: { 'Content-Type':'application/json', ...(options?.headers||{}) }, body: options?.body ? JSON.stringify(options.body) : undefined }), { retries: 2 })
  const text = await res.body.text(); let json: any = null; try { json = JSON.parse(text) } catch {}
  if (options?.save && json){ for (const [varName, jp] of Object.entries(options.save)){ const val = extractByJSONPath(json, jp); if (val !== undefined) vars[varName] = val } }
  return { status: res.statusCode, json, text }
}
export async function apiPoll(vars:Vars, url:string, condExpr:(j:any)=>boolean, timeoutMs=20000, intervalMs=1000){
  const end = Date.now() + timeoutMs; let last:any = null
  while (Date.now() < end){ const { json } = await apiCall(vars, 'GET', url); last = json; if (condExpr(json)) return { ok: true, json }; await new Promise(r=>setTimeout(r, intervalMs)) }
  return { ok: false, json: last }
}
