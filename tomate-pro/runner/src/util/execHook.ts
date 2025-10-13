import { spawn } from 'child_process';
type HookPayload = { environment?: string, variables?: any, artifactsDir?: string }
type HookOut = { set?: any, asserts?: any[], logs?: string[], artifacts?: string[] }
export async function executeHook(registry: any, name: string, payload: HookPayload, timeoutMs=20000): Promise<HookOut> {
  const entry = registry[name]; if (!entry) throw new Error(`Hook '${name}' não encontrado no registry`);
  return await executeHookSubprocess(entry, payload, timeoutMs);
}
async function executeHookSubprocess(entry:any, payload:HookPayload, timeoutMs:number): Promise<HookOut> {
  const [cmd, ...args] = resolveCmd(entry); const proc = spawn(cmd, args, { stdio: ['pipe','pipe','pipe'] }); const timer = setTimeout(()=>{ try{ proc.kill('SIGKILL'); }catch{} }, timeoutMs);
  const stdoutChunks: Buffer[] = []; const stderrChunks: Buffer[] = [];
  proc.stdout.on('data', b => stdoutChunks.push(b)); proc.stderr.on('data', b => stderrChunks.push(b));
  proc.stdin.write(JSON.stringify(payload)); proc.stdin.end();
  const code: number = await new Promise(res => proc.on('close', res as any)); clearTimeout(timer);
  const stdout = Buffer.concat(stdoutChunks).toString('utf8'); if (code !== 0) { const stderr = Buffer.concat(stderrChunks).toString('utf8'); throw new Error(`Hook falhou (code=${code}). Stderr: ${stderr}`); }
  return JSON.parse(stdout || "{}");
}
function resolveCmd(entry: any): string[] { const rt = (entry.runtime||'').toLowerCase(); const p = entry.path; if (rt === 'python') return [ 'python3', p ]; if (rt === 'node') return [ 'node', p ]; if (rt === 'bash') return [ 'bash', p ]; return [ p ]; }
