/**
 * Database helpers for Canryn Production Business Operations
 * Bookkeeping, HR, Accounting, Contracts & Legal
 * 
 * All helpers follow the same pattern as server/db.ts:
 * - getDb() for lazy connection
 * - Return raw Drizzle rows
 * - Graceful fallback when DB unavailable
 */

import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import {
  bookkeepingAccounts,
  bookkeepingJournalEntries,
  bookkeepingLedgerLines,
  hrEmployees,
  hrDepartments,
  hrTimeTracking,
  hrPayroll,
  accountingInvoices,
  accountingPayments,
  accountingReconciliation,
  legalContracts,
  legalIntellectualProperty,
  legalComplianceItems,
} from "../drizzle/schema";
import { getDb } from "./db";

// ═══════════════════════════════════════════════════════════
// BOOKKEEPING
// ═══════════════════════════════════════════════════════════

export async function getAccounts(subsidiary?: string) {
  const db = await getDb();
  if (!db) return [];
  if (subsidiary) {
    return db.select().from(bookkeepingAccounts).where(eq(bookkeepingAccounts.subsidiary, subsidiary)).orderBy(bookkeepingAccounts.accountCode);
  }
  return db.select().from(bookkeepingAccounts).orderBy(bookkeepingAccounts.accountCode);
}

