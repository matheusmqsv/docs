import fs from 'fs'; export function loadRegistry(path: string){ return JSON.parse(fs.readFileSync(path,'utf8')) }
