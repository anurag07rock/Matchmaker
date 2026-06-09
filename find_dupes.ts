import { mockCustomers } from './src/data/customers';
const emails = mockCustomers.map(c => c.email);
const duplicates = emails.filter((e, i, a) => a.indexOf(e) !== i);
console.log('Duplicates:', duplicates);
