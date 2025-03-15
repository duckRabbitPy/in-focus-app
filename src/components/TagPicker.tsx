import { useCallback, useEffect, useState } from "react";
import { Tag } from "@/types/tag";
import { sharedStyles } from "@/styles/shared";
import TagCreator from "./TagCreator";

interface TagPickerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  disableAdd?: boolean;
  userId: string;
}

export default function TagPicker({
  selectedTags,
  onTagsChange,
  userId,
  disableAdd,
}: TagPickerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState("");

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/${userId}/tags`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.status}`);
      }

      const data = await response.json();
      setTags(data);
      setError("");
      setNetworkError("");
    } catch (err) {
      console.error("Error fetching tags:", err);
      setError("Failed to load tags");
      setNetworkError(
        err instanceof Error ? err.message : "Network error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const memoizedFetchTags = useCallback(fetchTags, [userId]);

  useEffect(() => {
    memoizedFetchTags();
  }, [userId, memoizedFetchTags]);

  const handleTagSelect = (tagName: string) => {
    onTagsChange([...selectedTags, tagName]);
  };

  const handleTagRemove = (tagName: string) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagName));
  };

  const handleCreateTag = async (newTagName: string) => {
    try {
      setNetworkError("");

      if (!newTagName.trim()) {
        return false;
      }

      const response = await fetch(`/api/user/${userId}/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ tags: [newTagName.trim()] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to create tag: ${response.status}`
        );
      }

      // Refetch tags
      await fetchTags();

      // Add the new tag to selected tags
      handleTagSelect(newTagName.trim());

      return true;
    } catch (err) {
      console.error("Error creating tag:", err);
      setNetworkError(
        err instanceof Error ? err.message : "Failed to create tag"
      );
      return false;
    }
  };

  // Filter out already selected tags from the dropdown options
  const availableTags = tags.filter((tag) => !selectedTags.includes(tag.name));

  if (loading) {
    return <p style={sharedStyles.subtitle}>Loading tags...</p>;
  }

  if (error) {
    return <p style={sharedStyles.error}>{error}</p>;
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", marginBottom: "0.5rem" }}>Tags</label>

      {/* Selected Tags Display */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        {selectedTags.map((tagName) => (
          <div
            key={tagName}
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f3f4f6",
              borderRadius: "1rem",
              padding: "0.25rem 0.75rem",
              fontSize: "0.875rem",
              gap: "0.5rem",
            }}
          >
            <span>{tagName}</span>
            <button
              type="button"
              onClick={() => handleTagRemove(tagName)}
              onMouseEnter={() => setHoveredTag(tagName)}
              onMouseLeave={() => setHoveredTag(null)}
              style={{
                border: "none",
                background: hoveredTag === tagName ? "#e5e7eb" : "none",
                padding: "0",
                cursor: "pointer",
                color: "#6b7280",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                transition: "background-color 0.2s ease",
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Network Error Display */}
      {networkError && (
        <p
          style={{
            ...sharedStyles.error,
            fontSize: "0.875rem",
            marginBottom: "0.5rem",
          }}
        >
          {networkError}
        </p>
      )}

      {/* Tag Selection and Creation */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexDirection: "row",
        }}
      >
        {/* Tag Dropdown */}
        {availableTags.length > 0 && (
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                handleTagSelect(e.target.value);
                e.target.value = ""; // Reset selection
              }
            }}
            style={{
              ...sharedStyles.input,
              flex: 1,
              padding: "0.75rem",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
              backgroundSize: "1.25rem",
              paddingRight: "2.5rem",
            }}
          >
            <option value="">Select tag...</option>
            {availableTags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>
        )}

        {/* Create Tag Button or Input */}
        {!disableAdd && <TagCreator onCreate={handleCreateTag} />}
      </div>
    </div>
  );
}
