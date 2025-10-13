export interface HookInput { environment?: string; variables?: Record<string, any>; artifactsDir?: string }
export interface HookOutput { set?: Record<string, any>; asserts?: {name:string, status:'pass'|'fail'|'error', details?:string}[]; logs?: string[]; artifacts?: string[] }
export interface Ctx {
  environment?: string; vars: Record<string, any>; artifactsDir?: string;
  set: (updates: Record<string, any>) => void; log: (msg: string) => void; artifact: (path: string) => void;
  assertPass: (name: string, details?: string) => void; assertFail: (name: string, details?: string) => void;
  env: (name: string) => string | undefined; secret: (name: string) => string | undefined;
}
function redact(obj:any): any {
  const re = /(token|secret|key)$/i
  if (Array.isArray(obj)) return obj.map(redact)
  if (obj && typeof obj === 'object') {
    const out:any = {}
    for (const k of Object.keys(obj)) {
      const v = (re.test(k)) ? '***' : redact((obj as any)[k])
      out[k] = v
    }
    return out
  }
  return obj
}
export function hook(fn: (ctx: Ctx) => Promise<void> | void) {
  return async function run() {
    const raw = await new Promise<string>(res => {
      let data = ''; process.stdin.setEncoding('utf8')
      process.stdin.on('data', c => data += c); process.stdin.on('end', () => res(data))
    })
    const input: HookInput = raw ? JSON.parse(raw) : {}; const out: HookOutput = { set:{}, asserts:[], logs:[], artifacts:[] }
    const envFn = (name:string) => process.env[name]
    const ctx: Ctx = {
      environment: input.environment, vars: input.variables || {}, artifactsDir: input.artifactsDir,
      set: (u) => Object.assign(out.set!, u), log: (m) => out.logs!.push(String(m)), artifact: (p) => out.artifacts!.push(p),
      assertPass: (n,d='') => out.asserts!.push({name:n,status:'pass',details:d}), assertFail: (n,d='') => out.asserts!.push({name:n,status:'fail',details:d}),
      env: envFn, secret: envFn
    }
    try { await fn(ctx); process.stdout.write(JSON.stringify(redact(out))); process.exit(0) }
    catch (e:any) { out.asserts!.push({name:'hook_error',status:'error',details:String(e?.message||e)}); process.stdout.write(JSON.stringify(redact(out))); process.exit(1) }
  }
}
