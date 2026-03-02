import { useState, useCallback } from "react";

export interface SessionTag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface UseSessionTagsOptions {
  sessionId: number | null;
}

/**
 * Hook for managing session tags and organization
 */
export function useSessionTags(options: UseSessionTagsOptions) {
  const { sessionId } = options;
  const [tags, setTags] = useState<SessionTag[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [collections, setCollections] = useState<Record<string, number[]>>({});

  // Add tag to session
  const addTag = useCallback(
    (tagName: string, color: string = "#3b82f6") => {
      if (!sessionId) return;

      setTags((prev) => {
        const existing = prev.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
        if (existing) {
          return prev.map((t) =>
            t.name.toLowerCase() === tagName.toLowerCase()
              ? { ...t, count: t.count + 1 }
              : t
          );
        }
        return [
          ...prev,
          {
            id: `tag-${Date.now()}`,
            name: tagName,
            color,
            count: 1,
          },
        ];
      });

      // Save to localStorage
      const stored = JSON.parse(localStorage.getItem(`session-tags-${sessionId}`) || "[]");
      localStorage.setItem(
        `session-tags-${sessionId}`,
        JSON.stringify([...stored, tagName])
      );
    },
    [sessionId]
  );

  // Remove tag from session
  const removeTag = useCallback(
    (tagName: string) => {
      if (!sessionId) return;

      setTags((prev) =>
        prev
          .map((t) =>
            t.name.toLowerCase() === tagName.toLowerCase()
              ? { ...t, count: Math.max(0, t.count - 1) }
              : t
          )
          .filter((t) => t.count > 0)
      );

      const stored = JSON.parse(localStorage.getItem(`session-tags-${sessionId}`) || "[]");
      localStorage.setItem(
        `session-tags-${sessionId}`,
        JSON.stringify(stored.filter((t: string) => t.toLowerCase() !== tagName.toLowerCase()))
      );
    },
    [sessionId]
  );

  // Create collection
  const createCollection = useCallback(
    (collectionName: string, sessionIds: number[]) => {
      setCollections((prev) => ({
        ...prev,
        [collectionName]: sessionIds,
      }));

      localStorage.setItem(
        "session-collections",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("session-collections") || "{}"),
          [collectionName]: sessionIds,
        })
      );
    },
    []
  );

  // Get smart tag suggestions based on content
  const getSuggestedTags = useCallback((content: string): string[] => {
    const suggestions: string[] = [];

    // Simple keyword-based suggestions
    if (content.toLowerCase().includes("bug") || content.toLowerCase().includes("error")) {
      suggestions.push("bug");
    }
    if (content.toLowerCase().includes("feature") || content.toLowerCase().includes("enhancement")) {
      suggestions.push("feature");
    }
    if (content.toLowerCase().includes("urgent") || content.toLowerCase().includes("critical")) {
      suggestions.push("urgent");
    }
    if (content.toLowerCase().includes("question") || content.toLowerCase().includes("help")) {
      suggestions.push("question");
    }

    return suggestions;
  }, []);

  return {
    tags,
    suggestedTags,
    collections,
    addTag,
    removeTag,
    createCollection,
    getSuggestedTags,
  };
}
