/**
 * Human Resources Page — Canryn Production Business Operations
 * Employee management, departments, time tracking, payroll
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
  Users, Plus, Building2, Clock, Wallet, ArrowLeft, UserCheck, UserX,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function BusinessHR() {
  
  const [subsidiary, setSubsidiary] = useState("all");
  const [activeTab, setActiveTab] = useState("employees");
  const [showNewEmployee, setShowNewEmployee] = useState(false);
  const [showNewDept, setShowNewDept] = useState(false);

  const [empForm, setEmpForm] = useState({
    employeeNumber: "", firstName: "", lastName: "", email: "", phone: "",
    title: "", employmentType: "full_time" as any, salary: "", hireDate: "",
  });

  const [deptForm, setDeptForm] = useState({
    name: "", code: "", description: "", budget: "",
  });

  const subFilter = subsidiary === "all" ? undefined : subsidiary;

  const employeesQuery = trpc.hr.getEmployees.useQuery(subFilter ? { subsidiary: subFilter } : undefined);
  const departmentsQuery = trpc.hr.getDepartments.useQuery(subFilter ? { subsidiary: subFilter } : undefined);
  const payrollQuery = trpc.hr.getPayroll.useQuery(undefined);
  const timeQuery = trpc.hr.getTimeTracking.useQuery(undefined);

  const utils = trpc.useUtils();

  const createEmpMut = trpc.hr.createEmployee.useMutation({
    onSuccess: () => {
      toast.success("Employee added");
      setShowNewEmployee(false);
      setEmpForm({ employeeNumber: "", firstName: "", lastName: "", email: "", phone: "", title: "", employmentType: "full_time", salary: "", hireDate: "" });
      utils.hr.getEmployees.invalidate();
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const createDeptMut = trpc.hr.createDepartment.useMutation({
    onSuccess: () => {
      toast.success("Department created");
      setShowNewDept(false);
      setDeptForm({ name: "", code: "", description: "", budget: "" });
      utils.hr.getDepartments.invalidate();
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const employees = employeesQuery.data ?? [];
  const departments = departmentsQuery.data ?? [];
  const payroll = payrollQuery.data ?? [];
  const timeEntries = timeQuery.data ?? [];

  const activeCount = employees.filter((e: any) => e.status === "active").length;
  const onLeaveCount = employees.filter((e: any) => e.status === "on_leave").length;

  const statusColors: Record<string, string> = {
    active: "bg-green-500/20 text-green-300",
    on_leave: "bg-amber-500/20 text-amber-300",
    terminated: "bg-red-500/20 text-red-300",
    retired: "bg-gray-500/20 text-gray-300",
  };

  const typeLabels: Record<string, string> = {
    full_time: "Full-Time",
    part_time: "Part-Time",
    contractor: "Contractor",
    intern: "Intern",
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Users className="w-6 h-6 text-blue-400" />
        <h1 className="text-2xl font-bold">Human Resources</h1>
        <span className="text-sm text-muted-foreground">Canryn Production</span>
      </div>

      <OfflineStatusBar isOffline={false} isSyncing={false} pendingCount={0} lastSynced={null} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCheck className="w-4 h-4" /> Active
            </div>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserX className="w-4 h-4" /> On Leave
            </div>
            <div className="text-2xl font-bold">{onLeaveCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" /> Departments
            </div>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="w-4 h-4" /> Payroll Records
            </div>
            <div className="text-2xl font-bold">{payroll.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <SubsidiaryFilter value={subsidiary} onChange={setSubsidiary} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
        </TabsList>

        {/* Employees */}
        <TabsContent value="employees">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Employee Directory</h2>
            <Dialog open={showNewEmployee} onOpenChange={setShowNewEmployee}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Employee</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Employee</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Employee #" value={empForm.employeeNumber} onChange={(e) => setEmpForm((p) => ({ ...p, employeeNumber: e.target.value }))} />
                    <Input placeholder="Title/Position" value={empForm.title} onChange={(e) => setEmpForm((p) => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="First Name" value={empForm.firstName} onChange={(e) => setEmpForm((p) => ({ ...p, firstName: e.target.value }))} />
                    <Input placeholder="Last Name" value={empForm.lastName} onChange={(e) => setEmpForm((p) => ({ ...p, lastName: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Email" type="email" value={empForm.email} onChange={(e) => setEmpForm((p) => ({ ...p, email: e.target.value }))} />
                    <Input placeholder="Phone" value={empForm.phone} onChange={(e) => setEmpForm((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={empForm.employmentType} onValueChange={(v: any) => setEmpForm((p) => ({ ...p, employmentType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full-Time</SelectItem>
                        <SelectItem value="part_time">Part-Time</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Salary" type="number" step="0.01" value={empForm.salary} onChange={(e) => setEmpForm((p) => ({ ...p, salary: e.target.value }))} />
                  </div>
                  <Input type="date" value={empForm.hireDate} onChange={(e) => setEmpForm((p) => ({ ...p, hireDate: e.target.value }))} />
                  <Button
                    className="w-full"
                    disabled={!empForm.employeeNumber || !empForm.firstName || !empForm.lastName || !empForm.hireDate || createEmpMut.isPending}
                    onClick={() => createEmpMut.mutate({ ...empForm, subsidiary: subFilter })}
                  >
                    {createEmpMut.isPending ? "Adding..." : "Add Employee"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {employeesQuery.isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading employees...</div>
          ) : employees.length === 0 ? (
            <Card className="bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No employees yet. Add your first team member.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {employees.map((emp: any) => (
                <Card key={emp.id} className="bg-card hover:bg-accent/5 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-sm">
                      {emp.firstName?.[0]}{emp.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                      <div className="text-xs text-muted-foreground">
                        {emp.title ?? "—"} · #{emp.employeeNumber}
                        {emp.email && ` · ${emp.email}`}
                      </div>
                    </div>
                    <Badge className={statusColors[emp.status] ?? ""}>{emp.status}</Badge>
                    <Badge variant="outline">{typeLabels[emp.employmentType] ?? emp.employmentType}</Badge>
                    {emp.salary && (
                      <div className="text-right font-mono text-sm">
                        ${parseFloat(emp.salary).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Departments */}
        <TabsContent value="departments">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Departments</h2>
            <Dialog open={showNewDept} onOpenChange={setShowNewDept}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> New Department</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Department</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Department Name" value={deptForm.name} onChange={(e) => setDeptForm((p) => ({ ...p, name: e.target.value }))} />
                  <Input placeholder="Code (e.g. ENG)" value={deptForm.code} onChange={(e) => setDeptForm((p) => ({ ...p, code: e.target.value }))} />
                  <Textarea placeholder="Description" value={deptForm.description} onChange={(e) => setDeptForm((p) => ({ ...p, description: e.target.value }))} />
                  <Input placeholder="Budget" type="number" step="0.01" value={deptForm.budget} onChange={(e) => setDeptForm((p) => ({ ...p, budget: e.target.value }))} />
                  <Button
                    className="w-full"
                    disabled={!deptForm.name || !deptForm.code || createDeptMut.isPending}
                    onClick={() => createDeptMut.mutate({ ...deptForm, subsidiary: subFilter })}
                  >
                    {createDeptMut.isPending ? "Creating..." : "Create Department"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {departments.length === 0 ? (
            <Card className="bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No departments yet. Create your organizational structure.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map((dept: any) => (
                <Card key={dept.id} className="bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{dept.name}</div>
                      <Badge variant="outline">{dept.code}</Badge>
                    </div>
                    {dept.description && <p className="text-sm text-muted-foreground mb-2">{dept.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Headcount: {dept.headcount ?? 0}</span>
                      {dept.budget && <span>Budget: ${parseFloat(dept.budget).toLocaleString()}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Payroll */}
        <TabsContent value="payroll">
          <h2 className="text-lg font-semibold mb-4">Payroll Records</h2>
          {payroll.length === 0 ? (
            <Card className="bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No payroll records yet. Process payroll from the employee directory.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {payroll.map((pr: any) => (
                <Card key={pr.id} className="bg-card">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="font-medium">Employee #{pr.employeeId}</div>
                      <div className="text-xs text-muted-foreground">
                        {pr.payPeriodStart ? new Date(pr.payPeriodStart).toLocaleDateString() : "—"} —{" "}
                        {pr.payPeriodEnd ? new Date(pr.payPeriodEnd).toLocaleDateString() : "—"}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-mono">Gross: ${parseFloat(pr.grossPay ?? "0").toFixed(2)}</div>
                      <div className="font-mono text-green-400">Net: ${parseFloat(pr.netPay ?? "0").toFixed(2)}</div>
                    </div>
                    <Badge className={pr.status === "paid" ? "bg-green-500/20 text-green-300" : "bg-amber-500/20 text-amber-300"}>
                      {pr.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Time Tracking */}
        <TabsContent value="time">
          <h2 className="text-lg font-semibold mb-4">Time Tracking</h2>
          {timeEntries.length === 0 ? (
            <Card className="bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No time entries yet. Track employee hours and project time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {timeEntries.map((te: any) => (
                <Card key={te.id} className="bg-card">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="font-medium">Employee #{te.employeeId}</div>
                      <div className="text-xs text-muted-foreground">
                        {te.date ? new Date(te.date).toLocaleDateString() : "—"}
                        {te.projectCode && ` · Project: ${te.projectCode}`}
                      </div>
                    </div>
                    <div className="font-mono text-sm">{te.hoursWorked}h</div>
                    {te.overtime && parseFloat(te.overtime) > 0 && (
                      <Badge className="bg-amber-500/20 text-amber-300">+{te.overtime}h OT</Badge>
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
