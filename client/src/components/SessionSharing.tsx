import { useState } from "react";
import {
  Share2,
  Copy,
  Trash2,
  Lock,
  Eye,
  Edit,
  Users,
  Mail,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface SharedUser {
  id: number;
  email: string;
  name: string;
  role: "viewer" | "commenter" | "editor";
  sharedAt: Date;
}

interface SessionSharingProps {
  sessionId: number;
  sessionName: string;
  sharedUsers?: SharedUser[];
  onShare?: (email: string, role: "viewer" | "commenter" | "editor") => void;
  onRemove?: (userId: number) => void;
}

export default function SessionSharing({
  sessionId,
  sessionName,
  sharedUsers = [],
  onShare,
  onRemove,
}: SessionSharingProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState<"viewer" | "commenter" | "editor">(
    "viewer"
  );
  const [shareLink, setShareLink] = useState(
    `https://manus.agent/share/${sessionId}`
  );
  const [isPublic, setIsPublic] = useState(false);

  const handleShare = () => {
    if (!shareEmail) {
      toast.error("Please enter an email address");
      return;
    }

    if (onShare) {
      onShare(shareEmail, shareRole);
    }

    toast.success(`Session shared with ${shareEmail} as ${shareRole}`);
    setShareEmail("");
    setShareRole("viewer");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Share link copied to clipboard");
  };

  const handleRemoveUser = (userId: number) => {
    if (onRemove) {
      onRemove(userId);
    }
    toast.success("User removed from session");
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "viewer":
        return <Eye size={16} className="text-blue-500" />;
      case "commenter":
        return <Mail size={16} className="text-orange-500" />;
      case "editor":
        return <Edit size={16} className="text-green-500" />;
      default:
        return <Eye size={16} />;
    }
    };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "viewer":
        return "Can view session and replay";
      case "commenter":
        return "Can view, replay, and add comments";
      case "editor":
        return "Can view, replay, comment, and edit settings";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Share Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-muted-foreground" />
          <div>
            <h3 className="font-semibold">Share Session</h3>
            <p className="text-sm text-muted-foreground">
              {sharedUsers.length} user{sharedUsers.length !== 1 ? "s" : ""} have access
            </p>
          </div>
        </div>

        <Button
          variant={isExpanded ? "default" : "outline"}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Share2 size={16} />
          Share
        </Button>
      </div>

      {/* Sharing Panel */}
      {isExpanded && (
        <Card className="p-6 space-y-4">
          {/* Share Link Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Share Link</h4>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="bg-muted"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2"
              >
                <Copy size={16} />
                Copy
              </Button>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
              />
              <span>Make link public (anyone with link can view)</span>
            </label>
          </div>

          <div className="border-t pt-4" />

          {/* Invite User Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Invite by Email</h4>

            <div className="space-y-3">
              <Input
                type="email"
                placeholder="user@example.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />

              <Select value={shareRole} onValueChange={(value: any) => setShareRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye size={16} />
                      Viewer
                    </div>
                  </SelectItem>
                  <SelectItem value="commenter">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      Commenter
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <Edit size={16} />
                      Editor
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <p className="text-xs text-muted-foreground">
                {getRoleDescription(shareRole)}
              </p>

              <Button onClick={handleShare} className="w-full">
                Send Invite
              </Button>
            </div>
          </div>

          <div className="border-t pt-4" />

          {/* Shared Users List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">People with Access</h4>

            {sharedUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No one else has access yet
              </p>
            ) : (
              <div className="space-y-2">
                {sharedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <Badge variant="secondary" className="capitalize">
                          {user.role}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Permission Guide */}
          <div className="border-t pt-4 space-y-2 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Permission Levels:</p>
            <div className="space-y-1">
              <p>
                <strong>Viewer:</strong> Can view session chat, tools, and replay
              </p>
              <p>
                <strong>Commenter:</strong> Viewer + can add comments and annotations
              </p>
              <p>
                <strong>Editor:</strong> Commenter + can modify session settings
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
