export type BankType = 'Vietcombank' | 'HSBC';

export type TransactionType = 'debit' | 'credit';

export interface CreditCardTransaction {
  id: string;
  bank: BankType;
  sourceFile: string;
  accountOrCard: string;
  statementDate: string; // YYYY-MM-DD
  txnDate: string; // YYYY-MM-DD
  postDate: string; // YYYY-MM-DD
  rawDescription: string;
  cleanMerchant: string;
  category: string;
  amount: number; // positive numeric value in VND
  type: TransactionType;
  currency: string;
}

export interface StatementSummary {
  bank: BankType;
  fileName: string;
  cardholderName: string;
  cardType: string;
  accountOrCard: string;
  statementDate: string;
  dueDate: string;
  creditLimit: number;
  statementBalance: number;
  minPayment: number;
  totalDebits: number;
  totalCredits: number;
  transactionsCount: number;
}

export interface ParsedStatementResult {
  summary: StatementSummary;
  transactions: CreditCardTransaction[];
}

export interface MerchantSpend {
  merchant: string;
  category: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface DailySpend {
  date: string; // YYYY-MM-DD
  displayDate: string; // DD/MM
  totalAmount: number;
  transactionCount: number;
  topMerchant?: string;
  transactions: CreditCardTransaction[];
}
