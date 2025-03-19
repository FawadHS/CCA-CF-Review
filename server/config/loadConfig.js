import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = join(__dirname, 'config.json');

if (existsSync(configPath)) {
  const configData = readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configData);
  console.log('✅ Configuration loaded successfully:', config);
} else {
  console.error('❌ Configuration file not found!');
  process.exit(1);
}
