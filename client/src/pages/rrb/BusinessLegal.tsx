/**
 * Contracts & Legal Page — Canryn Production Business Operations
 * Contract management, IP registry, compliance tracking
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
  Scale, Plus, ArrowLeft, FileText, Shield, Copyright, AlertTriangle, CheckCircle,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function BusinessLegal() {
  
  const [subsidiary, setSubsidiary] = useState("all");
  const [activeTab, setActiveTab] = useState("contracts");
  const [showNewContract, setShowNewContract] = useState(false);
  const [showNewIP, setShowNewIP] = useState(false);
  const [showNewCompliance, setShowNewCompliance] = useState(false);

  const [contractForm, setContractForm] = useState({
    contractNumber: "", title: "", contractType: "service" as any,
    counterparty: "", startDate: "", endDate: "", value: "", description: "",
  });

  const [ipForm, setIPForm] = useState({
    title: "", ipType: "copyright" as any, registrationNumber: "",
    filingDate: "", description: "", owner: "",
  });

  const [complianceForm, setComplianceForm] = useState({
    requirement: "", authority: "", category: "tax" as any,
    dueDate: "", description: "",
  });

  const subFilter = subsidiary === "all" ? undefined : subsidiary;

  const contractsQuery = trpc.legal.getContracts.useQuery(subFilter ? { subsidiary: subFilter } : undefined);
  const ipQuery = trpc.legal.getIPRegistry.useQuery(subFilter ? { subsidiary: subFilter } : undefined);
  const complianceQuery = trpc.legal.getComplianceItems.useQuery(subFilter ? { subsidiary: subFilter } : undefined);

  const utils = trpc.useUtils();

  const createContractMut = trpc.legal.createContract.useMutation({
    onSuccess: () => {
      toast.success("Contract created");
      setShowNewContract(false);
      setContractForm({ contractNumber: "", title: "", contractType: "service", counterparty: "", startDate: "", endDate: "", value: "", description: "" });
      utils.legal.getContracts.invalidate();
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const createIPMut = trpc.legal.createIP.useMutation({
    onSuccess: () => {
      toast.success("IP record created");
      setShowNewIP(false);
      setIPForm({ title: "", ipType: "copyright", registrationNumber: "", filingDate: "", description: "", owner: "" });
      utils.legal.getIPRegistry.invalidate();
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const createComplianceMut = trpc.legal.createComplianceItem.useMutation({
    onSuccess: () => {
      toast.success("Compliance item created");
      setShowNewCompliance(false);
      setComplianceForm({ requirement: "", authority: "", category: "tax", dueDate: "", description: "" });
      utils.legal.getComplianceItems.invalidate();
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const updateComplianceMut = trpc.legal.updateComplianceStatus.useMutation({
    onSuccess: () => utils.legal.getComplianceItems.invalidate(),
  });

  const contracts = contractsQuery.data ?? [];
  const ipRecords = ipQuery.data ?? [];
  const complianceItems = complianceQuery.data ?? [];

  const contractStatusColors: Record<string, string> = {
    draft: "bg-gray-500/20 text-gray-300",
    active: "bg-green-500/20 text-green-300",
    expired: "bg-amber-500/20 text-amber-300",
    terminated: "bg-red-500/20 text-red-300",
    renewed: "bg-blue-500/20 text-blue-300",
  };

  const ipStatusColors: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-300",
    registered: "bg-green-500/20 text-green-300",
    expired: "bg-red-500/20 text-red-300",
    abandoned: "bg-gray-500/20 text-gray-300",
  };

  const complianceStatusColors: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-300",
    compliant: "bg-green-500/20 text-green-300",
    non_compliant: "bg-red-500/20 text-red-300",
    in_progress: "bg-blue-500/20 text-blue-300",
    overdue: "bg-red-500/20 text-red-300",
  };

  const activeContracts = contracts.filter((c: any) => c.status === "active").length;
  const pendingCompliance = complianceItems.filter((c: any) => c.status === "pending" || c.status === "overdue").length;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Scale className="w-6 h-6 text-purple-400" />
        <h1 className="text-2xl font-bold">Contracts & Legal</h1>
        <span className="text-sm text-muted-foreground">Canryn Production</span>
      </div>

      <OfflineStatusBar isOffline={false} isSyncing={false} pendingCount={0} lastSynced={null} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" /> Active Contracts
            </div>
            <div className="text-2xl font-bold">{activeContracts}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Copyright className="w-4 h-4" /> IP Records
            </div>
            <div className="text-2xl font-bold">{ipRecords.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" /> Compliance Items
            </div>
            <div className="text-2xl font-bold">{complianceItems.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Pending Action
            </div>
            <div className="text-2xl font-bold text-amber-400">{pendingCompliance}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <SubsidiaryFilter value={subsidiary} onChange={setSubsidiary} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="ip">IP Registry</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Contracts */}
        <TabsContent value="contracts">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Contract Management</h2>
            <Dialog open={showNewContract} onOpenChange={setShowNewContract}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> New Contract</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Contract</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Contract #" value={contractForm.contractNumber} onChange={(e) => setContractForm((p) => ({ ...p, contractNumber: e.target.value }))} />
                    <Select value={contractForm.contractType} onValueChange={(v: any) => setContractForm((p) => ({ ...p, contractType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="licensing">Licensing</SelectItem>
                        <SelectItem value="employment">Employment</SelectItem>
                        <SelectItem value="nda">NDA</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="lease">Lease</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input placeholder="Contract Title" value={contractForm.title} onChange={(e) => setContractForm((p) => ({ ...p, title: e.target.value }))} />
                  <Input placeholder="Counterparty" value={contractForm.counterparty} onChange={(e) => setContractForm((p) => ({ ...p, counterparty: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Start Date</label>
                      <Input type="date" value={contractForm.startDate} onChange={(e) => setContractForm((p) => ({ ...p, startDate: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">End Date</label>
                      <Input type="date" value={contractForm.endDate} onChange={(e) => setContractForm((p) => ({ ...p, endDate: e.target.value }))} />
                    </div>
                  </div>
                  <Input placeholder="Contract Value" type="number" step="0.01" value={contractForm.value} onChange={(e) => setContractForm((p) => ({ ...p, value: e.target.value }))} />
                  <Textarea placeholder="Description" value={contractForm.description} onChange={(e) => setContractForm((p) => ({ ...p, description: e.target.value }))} />
                  <Button
                    className="w-full"
                    disabled={!contractForm.contractNumber || !contractForm.title || !contractForm.counterparty || createContractMut.isPending}
                    onClick={() => createContractMut.mutate({ ...contractForm, subsidiary: subFilter })}
                  >
                    {createContractMut.isPending ? "Creating..." : "Create Contract"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {contractsQuery.isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading contracts...</div>
          ) : contracts.length === 0 ? (
            <Card className="bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No contracts yet. Create your first contract record.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {contracts.map((c: any) => (
                <Card key={c.id} className="bg-card hover:bg-accent/5 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="font-mono text-sm text-muted-foreground w-24">{c.contractNumber}</div>
                    <div className="flex-1">
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.counterparty} · {c.contractType}
                        {c.startDate && ` · ${new Date(c.startDate).toLocaleDateString()}`}
                        {c.endDate && ` — ${new Date(c.endDate).toLocaleDateString()}`}
                      </div>
                    </div>
                    <Badge className={contractStatusColors[c.status] ?? ""}>{c.status}</Badge>
                    {c.value && (
                      <div className="text-right font-mono text-sm">
                        ${parseFloat(c.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* IP Registry */}
        <TabsContent value="ip">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Intellectual Property Registry</h2>
            <Dialog open={showNewIP} onOpenChange={setShowNewIP}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Register IP</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Register Intellectual Property</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Title" value={ipForm.title} onChange={(e) => setIPForm((p) => ({ ...p, title: e.target.value }))} />
                  <Select value={ipForm.ipType} onValueChange={(v: any) => setIPForm((p) => ({ ...p, ipType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="copyright">Copyright</SelectItem>
                      <SelectItem value="trademark">Trademark</SelectItem>
                      <SelectItem value="patent">Patent</SelectItem>
                      <SelectItem value="trade_secret">Trade Secret</SelectItem>
                      <SelectItem value="license">License</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Registration Number" value={ipForm.registrationNumber} onChange={(e) => setIPForm((p) => ({ ...p, registrationNumber: e.target.value }))} />
                  <Input placeholder="Owner" value={ipForm.owner} onChange={(e) => setIPForm((p) => ({ ...p, owner: e.target.value }))} />
                  <div>
                    <label className="text-xs text-muted-foreground">Filing Date</label>
                    <Input type="date" value={ipForm.filingDate} onChange={(e) => setIPForm((p) => ({ ...p, filingDate: e.target.value }))} />
                  </div>
                  <Textarea placeholder="Description" value={ipForm.description} onChange={(e) => setIPForm((p) => ({ ...p, description: e.target.value }))} />
                  <Button
                    className="w-full"
                    disabled={!ipForm.title || !ipForm.owner || createIPMut.isPending}
                    onClick={() => createIPMut.mutate({ ...ipForm, subsidiary: subFilter })}
                  >
                    {createIPMut.isPending ? "Registering..." : "Register IP"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {ipRecords.length === 0 ? (
            <Card className="bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Copyright className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No IP records yet. Register copyrights, trademarks, and patents.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {ipRecords.map((ip: any) => (
                <Card key={ip.id} className="bg-card hover:bg-accent/5 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Copyright className="w-5 h-5 text-purple-400 shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{ip.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {ip.ipType} · Owner: {ip.owner}
                        {ip.registrationNumber && ` · Reg: ${ip.registrationNumber}`}
                        {ip.filingDate && ` · Filed: ${new Date(ip.filingDate).toLocaleDateString()}`}
                      </div>
                    </div>
                    <Badge className={ipStatusColors[ip.status] ?? ""}>{ip.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Compliance Tracking</h2>
            <Dialog open={showNewCompliance} onOpenChange={setShowNewCompliance}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Requirement</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Compliance Requirement</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Requirement" value={complianceForm.requirement} onChange={(e) => setComplianceForm((p) => ({ ...p, requirement: e.target.value }))} />
                  <Input placeholder="Authority (e.g. IRS, FCC, State)" value={complianceForm.authority} onChange={(e) => setComplianceForm((p) => ({ ...p, authority: e.target.value }))} />
                  <Select value={complianceForm.category} onValueChange={(v: any) => setComplianceForm((p) => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tax">Tax</SelectItem>
                      <SelectItem value="licensing">Licensing</SelectItem>
                      <SelectItem value="regulatory">Regulatory</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="labor">Labor</SelectItem>
                      <SelectItem value="environmental">Environmental</SelectItem>
                      <SelectItem value="data_privacy">Data Privacy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <div>
                    <label className="text-xs text-muted-foreground">Due Date</label>
                    <Input type="date" value={complianceForm.dueDate} onChange={(e) => setComplianceForm((p) => ({ ...p, dueDate: e.target.value }))} />
                  </div>
                  <Textarea placeholder="Description" value={complianceForm.description} onChange={(e) => setComplianceForm((p) => ({ ...p, description: e.target.value }))} />
                  <Button
                    className="w-full"
                    disabled={!complianceForm.requirement || !complianceForm.authority || createComplianceMut.isPending}
                    onClick={() => createComplianceMut.mutate({ ...complianceForm, subsidiary: subFilter })}
                  >
                    {createComplianceMut.isPending ? "Adding..." : "Add Requirement"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {complianceItems.length === 0 ? (
            <Card className="bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No compliance items yet. Track tax, licensing, and regulatory requirements.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {complianceItems.map((ci: any) => (
                <Card key={ci.id} className="bg-card hover:bg-accent/5 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{ci.requirement}</div>
                      <div className="text-xs text-muted-foreground">
                        {ci.authority} · {ci.category}
                        {ci.dueDate && ` · Due: ${new Date(ci.dueDate).toLocaleDateString()}`}
                      </div>
                    </div>
                    <Badge className={complianceStatusColors[ci.status] ?? ""}>{ci.status}</Badge>
                    {(ci.status === "pending" || ci.status === "in_progress") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-400"
                        onClick={() => updateComplianceMut.mutate({ id: ci.id, status: "compliant" })}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" /> Complete
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
