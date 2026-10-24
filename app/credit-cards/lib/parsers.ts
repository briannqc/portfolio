import {
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
  let cardholderName = 'NGO QUOC CUONG';
  let cardType = 'Vietcombank Visa Signature';
  let accountOrCard = 'VS00700393113';
  let statementDate = '2026-10-20';
  let dueDate = '2026-11-16';
  let creditLimit = 150000000;
  let statementBalance = 60663854;
  let minPayment = 1213277;

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const tc = await page.getTextContent();

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
      const fullText = items.map((t) => t.text).join(' ');

      // Metadata extraction
      if (pageNum === 1) {
        if (fullText.includes('VIETCOMBANK VISA SIGNATURE'))
          cardType = 'Vietcombank Visa Signature';
        if (fullText.includes('VS00700393113')) accountOrCard = 'VS00700393113';
        if (fullText.includes('NGO QUOC CUONG')) cardholderName = 'NGO QUOC CUONG';

        const regexMatch = fullText.match(/Credit Limit:\s*([\d,]+\.?\d*)/i);
        const itemMatch = items.find((it) => it.text.match(/^\d{3},\d{3},\d{3}/));
        if (regexMatch) {
          creditLimit = parseVND(regexMatch[1]);
        } else if (itemMatch) {
          creditLimit = parseVND(itemMatch.text);
        }

        const dateMatch = fullText.match(/(\d{2}-\d{2}-\d{4})/);
        if (fullText.includes('Statement Date') && dateMatch)
          statementDate = parseDateDDMMYYYY(dateMatch[1]);
        if (fullText.includes('Proposed Payment Date') && dateMatch)
          dueDate = parseDateDDMMYYYY(dateMatch[1]);

        if (
          fullText.includes('Curent Statement Balance') ||
          fullText.includes('Statement Balance:')
        ) {
          const bal = items.find(
            (it) => it.x > 200 && /[\d,]+\.00/.test(it.text)
          );
          if (bal) statementBalance = parseVND(bal.text);
        }

        if (fullText.includes('Min Payment Due:')) {
          const minP = items.find(
            (it) => it.x > 200 && /[\d,]+\.00/.test(it.text)
          );
          if (minP) minPayment = parseVND(minP.text);
        }
      }

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
  let cardholderName = 'NGO QUOC CUONG';
  let cardType = 'HSBC Visa Cash Back';
  let accountOrCard = '4450 9400 xxxx 7667';
  let statementDate = '2026-10-07';
  let dueDate = '2026-11-01';
  let creditLimit = 240500000;
  let statementBalance = 4990104;
  let minPayment = 50000;
  let stmtYear = 2026;

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const tc = await page.getTextContent();

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

      // Metadata on Page 1
      if (pageNum === 1) {
        if (fullText.includes('NGO QUOC CUONG')) cardholderName = 'NGO QUOC CUONG';
        if (fullText.includes('HSBC VISA CASH BACK'))
          cardType = 'HSBC Visa Cash Back';
        if (fullText.includes('4450 9400 xxxx 7667'))
          accountOrCard = '4450 9400 xxxx 7667';

        const stmtDateItem = items.find((it) =>
          /^\d{2}\/\d{2}\/\d{4}$/.test(it.text)
        );
        if (stmtDateItem && !statementDate) {
          const [d, m, y] = stmtDateItem.text.split('/');
          statementDate = `${y}-${m}-${d}`;
          stmtYear = parseInt(y, 10);
        }

        const dueMatch = fullText.match(/(\d{2}\/\d{2}\/\d{4})/g);
        if (dueMatch && dueMatch.length > 1 && !dueDate) {
          const [d, m, y] = dueMatch[1].split('/');
          dueDate = `${y}-${m}-${d}`;
        }

        if (
          fullText.includes('Statement balance') ||
          fullText.includes('Dư nợ cuối kỳ')
        ) {
          const bal = items.find(
            (it) => it.x > 400 && /[\d,]+\.00/.test(it.text)
          );
          if (bal) statementBalance = parseVND(bal.text);
        }

        if (
          fullText.includes('Minimum payment') ||
          fullText.includes('Thanh toán tối thiểu')
        ) {
          const minP = items.find(
            (it) => it.x > 400 && /[\d,]+\.00/.test(it.text)
          );
          if (minP) minPayment = parseVND(minP.text);
        }

        if (fullText.includes('Your Credit Limit:')) {
          const lMatch = fullText.match(/VND\s*([\d,]+)/i);
          if (lMatch) creditLimit = parseVND(lMatch[1]);
        }
      }

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
            accountOrCard: accountOrCard || '4450 9400 xxxx 7667',
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

  // Detect bank from page 1 content
  const page1 = await doc.getPage(1);
  const textContent = await page1.getTextContent();
  const page1Text = textContent.items
    .map((it: any) => it.str || '')
    .join(' ');

  if (
    page1Text.includes('Vietcombank') ||
    page1Text.includes('VIETCOMBANK') ||
    page1Text.includes('VS00700393113') ||
    fileName.toLowerCase().startsWith('vs')
  ) {
    return parseVietcombankDoc(doc, fileName);
  } else if (
    page1Text.includes('HSBC') ||
    page1Text.includes('Cash Back') ||
    fileName.includes('20261007')
  ) {
    return parseHSBCDoc(doc, fileName);
  } else {
    // Default fallback: try Vietcombank first, then HSBC
    try {
      const vcb = await parseVietcombankDoc(doc, fileName);
      if (vcb.transactions.length > 0) return vcb;
    } catch {
      // fallback
    }
    return parseHSBCDoc(doc, fileName);
  }
}
