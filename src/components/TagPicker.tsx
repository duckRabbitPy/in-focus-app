import { Tag } from "@/types/shared";
import ItemPicker from "./ItemPicker";

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
  return (
    <ItemPicker<Tag>
      selectedItems={selectedTags}
      onItemsChange={onTagsChange}
      userId={userId}
      disableAdd={disableAdd}
      entityType="tags"
      entityLabel="Tag"
    />
  );
}
