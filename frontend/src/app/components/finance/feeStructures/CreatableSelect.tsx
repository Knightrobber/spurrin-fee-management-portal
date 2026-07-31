import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "../../ui/select";

export type CreatableSelectOption = { id: string; label: string };

const CREATE_SENTINEL = "__create__";

/**
 * A Select with a trailing "+ Create new …" row. Picking it calls
 * `onCreateRequested` instead of `onChange` — the controlled `value` never
 * becomes the sentinel, so the trigger's displayed label never changes; the
 * parent owns opening its own create-entity dialog and, on success, both
 * refreshes `options` and calls `onChange` with the new id to auto-select it.
 */
export function CreatableSelect({
  value,
  onChange,
  options,
  placeholder,
  createLabel,
  onCreateRequested,
  disabled,
  className,
}: {
  value: string | null;
  onChange: (id: string) => void;
  options: CreatableSelectOption[];
  placeholder?: string;
  createLabel: string;
  onCreateRequested: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Select
      value={value ?? undefined}
      onValueChange={(v) => {
        if (v === CREATE_SENTINEL) {
          onCreateRequested();
          return;
        }
        onChange(v);
      }}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.label}
          </SelectItem>
        ))}
        <SelectSeparator />
        <SelectItem value={CREATE_SENTINEL} className="text-primary">
          <Plus className="w-3.5 h-3.5" /> {createLabel}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
