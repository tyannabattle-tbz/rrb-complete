import { useState } from "react";
import { Users, Plus, Settings, Trash2, Edit2, Share2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  joinedAt: Date;
  lastActive: Date;
}

interface Workspace {
  id: number;
  name: string;
  description: string;
  owner: string;
  memberCount: number;
  sessionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkspaceDashboardProps {
  currentWorkspace?: Workspace;
  teamMembers?: TeamMember[];
  onCreateWorkspace?: (name: string, description: string) => void;
  onInviteMember?: (email: string, role: string) => void;
  onRemoveMember?: (memberId: number) => void;
}

export default function WorkspaceDashboard({
  currentWorkspace,
  teamMembers = [],
  onCreateWorkspace,
  onInviteMember,
  onRemoveMember,
}: WorkspaceDashboardProps) {
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    if (onCreateWorkspace) {
      onCreateWorkspace(newWorkspaceName, newWorkspaceDesc);
    }

    toast.success("Workspace created successfully");
    setNewWorkspaceName("");
    setNewWorkspaceDesc("");
    setShowCreateForm(false);
  };

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) {
      toast.error("Email is required");
      return;
    }

    if (onInviteMember) {
      onInviteMember(inviteEmail, inviteRole);
    }

    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
    setInviteRole("member");
    setShowInviteForm(false);
  };

  const handleRemoveMember = (memberId: number) => {
    if (onRemoveMember) {
      onRemoveMember(memberId);
    }
    toast.success("Member removed from workspace");
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "member":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      {currentWorkspace && (
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{currentWorkspace.name}</h2>
              <p className="text-muted-foreground mt-1">
                {currentWorkspace.description}
              </p>
              <div className="flex gap-6 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="text-2xl font-semibold">
                    {currentWorkspace.memberCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                  <p className="text-2xl font-semibold">
                    {currentWorkspace.sessionCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-lg font-semibold">
                    {formatDate(currentWorkspace.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings size={16} />
                Settings
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 size={16} />
                Share
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members" className="gap-2">
            <Users size={16} />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity size={16} />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings size={16} />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Team Members</h3>
            <Button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="gap-2"
            >
              <Plus size={16} />
              Invite Member
            </Button>
          </div>

          {/* Invite Form */}
          {showInviteForm && (
            <Card className="p-4 space-y-3">
              <Input
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />

              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="viewer">Viewer</option>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>

              <div className="flex gap-2">
                <Button onClick={handleInviteMember} className="flex-1">
                  Send Invite
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowInviteForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Members List */}
          <div className="space-y-2">
            {teamMembers.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                <Users size={32} className="mx-auto mb-2 opacity-50" />
                <p>No team members yet</p>
              </Card>
            ) : (
              teamMembers.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={getRoleColor(member.role)}>
                          {member.role}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Last active: {formatDate(member.lastActive)}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="font-medium">Session created</p>
                  <p className="text-sm text-muted-foreground">
                    New agent session started
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">2h ago</span>
              </div>

              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="font-medium">Session shared</p>
                  <p className="text-sm text-muted-foreground">
                    Shared with 3 team members
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">4h ago</span>
              </div>

              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <div className="flex-1">
                  <p className="font-medium">Comment added</p>
                  <p className="text-sm text-muted-foreground">
                    New comment on session
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">6h ago</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <div className="flex-1">
                  <p className="font-medium">Member joined</p>
                  <p className="text-sm text-muted-foreground">
                    New team member invited
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">1d ago</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Workspace Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Workspace Name</label>
                  <Input
                    value={currentWorkspace?.name || ""}
                    readOnly
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={currentWorkspace?.description || ""}
                    readOnly
                    className="w-full px-3 py-2 border rounded-md mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Owner</label>
                    <Input
                      value={currentWorkspace?.owner || ""}
                      readOnly
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <Input
                      value={
                        currentWorkspace
                          ? formatDate(currentWorkspace.createdAt)
                          : ""
                      }
                      readOnly
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Danger Zone</h4>
                  <Button variant="destructive">Delete Workspace</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
