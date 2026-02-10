/**
 * Offline-First IndexedDB Storage for Canryn Production Business Operations
 * 
 * Provides local caching and offline queue for:
 * - Bookkeeping (accounts, journal entries, ledger)
 * - Human Resources (employees, departments, payroll, time tracking)
 * - Accounting (invoices, payments, reconciliation)
 * - Contracts & Legal (contracts, IP, compliance)
 * 
 * Data is cached locally for offline viewing and queued mutations
 * auto-sync when connectivity returns.
 */

const DB_NAME = 'canryn_business_ops';
const DB_VERSION = 1;

// Store names
const STORES = {
  // Bookkeeping
  ACCOUNTS: 'bookkeeping_accounts',
  JOURNAL_ENTRIES: 'bookkeeping_journal_entries',
  LEDGER_LINES: 'bookkeeping_ledger_lines',
  // HR
  EMPLOYEES: 'hr_employees',
  DEPARTMENTS: 'hr_departments',
  TIME_TRACKING: 'hr_time_tracking',
  PAYROLL: 'hr_payroll',
  // Accounting
  INVOICES: 'accounting_invoices',
  PAYMENTS: 'accounting_payments',
  RECONCILIATION: 'accounting_reconciliation',
  // Legal
  CONTRACTS: 'legal_contracts',
  IP: 'legal_intellectual_property',
  COMPLIANCE: 'legal_compliance_items',
  // Sync queue
  OFFLINE_QUEUE: 'offline_queue',
  // Metadata
  SYNC_META: 'sync_metadata',
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

export interface OfflineQueueItem {
  id?: number;
  store: StoreName;
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
  retries: number;
}

export interface SyncMetadata {
  store: string;
  lastSyncedAt: number;
  itemCount: number;
}

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create all business stores with id index
      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, {
            keyPath: storeName === 'offline_queue' ? 'id' : 'id',
            autoIncrement: storeName === 'offline_queue',
          });
          if (storeName === 'offline_queue') {
            store.createIndex('synced', 'synced', { unique: false });
            store.createIndex('store', 'store', { unique: false });
          }
          if (storeName === 'sync_metadata') {
            // store uses 'store' as keyPath
          }
        }
      });
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => reject(request.error);
  });
}

// Generic CRUD operations for any store
export async function getAllFromStore<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getFromStore<T>(storeName: StoreName, id: number): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function putInStore<T extends { id?: number }>(storeName: StoreName, data: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function bulkPutInStore<T>(storeName: StoreName, items: T[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    items.forEach((item) => store.put(item));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteFromStore(storeName: StoreName, id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearStore(storeName: StoreName): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Offline queue operations
export async function addToOfflineQueue(item: Omit<OfflineQueueItem, 'id' | 'synced' | 'retries' | 'timestamp'>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.OFFLINE_QUEUE, 'readwrite');
    const store = tx.objectStore(STORES.OFFLINE_QUEUE);
    store.add({
      ...item,
      timestamp: Date.now(),
      synced: false,
      retries: 0,
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingQueueItems(): Promise<OfflineQueueItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.OFFLINE_QUEUE, 'readonly');
    const store = tx.objectStore(STORES.OFFLINE_QUEUE);
    const index = store.index('synced');
    const request = index.getAll(false);
    request.onsuccess = () => resolve(request.result as OfflineQueueItem[]);
    request.onerror = () => reject(request.error);
  });
}

export async function markQueueItemSynced(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.OFFLINE_QUEUE, 'readwrite');
    const store = tx.objectStore(STORES.OFFLINE_QUEUE);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const item = getReq.result;
      if (item) {
        item.synced = true;
        store.put(item);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Connectivity detection
export function isOnline(): boolean {
  return navigator.onLine;
}

export function onConnectivityChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Sync metadata
export async function updateSyncMeta(storeName: string, itemCount: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SYNC_META, 'readwrite');
    const store = tx.objectStore(STORES.SYNC_META);
    store.put({ store: storeName, lastSyncedAt: Date.now(), itemCount, id: storeName });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSyncMeta(storeName: string): Promise<SyncMetadata | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SYNC_META, 'readonly');
    const store = tx.objectStore(STORES.SYNC_META);
    const request = store.get(storeName);
    request.onsuccess = () => resolve(request.result as SyncMetadata | undefined);
    request.onerror = () => reject(request.error);
  });
}

// Client-side financial calculations (work offline)
export function calculateTrialBalance(accounts: Array<{ accountType: string; balance: number }>) {
  let totalDebits = 0;
  let totalCredits = 0;
  accounts.forEach((acc) => {
    const bal = Number(acc.balance) || 0;
    if (['asset', 'expense'].includes(acc.accountType)) {
      totalDebits += bal;
    } else {
      totalCredits += bal;
    }
  });
  return { totalDebits, totalCredits, balanced: Math.abs(totalDebits - totalCredits) < 0.01 };
}

export function calculateProfitAndLoss(accounts: Array<{ accountType: string; balance: number; accountName: string }>) {
  const revenue = accounts.filter((a) => a.accountType === 'revenue');
  const expenses = accounts.filter((a) => a.accountType === 'expense');
  const totalRevenue = revenue.reduce((s, a) => s + (Number(a.balance) || 0), 0);
  const totalExpenses = expenses.reduce((s, a) => s + (Number(a.balance) || 0), 0);
  return { revenue, expenses, totalRevenue, totalExpenses, netIncome: totalRevenue - totalExpenses };
}

export function calculateBalanceSheet(accounts: Array<{ accountType: string; balance: number; accountName: string }>) {
  const assets = accounts.filter((a) => a.accountType === 'asset');
  const liabilities = accounts.filter((a) => a.accountType === 'liability');
  const equity = accounts.filter((a) => a.accountType === 'equity');
  const totalAssets = assets.reduce((s, a) => s + (Number(a.balance) || 0), 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + (Number(a.balance) || 0), 0);
  const totalEquity = equity.reduce((s, a) => s + (Number(a.balance) || 0), 0);
  return { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity, balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 };
}

export function calculatePayrollSummary(payrollRecords: Array<{ grossPay: number; deductions: number; netPay: number; taxWithheld: number }>) {
  return payrollRecords.reduce(
    (acc, r) => ({
      totalGross: acc.totalGross + (Number(r.grossPay) || 0),
      totalDeductions: acc.totalDeductions + (Number(r.deductions) || 0),
      totalNet: acc.totalNet + (Number(r.netPay) || 0),
      totalTax: acc.totalTax + (Number(r.taxWithheld) || 0),
      count: acc.count + 1,
    }),
    { totalGross: 0, totalDeductions: 0, totalNet: 0, totalTax: 0, count: 0 }
  );
}

export { STORES };
