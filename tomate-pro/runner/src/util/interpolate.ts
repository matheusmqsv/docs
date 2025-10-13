export function interpolate(s:string, vars:Record<string, any>){ return s.replace(/{{\s*([\w\.]+)\s*}}/g, (_,k)=> (vars[k] ?? '')) }
