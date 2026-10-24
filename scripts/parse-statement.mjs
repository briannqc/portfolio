import fs from 'fs';
import { parsePdfFile } from './parse-core.mjs';

async function main() {
  const args = process.argv.slice(2);
  const filePath = args[0];
  const password = args[1] || '';
  const bankHint = args[2] || '';

  if (!filePath || !fs.existsSync(filePath)) {
    console.log('__JSON_START__' + JSON.stringify({ success: false, error: 'File not found: ' + filePath }) + '__JSON_END__');
    process.exit(1);
  }

  try {
    const parsed = await parsePdfFile(filePath, password, bankHint);
    console.log('__JSON_START__' + JSON.stringify({ success: true, data: parsed }) + '__JSON_END__');
  } catch (err) {
    const errorMsg = err?.message || String(err);
    console.log('__JSON_START__' + JSON.stringify({ success: false, error: errorMsg }) + '__JSON_END__');
  }
}

main();
