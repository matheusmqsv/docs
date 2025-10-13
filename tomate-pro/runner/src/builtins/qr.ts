import { PlaywrightDriver } from '../drivers/playwright.js'
import { Decoder } from '@nuintun/qrcode'
import fs from 'fs'
export async function captureQrFromWeb(driver:any): Promise<string>{
  const d = driver as unknown as PlaywrightDriver; const page = d.getPage()
  const img = await page.$('img[alt*="qr" i], img[aria-label*="qr" i], img[alt*="código" i], img[role="img"][aria-label*="qr" i]')
  if (img){
    const src = await img.getAttribute('src')
    if (src?.startsWith('data:image/')){ const buf = Buffer.from(src.split(',')[1], 'base64'); const text = await decodeBuffer(buf); if (text) return text }
    if (src && /^https?:/.test(src)){ const resp = await page.request.get(src); const buf = Buffer.from(await resp.body()); const text = await decodeBuffer(buf); if (text) return text }
    const path = `qr-${Date.now()}.png`; await img.screenshot({ path }); const buf = fs.readFileSync(path); const text = await decodeBuffer(buf); if (text) return text
  }
  const canvas = await page.$('canvas')
  if (canvas){ const path = `qr-${Date.now()}.png`; await canvas.screenshot({ path }); const buf = fs.readFileSync(path); const text = await decodeBuffer(buf); if (text) return text }
  const ss = await page.screenshot({ fullPage: true }); const text = await decodeBuffer(Buffer.from(ss)); if (text) return text
  throw new Error('Não foi possível decodificar o QR')
}
async function decodeBuffer(buf: Buffer): Promise<string | null>{ try { const decoder = new Decoder(); const res = await decoder.decode(buf); return res?.data || null } catch { return null } }
