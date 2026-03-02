import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface PersonalityProfile {
  id: string;
  name: string;
  tone: "professional" | "casual" | "friendly" | "technical" | "creative";
  expertise: string[];
  behavior: string;
  systemPrompt: string;
  isActive: boolean;
}

interface PersonalityProfilesProps {
  profiles: PersonalityProfile[];
  activeProfileId?: string;
  onSelectProfile: (profileId: string) => void;
  onCreateProfile: (profile: Omit<PersonalityProfile, "id">) => void;
  onDeleteProfile: (profileId: string) => void;
  onUpdateProfile: (profileId: string, updates: Partial<PersonalityProfile>) => void;
}

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "technical", label: "Technical" },
  { value: "creative", label: "Creative" },
];

const EXPERTISE_OPTIONS = [
  "Programming",
  "Writing",
  "Analysis",
  "Problem-solving",
  "Research",
  "Teaching",
  "Brainstorming",
  "Debugging",
];

export default function PersonalityProfiles({
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  onUpdateProfile,
}: PersonalityProfilesProps) {
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    tone: "professional" as const,
    expertise: [] as string[],
    behavior: "",
    systemPrompt: "",
  });

  const handleCreateProfile = () => {
    if (!formData.name.trim()) {
      toast.error("Profile name is required");
      return;
    }
    onCreateProfile({
      ...formData,
      isActive: false,
    });
    setFormData({
      name: "",
      tone: "professional",
      expertise: [],
      behavior: "",
      systemPrompt: "",
    });
    setShowCreatePanel(false);
    toast.success("Personality profile created");
  };

  const handleToggleExpertise = (expertise: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter((e) => e !== expertise)
        : [...prev.expertise, expertise],
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} />
          <span className="text-sm font-medium">Personality Profiles</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreatePanel(!showCreatePanel)}
          className="h-8 px-3"
        >
          <Plus size={16} className="mr-1" />
          New Profile
        </Button>
      </div>

      {showCreatePanel && (
        <div className="p-3 bg-muted rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Profile name (e.g., 'Code Expert')"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-2 py-1 text-sm border border-border rounded"
          />

          <div>
            <label className="text-xs font-medium mb-2 block">Tone</label>
            <select
              value={formData.tone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tone: e.target.value as any,
                }))
              }
              className="w-full px-2 py-1 text-sm border border-border rounded"
            >
              {TONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block">Expertise</label>
            <div className="grid grid-cols-2 gap-2">
              {EXPERTISE_OPTIONS.map((expertise) => (
                <label key={expertise} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.expertise.includes(expertise)}
                    onChange={() => handleToggleExpertise(expertise)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-xs">{expertise}</span>
                </label>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Behavior description (e.g., 'Concise, direct, code-focused')"
            value={formData.behavior}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, behavior: e.target.value }))
            }
            className="w-full px-2 py-1 text-sm border border-border rounded h-20"
          />

          <textarea
            placeholder="System prompt (optional)"
            value={formData.systemPrompt}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, systemPrompt: e.target.value }))
            }
            className="w-full px-2 py-1 text-sm border border-border rounded h-20"
          />

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCreateProfile}
              className="flex-1"
            >
              Create
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreatePanel(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {profiles.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No profiles yet. Create one to customize Qumus's behavior.
        </p>
      ) : (
        <div className="space-y-2">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`p-2 rounded-lg border cursor-pointer transition ${
                activeProfileId === profile.id
                  ? "bg-primary/10 border-primary"
                  : "bg-muted border-border hover:bg-muted/80"
              }`}
              onClick={() => onSelectProfile(profile.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.tone} • {profile.expertise.join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {profile.behavior}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(profile.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit2 size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProfile(profile.id);
                      toast.success("Profile deleted");
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
