import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  DollarSign, Users, Music, Plus, ArrowRight, TrendingUp,
  FileText, Percent, Clock, CheckCircle, AlertCircle, BarChart3
} from "lucide-react";

type TabType = "dashboard" | "projects" | "earnings" | "project-detail";

export default function RoyaltyTracker() {
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);

  // New project form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("single");

  // New collaborator form
  const [showAddCollab, setShowAddCollab] = useState(false);
  const [collabName, setCollabName] = useState("");
  const [collabRole, setCollabRole] = useState("artist");
  const [collabSplit, setCollabSplit] = useState("");
  const [collabEmail, setCollabEmail] = useState("");

  // New payment form
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paySource, setPaySource] = useState("");
  const [paySourceType, setPaySourceType] = useState("streaming");
  const [payGross, setPayGross] = useState("");
  const [payNet, setPayNet] = useState("");
  const [payNotes, setPayNotes] = useState("");

  const utils = trpc.useUtils();

  const projectsQuery = trpc.royalties.listProjects.useQuery(undefined, { enabled: !!user });
  const earningsQuery = trpc.royalties.getMyEarnings.useQuery(undefined, { enabled: !!user });
  const projectDetailQuery = trpc.royalties.getProject.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );
  const paymentsQuery = trpc.royalties.listPayments.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  const createProject = trpc.royalties.createProject.useMutation({
    onSuccess: (data) => {
      toast.success("Project Created");
      utils.royalties.listProjects.invalidate();
      setShowNewProject(false);
      setNewTitle(""); setNewDesc(""); setNewType("single");
      setSelectedProjectId(data.id);
      setActiveTab("project-detail");
    },
    onError: (err) => toast.error(err.message),
  });

  const addCollaborator = trpc.royalties.addCollaborator.useMutation({
    onSuccess: () => {
      toast.success("Collaborator Added");
      utils.royalties.getProject.invalidate({ projectId: selectedProjectId! });
      setShowAddCollab(false);
      setCollabName(""); setCollabRole("artist"); setCollabSplit(""); setCollabEmail("");
    },
    onError: (err) => toast.error(err.message),
  });

  const removeCollaborator = trpc.royalties.removeCollaborator.useMutation({
    onSuccess: () => {
      toast.success("Collaborator Removed");
      utils.royalties.getProject.invalidate({ projectId: selectedProjectId! });
    },
  });

  const recordPayment = trpc.royalties.recordPayment.useMutation({
    onSuccess: (data) => {
      toast.success(`Payment Recorded — Distributed to ${data.distributionsCreated} collaborators`);
      utils.royalties.listPayments.invalidate({ projectId: selectedProjectId! });
      utils.royalties.getProject.invalidate({ projectId: selectedProjectId! });
      utils.royalties.getMyEarnings.invalidate();
      utils.royalties.listProjects.invalidate();
      setShowAddPayment(false);
      setPaySource(""); setPaySourceType("streaming"); setPayGross(""); setPayNet(""); setPayNotes("");
    },
    onError: (err) => toast.error(err.message),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-pulse text-amber-800">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <DollarSign className="w-12 h-12 mx-auto text-amber-600 mb-2" />
            <CardTitle className="text-2xl">Royalty Tracker</CardTitle>
            <CardDescription>Sign in to track your royalties and manage collaborations</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <a href={getLoginUrl()}>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">Sign In to Continue</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const projects = projectsQuery.data || [];
  const earnings = earningsQuery.data;
  const projectDetail = projectDetailQuery.data;
  const payments = paymentsQuery.data || [];

  const roleColors: Record<string, string> = {
    artist: "bg-amber-100 text-amber-800",
    producer: "bg-blue-100 text-blue-800",
    songwriter: "bg-purple-100 text-purple-800",
    engineer: "bg-green-100 text-green-800",
    featured: "bg-pink-100 text-pink-800",
    session_musician: "bg-teal-100 text-teal-800",
    other: "bg-gray-100 text-gray-800",
  };

  const sourceTypeLabels: Record<string, string> = {
    streaming: "Streaming",
    download: "Download",
    sync_license: "Sync License",
    performance: "Performance",
    mechanical: "Mechanical",
    merch: "Merchandise",
    other: "Other",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white">
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-1">
            <DollarSign className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Royalty Tracker</h1>
          </div>
          <p className="text-amber-200 text-sm">A Canryn Production — Track earnings, splits, and payments for collaborative projects</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex gap-1 py-1">
          {([
            { id: "dashboard" as TabType, label: "Dashboard", icon: BarChart3 },
            { id: "projects" as TabType, label: "Projects", icon: Music },
            { id: "earnings" as TabType, label: "My Earnings", icon: TrendingUp },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedProjectId(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-amber-100 text-amber-900 border-b-2 border-amber-600"
                  : "text-gray-600 hover:text-amber-800 hover:bg-amber-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          {activeTab === "project-detail" && projectDetail && (
            <div className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-amber-100 text-amber-900 border-b-2 border-amber-600 rounded-t-lg">
              <FileText className="w-4 h-4" />
              {projectDetail.title}
            </div>
          )}
        </div>
      </div>

      <div className="container py-6">
        {/* ===== DASHBOARD ===== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Projects</p>
                      <p className="text-3xl font-bold text-amber-900">{earnings?.summary.totalProjects || 0}</p>
                    </div>
                    <Music className="w-10 h-10 text-amber-300" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Earned</p>
                      <p className="text-3xl font-bold text-green-700">${earnings?.summary.grandTotal || "0.00"}</p>
                    </div>
                    <DollarSign className="w-10 h-10 text-green-300" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Paid Out</p>
                      <p className="text-3xl font-bold text-blue-700">${earnings?.summary.grandPaid || "0.00"}</p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-blue-300" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Pending</p>
                      <p className="text-3xl font-bold text-orange-700">${earnings?.summary.grandPending || "0.00"}</p>
                    </div>
                    <Clock className="w-10 h-10 text-orange-300" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Your collaborative projects and royalty splits</CardDescription>
                </div>
                <Button onClick={() => setShowNewProject(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Plus className="w-4 h-4 mr-1" /> New Project
                </Button>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Music className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No projects yet</p>
                    <p className="text-sm">Create your first project to start tracking royalties</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.slice(0, 5).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => { setSelectedProjectId(p.id); setActiveTab("project-detail"); }}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-amber-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <Music className="w-5 h-5 text-amber-700" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{p.title}</p>
                            <p className="text-sm text-gray-500 capitalize">{p.projectType} · {p.status}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-green-700">${p.totalRevenue}</p>
                            <p className="text-xs text-gray-500">Total Revenue</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Earnings Breakdown */}
            {earnings && earnings.earnings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Earnings by Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="py-2 font-medium text-gray-500">Project</th>
                          <th className="py-2 font-medium text-gray-500">Role</th>
                          <th className="py-2 font-medium text-gray-500">Split</th>
                          <th className="py-2 font-medium text-gray-500 text-right">Earned</th>
                          <th className="py-2 font-medium text-gray-500 text-right">Paid</th>
                          <th className="py-2 font-medium text-gray-500 text-right">Pending</th>
                        </tr>
                      </thead>
                      <tbody>
                        {earnings.earnings.map((e, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-3 font-medium">{e.projectTitle}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${roleColors[e.role] || roleColors.other}`}>
                                {e.role.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-3">{e.splitPercentage}%</td>
                            <td className="py-3 text-right font-medium text-green-700">${e.totalEarned}</td>
                            <td className="py-3 text-right text-blue-700">${e.totalPaid}</td>
                            <td className="py-3 text-right text-orange-700">${e.totalPending}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ===== PROJECTS LIST ===== */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">All Projects</h2>
              <Button onClick={() => setShowNewProject(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
                <Plus className="w-4 h-4 mr-1" /> New Project
              </Button>
            </div>
            {projects.map((p) => (
              <Card
                key={p.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => { setSelectedProjectId(p.id); setActiveTab("project-detail"); }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{p.title}</h3>
                      <p className="text-sm text-gray-500 capitalize">{p.projectType} · {p.status} · {p.currency}</p>
                      {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-700">${p.totalRevenue}</p>
                      <p className="text-xs text-gray-500">Total Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ===== MY EARNINGS ===== */}
        {activeTab === "earnings" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">My Earnings</h2>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-green-700">Total Earned</p>
                  <p className="text-4xl font-bold text-green-800">${earnings?.summary.grandTotal || "0.00"}</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-blue-700">Paid Out</p>
                  <p className="text-4xl font-bold text-blue-800">${earnings?.summary.grandPaid || "0.00"}</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-orange-700">Pending Balance</p>
                  <p className="text-4xl font-bold text-orange-800">${earnings?.summary.grandPending || "0.00"}</p>
                </CardContent>
              </Card>
            </div>

            {/* Per-project earnings */}
            {earnings?.earnings.map((e, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{e.projectTitle}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${roleColors[e.role] || roleColors.other}`}>
                          {e.role.replace("_", " ")}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Percent className="w-3 h-3" /> {e.splitPercentage}% split
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setSelectedProjectId(e.projectId); setActiveTab("project-detail"); }}
                    >
                      View Project <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-green-600">Earned</p>
                      <p className="text-xl font-bold text-green-800">${e.totalEarned}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-blue-600">Paid</p>
                      <p className="text-xl font-bold text-blue-800">${e.totalPaid}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-orange-600">Pending</p>
                      <p className="text-xl font-bold text-orange-800">${e.totalPending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!earnings || earnings.earnings.length === 0) && (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No earnings yet</p>
                  <p className="text-sm">Earnings will appear here when payments are recorded for your projects</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ===== PROJECT DETAIL ===== */}
        {activeTab === "project-detail" && projectDetail && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <button onClick={() => setActiveTab("projects")} className="hover:text-amber-700">Projects</button>
              <span>/</span>
              <span className="text-gray-900 font-medium">{projectDetail.title}</span>
            </div>

            {/* Project Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{projectDetail.title}</CardTitle>
                    <CardDescription className="capitalize">
                      {projectDetail.projectType} · {projectDetail.status} · {projectDetail.currency}
                      {projectDetail.isrcCode && ` · ISRC: ${projectDetail.isrcCode}`}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-700">${projectDetail.totalRevenue}</p>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                  </div>
                </div>
              </CardHeader>
              {projectDetail.description && (
                <CardContent>
                  <p className="text-gray-600">{projectDetail.description}</p>
                </CardContent>
              )}
            </Card>

            {/* Collaborators */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" /> Collaborators & Splits
                  </CardTitle>
                  <CardDescription>
                    Total split: {projectDetail.collaborators.reduce((s, c) => s + parseFloat(c.splitPercentage), 0).toFixed(1)}%
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddCollab(true)} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectDetail.collaborators.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-sm">
                          {c.artistName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{c.artistName}</p>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${roleColors[c.role] || roleColors.other}`}>
                              {c.role.replace("_", " ")}
                            </span>
                            {c.isRegistered && (
                              <span className="text-xs text-green-600 flex items-center gap-0.5">
                                <CheckCircle className="w-3 h-3" /> Registered
                              </span>
                            )}
                            {!c.isRegistered && c.email && (
                              <span className="text-xs text-orange-600 flex items-center gap-0.5">
                                <AlertCircle className="w-3 h-3" /> {c.inviteStatus}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl font-bold text-amber-800">{c.splitPercentage}%</p>
                          <p className="text-xs text-gray-500">Split</p>
                        </div>
                        {projectDetail.collaborators.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeCollaborator.mutate({ collaboratorId: c.id })}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Split visualization bar */}
                <div className="mt-4">
                  <div className="flex rounded-full overflow-hidden h-6">
                    {projectDetail.collaborators.map((c, i) => {
                      const pct = parseFloat(c.splitPercentage);
                      const colors = ["bg-amber-500", "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-pink-500", "bg-teal-500"];
                      return (
                        <div
                          key={c.id}
                          className={`${colors[i % colors.length]} flex items-center justify-center text-white text-xs font-medium`}
                          style={{ width: `${pct}%` }}
                          title={`${c.artistName}: ${pct}%`}
                        >
                          {pct >= 10 ? `${pct}%` : ""}
                        </div>
                      );
                    })}
                    {(() => {
                      const remaining = 100 - projectDetail.collaborators.reduce((s, c) => s + parseFloat(c.splitPercentage), 0);
                      if (remaining > 0) {
                        return (
                          <div className="bg-gray-200 flex items-center justify-center text-gray-500 text-xs" style={{ width: `${remaining}%` }}>
                            {remaining >= 10 ? `${remaining.toFixed(1)}% unassigned` : ""}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" /> Payment History
                  </CardTitle>
                  <CardDescription>{payments.length} payment{payments.length !== 1 ? "s" : ""} recorded</CardDescription>
                </div>
                <Button onClick={() => setShowAddPayment(true)} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-1" /> Record Payment
                </Button>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No payments recorded yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="py-2 font-medium text-gray-500">Source</th>
                          <th className="py-2 font-medium text-gray-500">Type</th>
                          <th className="py-2 font-medium text-gray-500 text-right">Gross</th>
                          <th className="py-2 font-medium text-gray-500 text-right">Net</th>
                          <th className="py-2 font-medium text-gray-500">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p.id} className="border-b last:border-0">
                            <td className="py-3 font-medium">{p.source}</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">
                                {sourceTypeLabels[p.sourceType] || p.sourceType}
                              </span>
                            </td>
                            <td className="py-3 text-right">${p.grossAmount}</td>
                            <td className="py-3 text-right font-medium text-green-700">${p.netAmount}</td>
                            <td className="py-3 text-gray-500">
                              {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ===== NEW PROJECT DIALOG ===== */}
      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g., Rockin' Rockin' Boogie" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Project description..." />
            </div>
            <div>
              <Label>Project Type</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="album">Album</SelectItem>
                  <SelectItem value="ep">EP</SelectItem>
                  <SelectItem value="compilation">Compilation</SelectItem>
                  <SelectItem value="soundtrack">Soundtrack</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              disabled={!newTitle.trim() || createProject.isPending}
              onClick={() => createProject.mutate({ title: newTitle, description: newDesc || undefined, projectType: newType as any })}
            >
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== ADD COLLABORATOR DIALOG ===== */}
      <Dialog open={showAddCollab} onOpenChange={setShowAddCollab}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Collaborator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Artist Name *</Label>
              <Input value={collabName} onChange={(e) => setCollabName(e.target.value)} placeholder="e.g., Little Richard" />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={collabRole} onValueChange={setCollabRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="artist">Artist</SelectItem>
                  <SelectItem value="producer">Producer</SelectItem>
                  <SelectItem value="songwriter">Songwriter</SelectItem>
                  <SelectItem value="engineer">Engineer</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="session_musician">Session Musician</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Split Percentage *</Label>
              <Input type="number" min="0" max="100" step="0.01" value={collabSplit} onChange={(e) => setCollabSplit(e.target.value)} placeholder="e.g., 25" />
            </div>
            <div>
              <Label>Email (optional)</Label>
              <Input type="email" value={collabEmail} onChange={(e) => setCollabEmail(e.target.value)} placeholder="artist@example.com" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              disabled={!collabName.trim() || !collabSplit || addCollaborator.isPending}
              onClick={() => addCollaborator.mutate({
                projectId: selectedProjectId!,
                artistName: collabName,
                role: collabRole as any,
                splitPercentage: parseFloat(collabSplit),
                email: collabEmail || undefined,
              })}
            >
              {addCollaborator.isPending ? "Adding..." : "Add Collaborator"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== RECORD PAYMENT DIALOG ===== */}
      <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Source *</Label>
              <Input value={paySource} onChange={(e) => setPaySource(e.target.value)} placeholder="e.g., Spotify, Apple Music, BMI" />
            </div>
            <div>
              <Label>Source Type</Label>
              <Select value={paySourceType} onValueChange={setPaySourceType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="streaming">Streaming</SelectItem>
                  <SelectItem value="download">Download</SelectItem>
                  <SelectItem value="sync_license">Sync License</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="mechanical">Mechanical</SelectItem>
                  <SelectItem value="merch">Merchandise</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gross Amount *</Label>
                <Input type="number" min="0" step="0.01" value={payGross} onChange={(e) => setPayGross(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <Label>Net Amount *</Label>
                <Input type="number" min="0" step="0.01" value={payNet} onChange={(e) => setPayNet(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea value={payNotes} onChange={(e) => setPayNotes(e.target.value)} placeholder="Payment notes..." />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!paySource.trim() || !payGross || !payNet || recordPayment.isPending}
              onClick={() => recordPayment.mutate({
                projectId: selectedProjectId!,
                source: paySource,
                sourceType: paySourceType as any,
                grossAmount: parseFloat(payGross),
                netAmount: parseFloat(payNet),
                notes: payNotes || undefined,
              })}
            >
              {recordPayment.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
