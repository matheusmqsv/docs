import { interpolate } from '../util/interpolate.js'
export type Action =
  | { type: 'openUrl', url?: string }
  | { type: 'openDeepLink', url?: string }
  | { type: 'tap', label: string }
  | { type: 'type', label: string, text: string }
  | { type: 'waitVisible', text: string, timeoutMs?: number }
  | { type: 'assertDisabled', label: string }
  | { type: 'captureAs', name: string }
  | { type: 'qrCapture', saveAs: string }
  | { type: 'noop' }
export function interpretStep(text: string, vars: Record<string,any>): Action {
  const raw = text.trim(); const t = raw.toLowerCase()
  if (t.startsWith('acesse ')) { const m = raw.match(/página\s+(.+)$/i); const url = m ? interpolate(m[1].replace(/^"|"$/g,''), vars) : undefined; return { type: 'openUrl', url } }
  if (t.startsWith('abra o deep link')) { const m = raw.match(/deep link\s+(.+)$/i); const url = m ? interpolate(m[1].replace(/^"|"$/g,''), vars) : undefined; return { type: 'openDeepLink', url } }
  if (/^(toque|clique)\sem\s/i.test(t)) { const label = (raw.match(/"(.*?)"/) || [])[1] || raw.replace(/^(toque|clique)\sem\s/i,'').trim(); return { type: 'tap', label } }
  if (t.startsWith('digite ')) { const m = raw.match(/digite\s+"(.*?)"\s+no campo\s+"(.*?)"/i) || raw.match(/digite\s+"(.*?)"\s+em\s+"(.*?)"/i); if (m) return { type: 'type', text: interpolate(m[1], vars), label: m[2] } }
  if ((/^aguarde/i.test(t) || /^espere/i.test(t)) && /"(.+?)"/.test(raw)) { const textQ = (raw.match(/"(.+?)"/) || [])[1]; return { type: 'waitVisible', text: textQ } }
  if ((/^valide|^confirme/i.test(t)) && /est[aá]\s+desabilitado/.test(t)) { const label = (raw.match(/"(.+?)"/) || [])[1] || 'botão'; return { type: 'assertDisabled', label } }
  if (/como\s+"([^"]+)"/i.test(raw)) { const name = (raw.match(/como\s+"([^"]+)"/i) || [])[1]; return { type: 'captureAs', name } }
  if (/qr code/i.test(raw) && /salve o link como/i.test(raw)) { const saveAs = (raw.match(/salve o link como\s+"([^"]+)"/i) || [])[1] || 'dl'; return { type: 'qrCapture', saveAs } }
  return { type: 'noop' }
}
