import ItemPicker from "./ItemPicker";

interface LensPickerProps {
  selectedLenses: string[];
  onLensesChange: (lenses: string[]) => void;
  disableAdd?: boolean;
  userId: string;
}

export default function LensPicker({
  selectedLenses,
  onLensesChange,
  userId,
  disableAdd,
}: LensPickerProps) {
  return (
    <ItemPicker
      selectedItems={selectedLenses}
      onItemsChange={onLensesChange}
      userId={userId}
      disableAdd={disableAdd}
      entityType="lenses"
      entityLabel="Lens"
      disabled={selectedLenses.length > 1}
    />
  );
}
