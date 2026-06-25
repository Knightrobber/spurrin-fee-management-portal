import { motion } from "motion/react";
import { ArrowLeft, MinusCircle, UserX, Plus, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "../ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Checkbox } from "../ui/checkbox";
import { ExtendDeadlineDialog } from "../shared/ExtendDeadlineDialog";
import { students, addOns, paymentHistory, inr } from "../../lib/mock";
import { useState } from "react";
import { toast } from "sonner";

export function StudentDetail({ studentId, onBack }: { studentId: string; onBack: () => void }) {
  const s = students.find((x) => x.id === studentId) ?? students[0];
  const [attached, setAttached] = useState(() => addOns.slice(0, 3));
  const [status, setStatus] = useState(s.status);

  const removeAddOn = (id: string, name: string) => {
    setAttached((list) => list.filter((a) => a.id !== id));
    toast.success(`${name} will stop from next term`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to students
      </Button>

      <Card>
        <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14">
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {s.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2>{s.name}</h2>
                <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                  {status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {s.course} · {s.id} · Batch {s.batch}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExtendDeadlineDialog studentName={s.name} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-red-600 hover:text-red-700"
                  disabled={status === "Dropped out"}
                >
                  <UserX className="w-4 h-4" /> Mark dropped out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mark {s.name} as dropped out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Future-term dues stop generating. The student is never deleted — all financial
                    history is retained.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setStatus("Dropped out");
                      toast.success(`${s.name} marked as dropped out`);
                    }}
                  >
                    Confirm dropout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="dues">
        <TabsList>
          <TabsTrigger value="dues">Dues & history</TabsTrigger>
          <TabsTrigger value="addons">Add-ons</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="dues" className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Outstanding" value={inr(s.dues)} tone={s.overdue ? "danger" : "default"} />
            <Stat label="Paid this year" value={inr(46500)} />
            <Stat label="Next deadline" value="18 Aug 2025" />
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="w-4 h-4 text-primary" /> Payment history</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paymentHistory.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-md border bg-card">
                    <div>
                      <div className="text-sm">{p.term}</div>
                      <div className="text-xs text-muted-foreground">{p.date} · {p.mode} · {p.id}</div>
                    </div>
                    <div className="text-sm">{inr(p.amount)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addons" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Attached add-ons</CardTitle>
              <AttachAddOnDialog
                attachedIds={attached.map((a) => a.id)}
                onAttach={(picked) =>
                  setAttached((list) => [
                    ...list,
                    ...addOns.filter((a) => picked.includes(a.id) && !list.some((x) => x.id === a.id)),
                  ])
                }
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attached.length === 0 && (
                  <div className="text-sm text-muted-foreground">No add-ons attached.</div>
                )}
                {attached.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <div className="text-sm">{a.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.recurring ? "Recurring" : "One-time"} · Applies {a.mode}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{inr(a.amount)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-red-600"
                        onClick={() => removeAddOn(a.id, a.name)}
                      >
                        <MinusCircle className="w-4 h-4" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="text-xs text-muted-foreground">
                Removing an add-on stops it from the next term — historical dues are retained.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Approval history</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">No pending approvals for this student.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "danger" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-xl mt-1 ${tone === "danger" ? "text-red-600" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function AttachAddOnDialog({
  attachedIds,
  onAttach,
}: {
  attachedIds: string[];
  onAttach: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const available = addOns.filter((a) => a.type === "positive" && !attachedIds.includes(a.id));

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setPicked([]);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> Attach add-on
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach add-ons</DialogTitle>
          <DialogDescription>
            Positive add-ons only. Discounts and scholarships are raised by Finance.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {available.length === 0 && (
            <div className="text-sm text-muted-foreground">All positive add-ons are already attached.</div>
          )}
          {available.map((a) => (
            <label
              key={a.id}
              className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <Checkbox checked={picked.includes(a.id)} onCheckedChange={() => toggle(a.id)} />
                <div>
                  <div className="text-sm">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.recurring ? "Recurring" : "One-time"}</div>
                </div>
              </div>
              <span className="text-sm">{inr(a.amount)}</span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button
            disabled={picked.length === 0}
            onClick={() => {
              onAttach(picked);
              setOpen(false);
              setPicked([]);
              toast.success(`${picked.length} add-on${picked.length > 1 ? "s" : ""} attached`);
            }}
          >
            Attach selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
