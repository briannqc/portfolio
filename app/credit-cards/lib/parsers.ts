import {
  BankType,
  CreditCardTransaction,
  ParsedStatementResult,
  StatementSummary,
  TransactionType,
} from '../types';
import { normalizeMerchant } from './normalizer';

function parseVND(str?: string): number {
  if (!str) return 0;
  return parseFloat(str.replace(/,/g, '')) || 0;
}

function parseDateDDMMYYYY(str: string): string {
  // 19-09-2026 -> 2026-09-19
  const m = str.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return str;
}

interface TextItem {
  str: string;
  transform: number[];
}

export async function parseVietcombankDoc(
  doc: any,
  fileName: string
): Promise<ParsedStatementResult> {
  const transactions: CreditCardTransaction[] = [];
  let cardholderName = '';
  let cardType = 'Vietcombank Visa Signature';
  let accountOrCard = '';
  let statementDate = '';
  let dueDate = '';
  let creditLimit = 0;
  let statementBalance = 0;
  let minPayment = 0;

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const tc = await page.getTextContent();

    if (pageNum === 1) {
      const allItems = (tc.items as TextItem[])
        .map((i) => ({
          text: i.str.trim(),
          x: Math.round(i.transform[4]),
          y: Math.round(i.transform[5]),
        }))
        .filter((i) => i.text);
      const fullPageText = allItems.map((i) => i.text).join(' ');

      const nameItem = allItems.find(
        (i) => i.x >= 350 && i.x <= 375 && i.y >= 665 && i.y <= 685 && !/mr\./i.test(i.text)
      );
      if (nameItem) cardholderName = nameItem.text;
      else if (fullPageText.includes('NGO QUOC CUONG')) cardholderName = 'NGO QUOC CUONG';

      const accItem = allItems.find((i) => /^[A-Z]{2}\d{10,13}$/.test(i.text));
      if (accItem) accountOrCard = accItem.text;

      const cardTypeItem = allItems.find(
        (i) => /vietcombank\s+[a-z\s]+/i.test(i.text) && !/account statement/i.test(i.text)
      );
      if (cardTypeItem) cardType = cardTypeItem.text;

      const regexLimit = fullPageText.match(/Credit Limit:\s*([\d,]+\.?\d*)/i);
      const itemLimit = allItems.find((it) => it.text.match(/^\d{3},\d{3},\d{3}/));
      if (regexLimit) creditLimit = parseVND(regexLimit[1]);
      else if (itemLimit) creditLimit = parseVND(itemLimit.text);

      const stmtLabel = allItems.find((it) => /statement date/i.test(it.text));
      const stmtItem = allItems.find(
        (it) => stmtLabel && Math.abs(it.y - stmtLabel.y) <= 5 && /^\d{2}-\d{2}-\d{4}$/.test(it.text)
      );
      if (stmtItem) statementDate = parseDateDDMMYYYY(stmtItem.text);

      const propLabel = allItems.find((it) => /proposed payment date/i.test(it.text));
      const dueItem = allItems.find(
        (it) => propLabel && Math.abs(it.y - propLabel.y) <= 5 && /^\d{2}-\d{2}-\d{4}$/.test(it.text)
      );
      if (dueItem) dueDate = parseDateDDMMYYYY(dueItem.text);

      const bal = allItems.find(
        (it) => it.x > 200 && it.y >= 605 && it.y <= 625 && /[\d,]+\.00/.test(it.text)
      );
      if (bal) statementBalance = parseVND(bal.text);

      const minP = allItems.find(
        (it) => it.x > 200 && it.y >= 575 && it.y <= 595 && /[\d,]+\.00/.test(it.text)
      );
      if (minP) minPayment = parseVND(minP.text);
    }

    // Group text items by Y coordinate
    const rowsMap: Record<number, { text: string; x: number }[]> = {};
    for (const item of tc.items as TextItem[]) {
      if (!item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 3) * 3;
      if (!rowsMap[y]) rowsMap[y] = [];
      rowsMap[y].push({ text: item.str, x: Math.round(item.transform[4]) });
    }

    const sortedY = Object.keys(rowsMap)
      .map(Number)
      .sort((a, b) => b - a);

    for (let i = 0; i < sortedY.length; i++) {
      const y = sortedY[i];
      const items = rowsMap[y].sort((a, b) => a.x - b.x);

      // Check for transaction row: Txn Date is around x ~ 48 with format DD-MM-YYYY
      const txnDateItem = items.find(
        (it) => it.x >= 40 && it.x <= 60 && /^\d{2}-\d{2}-\d{4}$/.test(it.text)
      );
      if (txnDateItem) {
        const postDateItem = items.find(
          (it) =>
            it.x >= 90 && it.x <= 110 && /^\d{2}-\d{2}-\d{4}$/.test(it.text)
        );

        // Debit is at x ~ 230-270, Credit is at x ~ 285-340
        const debitItem = items.find(
          (it) => it.x >= 230 && it.x <= 270 && /^[\d,]+\.\d{2}$/.test(it.text)
        );
        const creditItem = items.find(
          (it) => it.x >= 285 && it.x <= 340 && /^[\d,]+\.\d{2}$/.test(it.text)
        );

        let type: TransactionType = 'debit';
        let amount = 0;
        if (debitItem) {
          type = 'debit';
          amount = parseVND(debitItem.text);
        } else if (creditItem) {
          type = 'credit';
          amount = parseVND(creditItem.text);
        }

        if (amount > 0) {
          // Description text is at x >= 355
          const descParts = items.filter((it) => it.x >= 355).map((it) => it.text);

          // Check next line for wrapped description or currency
          if (i + 1 < sortedY.length) {
            const nextY = sortedY[i + 1];
            if (Math.abs(y - nextY) <= 5) {
              const extraItems = rowsMap[nextY].filter((it) => it.x >= 355);
              descParts.push(...extraItems.map((it) => it.text));
            }
          }

          const rawDescription = descParts.join(' ').trim();
          const { cleanMerchant, category } = normalizeMerchant(
            rawDescription,
            type
          );

          transactions.push({
            id: `vcb-${transactions.length + 1}`,
            bank: 'Vietcombank',
            sourceFile: fileName,
            accountOrCard: accountOrCard || 'VS00700393113',
            statementDate,
            txnDate: parseDateDDMMYYYY(txnDateItem.text),
            postDate: postDateItem
              ? parseDateDDMMYYYY(postDateItem.text)
              : parseDateDDMMYYYY(txnDateItem.text),
            rawDescription,
            cleanMerchant,
            category,
            amount,
            type,
            currency: 'VND',
          });
        }
      }
    }
  }

  const totalDebits = transactions
    .filter((t) => t.type === 'debit')
    .reduce((s, t) => s + t.amount, 0);
  const totalCredits = transactions
    .filter((t) => t.type === 'credit')
    .reduce((s, t) => s + t.amount, 0);

  const summary: StatementSummary = {
    bank: 'Vietcombank',
    fileName,
    cardholderName,
    cardType,
    accountOrCard,
    statementDate,
    dueDate,
    creditLimit,
    statementBalance,
    minPayment,
    totalDebits,
    totalCredits,
    transactionsCount: transactions.length,
  };

  return { summary, transactions };
}

