import { chromium, Page, Browser } from 'playwright'
export class PlaywrightDriver {
  private browser!: Browser; private page!: Page; public readonly name: string
  constructor(name:string){ this.name = name }
  async init(device?: string){ this.browser = await chromium.launch(); const ctx = await this.browser.newContext(); this.page = await ctx.newPage() }
  async open(url: string){ await this.page.goto(url, { waitUntil: 'domcontentloaded' }) }
  async tap(label: string){
    const p = this.page
    const btn = p.getByRole('button', { name: label }).first()
    if (await btn.count()) { await btn.click(); return }
    const link = p.getByRole('link', { name: label }).first()
    if (await link.count()) { await link.click(); return }
    const text = p.getByText(label, { exact: true }).first()
    if (await text.count()) { await text.click(); return }
    throw new Error(`Elemento clicável não encontrado: "${label}"`)
  }
  async type(label: string, text: string){
    const p = this.page
    const byLabel = p.getByLabel(label).first()
    if (await byLabel.count()) { await byLabel.fill(text); return }
    const byPlaceholder = p.getByPlaceholder(label).first()
    if (await byPlaceholder.count()) { await byPlaceholder.fill(text); return }
    const byRole = p.getByRole('textbox', { name: label }).first()
    if (await byRole.count()) { await byRole.fill(text); return }
    throw new Error(`Campo para digitar não encontrado: "${label}"`)
  }
  async waitVisible(text: string, timeoutMs=10000){ await this.page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout: timeoutMs }) }
  async assertDisabled(label: string){
    const p = this.page
    const btn = p.getByRole('button', { name: label }).first()
    if (await btn.count()) {
      const disabled = await btn.isDisabled()
      if (!disabled) throw new Error(`Esperado desabilitado: "${label}"`)
      return
    }
    const el = p.locator(`text="${label}"`).first()
    if (await el.count()){
      const isDisabled = await el.evaluate((e:any)=> e.hasAttribute('disabled') || e.getAttribute('aria-disabled')==='true')
      if (!isDisabled) throw new Error(`Esperado desabilitado: "${label}"`)
      return
    }
    throw new Error(`Elemento para assertDisabled não encontrado: "${label}"`)
  }
  async screenshot(path?: string){ await this.page.screenshot({ path: path || `screenshot-${Date.now()}.png`, fullPage: true }) }
  getPage(){ return this.page }
  async close(){ await this.browser?.close() }
}
