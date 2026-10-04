import { createHash } from 'node:crypto';
const esc=x=>String(x).replace(/~/g,'~0').replace(/\//g,'~1');
const canonical=v=>Array.isArray(v)?`[${v.map(canonical).join(',')}]`:v!==null&&typeof v==='object'?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}`:JSON.stringify(v);
const id=v=>createHash('sha256').update(canonical(v)).digest('hex').slice(0,12);
const type=v=>v===null?'null':Array.isArray(v)?'array':typeof v;
export function flatten(value,parts=[],out=[]){if(value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length){for(const k of Object.keys(value).sort())flatten(value[k],[...parts,k],out)}else out.push({path:parts.length?`/${parts.map(esc).join('/')}`:'/',value});return out}
export function analyze(rows,{ignore=[]}={}){
  if(!Array.isArray(rows)||!rows.length)throw new Error('at least one JSON record is required');
  const prefixes=ignore.map(x=>x.startsWith('/')?x:`/${x.split('.').map(esc).join('/')}`),stats=new Map();
  for(const row of rows)for(const item of flatten(row)){if(prefixes.some(p=>item.path===p||item.path.startsWith(`${p}/`)))continue;const s=stats.get(item.path)||{path:item.path,present:0,types:new Set(),values:new Map()};s.present++;s.types.add(type(item.value));const key=id(item.value);s.values.set(key,(s.values.get(key)||0)+1);stats.set(item.path,s)}
  const fields=[...stats.values()].map(s=>{const distinct=s.values.size,ratio=distinct/s.present;return {path:s.path,present:s.present,coverage:s.present/rows.length,distinct,cardinalityRatio:ratio,classification:distinct===1?'constant':ratio<=0.1?'low':ratio>=0.9?'near-unique':'medium',types:[...s.types].sort(),topFingerprints:[...s.values].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,5).map(([fingerprint,count])=>({fingerprint,count}))}});
  fields.sort((a,b)=>b.cardinalityRatio-a.cardinalityRatio||b.distinct-a.distinct||a.path.localeCompare(b.path));
  return {recordCount:rows.length,fieldCount:fields.length,nearUniqueCount:fields.filter(f=>f.classification==='near-unique').length,ignored:prefixes,fields};
}
