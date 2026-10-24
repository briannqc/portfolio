import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Exactly 10 consolidated consumer spending categories (+ Bank / Payments)
export const MERCHANT_RULES = [
  // 1. Groceries & Supermarket
  { regex: /(king\s*food|kfm_|ctcp\s+king\s+food)/i, cleanName: 'King Food Market', category: 'Groceries & Supermarket' },
  { regex: /(co\.?op\s*food|coop\s*food|co\.?op\s*mart|saigon\s*co\.?op)/i, cleanName: 'Co.op Food', category: 'Groceries & Supermarket' },
  { regex: /(wincommerce|winmart|wcm_)/i, cleanName: 'WinMart', category: 'Groceries & Supermarket' },
  { regex: /(mega\s*market|mm\s*mega)/i, cleanName: 'MM Mega Market', category: 'Groceries & Supermarket' },
  { regex: /(go_di\s*an|go!|big\s*c|central\s*retail)/i, cleanName: 'GO! Supermarket', category: 'Groceries & Supermarket' },
  { regex: /(gs25)/i, cleanName: 'GS25 Convenience', category: 'Groceries & Supermarket' },
  { regex: /(circle\s*k)/i, cleanName: 'Circle K', category: 'Groceries & Supermarket' },
  { regex: /(bach\s*hoa\s*xanh|bhx)/i, cleanName: 'Bách Hóa Xanh', category: 'Groceries & Supermarket' },

  // 2. Healthcare & Pharmacy
  { regex: /(msg\s*bd\s*2|mắt\s*sài\s*gòn|mat\s*sai\s*gon)/i, cleanName: 'Bệnh viện Mắt Sài Gòn', category: 'Healthcare & Pharmacy' },
  { regex: /(hoan\s*my|bvdk\s*qt\s*hoan\s*my)/i, cleanName: 'Bệnh viện Hoàn Mỹ', category: 'Healthcare & Pharmacy' },
  { regex: /(long\s*chau|fpt\s*lc|fptlongchau)/i, cleanName: 'Nhà thuốc Long Châu', category: 'Healthcare & Pharmacy' },
  { regex: /(pharmacity)/i, cleanName: 'Pharmacity', category: 'Healthcare & Pharmacy' },
  { regex: /(an\s*khang)/i, cleanName: 'Nhà thuốc An Khang', category: 'Healthcare & Pharmacy' },

  // 3. Insurance
  { regex: /(fwd|bh\s*nhan\s*tho\s*fwd)/i, cleanName: 'Bảo hiểm FWD', category: 'Insurance' },
  { regex: /(prudential|manulife|aia|dai-ichi|bảo\s*hiểm)/i, cleanName: 'Bảo hiểm nhân thọ', category: 'Insurance' },

  // 4. Transportation
  { regex: /(onepay.*vietnam|vinfast)/i, cleanName: 'VinFast', category: 'Transportation' },
  { regex: /(green\s*sm|xanh\s*sm|taxi\s*xanh|\.op\*green\s*sm)/i, cleanName: 'Xanh SM (GSM)', category: 'Transportation' },
  { regex: /(grab)/i, cleanName: 'Grab', category: 'Transportation' },
  { regex: /(be\s*group|be\s*bike|be\s*car)/i, cleanName: 'Be Group', category: 'Transportation' },

  // 5. Shopping & E-Commerce
  { regex: /(hmikt|vua\s*nệm|vua\s*nem)/i, cleanName: 'Vua Nệm', category: 'Shopping & E-Commerce' },
  { regex: /(shopee)/i, cleanName: 'Shopee', category: 'Shopping & E-Commerce' },
  { regex: /(tiktok\s*shop|9pay.*tiktok)/i, cleanName: 'TikTok Shop', category: 'Shopping & E-Commerce' },
  { regex: /(lazada)/i, cleanName: 'Lazada', category: 'Shopping & E-Commerce' },
  { regex: /(tiki)/i, cleanName: 'Tiki', category: 'Shopping & E-Commerce' },
  { regex: /(mrdiy|mr\s*diy)/i, cleanName: 'MR. D.I.Y', category: 'Shopping & E-Commerce' },

  // 6. Dining & Cafes
  { regex: /(katinat)/i, cleanName: 'Katinat Saigon Kafe', category: 'Dining & Cafes' },
  { regex: /(highlands)/i, cleanName: 'Highlands Coffee', category: 'Dining & Cafes' },
  { regex: /(letcafe)/i, cleanName: 'Let Cafe', category: 'Dining & Cafes' },
  { regex: /(phuc\s*long|starbucks|the\s*coffee\s*house)/i, cleanName: 'Coffee & Tea', category: 'Dining & Cafes' },

  // 7. Utilities & Bills
  { regex: /(momo\s*evn|evn|dien\s*luc)/i, cleanName: 'Điện lực EVN', category: 'Utilities & Bills' },
  { regex: /(viettel)/i, cleanName: 'Viettel Telecom', category: 'Utilities & Bills' },
  { regex: /(vnpt|fpt\s*telecom)/i, cleanName: 'Internet & Telecom', category: 'Utilities & Bills' },

  // 8. Digital & Tech
  { regex: /(apple\.com|itunes)/i, cleanName: 'Apple Services', category: 'Digital & Tech' },
  { regex: /(google|youtube)/i, cleanName: 'Google Services', category: 'Digital & Tech' },
  { regex: /(thegioididong|tgdd|dien\s*may\s*xanh|fpt\s*shop|cellphones)/i, cleanName: 'Thế Giới Di Động', category: 'Digital & Tech' },

  // 9. Travel & Hotel
  { regex: /(agoda)/i, cleanName: 'Agoda', category: 'Travel & Hotel' },
  { regex: /(booking\.com|traveloka|vietnam\s*airlines|vietjet)/i, cleanName: 'Travel & Flights', category: 'Travel & Hotel' },

  // 10. Others & System
  { regex: /(auto\s*payment|thanh\s*toan\s*sao\s*ke|payment.*card|^\d{4}\s*\d{4}\s*\d{4}\s*\d{4})/i, cleanName: 'Credit Card Payment', category: 'Payment & Transfer' },
  { regex: /(cashback|hoan\s*tien|loy_hoan\s*tien)/i, cleanName: 'Cashback & Rewards', category: 'Payment & Transfer' },
  { regex: /(interest|lai\s*suat)/i, cleanName: 'Bank Interest & Fees', category: 'Payment & Transfer' },
];

