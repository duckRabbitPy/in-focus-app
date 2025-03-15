import { useEffect, useState } from 'react';
import { Tag } from '@/types/tag';
import { sharedStyles } from '@/styles/shared';

interface TagPickerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  userId: string;
}

export default function TagPicker({ selectedTags, onTagsChange, userId }: TagPickerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [createError, setCreateError] = useState('');

  const fetchTags = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/tags`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }

      const data = await response.json();
      setTags(data);
      setError('');
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [userId]);

  const handleTagSelect = (tagName: string) => {
    onTagsChange([...selectedTags, tagName]);
  };

  const handleTagRemove = (tagName: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagName));
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      setCreateError('Tag name cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/user/${userId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ tags: [newTagName.trim()] }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create tag');
      }

      // Reset state
      setNewTagName('');
      setIsCreating(false);
      setCreateError('');

      // Refetch tags
      await fetchTags();

      // Add the new tag to selected tags
      handleTagSelect(newTagName.trim());
    } catch (err) {
      console.error('Error creating tag:', err);
      setCreateError(err instanceof Error ? err.message : 'Failed to create tag');
    }
  };

  // Filter out already selected tags from the dropdown options
  const availableTags = tags.filter(tag => !selectedTags.includes(tag.name));

  if (loading) {
    return <p style={sharedStyles.subtitle}>Loading tags...</p>;
  }

  if (error) {
    return <p style={sharedStyles.error}>{error}</p>;
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tags</label>
      
      {/* Selected Tags Display */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '0.75rem'
      }}>
        {selectedTags.map((tagName) => (
          <div
            key={tagName}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: '1rem',
              padding: '0.25rem 0.75rem',
              fontSize: '0.875rem',
              gap: '0.5rem'
            }}
          >
            <span>{tagName}</span>
            <button
              type="button"
              onClick={() => handleTagRemove(tagName)}
              onMouseEnter={() => setHoveredTag(tagName)}
              onMouseLeave={() => setHoveredTag(null)}
              style={{
                border: 'none',
                background: hoveredTag === tagName ? '#e5e7eb' : 'none',
                padding: '0',
                cursor: 'pointer',
                color: '#6b7280',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                transition: 'background-color 0.2s ease'
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Tag Selection and Creation */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem',
        flexDirection: isCreating ? 'column' : 'row'
      }}>
        {/* Tag Dropdown */}
        {!isCreating && availableTags.length > 0 && (
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                handleTagSelect(e.target.value);
                e.target.value = ''; // Reset selection
              }
            }}
            style={{
              ...sharedStyles.input,
              flex: 1,
              padding: '0.75rem',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.25rem',
              paddingRight: '2.5rem'
            }}
          >
            <option value="">Add a tag...</option>
            {availableTags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>
        )}

        {/* Create Tag Button or Input */}
        {isCreating ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter new tag name"
                style={{
                  ...sharedStyles.input,
                  flex: 1,
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateTag();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setIsCreating(false);
                    setNewTagName('');
                    setCreateError('');
                  }
                }}
              />
              <button
                onClick={handleCreateTag}
                style={{
                  ...sharedStyles.button,
                  padding: '0.75rem 1rem',
                  minWidth: 'fit-content',
                  whiteSpace: 'nowrap',
                }}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewTagName('');
                  setCreateError('');
                }}
                style={{
                  ...sharedStyles.secondaryButton,
                  padding: '0.75rem 1rem',
                  minWidth: 'fit-content',
                  whiteSpace: 'nowrap',
                }}
              >
                Cancel
              </button>
            </div>
            {createError && (
              <p style={{ ...sharedStyles.error, margin: 0, fontSize: '0.875rem' }}>
                {createError}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            style={{
              ...sharedStyles.secondaryButton,
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              minWidth: '44px',
              height: '44px'
            }}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
} 