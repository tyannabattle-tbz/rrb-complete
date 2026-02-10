/**
 * Bookkeeping Page — Canryn Production Business Operations
 * Chart of Accounts, Journal Entries, General Ledger
 * Offline-first with IndexedDB caching
 */
import { useState, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OfflineStatusBar } from "@/components/OfflineStatusBar";
import { SubsidiaryFilter } from "@/components/SubsidiaryFilter";
import {
  BookOpen,
  Plus,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function BusinessBookkeeping() {
  
  const [subsidiary, setSubsidiary] = useState("all");
  const [activeTab, setActiveTab] = useState("accounts");
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [showNewEntry, setShowNewEntry] = useState(false);

  // New account form
  const [accountForm, setAccountForm] = useState({
    accountCode: "",
    accountName: "",
    accountType: "asset" as "asset" | "liability" | "equity" | "revenue" | "expense",
    description: "",
  });

  // New journal entry form
  const [entryForm, setEntryForm] = useState({
    entryNumber: "",
    description: "",
    reference: "",
    lines: [
      { accountId: 0, debit: "", credit: "", memo: "" },
      { accountId: 0, debit: "", credit: "", memo: "" },
    ],
  });

  const subFilter = subsidiary === "all" ? undefined : subsidiary;

  const accountsQuery = trpc.bookkeeping.getAccounts.useQuery(
    subFilter ? { subsidiary: subFilter } : undefined
  );
  const entriesQuery = trpc.bookkeeping.getJournalEntries.useQuery(
    subFilter ? { subsidiary: subFilter } : undefined
  );
  const statsQuery = trpc.bookkeeping.getDashboardStats.useQuery();

  const utils = trpc.useUtils();

  const createAccountMut = trpc.bookkeeping.createAccount.useMutation({
    onSuccess: () => {
      toast.success("Account created");
      setShowNewAccount(false);
      setAccountForm({ accountCode: "", accountName: "", accountType: "asset", description: "" });
      utils.bookkeeping.getAccounts.invalidate();
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const createEntryMut = trpc.bookkeeping.createJournalEntry.useMutation({
    onSuccess: () => {
      toast.success("Journal entry created");
      setShowNewEntry(false);
      setEntryForm({
        entryNumber: "",
        description: "",
        reference: "",
        lines: [
          { accountId: 0, debit: "", credit: "", memo: "" },
          { accountId: 0, debit: "", credit: "", memo: "" },
        ],
      });
      utils.bookkeeping.getJournalEntries.invalidate();
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const postEntryMut = trpc.bookkeeping.postJournalEntry.useMutation({
    onSuccess: () => {
      toast.success("Entry posted");
      utils.bookkeeping.getJournalEntries.invalidate();
    },
  });

  const accounts = accountsQuery.data ?? [];
  const entries = entriesQuery.data ?? [];
  const stats = statsQuery.data;

  const accountTypeColors: Record<string, string> = {
    asset: "bg-blue-500/20 text-blue-300",
    liability: "bg-red-500/20 text-red-300",
    equity: "bg-purple-500/20 text-purple-300",
    revenue: "bg-green-500/20 text-green-300",
    expense: "bg-amber-500/20 text-amber-300",
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-500/20 text-gray-300",
    posted: "bg-green-500/20 text-green-300",
    voided: "bg-red-500/20 text-red-300",
  };

  const addLine = () => {
    setEntryForm((prev) => ({
      ...prev,
      lines: [...prev.lines, { accountId: 0, debit: "", credit: "", memo: "" }],
    }));
  };

  const updateLine = (index: number, field: string, value: string | number) => {
    setEntryForm((prev) => ({
      ...prev,
      lines: prev.lines.map((l, i) => (i === index ? { ...l, [field]: value } : l)),
    }));
  };

  const totalDebit = entryForm.lines.reduce((s, l) => s + parseFloat(l.debit || "0"), 0);
  const totalCredit = entryForm.lines.reduce((s, l) => s + parseFloat(l.credit || "0"), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <BookOpen className="w-6 h-6 text-amber-400" />
        <h1 className="text-2xl font-bold">Bookkeeping</h1>
        <span className="text-sm text-muted-foreground">Canryn Production</span>
      </div>

      <OfflineStatusBar
        isOffline={false}
        isSyncing={false}
        pendingCount={0}
        lastSynced={null}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Accounts</div>
            <div className="text-2xl font-bold">{stats?.totalAccounts ?? accounts.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Journal Entries</div>
            <div className="text-2xl font-bold">{entries.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Active Employees</div>
            <div className="text-2xl font-bold">{stats?.totalEmployees ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Active Contracts</div>
            <div className="text-2xl font-bold">{stats?.activeContracts ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 mb-6">
        <SubsidiaryFilter value={subsidiary} onChange={setSubsidiary} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="journal">Journal Entries</TabsTrigger>
        </TabsList>

        {/* Chart of Accounts */}
        <TabsContent value="accounts">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Chart of Accounts</h2>
            <Dialog open={showNewAccount} onOpenChange={setShowNewAccount}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> New Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Account Code (e.g. 1000)"
                    value={accountForm.accountCode}
                    onChange={(e) => setAccountForm((p) => ({ ...p, accountCode: e.target.value }))}
                  />
                  <Input
                    placeholder="Account Name"
                    value={accountForm.accountName}
                    onChange={(e) => setAccountForm((p) => ({ ...p, accountName: e.target.value }))}
                  />
                  <Select
                    value={accountForm.accountType}
                    onValueChange={(v: any) => setAccountForm((p) => ({ ...p, accountType: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asset">Asset</SelectItem>
                      <SelectItem value="liability">Liability</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Description (optional)"
                    value={accountForm.description}
                    onChange={(e) => setAccountForm((p) => ({ ...p, description: e.target.value }))}
                  />
                  <Button
                    className="w-full"
                    onClick={() =>
                      createAccountMut.mutate({
                        ...accountForm,
                        subsidiary: subFilter,
                      })
                    }
                    disabled={!accountForm.accountCode || !accountForm.accountName || createAccountMut.isPending}
                  >
                    {createAccountMut.isPending ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {accountsQuery.isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <Card className="bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No accounts yet. Create your first chart of accounts entry.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {accounts.map((acct: any) => (
                <Card key={acct.id} className="bg-card hover:bg-accent/5 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="font-mono text-sm text-muted-foreground w-16">{acct.accountCode}</div>
                    <div className="flex-1">
                      <div className="font-medium">{acct.accountName}</div>
                      {acct.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">{acct.description}</div>
                      )}
                    </div>
                    <Badge className={accountTypeColors[acct.accountType] ?? ""}>
                      {acct.accountType}
                    </Badge>
                    <div className="text-right font-mono">
                      ${parseFloat(acct.balance ?? "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Journal Entries */}
        <TabsContent value="journal">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Journal Entries</h2>
            <Dialog open={showNewEntry} onOpenChange={setShowNewEntry}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> New Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Journal Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Entry Number (e.g. JE-001)"
                      value={entryForm.entryNumber}
                      onChange={(e) => setEntryForm((p) => ({ ...p, entryNumber: e.target.value }))}
                    />
                    <Input
                      placeholder="Reference"
                      value={entryForm.reference}
                      onChange={(e) => setEntryForm((p) => ({ ...p, reference: e.target.value }))}
                    />
                  </div>
                  <Textarea
                    placeholder="Description"
                    value={entryForm.description}
                    onChange={(e) => setEntryForm((p) => ({ ...p, description: e.target.value }))}
                  />

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Ledger Lines</div>
                    {entryForm.lines.map((line, i) => (
                      <div key={i} className="grid grid-cols-4 gap-2">
                        <Select
                          value={line.accountId ? String(line.accountId) : "select"}
                          onValueChange={(v) => updateLine(i, "accountId", parseInt(v))}
                        >
                          <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="select" disabled>Select Account</SelectItem>
                            {accounts.map((a: any) => (
                              <SelectItem key={a.id} value={String(a.id)}>
                                {a.accountCode} — {a.accountName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Debit"
                          type="number"
                          step="0.01"
                          value={line.debit}
                          onChange={(e) => updateLine(i, "debit", e.target.value)}
                        />
                        <Input
                          placeholder="Credit"
                          type="number"
                          step="0.01"
                          value={line.credit}
                          onChange={(e) => updateLine(i, "credit", e.target.value)}
                        />
                        <Input
                          placeholder="Memo"
                          value={line.memo}
                          onChange={(e) => updateLine(i, "memo", e.target.value)}
                        />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addLine}>
                      + Add Line
                    </Button>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-lg ${isBalanced ? "bg-green-500/10" : "bg-red-500/10"}`}>
                    <div className="flex items-center gap-2">
                      {isBalanced ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-sm">{isBalanced ? "Balanced" : "Not balanced"}</span>
                    </div>
                    <div className="text-sm font-mono">
                      Dr: ${totalDebit.toFixed(2)} | Cr: ${totalCredit.toFixed(2)}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    disabled={!isBalanced || !entryForm.entryNumber || !entryForm.description || createEntryMut.isPending}
                    onClick={() =>
                      createEntryMut.mutate({
                        ...entryForm,
                        entryDate: new Date().toISOString(),
                        totalDebit: totalDebit.toFixed(2),
                        totalCredit: totalCredit.toFixed(2),
                        subsidiary: subFilter,
                      })
                    }
                  >
                    {createEntryMut.isPending ? "Creating..." : "Create Journal Entry"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {entriesQuery.isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading entries...</div>
          ) : entries.length === 0 ? (
            <Card className="bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No journal entries yet. Create accounts first, then record transactions.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {entries.map((entry: any) => (
                <Card key={entry.id} className="bg-card hover:bg-accent/5 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="font-mono text-sm text-muted-foreground w-20">{entry.entryNumber}</div>
                    <div className="flex-1">
                      <div className="font-medium">{entry.description}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {entry.entryDate ? new Date(entry.entryDate).toLocaleDateString() : "—"}
                        {entry.reference && ` · Ref: ${entry.reference}`}
                      </div>
                    </div>
                    <Badge className={statusColors[entry.status] ?? ""}>
                      {entry.status}
                    </Badge>
                    <div className="text-right font-mono text-sm">
                      ${parseFloat(entry.totalDebit ?? "0").toFixed(2)}
                    </div>
                    {entry.status === "draft" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => postEntryMut.mutate({ id: entry.id })}
                        disabled={postEntryMut.isPending}
                      >
                        Post
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
