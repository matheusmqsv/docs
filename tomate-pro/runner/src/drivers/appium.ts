import { remote, Browser } from 'webdriverio'
import { execFileSync } from 'child_process'
export class AppiumDriver {
  private client!: Browser<'async'>; public readonly name: string; private cfg: any
  constructor(name:string, cfg:any){ this.name = name; this.cfg = cfg }
  async init(){
    const caps:any = {
      platformName: this.cfg.target === 'ios' ? 'iOS' : 'Android',
      'appium:deviceName': this.cfg.device || 'emulator',
      'appium:platformVersion': this.cfg.osVersion || undefined,
      'appium:app': this.cfg.appPath || undefined,
      'appium:autoGrantPermissions': this.cfg.mobile?.autoGrantPermissions ?? true,
      'appium:newCommandTimeout': 120
    }
    if (this.cfg.target === 'ios' && this.cfg.appId) caps['appium:bundleId'] = this.cfg.appId
    this.client = await remote({ hostname: process.env.APPIUM_HOST || '127.0.0.1', port: parseInt(process.env.APPIUM_PORT || '4723', 10), path: '/wd/hub', capabilities: caps })
    if (this.cfg.appId) { try { await this.client.activateApp(this.cfg.appId) } catch {} }
  }
  private async find(label:string, timeout=10000){
    const byAcc = await this.client.$(`~${label}`); if (await byAcc.isExisting()) return byAcc
    const byText = await this.client.$(`xpath=//*[@text='${label}' or @label='${label}' or @name='${label}']`); if (await byText.isExisting()) return byText
    const byContains = await this.client.$(`xpath=//*[contains(@text,'${label}') or contains(@label,'${label}') or contains(@name,'${label}')]`); await byContains.waitForExist({ timeout }); return byContains
  }
  async tap(label: string){ const el = await this.find(label); await el.click() }
  async type(label: string, text: string){ const el = await this.find(label); await el.click(); await el.setValue(text) }
  async waitVisible(text: string, timeoutMs=10000){ const el = await this.client.$(`xpath=//*[contains(@text,'${text}') or contains(@label,'${text}') or contains(@name,'${text}')]`); await el.waitForDisplayed({ timeout: timeoutMs }) }
  async assertDisabled(label: string){ const el = await this.find(label); const enabled = await el.isEnabled(); if (enabled) throw new Error(`Esperado desabilitado: "${label}"`) }
  async openDeepLink(url: string){
    if (this.cfg.target === 'android'){
      try { await this.client.execute('mobile: deepLink', { url, package: this.cfg.appId }) }
      catch { await this.client.execute('mobile: shell', { command: 'am', args: ['start','-a','android.intent.action.VIEW','-d', url] }) }
    } else {
      try { execFileSync('xcrun', ['simctl','openurl','booted', url]) } catch {}
      if (this.cfg.appId) { try { await this.client.activateApp(this.cfg.appId) } catch {} }
    }
  }
  async screenshot(path?: string){ const b64 = await this.client.takeScreenshot(); const buf = Buffer.from(b64, 'base64'); const p = path || `screenshot-${Date.now()}.png`; await import('fs').then(fs => fs.writeFileSync(p, buf)) }
  getClient(){ return self.client }
  async close(){ try { await self.client?.deleteSession() } catch {} }
}
