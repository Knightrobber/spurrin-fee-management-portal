import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { addDays, fromDDMMYYYY, isValidDDMMYYYY, maskDateInput, toDDMMYYYY } from "../../../lib/dates";
import {
  createDraftVersion,
  createFeeStructure,
  defaultFeeStructureName,
  getActiveVersion,
  getLineage,
  listBatches,
  listCategories,
  listCourses,
  uid,
  type Batch,
  type Category,
  type Course,
  type FeeStructureInput,
  type FeeStructureLineage,
  type TermInput,
} from "../../../lib/feeCatalogStore";
import { CreatableSelect } from "./CreatableSelect";
import { CreateBatchDialog, CreateCategoryDialog, CreateCourseDialog } from "./CreateEntityDialogs";
import { ClonePopover } from "./ClonePopover";

type CostDraft = { key: string; name: string; amount: string };
type TermDraft = {
  key: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  paymentWindowOpenDate: string;
  components: CostDraft[];
};

type FormState = {
  courseId: string | null;
  categoryId: string | null;
  batchId: string | null;
  name: string;
  lateFee: string;
  windowOffset: string;
  dueOffset: string;
  terms: TermDraft[];
  oneTimeCosts: CostDraft[];
};

/** Extra classes for a field whose value differs from the baseline it's being compared against. */
function editedRing(dirty: boolean): string {
  return dirty ? "border-blue-400 ring-2 ring-blue-100" : "";
}

function blankTerm(): TermDraft {
  return {
    key: uid("term-draft"),
    startDate: "",
    endDate: "",
    dueDate: "",
    paymentWindowOpenDate: "",
    components: [
      { key: uid("cost-draft"), name: "Tuition", amount: "" },
      { key: uid("cost-draft"), name: "Examination", amount: "" },
      { key: uid("cost-draft"), name: "Clinical training", amount: "" },
    ],
  };
}

function blankState(): FormState {
  return {
    courseId: null,
    categoryId: null,
    batchId: null,
    name: "",
    lateFee: "50",
    windowOffset: "30",
    dueOffset: "18",
    terms: [blankTerm()],
    oneTimeCosts: [
      { key: uid("cost-draft"), name: "Admission / registration", amount: "" },
      { key: uid("cost-draft"), name: "Refundable deposit", amount: "" },
    ],
  };
}

/**
 * Keys reuse the store's own stable ids (term.id / component.id) instead of
 * fresh random ones, so a baseline snapshot and the live form state can be
 * matched up field-by-field to know what changed, regardless of which of two
 * independent `stateFromLineage` calls produced each copy.
 */
function stateFromLineage(lineage: FeeStructureLineage): FormState {
  const v = getActiveVersion(lineage);
  return {
    courseId: lineage.courseId,
    categoryId: lineage.categoryId,
    batchId: lineage.batchId,
    name: v.name,
    lateFee: String(v.lateFeePerDay),
    windowOffset: String(v.paymentWindowOffsetDays),
    dueOffset: String(v.dueDateOffsetDays),
    terms: v.terms.map((t) => ({
      key: t.id,
      startDate: toDDMMYYYY(t.startDate),
      endDate: toDDMMYYYY(t.endDate),
      dueDate: toDDMMYYYY(t.dueDate),
      paymentWindowOpenDate: toDDMMYYYY(t.paymentWindowOpenDate),
      components: t.components.map((c) => ({ key: c.id, name: c.name, amount: String(c.amount) })),
    })),
    oneTimeCosts: v.oneTimeCosts.map((c) => ({ key: c.id, name: c.name, amount: String(c.amount) })),
  };
}

const DATE_FIELDS = [
  ["startDate", "start"],
  ["endDate", "end"],
  ["dueDate", "due"],
  ["paymentWindowOpenDate", "payment window open"],
] as const;