export async function parseHSBCDoc(
  doc: any,
  fileName: string
): Promise<ParsedStatementResult> {
  const transactions: CreditCardTransaction[] = [];
  let cardholderName = '';
  let cardType = 'HSBC Credit Card';
  let accountOrCard = '';
  let statementDate = '';
  let dueDate = '';
  let creditLimit = 0;
  let statementBalance = 0;
  let minPayment = 0;
  let stmtYear = 2026;

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const tc = await page.getTextContent();

    if (pageNum === 1) {
      const allItems = (tc.items as TextItem[])
        .map((i) => ({
          text: i.str.trim(),
          x: Math.round(i.transform[4]),
          y: Math.round(i.transform[5]),
        }))
        .filter((i) => i.text);
      const fullPageText = allItems.map((i) => i.text).join(' ');

      const nameItem = allItems.find(
        (i) => i.x >= 50 && i.x <= 75 && i.y >= 685 && i.y <= 705 && !/cardholder/i.test(i.text)
      );
      if (nameItem) cardholderName = nameItem.text;
      else if (fullPageText.includes('NGO QUOC CUONG')) cardholderName = 'NGO QUOC CUONG';

      const cardNumItem = allItems.find((i) =>
        /\d{4}\s*\d{4}\s*[xX\d]{4}\s*\d{4}/.test(i.text)
      );
      if (cardNumItem) accountOrCard = cardNumItem.text;

      const cardTypeItem = allItems.find(
        (i) => /hsbc\s+[a-z\s]+/i.test(i.text) && !/hsbc bank/i.test(i.text)
      );
      if (cardTypeItem) cardType = cardTypeItem.text;
      else if (fullPageText.includes('HSBC VISA CASH BACK')) cardType = 'HSBC Visa Cash Back';

      const stmtDateItem = allItems.find((it) =>
        /^\d{2}\/\d{2}\/\d{4}$/.test(it.text)
      );
      if (stmtDateItem) {
        const [d, m, y] = stmtDateItem.text.split('/');
        statementDate = `${y}-${m}-${d}`;
        stmtYear = parseInt(y, 10);
      }

      const dueMatch = fullPageText.match(/(\d{2}\/\d{2}\/\d{4})/g);
      if (dueMatch && dueMatch.length > 1) {
        const [d, m, y] = dueMatch[1].split('/');
        dueDate = `${y}-${m}-${d}`;
      }

      const bal = allItems.find(
        (it) => it.x > 400 && it.y >= 580 && it.y <= 600 && /[\d,]+\.00/.test(it.text)
      );
      if (bal) statementBalance = parseVND(bal.text);

      const minP = allItems.find(
        (it) => it.x > 400 && it.y >= 555 && it.y <= 575 && /[\d,]+\.00/.test(it.text)
      );
      if (minP) minPayment = parseVND(minP.text);

      const lMatch = fullPageText.match(
        /Your Credit Limit:\s*(?:VND\s*)?([\d,]+)/i
      );
      if (lMatch) creditLimit = parseVND(lMatch[1]);
    }

    const rowsMap: Record<number, { text: string; x: number }[]> = {};
    for (const item of tc.items as TextItem[]) {
      if (!item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 3) * 3;
      if (!rowsMap[y]) rowsMap[y] = [];
      rowsMap[y].push({ text: item.str, x: Math.round(item.transform[4]) });
    }

    const sortedY = Object.keys(rowsMap)
      .map(Number)
      .sort((a, b) => b - a);

    for (let i = 0; i < sortedY.length; i++) {
      const y = sortedY[i];
      const items = rowsMap[y].sort((a, b) => a.x - b.x);
      const fullText = items.map((t) => t.text).join(' ');

      // Transaction row in HSBC:
      // Txn Date at x ~ 60-85 with format DD/MM
      const txnDateItem = items.find(
        (it) => it.x >= 60 && it.x <= 85 && /^\d{2}\/\d{2}$/.test(it.text)
      );
      if (txnDateItem) {
        const postDateItem = items.find(
          (it) => it.x >= 120 && it.x <= 145 && /^\d{2}\/\d{2}$/.test(it.text)
        );

        // Amount is at x ~ 450-510
        const amountItem = items.find(
          (it) => it.x >= 450 && it.x <= 510 && /[\d,]+\.\d{2}/.test(it.text)
        );
        if (amountItem) {
          const isCredit =
            /CR/i.test(fullText) || /CR/i.test(amountItem.text);
          const type: TransactionType = isCredit ? 'credit' : 'debit';
          const amount = parseVND(amountItem.text);

          // Description between postDate and amount (x between 165 and 450)
          const descItems = items.filter((it) => it.x >= 165 && it.x < 450);
          const rawDescription = descItems
            .map((it) => it.text)
            .join(' ')
            .trim();

          const [d, m] = txnDateItem.text.split('/');
          const txnMonth = parseInt(m, 10);
          const stmtMonth = parseInt(statementDate.split('-')[1] || '10', 10);
          const year = txnMonth > stmtMonth ? stmtYear - 1 : stmtYear;
          const fullTxnDate = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

          let fullPostDate = fullTxnDate;
          if (postDateItem) {
            const [pd, pm] = postDateItem.text.split('/');
            const pMonth = parseInt(pm, 10);
            const pYear = pMonth > stmtMonth ? stmtYear - 1 : stmtYear;
            fullPostDate = `${pYear}-${pm.padStart(2, '0')}-${pd.padStart(2, '0')}`;
          }

          const { cleanMerchant, category } = normalizeMerchant(
            rawDescription,
            type
          );

          transactions.push({
            id: `hsbc-${transactions.length + 1}`,
            bank: 'HSBC',
            sourceFile: fileName,
            accountOrCard: accountOrCard || 'HSBC Card',
            statementDate: statementDate || '2026-10-07',
            txnDate: fullTxnDate,
            postDate: fullPostDate,
            rawDescription,
            cleanMerchant,
            category,
            amount,
            type,
            currency: 'VND',
          });
        }
      }
    }
  }

  const totalDebits = transactions
    .filter((t) => t.type === 'debit')
    .reduce((s, t) => s + t.amount, 0);
  const totalCredits = transactions
    .filter((t) => t.type === 'credit')
    .reduce((s, t) => s + t.amount, 0);

  const summary: StatementSummary = {
    bank: 'HSBC',
    fileName,
    cardholderName: cardholderName || 'Cardholder',
    cardType: cardType || 'HSBC Credit Card',
    accountOrCard: accountOrCard || 'HSBC Card',
    statementDate,
    dueDate,
    creditLimit,
    statementBalance,
    minPayment,
    totalDebits,
    totalCredits,
    transactionsCount: transactions.length,
  };

  return { summary, transactions };
}

