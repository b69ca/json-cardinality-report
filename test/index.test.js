import test from 'node:test';import assert from 'node:assert/strict';import { analyze } from '../src/index.js';
test('classifies constant and unique fields',()=>{const r=analyze([{kind:'x',id:1},{kind:'x',id:2},{kind:'x',id:3}]);assert.equal(r.fields.find(f=>f.path==='/kind').classification,'constant');assert.equal(r.fields.find(f=>f.path==='/id').classification,'near-unique')});
test('reports optional-field coverage',()=>assert.equal(analyze([{x:1},{}]).fields[0].coverage,.5));
test('ignores pointer prefixes',()=>assert.equal(analyze([{meta:{id:1},x:1}],{ignore:['/meta']}).fieldCount,1));
test('does not expose values',()=>assert.equal(JSON.stringify(analyze([{secret:'hunter2'}])).includes('hunter2'),false));
