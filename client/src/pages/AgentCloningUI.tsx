import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, CheckCircle2 } from "lucide-react";

export function AgentCloningUI() {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [cloneName, setCloneName] = useState("");
  const [includeMessages, setIncludeMessages] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const cloneMutation = trpc.agentCloning.cloneAgent.useMutation({
    onSuccess: (data: any) => {
      console.log("Session cloned successfully");
      setCloneName("");
      setIncludeMessages(false);
      setIsOpen(false);
    },
    onError: (error: any) => {
      console.error("Clone failed:", error);
    },
  });

  const handleClone = () => {
    if (!sessionId || !cloneName.trim()) {
      console.error("Missing information");
      return;
    }

    cloneMutation.mutate({
      sessionId,
      newName: cloneName.trim(),
      includeMessages,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Clone Agent Session
          </CardTitle>
          <CardDescription>
            Duplicate an existing session with all its configurations and optionally include message history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>Clone Session</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clone Agent Session</DialogTitle>
                <DialogDescription>
                  Create a copy of an existing session with all its settings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sessionId">Session ID</Label>
                  <Input
                    id="sessionId"
                    type="number"
                    placeholder="Enter session ID to clone"
                    value={sessionId || ""}
                    onChange={(e) => setSessionId(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="cloneName">Clone Name</Label>
                  <Input
                    id="cloneName"
                    placeholder="Name for the cloned session"
                    value={cloneName}
                    onChange={(e) => setCloneName(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeMessages"
                    checked={includeMessages}
                    onCheckedChange={(checked) => setIncludeMessages(checked as boolean)}
                  />
                  <Label htmlFor="includeMessages" className="cursor-pointer">
                    Include message history
                  </Label>
                </div>
                <Button
                  onClick={handleClone}
                  disabled={cloneMutation.isPending}
                  className="w-full"
                >
                  {cloneMutation.isPending ? "Cloning..." : "Clone Session"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Clone Status
          </CardTitle>
          <CardDescription>Recent cloning operations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent clones. Start by clicking the "Clone Session" button above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
