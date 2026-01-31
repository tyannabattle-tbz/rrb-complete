import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Mail, Trash2, Edit2, Plus, Shield, UserCheck } from "lucide-react";

interface TeamMember {
  id: number;
  email: string;
  name: string;
  role: "admin" | "editor" | "viewer";
  joinedDate: string;
  status: "active" | "pending" | "inactive";
}

interface TeamInvite {
  id: number;
  email: string;
  role: "admin" | "editor" | "viewer";
  sentDate: string;
  expiresDate: string;
}

export function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: 1,
      email: "owner@example.com",
      name: "Team Owner",
      role: "admin",
      joinedDate: "2024-01-15",
      status: "active",
    },
    {
      id: 2,
      email: "editor@example.com",
      name: "Editor User",
      role: "editor",
      joinedDate: "2024-02-01",
      status: "active",
    },
  ]);

  const [invites, setInvites] = useState<TeamInvite[]>([
    {
      id: 1,
      email: "newuser@example.com",
      role: "viewer",
      sentDate: "2024-02-15",
      expiresDate: "2024-02-22",
    },
  ]);

  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInviteRole, setNewInviteRole] = useState<"admin" | "editor" | "viewer">("viewer");
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);

  const handleInviteMember = () => {
    if (!newInviteEmail) return;

    const newInvite: TeamInvite = {
      id: Math.max(...invites.map((i) => i.id), 0) + 1,
      email: newInviteEmail,
      role: newInviteRole,
      sentDate: new Date().toISOString().split("T")[0],
      expiresDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };

    setInvites([...invites, newInvite]);
    setNewInviteEmail("");
    setNewInviteRole("viewer");
  };

  const handleRemoveMember = (id: number) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleRemoveInvite = (id: number) => {
    setInvites(invites.filter((i) => i.id !== id));
  };

  const handleChangeRole = (memberId: number, newRole: "admin" | "editor" | "viewer") => {
    setMembers(
      members.map((m) =>
        m.id === memberId ? { ...m, role: newRole } : m
      )
    );
    setEditingMemberId(null);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "editor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "viewer":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "inactive":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Management</h1>
        <p className="text-muted-foreground">Manage team members and workspace settings</p>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          <TabsTrigger value="invites">Pending Invites ({invites.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage your team members and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadgeColor(member.role)}`}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeColor(member.status)}`}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">Joined {member.joinedDate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {editingMemberId === member.id ? (
                        <Select value={member.role} onValueChange={(role) => handleChangeRole(member.id, role as any)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingMemberId(member.id)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      {member.role !== "admin" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invites Tab */}
        <TabsContent value="invites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Invite New Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  value={newInviteEmail}
                  onChange={(e) => setNewInviteEmail(e.target.value)}
                />
                <Select value={newInviteRole} onValueChange={(role) => setNewInviteRole(role as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleInviteMember}>
                  <Plus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Invitations expire after 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invites.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending invitations</p>
                ) : (
                  invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{invite.email}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadgeColor(invite.role)}`}>
                            {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Sent {invite.sentDate} • Expires {invite.expiresDate}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveInvite(invite.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Workspace Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Allow public sessions</p>
                    <p className="text-sm text-muted-foreground">Let team members share sessions publicly</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Require approval for new members</p>
                    <p className="text-sm text-muted-foreground">Admin approval needed for invitations</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Enable session history</p>
                    <p className="text-sm text-muted-foreground">Keep record of all sessions</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Enable audit logging</p>
                    <p className="text-sm text-muted-foreground">Track all team actions</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
              </div>

              <Button className="w-full">Save Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                Delete Workspace
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
