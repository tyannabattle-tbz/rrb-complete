import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Share2, Save, Plus, Trash2 } from "lucide-react";

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: "editor" | "viewer";
  avatar?: string;
}

interface EditSession {
  id: string;
  title: string;
  description: string;
  collaborators: Collaborator[];
  createdAt: Date;
  lastModified: Date;
  status: "editing" | "reviewing" | "completed";
}

export default function CollaborativeEditor() {
  const [sessions, setSessions] = useState<EditSession[]>([
    {
      id: "session-1",
      title: "Summer Montage",
      description: "Collaborative edit of summer vacation footage",
      collaborators: [
        { id: "user-1", name: "You", email: "you@example.com", role: "editor" },
        { id: "user-2", name: "Alex", email: "alex@example.com", role: "editor" },
        { id: "user-3", name: "Sam", email: "sam@example.com", role: "viewer" },
      ],
      createdAt: new Date(Date.now() - 86400000),
      lastModified: new Date(Date.now() - 3600000),
      status: "editing",
    },
  ]);

  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [selectedSession, setSelectedSession] = useState<EditSession | null>(sessions[0]);

  const addCollaborator = (email: string) => {
    if (!selectedSession) return;

    const newCollaborator: Collaborator = {
      id: `user-${Date.now()}`,
      name: email.split("@")[0],
      email,
      role: "editor",
    };

    const updatedSession = {
      ...selectedSession,
      collaborators: [...selectedSession.collaborators, newCollaborator],
    };

    setSessions(sessions.map((s) => (s.id === selectedSession.id ? updatedSession : s)));
    setSelectedSession(updatedSession);
    setNewCollaboratorEmail("");
  };

  const removeCollaborator = (collaboratorId: string) => {
    if (!selectedSession) return;

    const updatedSession = {
      ...selectedSession,
      collaborators: selectedSession.collaborators.filter((c) => c.id !== collaboratorId),
    };

    setSessions(sessions.map((s) => (s.id === selectedSession.id ? updatedSession : s)));
    setSelectedSession(updatedSession);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Collaborative Editor</h1>
          <p className="text-muted-foreground">
            Work together with other creators on video projects in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedSession?.id === session.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <div className="font-semibold text-sm">{session.title}</div>
                    <div className="text-xs opacity-75">
                      {session.collaborators.length} collaborators
                    </div>
                  </button>
                ))}
                <Button className="w-full mt-4" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Editor Panel */}
          {selectedSession && (
            <div className="lg:col-span-2 space-y-6">
              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle>{selectedSession.title}</CardTitle>
                  <CardDescription>
                    Last modified {new Date(selectedSession.lastModified).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Title</label>
                    <Input value={selectedSession.title} className="mt-1" readOnly />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <Textarea value={selectedSession.description} className="mt-1" readOnly />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Collaborators */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Collaborators ({selectedSession.collaborators.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {selectedSession.collaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <div className="font-semibold text-sm">{collaborator.name}</div>
                          <div className="text-xs text-muted-foreground">{collaborator.email}</div>
                          <div className="text-xs text-primary mt-1 capitalize">{collaborator.role}</div>
                        </div>
                        {collaborator.id !== "user-1" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCollaborator(collaborator.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Collaborator */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="collaborator@example.com"
                      value={newCollaboratorEmail}
                      onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                    />
                    <Button
                      onClick={() => addCollaborator(newCollaboratorEmail)}
                      disabled={!newCollaboratorEmail}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="text-muted-foreground">
                      • Alex added 3 clips to timeline (5 min ago)
                    </div>
                    <div className="text-muted-foreground">
                      • You adjusted color grading (12 min ago)
                    </div>
                    <div className="text-muted-foreground">
                      • Sam commented on transition (25 min ago)
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
