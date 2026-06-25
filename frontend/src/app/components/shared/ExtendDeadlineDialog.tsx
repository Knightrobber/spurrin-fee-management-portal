import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";

const THRESHOLD = 14;

/** Extend a fee deadline. Within the threshold applies immediately; beyond it routes to the Finance Approver. */
export function ExtendDeadlineDialog({
  studentName,
  trigger,
}: {
  studentName?: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(10);
  const beyond = days > THRESHOLD;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarClock className="w-4 h-4" /> Extend deadline
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend payment deadline{studentName ? ` — ${studentName}` : ""}</DialogTitle>
          <DialogDescription>
            Within {THRESHOLD} days you can apply immediately. Beyond {THRESHOLD} days, this routes to the Finance Approver.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-sm">Days to extend</Label>
            <Input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-sm">Reason</Label>
            <Textarea placeholder="Optional note for audit trail" className="mt-2" />
          </div>
          {beyond && (
            <div className="rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3">
              This exceeds the {THRESHOLD} day threshold. The request will go to the Finance Approver.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              setOpen(false);
              toast.success(
                beyond
                  ? "Extension request raised to Finance Approver"
                  : "Deadline extended immediately"
              );
            }}
          >
            {beyond ? "Raise request" : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