function buildPayload(state: FormState): { payload: FeeStructureInput } | { error: string } {
  const name = state.name.trim();
  if (!name) return { error: "Give this fee structure a name." };
  if (state.terms.length === 0) return { error: "Add at least one term." };

  const terms: TermInput[] = [];
  for (let i = 0; i < state.terms.length; i++) {
    const t = state.terms[i];
    const label = `Term ${i + 1}`;
    for (const [field, fieldLabel] of DATE_FIELDS) {
      if (!isValidDDMMYYYY(t[field])) return { error: `${label}: enter a valid ${fieldLabel} date (DD/MM/YYYY).` };
    }
    const rows = t.components.filter((c) => c.name.trim() || c.amount.trim());
    if (rows.length === 0) return { error: `${label}: add at least one cost line.` };
    const components: TermInput["components"] = [];
    for (const c of rows) {
      if (!c.name.trim()) return { error: `${label}: every cost line needs a name.` };
      const amount = Number(c.amount);
      if (c.amount.trim() === "" || Number.isNaN(amount) || amount < 0) {
        return { error: `${label}: "${c.name}" needs a valid amount.` };
      }
      components.push({ name: c.name.trim(), amount });
    }
    terms.push({
      startDate: fromDDMMYYYY(t.startDate)!,
      endDate: fromDDMMYYYY(t.endDate)!,
      dueDate: fromDDMMYYYY(t.dueDate)!,
      paymentWindowOpenDate: fromDDMMYYYY(t.paymentWindowOpenDate)!,
      components,
    });
  }

  const oneTimeCosts: { name: string; amount: number }[] = [];
  for (const c of state.oneTimeCosts) {
    if (!c.name.trim() && !c.amount.trim()) continue;
    if (!c.name.trim()) return { error: "Every one-time cost needs a name." };
    const amount = Number(c.amount);
    if (c.amount.trim() === "" || Number.isNaN(amount) || amount < 0) {
      return { error: `"${c.name}" needs a valid one-time amount.` };
    }
    oneTimeCosts.push({ name: c.name.trim(), amount });
  }

  const policy: [string, string][] = [
    [state.lateFee, "Late fee per day"],
    [state.windowOffset, "Payment window offset"],
    [state.dueOffset, "Due date offset"],
  ];
  const parsedPolicy: number[] = [];
  for (const [val, fieldLabel] of policy) {
    const n = Number(val);
    if (val.trim() === "" || Number.isNaN(n) || n < 0) return { error: `${fieldLabel} must be a non-negative number.` };
    parsedPolicy.push(n);
  }

  return {
    payload: {
      name,
      lateFeePerDay: parsedPolicy[0],
      paymentWindowOffsetDays: parsedPolicy[1],
      dueDateOffsetDays: parsedPolicy[2],
      terms,
      oneTimeCosts,
    },
  };
}