export async function getAccountById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(bookkeepingAccounts).where(eq(bookkeepingAccounts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createAccount(data: {
  accountCode: string; accountName: string; accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentAccountId?: number; description?: string; subsidiary?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookkeepingAccounts).values(data);
  return result[0].insertId;
}

export async function updateAccount(id: number, data: Partial<{
  accountName: string; accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  description: string; isActive: boolean; balance: string; subsidiary: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bookkeepingAccounts).set(data).where(eq(bookkeepingAccounts.id, id));
}

export async function getJournalEntries(subsidiary?: string) {
  const db = await getDb();
  if (!db) return [];
  if (subsidiary) {
    return db.select().from(bookkeepingJournalEntries).where(eq(bookkeepingJournalEntries.subsidiary, subsidiary)).orderBy(desc(bookkeepingJournalEntries.entryDate));
  }
  return db.select().from(bookkeepingJournalEntries).orderBy(desc(bookkeepingJournalEntries.entryDate));
}

export async function createJournalEntry(data: {
  entryNumber: string; entryDate: Date; description: string; reference?: string;
  createdBy?: number; totalDebit: string; totalCredit: string; subsidiary?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookkeepingJournalEntries).values(data);
  return result[0].insertId;
}

export async function updateJournalEntry(id: number, data: Partial<{
  description: string; reference: string; status: 'draft' | 'posted' | 'voided'; approvedBy: number;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bookkeepingJournalEntries).set(data).where(eq(bookkeepingJournalEntries.id, id));
}

export async function createLedgerLine(data: {
  journalEntryId: number; accountId: number; debit: string; credit: string; memo?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(bookkeepingLedgerLines).values(data);
}

export async function getLedgerLinesByEntry(journalEntryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookkeepingLedgerLines).where(eq(bookkeepingLedgerLines.journalEntryId, journalEntryId));
}

// ═══════════════════════════════════════════════════════════
// HUMAN RESOURCES
// ═══════════════════════════════════════════════════════════

export async function getEmployees(subsidiary?: string) {
  const db = await getDb();
  if (!db) return [];
  if (subsidiary) {
    return db.select().from(hrEmployees).where(eq(hrEmployees.subsidiary, subsidiary)).orderBy(hrEmployees.lastName);
  }
  return db.select().from(hrEmployees).orderBy(hrEmployees.lastName);
}

export async function getEmployeeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(hrEmployees).where(eq(hrEmployees.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createEmployee(data: {
  employeeNumber: string; firstName: string; lastName: string; email?: string; phone?: string;
  title?: string; departmentId?: number; subsidiary?: string; hireDate: Date;
  employmentType?: 'full_time' | 'part_time' | 'contractor' | 'intern'; salary?: string;
  payFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'annual'; notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(hrEmployees).values(data);
  return result[0].insertId;
}

export async function updateEmployee(id: number, data: Partial<{
  firstName: string; lastName: string; email: string; phone: string; title: string;
  departmentId: number; subsidiary: string; status: 'active' | 'on_leave' | 'terminated' | 'retired';
  employmentType: 'full_time' | 'part_time' | 'contractor' | 'intern';
  salary: string; payFrequency: 'weekly' | 'biweekly' | 'monthly' | 'annual';
  terminationDate: Date; notes: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(hrEmployees).set(data).where(eq(hrEmployees.id, id));
}

export async function getDepartments(subsidiary?: string) {
  const db = await getDb();
  if (!db) return [];
  if (subsidiary) {
    return db.select().from(hrDepartments).where(eq(hrDepartments.subsidiary, subsidiary)).orderBy(hrDepartments.name);
  }
  return db.select().from(hrDepartments).orderBy(hrDepartments.name);
}

export async function createDepartment(data: {
  name: string; code: string; subsidiary?: string; managerId?: number;
  description?: string; budget?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(hrDepartments).values(data);
  return result[0].insertId;
}

export async function updateDepartment(id: number, data: Partial<{
  name: string; code: string; subsidiary: string; managerId: number;
  description: string; budget: string; headcount: number; isActive: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(hrDepartments).set(data).where(eq(hrDepartments.id, id));
}

export async function getTimeTracking(employeeId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (employeeId) {
    return db.select().from(hrTimeTracking).where(eq(hrTimeTracking.employeeId, employeeId)).orderBy(desc(hrTimeTracking.date));
  }
  return db.select().from(hrTimeTracking).orderBy(desc(hrTimeTracking.date));
}

export async function createTimeEntry(data: {
  employeeId: number; date: Date; hoursWorked: string; overtime?: string;
  projectCode?: string; notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(hrTimeTracking).values(data);
}

export async function getPayroll(employeeId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (employeeId) {
    return db.select().from(hrPayroll).where(eq(hrPayroll.employeeId, employeeId)).orderBy(desc(hrPayroll.payPeriodEnd));
  }
  return db.select().from(hrPayroll).orderBy(desc(hrPayroll.payPeriodEnd));
}

export async function createPayrollEntry(data: {
  employeeId: number; payPeriodStart: Date; payPeriodEnd: Date;
  grossPay: string; deductions: string; netPay: string; taxWithheld: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(hrPayroll).values(data);
}

export async function updatePayrollEntry(id: number, data: Partial<{
  status: 'pending' | 'processed' | 'paid' | 'voided'; paidDate: Date;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(hrPayroll).set(data).where(eq(hrPayroll.id, id));
}

// ═══════════════════════════════════════════════════════════
// ACCOUNTING
// ═══════════════════════════════════════════════════════════

export async function getInvoices(type?: 'receivable' | 'payable', subsidiary?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (type) conditions.push(eq(accountingInvoices.type, type));
  if (subsidiary) conditions.push(eq(accountingInvoices.subsidiary, subsidiary));
  if (conditions.length > 0) {
    return db.select().from(accountingInvoices).where(and(...conditions)).orderBy(desc(accountingInvoices.issueDate));
  }
  return db.select().from(accountingInvoices).orderBy(desc(accountingInvoices.issueDate));
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(accountingInvoices).where(eq(accountingInvoices.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createInvoice(data: {
  invoiceNumber: string; type: 'receivable' | 'payable'; clientName: string;
  clientEmail?: string; issueDate: Date; dueDate: Date; subtotal: string;
  tax?: string; total: string; subsidiary?: string; notes?: string; lineItems?: unknown;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(accountingInvoices).values(data);
  return result[0].insertId;
}

export async function updateInvoice(id: number, data: Partial<{
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'void';
  amountPaid: string; notes: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(accountingInvoices).set(data).where(eq(accountingInvoices.id, id));
}

export async function getPayments(invoiceId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (invoiceId) {
    return db.select().from(accountingPayments).where(eq(accountingPayments.invoiceId, invoiceId)).orderBy(desc(accountingPayments.paymentDate));
  }
  return db.select().from(accountingPayments).orderBy(desc(accountingPayments.paymentDate));
}

export async function createPayment(data: {
  invoiceId?: number; paymentDate: Date; amount: string;
  method?: 'cash' | 'check' | 'wire' | 'ach' | 'credit_card' | 'stripe' | 'paypal' | 'other';
  reference?: string; notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(accountingPayments).values(data);
}

export async function getReconciliations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(accountingReconciliation).orderBy(desc(accountingReconciliation.reconciliationDate));
}

export async function createReconciliation(data: {
  accountId: number; reconciliationDate: Date; statementBalance: string;
  bookBalance: string; difference: string; notes?: string; reconciledBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(accountingReconciliation).values(data);
}

// ═══════════════════════════════════════════════════════════
// CONTRACTS & LEGAL
// ═══════════════════════════════════════════════════════════

export async function getContracts(subsidiary?: string) {
  const db = await getDb();
  if (!db) return [];
  if (subsidiary) {
    return db.select().from(legalContracts).where(eq(legalContracts.subsidiary, subsidiary)).orderBy(desc(legalContracts.createdAt));
  }
  return db.select().from(legalContracts).orderBy(desc(legalContracts.createdAt));
}

export async function getContractById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(legalContracts).where(eq(legalContracts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createContract(data: {
  contractNumber: string; title: string;
  contractType: 'artist_agreement' | 'licensing' | 'nda' | 'employment' | 'vendor' | 'distribution' | 'publishing' | 'sponsorship' | 'partnership' | 'other';
  counterparty: string; startDate?: Date; endDate?: Date; value?: string;
  subsidiary?: string; description?: string; terms?: string; assignedTo?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(legalContracts).values(data);
  return result[0].insertId;
}

export async function updateContract(id: number, data: Partial<{
  title: string; status: 'draft' | 'review' | 'approved' | 'active' | 'expired' | 'terminated' | 'disputed';
  endDate: Date; description: string; terms: string; approvedBy: number; documentUrl: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(legalContracts).set(data).where(eq(legalContracts.id, id));
}

export async function getIntellectualProperty(subsidiary?: string) {
  const db = await getDb();
  if (!db) return [];
  if (subsidiary) {
    return db.select().from(legalIntellectualProperty).where(eq(legalIntellectualProperty.subsidiary, subsidiary)).orderBy(desc(legalIntellectualProperty.createdAt));
  }
  return db.select().from(legalIntellectualProperty).orderBy(desc(legalIntellectualProperty.createdAt));
}

export async function createIntellectualProperty(data: {
  title: string;
  ipType: 'copyright' | 'trademark' | 'patent' | 'trade_secret' | 'licensing_right' | 'masters' | 'publishing_right';
  owner: string; registrationNumber?: string; filingDate?: Date; expirationDate?: Date;
  description?: string; subsidiary?: string; value?: string; notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(legalIntellectualProperty).values(data);
  return result[0].insertId;
}

export async function updateIntellectualProperty(id: number, data: Partial<{
  title: string; status: 'pending' | 'registered' | 'active' | 'expired' | 'disputed' | 'transferred';
  registrationNumber: string; description: string; value: string; notes: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(legalIntellectualProperty).set(data).where(eq(legalIntellectualProperty.id, id));
}

export async function getComplianceItems(subsidiary?: string) {
  const db = await getDb();
  if (!db) return [];
  if (subsidiary) {
    return db.select().from(legalComplianceItems).where(eq(legalComplianceItems.subsidiary, subsidiary)).orderBy(desc(legalComplianceItems.createdAt));
  }
  return db.select().from(legalComplianceItems).orderBy(desc(legalComplianceItems.createdAt));
}

export async function createComplianceItem(data: {
  title: string;
  category: 'fcc' | 'copyright' | 'gdpr' | 'ccpa' | 'ada' | 'tax' | 'employment_law' | 'broadcast_license' | 'other';
  dueDate?: Date; assignedTo?: number; description?: string; subsidiary?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(legalComplianceItems).values(data);
  return result[0].insertId;
}

export async function updateComplianceItem(id: number, data: Partial<{
  title: string; status: 'compliant' | 'non_compliant' | 'pending_review' | 'in_progress' | 'waived';
  resolution: string; priority: 'low' | 'medium' | 'high' | 'critical';
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(legalComplianceItems).set(data).where(eq(legalComplianceItems.id, id));
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD AGGREGATES
// ═══════════════════════════════════════════════════════════

export async function getBusinessDashboardStats() {
  const db = await getDb();
  if (!db) return {
    totalAccounts: 0, totalEmployees: 0, activeContracts: 0,
    pendingInvoices: 0, complianceItems: 0, totalRevenue: '0.00',
  };

  const [accounts, employees, contracts, invoices, compliance] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(bookkeepingAccounts).where(eq(bookkeepingAccounts.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(hrEmployees).where(eq(hrEmployees.status, 'active')),
    db.select({ count: sql<number>`count(*)` }).from(legalContracts).where(eq(legalContracts.status, 'active')),
    db.select({ count: sql<number>`count(*)` }).from(accountingInvoices).where(eq(accountingInvoices.status, 'sent')),
    db.select({ count: sql<number>`count(*)` }).from(legalComplianceItems).where(eq(legalComplianceItems.status, 'pending_review')),
  ]);

  return {
    totalAccounts: accounts[0]?.count ?? 0,
    totalEmployees: employees[0]?.count ?? 0,
    activeContracts: contracts[0]?.count ?? 0,
    pendingInvoices: invoices[0]?.count ?? 0,
    complianceItems: compliance[0]?.count ?? 0,
  };
}
