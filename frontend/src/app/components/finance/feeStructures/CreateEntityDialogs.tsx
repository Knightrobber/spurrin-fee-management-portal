import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { fromDDMMYYYY, isValidDDMMYYYY, maskDateInput } from "../../../lib/dates";
import { createBatch, createCategory, createCourse, type Batch, type Category, type Course } from "../../../lib/feeCatalogStore";

type DialogProps<T> = { open: boolean; onOpenChange: (open: boolean) => void; onCreated: (entity: T) => void };

export function CreateCourseDialog({ open, onOpenChange, onCreated }: DialogProps<Course>) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("4");

  const reset = () => {
    setName("");
    setDuration("4");
  };

  const submit = () => {
    if (!name.trim()) return toast.error("Enter a course name");
    const years = Number(duration);
    if (!Number.isFinite(years) || years <= 0) return toast.error("Enter a valid duration in years");
    try {
      const course = createCourse({ name: name.trim(), durationYears: years });
      toast.success(`Course "${course.name}" created`);
      onCreated(course);
      onOpenChange(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create course");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create course</DialogTitle>
          <DialogDescription>Adds a new course, available across every fee structure.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-sm">Course name</Label>
            <Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. BDS" />
          </div>
          <div>
            <Label className="text-sm">Duration (years)</Label>
            <Input
              className="mt-2"
              type="number"
              step="0.5"
              min="0"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit}>Create course</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateCategoryDialog({ open, onOpenChange, onCreated }: DialogProps<Category>) {
  const [name, setName] = useState("");

  const reset = () => setName("");

  const submit = () => {
    if (!name.trim()) return toast.error("Enter a category name");
    try {
      const category = createCategory({ name: name.trim() });
      toast.success(`Category "${category.name}" created`);
      onCreated(category);
      onOpenChange(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create category");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create category</DialogTitle>
          <DialogDescription>Adds a new quota / seat category.</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Label className="text-sm">Category name</Label>
          <Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. EWS" />
        </div>
        <DialogFooter>
          <Button onClick={submit}>Create category</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateBatchDialog({ open, onOpenChange, onCreated }: DialogProps<Batch>) {
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const reset = () => {
    setName("");
    setStart("");
    setEnd("");
  };

  const submit = () => {
    if (!name.trim()) return toast.error("Enter a batch name");
    const startIso = fromDDMMYYYY(start);
    const endIso = fromDDMMYYYY(end);
    if (!startIso || !endIso) return toast.error("Enter valid start and end dates (DD/MM/YYYY)");
    if (endIso <= startIso) return toast.error("End date must be after the start date");
    try {
      const batch = createBatch({ name: name.trim(), startDate: startIso, endDate: endIso });
      toast.success(`Batch "${batch.name}" created`);
      onCreated(batch);
      onOpenChange(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create batch");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create batch</DialogTitle>
          <DialogDescription>A new intake cohort, used to scope fee structures to an admission year.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-sm">Batch name</Label>
            <Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Batch of 2025" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Start date (DD/MM/YYYY)</Label>
              <Input
                className="mt-1"
                value={start}
                onChange={(e) => setStart(maskDateInput(e.target.value))}
                placeholder="01/08/2025"
                aria-invalid={start.length === 10 && !isValidDDMMYYYY(start)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">End date (DD/MM/YYYY)</Label>
              <Input
                className="mt-1"
                value={end}
                onChange={(e) => setEnd(maskDateInput(e.target.value))}
                placeholder="31/07/2029"
                aria-invalid={end.length === 10 && !isValidDDMMYYYY(end)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit}>Create batch</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
