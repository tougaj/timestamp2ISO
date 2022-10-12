import { readFileSync } from 'fs';

const data = readFileSync('./data/test.csv', 'utf-8');
console.log(data);
