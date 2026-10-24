import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

async function parseStatementWithCli(filePath: string, password: string, bankHint: string = '') {
  const cwd = process.cwd();
  const scriptPath = path.join(cwd, 'scripts', 'parse-statement.mjs');

  let stdout = '';
  try {
    const res = await execFileAsync(process.execPath, [
      scriptPath,
      filePath,
      password || '',
      bankHint || '',
    ], {
      cwd,
      maxBuffer: 10 * 1024 * 1024,
    });
    stdout = res.stdout;
  } catch (execErr: any) {
    stdout = execErr?.stdout || '';
    if (!stdout) {
      const combined = `${execErr?.message || ''} ${execErr?.stderr || ''}`;
      if (/password|incorrect|decrypt|14/i.test(combined)) {
        throw new Error('Incorrect password. Please verify your statement password and try again.');
      }
      throw new Error('Failed to parse statement. Please verify your password and file format.');
    }
  }

  const match = stdout.match(/__JSON_START__([\s\S]*?)__JSON_END__/);
  if (!match) {
    throw new Error('Parser failed to produce structured JSON output');
  }

  const result = JSON.parse(match[1]);
  if (!result.success) {
    const errText = result.error || '';
    if (/password|incorrect|decrypt|14/i.test(errText)) {
      throw new Error('Incorrect password. Please verify your statement password and try again.');
    }
    throw new Error(errText || 'Failed to parse statement');
  }

  return result.data;
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Statement parsing service is ready. Please upload your statement.',
    data: [],
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const password = (formData.get('password') as string) || '';
    const bankHint = (formData.get('bank') as string) || '';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const tempFilePath = path.join(tempDir, `upload_${Date.now()}_${file.name}`);
    fs.writeFileSync(tempFilePath, Buffer.from(arrayBuffer));

    try {
      const parsed = await parseStatementWithCli(tempFilePath, password, bankHint);
      return NextResponse.json({
        success: true,
        data: parsed,
      });
    } finally {
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  } catch (error: any) {
    console.error('Server upload parse error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to parse uploaded statement',
      },
      { status: 500 }
    );
  }
}
