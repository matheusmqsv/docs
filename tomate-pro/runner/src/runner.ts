import fs from 'fs'
import YAML from 'yaml'
import { SessionManager } from './sessionManager.js'
import { loadRegistry } from './util/registry.js'
import { executeHook } from './util/execHook.js'
import { interpretStep } from './nlp/interpret.js'
import { openDeepLink } from './builtins/mobile.js'
import { captureQrFromWeb } from './builtins/qr.js'
import { interpolate } from './util/interpolate.js'
type Vars = Record<string, any>
async function runScenario(pathYaml: string){
  const doc = YAML.parse(fs.readFileSync(pathYaml,'utf8'))
  let vars: Vars = { ...(doc.variables||{}) }
  const sessionsCfg = doc.context?.sessions || { default: doc.context }
  const sm = new SessionManager(); await sm.init(sessionsCfg)
  const registry = loadRegistry(process.cwd() + '/registry.json'); const artifactsDir = './artifacts'
  if (doc.context?.hooks?.before){ for (const h of doc.context.hooks.before){ vars = await runHookMerge(registry, h.name, vars, doc.context?.environment, artifactsDir) } }
  for (const raw of (doc.steps as any[])){
    const { tag, text } = normalizeStep(raw); if (tag) sm.switch(tag)
    const action = interpretStep(text, vars); const sessionName = tag || 'default'; const sessionCfg = sessionsCfg[sessionName]; const drv = sm.get()
    switch(action.type){
      case 'openUrl': { const url = action.url || interpolate(sessionCfg?.url || doc.context?.url || '', vars); if (!url) throw new Error('URL não especificada'); await drv.open?.(url); break }
      case 'openDeepLink': { const url = action.url || interpolate(sessionCfg?.deeplink || doc.context?.deeplink || '', vars); await openDeepLink(drv, url); break }
      case 'tap': { await (drv as any).tap?.(action.label); break }
      case 'type': { await (drv as any).type?.(action.label, action.text); break }
      case 'waitVisible': { if ((drv as any).waitVisible) await (drv as any).waitVisible(action.text, action.timeoutMs); else await drv.screenshot?.(`wait-visible-fallback-${Date.now()}.png`); break }
      case 'assertDisabled': { await (drv as any).assertDisabled?.(action.label); break }
      case 'captureAs': { vars[action.name] = vars[action.name] || 'VALOR_CAPTURADO'; break }
      case 'qrCapture': { const link = await captureQrFromWeb(drv); vars[action.saveAs] = link; break }
      case 'noop': break
    }
  }
  if (doc.context?.hooks?.after){ for (const h of doc.context.hooks.after){ vars = await runHookMerge(registry, h.name, vars, doc.context?.environment, artifactsDir) } }
  console.log('Vars finais:', vars); await sm.closeAll()
}
function normalizeStep(raw:any): { tag?:string, text:string } { if (Array.isArray(raw)){ const tag = String(raw[0] || '').replace(/\[|\]/g,''); const text = String(raw[1] || raw.text || ''); return { tag, text } } return { text: String(raw) } }
async function runHookMerge(registry:any, name:string, vars:Vars, env?:string, artifactsDir?:string){ const out = await executeHook(registry, name, { environment: env, variables: vars, artifactsDir }); return { ...vars, ...(out.set||{}) } }
if (process.argv[2]){ runScenario(process.argv[2]).catch(err=>{ console.error(err); process.exit(1) }) } else { console.log('uso: node dist/runner.js examples/web_login.yaml') }
