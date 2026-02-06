import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Users, Copy, Check } from "lucide-react";

export function CollaborationInvitesUI() {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [invitedEmail, setInvitedEmail] = useState("");
  const [permission, setPermission] = useState<"view" | "edit" | "admin">("view");
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: pendingInvites } = trpc.integrations.collaborationInvites.getPendingInvites.useQuery();

  const createInviteMutation = trpc.integrations.collaborationInvites.createInvite.useMutation({
    onSuccess: (data) => {
      console.log("Invite created:", data);
      setInvitedEmail("");
      setPermission("view");
      setIsOpen(false);
    },
    onError: (error) => {
      console.error("Failed to create invite:", error);
    },
  });

  const acceptInviteMutation = trpc.integrations.collaborationInvites.acceptInvite.useMutation({
    onSuccess: (data) => {
      console.log("Invite accepted:", data);
    },
    onError: (error) => {
      console.error("Failed to accept invite:", error);
    },
  });

  const handleCreateInvite = () => {
    if (!sessionId || !invitedEmail.trim()) {
      console.error("Missing session ID or email");
      return;
    }

    createInviteMutation.mutate({
      sessionId,
      invitedEmail: invitedEmail.trim(),
      permission,
    });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Invite Collaborators
          </CardTitle>
          <CardDescription>
            Share sessions with team members and set their permission levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>Create Invite</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Collaborator</DialogTitle>
                <DialogDescription>
                  Send an invite to collaborate on a session
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sessionId">Session ID</Label>
                  <Input
                    id="sessionId"
                    type="number"
                    placeholder="Enter session ID"
                    value={sessionId || ""}
                    onChange={(e) => setSessionId(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Collaborator Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="collaborator@example.com"
                    value={invitedEmail}
                    onChange={(e) => setInvitedEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="permission">Permission Level</Label>
                  <Select value={permission} onValueChange={(value: any) => setPermission(value)}>
                    <SelectTrigger id="permission">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="edit">Can Edit</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCreateInvite}
                  disabled={createInviteMutation.isPending}
                  className="w-full"
                >
                  {createInviteMutation.isPending ? "Creating..." : "Send Invite"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Pending Invites
          </CardTitle>
          <CardDescription>
            Invites waiting for acceptance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingInvites || pendingInvites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending invites</p>
          ) : (
            <div className="space-y-3">
              {pendingInvites.map((invite: any) => (
                <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{invite.invitedEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      Permission: {invite.permission}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => acceptInviteMutation.mutate({ inviteCode: invite.inviteCode })}
                    disabled={acceptInviteMutation.isPending}
                  >
                    Accept
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Invite Codes
          </CardTitle>
          <CardDescription>
            Shareable codes for quick collaboration setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Invite codes will appear here after creating invites
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
