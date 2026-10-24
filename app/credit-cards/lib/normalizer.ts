import { TransactionType } from '../types';

export interface MerchantRule {
  regex: RegExp;
  cleanName: string;
  category: string;
}

// Exactly 10 consolidated consumer spending categories (+ Bank / Payments)
export const CONSOLIDATED_CATEGORIES = [
  'Groceries & Supermarket',
  'Healthcare & Pharmacy',
  'Insurance',
  'Transportation',
  'Shopping & E-Commerce',
  'Dining & Cafes',
  'Utilities & Bills',
  'Digital & Tech',
  'Travel & Hotel',
  'Others',
] as const;

export const MERCHANT_RULES: MerchantRule[] = [
  // 1. Groceries & Supermarket
  {
    regex: /(king\s*food|kfm_|ctcp\s+king\s+food)/i,
    cleanName: 'King Food Market',
    category: 'Groceries & Supermarket',
  },
  {
    regex: /(co\.?op\s*food|coop\s*food|co\.?op\s*mart|saigon\s*co\.?op)/i,
    cleanName: 'Co.op Food',
    category: 'Groceries & Supermarket',
  },
  {
    regex: /(wincommerce|winmart|wcm_)/i,
    cleanName: 'WinMart',
    category: 'Groceries & Supermarket',
  },
  {
    regex: /(mega\s*market|mm\s*mega)/i,
    cleanName: 'MM Mega Market',
    category: 'Groceries & Supermarket',
  },
  {
    regex: /(go_di\s*an|go!|big\s*c|central\s*retail)/i,
    cleanName: 'GO! Supermarket',
    category: 'Groceries & Supermarket',
  },
  {
    regex: /(gs25)/i,
    cleanName: 'GS25 Convenience',
    category: 'Groceries & Supermarket',
  },
  {
    regex: /(circle\s*k)/i,
    cleanName: 'Circle K',
    category: 'Groceries & Supermarket',
  },
  {
    regex: /(bach\s*hoa\s*xanh|bhx)/i,
    cleanName: 'Bách Hóa Xanh',
    category: 'Groceries & Supermarket',
  },

  // 2. Healthcare & Pharmacy
  {
    regex: /(msg\s*bd\s*2|mắt\s*sài\s*gòn|mat\s*sai\s*gon)/i,
    cleanName: 'Bệnh viện Mắt Sài Gòn',
    category: 'Healthcare & Pharmacy',
  },
  {
    regex: /(hoan\s*my|bvdk\s*qt\s*hoan\s*my)/i,
    cleanName: 'Bệnh viện Hoàn Mỹ',
    category: 'Healthcare & Pharmacy',
  },
  {
    regex: /(long\s*chau|fpt\s*lc|fptlongchau)/i,
    cleanName: 'Nhà thuốc Long Châu',
    category: 'Healthcare & Pharmacy',
  },
  {
    regex: /(pharmacity)/i,
    cleanName: 'Pharmacity',
    category: 'Healthcare & Pharmacy',
  },
  {
    regex: /(an\s*khang)/i,
    cleanName: 'Nhà thuốc An Khang',
    category: 'Healthcare & Pharmacy',
  },

  // 3. Insurance
  {
    regex: /(fwd|bh\s*nhan\s*tho\s*fwd)/i,
    cleanName: 'Bảo hiểm FWD',
    category: 'Insurance',
  },
  {
    regex: /(prudential|manulife|aia|dai-ichi|bảo\s*hiểm)/i,
    cleanName: 'Bảo hiểm nhân thọ',
    category: 'Insurance',
  },

  // 4. Transportation
  {
    regex: /(onepay.*vietnam|vinfast)/i,
    cleanName: 'VinFast',
    category: 'Transportation',
  },
  {
    regex: /(green\s*sm|xanh\s*sm|taxi\s*xanh|\.op\*green\s*sm)/i,
    cleanName: 'Xanh SM (GSM)',
    category: 'Transportation',
  },
  {
    regex: /(grab)/i,
    cleanName: 'Grab',
    category: 'Transportation',
  },
  {
    regex: /(be\s*group|be\s*bike|be\s*car)/i,
    cleanName: 'Be Group',
    category: 'Transportation',
  },

  // 5. Shopping & E-Commerce
  {
    regex: /(hmikt|vua\s*nệm|vua\s*nem)/i,
    cleanName: 'Vua Nệm',
    category: 'Shopping & E-Commerce',
  },
  {
    regex: /(shopee)/i,
    cleanName: 'Shopee',
    category: 'Shopping & E-Commerce',
  },
  {
    regex: /(tiktok\s*shop|9pay.*tiktok)/i,
    cleanName: 'TikTok Shop',
    category: 'Shopping & E-Commerce',
  },
  {
    regex: /(lazada)/i,
    cleanName: 'Lazada',
    category: 'Shopping & E-Commerce',
  },
  {
    regex: /(tiki)/i,
    cleanName: 'Tiki',
    category: 'Shopping & E-Commerce',
  },
  {
    regex: /(mrdiy|mr\s*diy)/i,
    cleanName: 'MR. D.I.Y',
    category: 'Shopping & E-Commerce',
  },

  // 6. Dining & Cafes
  {
    regex: /(katinat)/i,
    cleanName: 'Katinat Saigon Kafe',
    category: 'Dining & Cafes',
  },
  {
    regex: /(highlands)/i,
    cleanName: 'Highlands Coffee',
    category: 'Dining & Cafes',
  },
  {
    regex: /(letcafe)/i,
    cleanName: 'Let Cafe',
    category: 'Dining & Cafes',
  },
  {
    regex: /(phuc\s*long|starbucks|the\s*coffee\s*house)/i,
    cleanName: 'Coffee & Tea',
    category: 'Dining & Cafes',
  },

  // 7. Utilities & Bills
  {
    regex: /(momo\s*evn|evn|dien\s*luc)/i,
    cleanName: 'Điện lực EVN',
    category: 'Utilities & Bills',
  },
  {
    regex: /(viettel)/i,
    cleanName: 'Viettel Telecom',
    category: 'Utilities & Bills',
  },
  {
    regex: /(vnpt|fpt\s*telecom)/i,
    cleanName: 'Internet & Telecom',
    category: 'Utilities & Bills',
  },

  // 8. Digital & Tech
  {
    regex: /(apple\.com|itunes)/i,
    cleanName: 'Apple Services',
    category: 'Digital & Tech',
  },
  {
    regex: /(google|youtube)/i,
    cleanName: 'Google Services',
    category: 'Digital & Tech',
  },
  {
    regex: /(thegioididong|tgdd|dien\s*may\s*xanh|fpt\s*shop|cellphones)/i,
    cleanName: 'Thế Giới Di Động',
    category: 'Digital & Tech',
  },

  // 9. Travel & Hotel
  {
    regex: /(agoda)/i,
    cleanName: 'Agoda',
    category: 'Travel & Hotel',
  },
  {
    regex: /(booking\.com|traveloka|vietnam\s*airlines|vietjet)/i,
    cleanName: 'Travel & Flights',
    category: 'Travel & Hotel',
  },

  // 10. Others (Bank & Card System Transactions & Fallbacks)
  {
    regex: /(auto\s*payment|thanh\s*toan\s*sao\s*ke|payment.*card|^\d{4}\s*\d{4}\s*\d{4}\s*\d{4})/i,
    cleanName: 'Credit Card Payment',
    category: 'Payment & Transfer',
  },
  {
    regex: /(cashback|hoan\s*tien|loy_hoan\s*tien)/i,
    cleanName: 'Cashback & Rewards',
    category: 'Payment & Transfer',
  },
  {
    regex: /(interest|lai\s*suat|phi\s*thuong\s*nien|annual\s*fee)/i,
    cleanName: 'Bank Fees & Interest',
    category: 'Payment & Transfer',
  },
];

export function normalizeMerchant(
  rawDesc: string,
  type: TransactionType
): { cleanMerchant: string; category: string } {
  const desc = (rawDesc || '').trim();

  for (const rule of MERCHANT_RULES) {
    if (rule.regex.test(desc)) {
      return { cleanMerchant: rule.cleanName, category: rule.category };
    }
  }

  // Fallback heuristic: clean prefixes and country codes
  let cleaned = desc
    .replace(/^(VNPAY\*|PAYOO\*|PAYOO\s+|9PAY\*|ONEPAY\s+|MOMO\s+|\.OP\*)/i, '')
    .replace(/\s+(VNM|VN|IRL|DEU|USA)$/i, '')
    .replace(
      /\s+(HANOI|HA NOI|HO CHI MINH|HCMC|HCM|TPHCM|TP THU DUC|AN GIANG|Berlin)$/i,
      ''
    )
    .trim();

  if (!cleaned) {
    cleaned = desc || (type === 'credit' ? 'Statement Credit' : 'Uncategorized Spend');
  }

  return {
    cleanMerchant: cleaned,
    category: type === 'credit' ? 'Payment & Transfer' : 'Others',
  };
}
