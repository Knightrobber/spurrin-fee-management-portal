import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "../../ui/select";

export type CreatableSelectOption = { id: string; label: string };

const CREATE_SENTINEL = "__create__";
const LOADING_SENTINEL = "__loading__";
const NONE_SENTINEL = "";

/**
 * A Select with a trailing "+ Create new …" row. Picking it calls
 * `onCreateRequested` instead of `onChange` — the underlying value never
 * becomes the sentinel, so the trigger keeps showing `placeholder`. This only
 * works because the Select's `value` is never passed as `undefined`: Radix's
 * `useControllableState` treats an `undefined` prop as "uncontrolled" and
 * starts managing its own internal value, which then gets stuck on whatever
 * item was last clicked (including the sentinel) with no way for this
 * component to reset it. Passing `""` for "nothing selected" instead keeps
 * the Select controlled at all times. The parent owns opening its own
 * create-entity dialog and, on success, both refreshes `options` and calls
 * `onChange` with the new id to auto-select it.
 */
export function CreatableSelect({
  value,
  onChange,
  options,
  placeholder,
  createLabel,
  onCreateRequested,
  onOpen,
  loading,
  disabled,
  className,
}: {
  value: string | null;
  onChange: (id: string) => void;
  options: CreatableSelectOption[];
  placeholder?: string;
  createLabel: string;
  onCreateRequested: () => void;
  /** Called the moment the dropdown opens — wire this to lazily fetch `options`. */
  onOpen?: () => void;
  /** Shows a "Loading…" row in place of options while a lazy fetch is in flight. */
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Select
      value={value ?? NONE_SENTINEL}
      onValueChange={(v) => {
        if (v === CREATE_SENTINEL) {
          // Opening the create-entity Dialog in the same tick as this Select
          // closing confuses Radix's focus/pointer-events handoff between the
          // two portalled overlays and can leave the page unresponsive after
          // the dialog closes. Deferring a tick lets the Select finish closing first.
          setTimeout(() => onCreateRequested(), 0);
          return;
        }
        onChange(v);
      }}
      onOpenChange={(open) => {
        if (open) onOpen?.();
      }}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {loading ? (
          <SelectItem value={LOADING_SENTINEL} disabled>
            Loading…
          </SelectItem>
        ) : (
          options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.label}
            </SelectItem>
          ))
        )}
        <SelectSeparator />
        <SelectItem value={CREATE_SENTINEL} className="text-primary">
          <Plus className="w-3.5 h-3.5" /> {createLabel}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