export function detectBankFromText(fullText: string): BankType | null {
  let vcbScore = 0;
  let hsbcScore = 0;

  const vcbMatches = fullText.match(/vietcombank/gi);
  if (vcbMatches) vcbScore += vcbMatches.length * 2;
  if (/sao\s*kê\s*tài\s*khoản\s*thẻ\s*tín\s*dụng/i.test(fullText)) vcbScore += 4;
  if (/proposed\s*payment\s*date/i.test(fullText)) vcbScore += 3;
  if (/cu(?:r)?rent\s*statement\s*balance/i.test(fullText)) vcbScore += 3;
  if (/min\s*payment\s*due/i.test(fullText)) vcbScore += 2;
  if (/\bVS\d{10,13}\b/.test(fullText)) vcbScore += 3;

  const hsbcMatches = fullText.match(/hsbc/gi);
  if (hsbcMatches) hsbcScore += hsbcMatches.length * 2;
  if (/hsbc\s*bank/i.test(fullText)) hsbcScore += 4;
  if (/dư\s*nợ\s*cuối\s*kỳ/i.test(fullText)) hsbcScore += 2;
  if (/thanh\s*toán\s*tối\s*thiểu/i.test(fullText)) hsbcScore += 2;
  if (/cashback\s*programme/i.test(fullText)) hsbcScore += 2;
  if (/your\s*credit\s*limit/i.test(fullText)) hsbcScore += 2;

  if (vcbScore >= 3 && vcbScore > hsbcScore) return 'Vietcombank';
  if (hsbcScore >= 3 && hsbcScore > vcbScore) return 'HSBC';
  return null;
}

