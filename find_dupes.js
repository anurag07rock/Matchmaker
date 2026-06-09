const fs = require('fs');
const content = fs.readFileSync('src/data/customers.ts', 'utf8');
const emails = [...content.matchAll(/email:\s*'([^']+)'/g)].map(m => m[1]);
const duplicates = emails.filter((e, i, a) => a.indexOf(e) !== i);
console.log('Duplicates found:', duplicates);
