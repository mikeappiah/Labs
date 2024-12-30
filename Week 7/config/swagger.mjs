import path from 'node:path';
import fs from 'node:fs';
import YAML from 'yaml';

import __dirname from '../utils/__dirname.mjs';

const file = fs.readFileSync(path.join(__dirname, '../swagger.yaml'), 'utf8');
const swaggerDocument = YAML.parse(file);

export default swaggerDocument;