export function StructureFormPage({
  mode,
  lineageId,
  onCancel,
  onSaved,
}: {
  mode: "create" | "edit";
  lineageId?: string;
  onCancel: () => void;
  onSaved: (lineageId: string) => void;
}) {
  const isEdit = mode === "edit";
  const lineage = isEdit && lineageId ? getLineage(lineageId) : undefined;

  const [state, setState] = useState<FormState>(() => (lineage ? stateFromLineage(lineage) : blankState()));
  const [baseline, setBaseline] = useState<FormState | null>(() => (lineage ? stateFromLineage(lineage) : null));
  const [courses, setCourses] = useState<Course[]>(() => listCourses());
  const [categories, setCategories] = useState<Category[]>(() => listCategories());
  const [batches, setBatches] = useState<Batch[]>(() => listBatches());
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [createBatchOpen, setCreateBatchOpen] = useState(false);

  // Auto-derive the name from course/category/batch in create mode, only
  // until the finance user types (or clones in) something of their own.
  useEffect(() => {
    if (isEdit || state.name.trim()) return;
    const course = courses.find((c) => c.id === state.courseId);
    const category = categories.find((c) => c.id === state.categoryId);
    const batch = batches.find((b) => b.id === state.batchId);
    if (course && category && batch) {
      setState((s) => (s.name.trim() ? s : { ...s, name: defaultFeeStructureName(course.name, category.name, batch.name) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.courseId, state.categoryId, state.batchId]);

  if (isEdit && !lineage) {
    return (
      <div className="max-w-3xl space-y-4">
        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <p className="text-sm text-muted-foreground">This fee structure could not be found.</p>
      </div>
    );
  }

  const updateTerm = (key: string, patch: Partial<TermDraft>) =>
    setState((s) => ({ ...s, terms: s.terms.map((t) => (t.key === key ? { ...t, ...patch } : t)) }));

  const addTerm = () => setState((s) => ({ ...s, terms: [...s.terms, blankTerm()] }));
  const removeTerm = (key: string) => setState((s) => ({ ...s, terms: s.terms.filter((t) => t.key !== key) }));

  const addComponent = (termKey: string) =>
    setState((s) => ({
      ...s,
      terms: s.terms.map((t) =>
        t.key === termKey ? { ...t, components: [...t.components, { key: uid("cost-draft"), name: "", amount: "" }] } : t
      ),
    }));
  const removeComponent = (termKey: string, componentKey: string) =>
    setState((s) => ({
      ...s,
      terms: s.terms.map((t) =>
        t.key === termKey ? { ...t, components: t.components.filter((c) => c.key !== componentKey) } : t
      ),
    }));
  const updateComponent = (termKey: string, componentKey: string, patch: Partial<CostDraft>) =>
    setState((s) => ({
      ...s,
      terms: s.terms.map((t) =>
        t.key === termKey
          ? { ...t, components: t.components.map((c) => (c.key === componentKey ? { ...c, ...patch } : c)) }
          : t
      ),
    }));

  const addOneTimeCost = () =>
    setState((s) => ({ ...s, oneTimeCosts: [...s.oneTimeCosts, { key: uid("cost-draft"), name: "", amount: "" }] }));
  const removeOneTimeCost = (key: string) =>
    setState((s) => ({ ...s, oneTimeCosts: s.oneTimeCosts.filter((c) => c.key !== key) }));
  const updateOneTimeCost = (key: string, patch: Partial<CostDraft>) =>
    setState((s) => ({ ...s, oneTimeCosts: s.oneTimeCosts.map((c) => (c.key === key ? { ...c, ...patch } : c)) }));

  const autoFillTermDates = (term: TermDraft) => {
    const startIso = fromDDMMYYYY(term.startDate);
    if (!startIso) {
      toast.error("Enter a valid start date first");
      return;
    }
    const dueOffsetDays = Number(state.dueOffset) || 0;
    const windowOffsetDays = Number(state.windowOffset) || 0;
    updateTerm(term.key, {
      dueDate: toDDMMYYYY(addDays(startIso, dueOffsetDays)),
      paymentWindowOpenDate: toDDMMYYYY(addDays(startIso, -windowOffsetDays)),
    });
  };

  const applyClone = (source: FeeStructureLineage) => {
    setState(stateFromLineage(source));
    setBaseline(stateFromLineage(source));
    toast.success(`Cloned from "${getActiveVersion(source).name}"`);
  };

  const handleSave = () => {
    if (mode === "create" && (!state.courseId || !state.categoryId || !state.batchId)) {
      toast.error("Choose a course, category and batch.");
      return;
    }
    const result = buildPayload(state);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    try {
      if (mode === "create") {
        const created = createFeeStructure({
          ...result.payload,
          courseId: state.courseId!,
          categoryId: state.categoryId!,
          batchId: state.batchId!,
        });
        toast.success("Fee structure created");
        onSaved(created.lineageId);
      } else if (lineage) {
        createDraftVersion(lineage.lineageId, result.payload);
        toast.success("Draft version created — publish it from the fee structure page to make it active");
        onSaved(lineage.lineageId);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save fee structure");
    }
  };

  const trackDirty = baseline !== null;
  const baselineTermFor = (key: string) => (trackDirty ? baseline!.terms.find((t) => t.key === key) : undefined);
  const nameDirty = trackDirty && baseline!.name !== state.name;
  const courseDirty = trackDirty && baseline!.courseId !== state.courseId;
  const categoryDirty = trackDirty && baseline!.categoryId !== state.categoryId;
  const batchDirty = trackDirty && baseline!.batchId !== state.batchId;
  const lateFeeDirty = trackDirty && baseline!.lateFee !== state.lateFee;
  const windowOffsetDirty = trackDirty && baseline!.windowOffset !== state.windowOffset;
  const dueOffsetDirty = trackDirty && baseline!.dueOffset !== state.dueOffset;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> {isEdit ? "Back to fee structure" : "Back to fee structures"}
        </Button>
        {!isEdit && <ClonePopover onClone={applyClone} />}
      </div>

      <div>
        <h1>{isEdit ? "Edit fee structure" : "Create fee structure"}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isEdit
            ? "Saving creates a new draft version — the active version keeps running until you publish this one."
            : "Set up every term for this batch up front, or clone an existing fee structure to start from. Dates use DD/MM/YYYY."}
        </p>
      </div>

      {trackDirty && (
        <div className="flex items-center gap-2 text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
          Fields outlined in blue are different from {isEdit ? "the active version" : "the cloned fee structure"}.
        </div>
      )}

      <Card>
        <CardContent className="p-6 space-y-5">
          <div>
            <Label className="text-sm">Fee structure name</Label>
            <Input
              className={`mt-2 ${editedRing(nameDirty)}`}
              value={state.name}
              onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
              placeholder="e.g. MBBS · General · Batch of 2025"
            />
          </div>

          <div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-sm">Course</Label>
                {isEdit ? (
                  <EntityChip label={courses.find((c) => c.id === lineage?.courseId)?.name ?? "—"} />
                ) : (
                  <CreatableSelect
                    className={`mt-2 ${editedRing(courseDirty)}`}
                    value={state.courseId}
                    onChange={(id) => setState((s) => ({ ...s, courseId: id }))}
                    options={courses.map((c) => ({ id: c.id, label: c.name }))}
                    placeholder="Select course"
                    createLabel="Create new course"
                    onCreateRequested={() => setCreateCourseOpen(true)}
                  />
                )}
              </div>
              <div>
                <Label className="text-sm">Category</Label>
                {isEdit ? (
                  <EntityChip label={categories.find((c) => c.id === lineage?.categoryId)?.name ?? "—"} />
                ) : (
                  <CreatableSelect
                    className={`mt-2 ${editedRing(categoryDirty)}`}
                    value={state.categoryId}
                    onChange={(id) => setState((s) => ({ ...s, categoryId: id }))}
                    options={categories.map((c) => ({ id: c.id, label: c.name }))}
                    placeholder="Select category"
                    createLabel="Create new category"
                    onCreateRequested={() => setCreateCategoryOpen(true)}
                  />
                )}
              </div>
              <div>
                <Label className="text-sm">Batch</Label>
                {isEdit ? (
                  <EntityChip label={batches.find((b) => b.id === lineage?.batchId)?.name ?? "—"} />
                ) : (
                  <CreatableSelect
                    className={`mt-2 ${editedRing(batchDirty)}`}
                    value={state.batchId}
                    onChange={(id) => setState((s) => ({ ...s, batchId: id }))}
                    options={batches.map((b) => ({ id: b.id, label: b.name }))}
                    placeholder="Select batch"
                    createLabel="Create new batch"
                    onCreateRequested={() => setCreateBatchOpen(true)}
                  />
                )}
              </div>
            </div>
            {isEdit && (
              <p className="text-xs text-muted-foreground mt-2">
                Course, category and batch are fixed once a fee structure is created.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Terms</Label>
              <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={addTerm}>
                <Plus className="w-3.5 h-3.5" /> Add term
              </Button>
            </div>
            {state.terms.map((term, i) => (
              <TermEditor
                key={term.key}
                index={i}
                term={term}
                baselineTerm={baselineTermFor(term.key)}
                trackDirty={trackDirty}
                canRemove={state.terms.length > 1}
                onChange={(patch) => updateTerm(term.key, patch)}
                onRemove={() => removeTerm(term.key)}
                onAddComponent={() => addComponent(term.key)}
                onRemoveComponent={(ck) => removeComponent(term.key, ck)}
                onUpdateComponent={(ck, patch) => updateComponent(term.key, ck, patch)}
                onAutoFillDates={() => autoFillTermDates(term)}
              />
            ))}
          </div>

          <div className="space-y-2 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">One-time costs</Label>
              <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={addOneTimeCost}>
                <Plus className="w-3.5 h-3.5" /> Add cost
              </Button>
            </div>
            <div className="space-y-2">
              {state.oneTimeCosts.map((c) => {
                const bRow = trackDirty ? baseline!.oneTimeCosts.find((b) => b.key === c.key) : undefined;
                return (
                  <CostRow
                    key={c.key}
                    cost={c}
                    nameDirty={trackDirty && (bRow ? bRow.name !== c.name : true)}
                    amountDirty={trackDirty && (bRow ? bRow.amount !== c.amount : true)}
                    onChange={(patch) => updateOneTimeCost(c.key, patch)}
                    onRemove={() => removeOneTimeCost(c.key)}
                  />
                );
              })}
              {state.oneTimeCosts.length === 0 && (
                <p className="text-xs text-muted-foreground">No one-time costs — add admission fees, deposits, and the like.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Late fee / day (₹)</Label>
              <Input
                className={`mt-1 ${editedRing(lateFeeDirty)}`}
                type="number"
                min="0"
                value={state.lateFee}
                onChange={(e) => setState((s) => ({ ...s, lateFee: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Window opens (days before start)</Label>
              <Input
                className={`mt-1 ${editedRing(windowOffsetDirty)}`}
                type="number"
                min="0"
                value={state.windowOffset}
                onChange={(e) => setState((s) => ({ ...s, windowOffset: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Due date (days after start)</Label>
              <Input
                className={`mt-1 ${editedRing(dueOffsetDirty)}`}
                type="number"
                min="0"
                value={state.dueOffset}
                onChange={(e) => setState((s) => ({ ...s, dueOffset: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>{isEdit ? "Save as new draft" : "Create fee structure"}</Button>
      </div>

      <CreateCourseDialog
        open={createCourseOpen}
        onOpenChange={setCreateCourseOpen}
        onCreated={(c) => {
          setCourses(listCourses());
          setState((s) => ({ ...s, courseId: c.id }));
        }}
      />
      <CreateCategoryDialog
        open={createCategoryOpen}
        onOpenChange={setCreateCategoryOpen}
        onCreated={(c) => {
          setCategories(listCategories());
          setState((s) => ({ ...s, categoryId: c.id }));
        }}
      />
      <CreateBatchDialog
        open={createBatchOpen}
        onOpenChange={setCreateBatchOpen}
        onCreated={(b) => {
          setBatches(listBatches());
          setState((s) => ({ ...s, batchId: b.id }));
        }}
      />
    </div>
  );
}

function EntityChip({ label }: { label: string }) {
  return <div className="mt-2 h-9 flex items-center px-3 rounded-md border bg-muted/40 text-sm text-muted-foreground">{label}</div>;
}

function CostRow({
  cost,
  nameDirty,
  amountDirty,
  onChange,
  onRemove,
}: {
  cost: CostDraft;
  nameDirty: boolean;
  amountDirty: boolean;
  onChange: (patch: Partial<CostDraft>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        className={`flex-1 ${editedRing(nameDirty)}`}
        placeholder="Cost name"
        value={cost.name}
        onChange={(e) => onChange({ name: e.target.value })}
      />
      <Input
        className={`w-32 ${editedRing(amountDirty)}`}
        type="number"
        min="0"
        placeholder="Amount"
        value={cost.amount}
        onChange={(e) => onChange({ amount: e.target.value })}
      />
      <Button type="button" size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive shrink-0" onClick={onRemove}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

function DateField({
  label,
  value,
  dirty,
  onChange,
}: {
  label: string;
  value: string;
  dirty: boolean;
  onChange: (v: string) => void;
}) {
  const invalid = value.length === 10 && !isValidDDMMYYYY(value);
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label} (DD/MM/YYYY)</Label>
      <Input
        className={`mt-1 h-9 ${editedRing(dirty)}`}
        value={value}
        onChange={(e) => onChange(maskDateInput(e.target.value))}
        placeholder="DD/MM/YYYY"
        aria-invalid={invalid}
        inputMode="numeric"
      />
    </div>
  );
}

function TermEditor({
  index,
  term,
  baselineTerm,
  trackDirty,
  canRemove,
  onChange,
  onRemove,
  onAddComponent,
  onRemoveComponent,
  onUpdateComponent,
  onAutoFillDates,
}: {
  index: number;
  term: TermDraft;
  baselineTerm: TermDraft | undefined;
  trackDirty: boolean;
  canRemove: boolean;
  onChange: (patch: Partial<TermDraft>) => void;
  onRemove: () => void;
  onAddComponent: () => void;
  onRemoveComponent: (componentKey: string) => void;
  onUpdateComponent: (componentKey: string, patch: Partial<CostDraft>) => void;
  onAutoFillDates: () => void;
}) {
  const isNewTerm = trackDirty && !baselineTerm;
  const fieldDirty = (field: "startDate" | "endDate" | "dueDate" | "paymentWindowOpenDate") =>
    trackDirty && (baselineTerm ? baselineTerm[field] !== term[field] : true);

  return (
    <div className={`border rounded-lg p-4 space-y-3 ${isNewTerm ? "border-blue-300 bg-blue-50/30" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm flex items-center gap-2">
          Term {index + 1}
          {isNewTerm && <span className="text-xs text-blue-700">New</span>}
        </div>
        <div className="flex items-center gap-1">
          <Button type="button" size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" onClick={onAutoFillDates}>
            <Wand2 className="w-3.5 h-3.5" /> Auto-fill from offsets
          </Button>
          {canRemove && (
            <Button type="button" size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={onRemove}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <DateField label="Start" value={term.startDate} dirty={fieldDirty("startDate")} onChange={(v) => onChange({ startDate: v })} />
        <DateField label="End" value={term.endDate} dirty={fieldDirty("endDate")} onChange={(v) => onChange({ endDate: v })} />
        <DateField label="Due" value={term.dueDate} dirty={fieldDirty("dueDate")} onChange={(v) => onChange({ dueDate: v })} />
        <DateField
          label="Window opens"
          value={term.paymentWindowOpenDate}
          dirty={fieldDirty("paymentWindowOpenDate")}
          onChange={(v) => onChange({ paymentWindowOpenDate: v })}
        />
      </div>
      <div className="space-y-2">
        {term.components.map((c) => {
          const bRow = baselineTerm?.components.find((b) => b.key === c.key);
          return (
            <CostRow
              key={c.key}
              cost={c}
              nameDirty={trackDirty && (bRow ? bRow.name !== c.name : true)}
              amountDirty={trackDirty && (bRow ? bRow.amount !== c.amount : true)}
              onChange={(patch) => onUpdateComponent(c.key, patch)}
              onRemove={() => onRemoveComponent(c.key)}
            />
          );
        })}
      </div>
      <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={onAddComponent}>
        <Plus className="w-3.5 h-3.5" /> Add cost field
      </Button>
    </div>
  );
}