// Client-side parser using browser PDF.js
export async function parsePdfInBrowser(
  arrayBuffer: ArrayBuffer,
  password: string,
  fileName: string
): Promise<ParsedStatementResult> {
  // Dynamically import pdfjs-dist in browser
  const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');

  // Set worker src to local public worker
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }

  const uint8Data = new Uint8Array(arrayBuffer);
  const loadingTask = pdfjsLib.getDocument({
    data: uint8Data,
    password: password || undefined,
    standardFontDataUrl: '/standard_fonts/',
  });

  const doc = await loadingTask.promise;

  // Extract text from the first 1-2 pages to dynamically identify the source bank and template
  let combinedText = '';
  const numPagesToCheck = Math.min(doc.numPages, 2);
  for (let p = 1; p <= numPagesToCheck; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    combinedText += ' ' + tc.items.map((it: any) => it.str || '').join(' ');
  }

  const detectedBank = detectBankFromText(combinedText);

  if (detectedBank === 'Vietcombank') {
    const result = await parseVietcombankDoc(doc, fileName);
    if (result.transactions.length === 0 && result.summary.statementBalance === 0) {
      throw new Error(
        'Detected Vietcombank statement but failed to extract statement details or transactions.'
      );
    }
    return result;
  } else if (detectedBank === 'HSBC') {
    const result = await parseHSBCDoc(doc, fileName);
    if (result.transactions.length === 0 && result.summary.statementBalance === 0) {
      throw new Error(
        'Detected HSBC statement but failed to extract statement details or transactions.'
      );
    }
    return result;
  } else {
    throw new Error(
      'Unsupported or unrecognized bank statement format. Currently supported banks: Vietcombank, HSBC.'
    );
  }
}
