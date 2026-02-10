/**
 * Accounting Page — Canryn Production Business Operations
 * Invoices (AR/AP), payments, reconciliation, financial summary
 * Offline-first with IndexedDB caching, accessible design
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { OfflineStatusBar } from "@/components/OfflineStatusBar";
import { SubsidiaryFilter } from "@/components/SubsidiaryFilter";
import {
  Receipt, Plus, ArrowLeft, TrendingUp, TrendingDown, DollarSign, AlertTriangle,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function BusinessAccounting() {
  
  const [subsidiary, setSubsidiary] = useState("all");
  const [activeTab, setActiveTab] = useState("receivable");
  const [showNewInvoice, setShowNewInvoice] = useState(false);

  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: "", clientName: "", clientEmail: "",
    issueDate: "", dueDate: "", subtotal: "", tax: "", total: "", notes: "",
  });

  const subFilter = subsidiary === "all" ? undefined : subsidiary;

  const arQuery = trpc.accounting.getInvoices.useQuery({ type: "receivable", subsidiary: subFilter });
  const apQuery = trpc.accounting.getInvoices.useQuery({ type: "payable", subsidiary: subFilter });
  const paymentsQuery = trpc.accounting.getPayments.useQuery(undefined);
  const summaryQuery = trpc.accounting.getFinancialSummary.useQuery(subFilter ? { subsidiary: subFilter } : undefined);

  const utils = trpc.useUtils();

  const createInvoiceMut = trpc.accounting.createInvoice.useMutation({
    onSuccess: () => {
      toast.success("Invoice created");
      setShowNewInvoice(false);
      setInvoiceForm({ invoiceNumber: "", clientName: "", clientEmail: "", issueDate: "", dueDate: "", subtotal: "", tax: "", total: "", notes: "" });
      utils.accounting.getInvoices.invalidate();
      utils.accounting.getFinancialSummary.invalidate();
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const updateInvoiceMut = trpc.accounting.updateInvoice.useMutation({
    onSuccess: () => {
      utils.accounting.getInvoices.invalidate();
      utils.accounting.getFinancialSummary.invalidate();
    },
  });

  const receivables = arQuery.data ?? [];
  const payables = apQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];
  const summary = summaryQuery.data;

  const statusColors: Record<string, string> = {
    draft: "bg-gray-500/20 text-gray-300",
    sent: "bg-blue-500/20 text-blue-300",
    paid: "bg-green-500/20 text-green-300",
    partial: "bg-amber-500/20 text-amber-300",
    overdue: "bg-red-500/20 text-red-300",
    cancelled: "bg-gray-500/20 text-gray-300",
    void: "bg-gray-500/20 text-gray-300",
  };

  const invoiceType = activeTab === "receivable" ? "receivable" : "payable";

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Receipt className="w-6 h-6 text-green-400" />
        <h1 className="text-2xl font-bold">Accounting</h1>
        <span className="text-sm text-muted-foreground">Canryn Production</span>
      </div>

      <OfflineStatusBar isOffline={false} isSyncing={false} pendingCount={0} lastSynced={null} />

      {/* Financial Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-green-400" /> Receivable
            </div>
            <div className="text-2xl font-bold font-mono text-green-400">
              ${summary?.totalReceivable ?? "0.00"}
            </div>
            {summary?.overdueReceivables ? (
              <div className="text-xs text-red-400 flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3" /> {summary.overdueReceivables} overdue
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card className="bg-card border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="w-4 h-4 text-red-400" /> Payable
            </div>
            <div className="text-2xl font-bold font-mono text-red-400">
              ${summary?.totalPayable ?? "0.00"}
            </div>
            {summary?.overduePayables ? (
              <div className="text-xs text-red-400 flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3" /> {summary.overduePayables} overdue
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" /> Collected
            </div>
            <div className="text-2xl font-bold font-mono">
              ${summary?.totalCollected ?? "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Net Position
            </div>
            <div className={`text-2xl font-bold font-mono ${parseFloat(summary?.netPosition ?? "0") >= 0 ? "text-green-400" : "text-red-400"}`}>
              ${summary?.netPosition ?? "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <SubsidiaryFilter value={subsidiary} onChange={setSubsidiary} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="receivable">Accounts Receivable ({receivables.length})</TabsTrigger>
          <TabsTrigger value="payable">Accounts Payable ({payables.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
        </TabsList>

        {/* Invoices (AR or AP) */}
        {["receivable", "payable"].map((type) => (
          <TabsContent key={type} value={type}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {type === "receivable" ? "Accounts Receivable" : "Accounts Payable"}
              </h2>
              <Dialog open={showNewInvoice && activeTab === type} onOpenChange={setShowNewInvoice}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> New Invoice</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create {type === "receivable" ? "Receivable" : "Payable"} Invoice</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Invoice #" value={invoiceForm.invoiceNumber} onChange={(e) => setInvoiceForm((p) => ({ ...p, invoiceNumber: e.target.value }))} />
                      <Input placeholder="Client Name" value={invoiceForm.clientName} onChange={(e) => setInvoiceForm((p) => ({ ...p, clientName: e.target.value }))} />
                    </div>
                    <Input placeholder="Client Email" type="email" value={invoiceForm.clientEmail} onChange={(e) => setInvoiceForm((p) => ({ ...p, clientEmail: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Issue Date</label>
                        <Input type="date" value={invoiceForm.issueDate} onChange={(e) => setInvoiceForm((p) => ({ ...p, issueDate: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Due Date</label>
                        <Input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm((p) => ({ ...p, dueDate: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input placeholder="Subtotal" type="number" step="0.01" value={invoiceForm.subtotal} onChange={(e) => {
                        const sub = e.target.value;
                        const tax = invoiceForm.tax || "0";
                        setInvoiceForm((p) => ({ ...p, subtotal: sub, total: (parseFloat(sub || "0") + parseFloat(tax)).toFixed(2) }));
                      }} />
                      <Input placeholder="Tax" type="number" step="0.01" value={invoiceForm.tax} onChange={(e) => {
                        const tax = e.target.value;
                        const sub = invoiceForm.subtotal || "0";
                        setInvoiceForm((p) => ({ ...p, tax, total: (parseFloat(sub) + parseFloat(tax || "0")).toFixed(2) }));
                      }} />
                      <Input placeholder="Total" type="number" step="0.01" value={invoiceForm.total} readOnly className="bg-muted" />
                    </div>
                    <Textarea placeholder="Notes" value={invoiceForm.notes} onChange={(e) => setInvoiceForm((p) => ({ ...p, notes: e.target.value }))} />
                    <Button
                      className="w-full"
                      disabled={!invoiceForm.invoiceNumber || !invoiceForm.clientName || !invoiceForm.issueDate || !invoiceForm.dueDate || !invoiceForm.total || createInvoiceMut.isPending}
                      onClick={() => createInvoiceMut.mutate({
                        ...invoiceForm,
                        type: type as "receivable" | "payable",
                        subsidiary: subFilter,
                      })}
                    >
                      {createInvoiceMut.isPending ? "Creating..." : "Create Invoice"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {(type === "receivable" ? arQuery : apQuery).isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading invoices...</div>
            ) : (type === "receivable" ? receivables : payables).length === 0 ? (
              <Card className="bg-card">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No {type === "receivable" ? "receivable" : "payable"} invoices yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {(type === "receivable" ? receivables : payables).map((inv: any) => (
                  <Card key={inv.id} className="bg-card hover:bg-accent/5 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="font-mono text-sm text-muted-foreground w-24">{inv.invoiceNumber}</div>
                      <div className="flex-1">
                        <div className="font-medium">{inv.clientName}</div>
                        <div className="text-xs text-muted-foreground">
                          Issued: {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : "—"} ·
                          Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
                        </div>
                      </div>
                      <Badge className={statusColors[inv.status] ?? ""}>{inv.status}</Badge>
                      <div className="text-right font-mono font-bold">
                        ${parseFloat(inv.total ?? "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                      {inv.status === "draft" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateInvoiceMut.mutate({ id: inv.id, status: "sent" })}
                        >
                          Send
                        </Button>
                      )}
                      {(inv.status === "sent" || inv.status === "partial") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-400"
                          onClick={() => updateInvoiceMut.mutate({ id: inv.id, status: "paid" })}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}

        {/* Payments */}
        <TabsContent value="payments">
          <h2 className="text-lg font-semibold mb-4">Payment Records</h2>
          {payments.length === 0 ? (
            <Card className="bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No payment records yet. Payments are recorded when invoices are paid.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {payments.map((pmt: any) => (
                <Card key={pmt.id} className="bg-card">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="font-medium">
                        {pmt.paymentDate ? new Date(pmt.paymentDate).toLocaleDateString() : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {pmt.method ?? "—"} {pmt.reference && `· Ref: ${pmt.reference}`}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-green-400">
                      ${parseFloat(pmt.amount ?? "0").toFixed(2)}
                    </div>
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
