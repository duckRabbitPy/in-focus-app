import { useCallback, useEffect, useState } from "react";
import { sharedStyles } from "@/styles/shared";
import ItemCreator from "./ItemCreator";
import { formStyles } from "./PhotoForm";

// Generic type for items like tags or lenses
export interface Item {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface ItemPickerProps {
  selectedItems: string[];
  onItemsChange: (items: string[]) => void;
  disableAdd?: boolean;
  userId: string;
  entityType: "tags" | "lenses";
  entityLabel: "Tag" | "Lens";
  disabled?: boolean;
}

export default function ItemPicker<T extends Item>({
  selectedItems,
  onItemsChange,
  userId,
  disableAdd,
  entityType,
  entityLabel,
  disabled,
}: ItemPickerProps) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState("");

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/${userId}/${entityType}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${entityType}: ${response.status}`);
      }

      const data = await response.json();
      setItems(data);
      setError("");
      setNetworkError("");
    } catch (err) {
      console.error(`Error fetching ${entityType}:`, err);
      setError(`Failed to load ${entityType}`);
      setNetworkError(
        err instanceof Error ? err.message : "Network error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const memoizedFetchItems = useCallback(fetchItems, [userId, entityType]);

  useEffect(() => {
    memoizedFetchItems();
  }, [userId, memoizedFetchItems]);

  const handleItemSelect = (itemName: string) => {
    onItemsChange([...selectedItems, itemName]);
  };

  const handleItemRemove = (itemName: string) => {
    onItemsChange(selectedItems.filter((item) => item !== itemName));
  };

  const handleCreateItem = async (newItemName: string) => {
    try {
      setNetworkError("");

      if (!newItemName.trim()) {
        return false;
      }

      const response = await fetch(`/api/user/${userId}/${entityType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ [entityType]: [newItemName.trim()] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to create ${entityLabel.toLowerCase()}: ${response.status}`
        );
      }

      // Refetch items
      await fetchItems();

      // Add the new item to selected items
      handleItemSelect(newItemName.trim());

      return true;
    } catch (err) {
      console.error(`Error creating ${entityLabel.toLowerCase()}:`, err);
      setNetworkError(
        err instanceof Error
          ? err.message
          : `Failed to create ${entityLabel.toLowerCase()}`
      );
      return false;
    }
  };

  // Filter out already selected items from the dropdown options
  const availableItems = items.filter(
    (item) => !selectedItems.includes(item.name)
  );

  if (loading) {
    return <p style={sharedStyles.subtitle}>Loading {entityType}...</p>;
  }

  if (error) {
    return <p style={sharedStyles.error}>{error}</p>;
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={formStyles.label}>
        {entityLabel === "Lens" ? "Lenses" : "Tags"}
      </label>

      {/* Selected Items Display */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        {selectedItems.map((itemName) => (
          <div
            key={itemName}
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
            <span>{itemName}</span>
            <button
              type="button"
              onClick={() => handleItemRemove(itemName)}
              onMouseEnter={() => setHoveredItem(itemName)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                border: "none",
                background: hoveredItem === itemName ? "#e5e7eb" : "none",
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

      {/* Item Selection and Creation */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexDirection: "row",
        }}
      >
        {/* Item Dropdown */}
        {availableItems.length > 0 && (
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                handleItemSelect(e.target.value);
                e.target.value = ""; // Reset selection
              }
            }}
            disabled={disabled}
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
            <option value="">Select {entityLabel.toLowerCase()}...</option>
            {availableItems.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        )}

        {/* Create Item Button or Input */}
        {!disableAdd && (
          <ItemCreator onCreate={handleCreateItem} entityLabel={entityLabel} />
        )}
      </div>
    </div>
  );
}