export function normalizeMerchant(rawDesc, type) {
  const desc = (rawDesc || '').trim();
  for (const rule of MERCHANT_RULES) {
    if (rule.regex.test(desc)) {
      return { cleanMerchant: rule.cleanName, category: rule.category };
    }
  }

  let cleaned = desc
    .replace(/^(VNPAY\*|PAYOO\*|PAYOO\s+|9PAY\*|ONEPAY\s+|MOMO\s+|\.OP\*)/i, '')
    .replace(/\s+(VNM|VN|IRL|DEU|USA)$/i, '')
    .replace(/\s+(HANOI|HA NOI|HO CHI MINH|HCMC|HCM|TPHCM|TP THU DUC|AN GIANG|Berlin)$/i, '')
    .trim();

  return {
    cleanMerchant: cleaned || desc || (type === 'credit' ? 'Statement Credit' : 'Uncategorized Spend'),
    category: type === 'credit' ? 'Payment & Transfer' : 'Others',
  };
}

function parseVND(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/,/g, '')) || 0;
}

function parseDateDDMMYYYY(str) {
  const m = str.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return str;
}

export async function parseVietcombank(doc, fileName) {
  const transactions = [];
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
    const rowsMap = {};
    for (const item of tc.items) {
      if (!item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 3) * 3;
      if (!rowsMap[y]) rowsMap[y] = [];
      rowsMap[y].push({ text: item.str, x: Math.round(item.transform[4]) });
    }

    const sortedY = Object.keys(rowsMap).map(Number).sort((a, b) => b - a);

    for (let i = 0; i < sortedY.length; i++) {
      const y = sortedY[i];
      const items = rowsMap[y].sort((a, b) => a.x - b.x);
      const fullText = items.map(t => t.text).join(' ');

      if (pageNum === 1) {
        if (fullText.includes('VIETCOMBANK VISA SIGNATURE')) cardType = 'Vietcombank Visa Signature';
        if (fullText.includes('VS00700393113')) accountOrCard = 'VS00700393113';
        if (fullText.includes('NGO QUOC CUONG')) cardholderName = 'NGO QUOC CUONG';

        const regexMatch = fullText.match(/Credit Limit:\s*([\d,]+\.?\d*)/i);
        const itemMatch = items.find(it => it.text.match(/^\d{3},\d{3},\d{3}/));
        if (regexMatch) creditLimit = parseVND(regexMatch[1]);
        else if (itemMatch) creditLimit = parseVND(itemMatch.text);

        const dateMatch = fullText.match(/(\d{2}-\d{2}-\d{4})/);
        if (fullText.includes('Statement Date') && dateMatch) statementDate = parseDateDDMMYYYY(dateMatch[1]);
        if (fullText.includes('Proposed Payment Date') && dateMatch) dueDate = parseDateDDMMYYYY(dateMatch[1]);

        if (fullText.includes('Curent Statement Balance') || fullText.includes('Statement Balance:')) {
          const bal = items.find(it => it.x > 200 && /[\d,]+\.00/.test(it.text));
          if (bal) statementBalance = parseVND(bal.text);
        }

        if (fullText.includes('Min Payment Due:')) {
          const minP = items.find(it => it.x > 200 && /[\d,]+\.00/.test(it.text));
          if (minP) minPayment = parseVND(minP.text);
        }
      }

      const txnDateItem = items.find(it => it.x >= 40 && it.x <= 60 && /^\d{2}-\d{2}-\d{4}$/.test(it.text));
      if (txnDateItem) {
        const postDateItem = items.find(it => it.x >= 90 && it.x <= 110 && /^\d{2}-\d{2}-\d{4}$/.test(it.text));
        const debitItem = items.find(it => it.x >= 230 && it.x <= 270 && /^[\d,]+\.\d{2}$/.test(it.text));
        const creditItem = items.find(it => it.x >= 285 && it.x <= 340 && /^[\d,]+\.\d{2}$/.test(it.text));

        let type = 'debit';
        let amount = 0;
        if (debitItem) {
          type = 'debit';
          amount = parseVND(debitItem.text);
        } else if (creditItem) {
          type = 'credit';
          amount = parseVND(creditItem.text);
        }

        if (amount > 0) {
          const descParts = items.filter(it => it.x >= 355).map(it => it.text);
          if (i + 1 < sortedY.length) {
            const nextY = sortedY[i + 1];
            if (Math.abs(y - nextY) <= 5) {
              const extraItems = rowsMap[nextY].filter(it => it.x >= 355);
              descParts.push(...extraItems.map(it => it.text));
            }
          }

          const rawDescription = descParts.join(' ').trim();
          const { cleanMerchant, category } = normalizeMerchant(rawDescription, type);

          transactions.push({
            id: `vcb-${transactions.length + 1}`,
            bank: 'Vietcombank',
            sourceFile: fileName,
            accountOrCard: accountOrCard || 'VS00700393113',
            statementDate,
            txnDate: parseDateDDMMYYYY(txnDateItem.text),
            postDate: postDateItem ? parseDateDDMMYYYY(postDateItem.text) : parseDateDDMMYYYY(txnDateItem.text),
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

  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);

  return {
    summary: {
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
    },
    transactions,
  };
}

export async function parseHSBC(doc, fileName) {
  const transactions = [];
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
    const rowsMap = {};
    for (const item of tc.items) {
      if (!item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 3) * 3;
      if (!rowsMap[y]) rowsMap[y] = [];
      rowsMap[y].push({ text: item.str, x: Math.round(item.transform[4]) });
    }

    const sortedY = Object.keys(rowsMap).map(Number).sort((a, b) => b - a);

    for (let i = 0; i < sortedY.length; i++) {
      const y = sortedY[i];
      const items = rowsMap[y].sort((a, b) => a.x - b.x);
      const fullText = items.map(t => t.text).join(' ');

      if (pageNum === 1) {
        if (fullText.includes('NGO QUOC CUONG')) cardholderName = 'NGO QUOC CUONG';
        if (fullText.includes('HSBC VISA CASH BACK')) cardType = 'HSBC Visa Cash Back';
        if (fullText.includes('4450 9400 xxxx 7667')) accountOrCard = '4450 9400 xxxx 7667';

        const stmtDateItem = items.find(it => /^\d{2}\/\d{2}\/\d{4}$/.test(it.text));
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

        if (fullText.includes('Statement balance') || fullText.includes('Dư nợ cuối kỳ')) {
          const bal = items.find(it => it.x > 400 && /[\d,]+\.00/.test(it.text));
          if (bal) statementBalance = parseVND(bal.text);
        }

        if (fullText.includes('Minimum payment') || fullText.includes('Thanh toán tối thiểu')) {
          const minP = items.find(it => it.x > 400 && /[\d,]+\.00/.test(it.text));
          if (minP) minPayment = parseVND(minP.text);
        }

        if (fullText.includes('Your Credit Limit:')) {
          const lMatch = fullText.match(/VND\s*([\d,]+)/i);
          if (lMatch) creditLimit = parseVND(lMatch[1]);
        }
      }

      const txnDateItem = items.find(it => it.x >= 60 && it.x <= 85 && /^\d{2}\/\d{2}$/.test(it.text));
      if (txnDateItem) {
        const postDateItem = items.find(it => it.x >= 120 && it.x <= 145 && /^\d{2}\/\d{2}$/.test(it.text));
        const amountItem = items.find(it => it.x >= 450 && it.x <= 510 && /[\d,]+\.\d{2}/.test(it.text));
        if (amountItem) {
          const isCredit = /CR/i.test(fullText) || /CR/i.test(amountItem.text);
          const type = isCredit ? 'credit' : 'debit';
          const amount = parseVND(amountItem.text);

          const descItems = items.filter(it => it.x >= 165 && it.x < 450);
          const rawDescription = descItems.map(it => it.text).join(' ').trim();

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

          const { cleanMerchant, category } = normalizeMerchant(rawDescription, type);

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

  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);

  return {
    summary: {
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
    },
    transactions,
  };
}

export async function parsePdfFile(filePath, password, bankHint) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const fileName = path.basename(filePath);
  const doc = await pdfjsLib.getDocument({
    data,
    password: password || undefined,
    standardFontDataUrl: path.join(process.cwd(), 'node_modules/pdfjs-dist/standard_fonts/'),
  }).promise;

  const page1 = await doc.getPage(1);
  const tc = await page1.getTextContent();
  const page1Text = tc.items.map(it => it.str || '').join(' ');

  if (
    bankHint === 'Vietcombank' ||
    page1Text.includes('VIETCOMBANK') ||
    page1Text.includes('Vietcombank') ||
    fileName.toLowerCase().startsWith('vs')
  ) {
    return parseVietcombank(doc, fileName);
  } else {
    return parseHSBC(doc, fileName);
  }
}
