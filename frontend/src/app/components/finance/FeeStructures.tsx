import { motion } from "motion/react";
import { Plus, Layers, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { feeStructures, inr } from "../../lib/mock";
import { toast } from "sonner";

export function FeeStructures() {
  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Fee structures</h1>
          <p className="text-sm text-muted-foreground mt-1">Course-based templates. Year-agnostic; dates as DD/MM.</p>
        </div>
        <StructureDialog
          trigger={<Button className="gap-2"><Plus className="w-4 h-4" /> New fee structure</Button>}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {feeStructures.map((f, i) => (
          <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover:border-primary/40 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-md bg-secondary text-primary flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle>{f.course}</CardTitle>
                      <div className="text-xs text-muted-foreground mt-0.5">{f.id} · updated {f.updated}</div>
                    </div>
                  </div>
                  <Badge variant="secondary">{f.students} students</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <Mini label="Terms" value={String(f.terms)} />
                  <Mini label="Annual" value={inr(f.totalAnnual)} />
                  <Mini label="Fixed costs" value={inr(f.fixedCosts)} />
                </div>
                <div className="mt-4 flex gap-2">
                  <StructureDialog
                    course={f.course}
                    trigger={
                      <Button size="sm" variant="outline" className="gap-2"><Pencil className="w-3 h-3" /> Edit</Button>
                    }
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      toast.info(`${f.course} · ${f.terms} terms · annual ${inr(f.totalAnnual)} · ${f.students} enrolled`)
                    }
                  >
                    View detail
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1">{value}</div>
    </div>
  );
}

function StructureDialog({ course, trigger }: { course?: string; trigger: React.ReactNode }) {
  const isEdit = Boolean(course);
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit fee structure — ${course}` : "Create fee structure"}</DialogTitle>
          <DialogDescription>Year-agnostic template. Dates use DD/MM; calendar year resolves from each student's batch.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Course label</Label>
              <Input className="mt-2" placeholder="e.g. MBBS, MD-Radiology" defaultValue={course} />
            </div>
            <div>
              <Label className="text-sm">Number of terms</Label>
              <Input type="number" defaultValue={2} className="mt-2" />
            </div>
          </div>
          <div className="border rounded-lg p-4 space-y-3">
            <div className="text-sm">Term 1</div>
            <div className="grid grid-cols-3 gap-3">
              <SmallField label="Start (DD/MM)" value="01/08" />
              <SmallField label="End (DD/MM)" value="31/12" />
              <SmallField label="Deadline (DD/MM)" value="18/08" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <SmallField label="Tuition" value="10000" />
              <SmallField label="Examination" value="2000" />
              <SmallField label="Clinical training" value="1000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SmallField label="Admission / registration" value="40000" />
            <SmallField label="Refundable deposit" value="10000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SmallField label="Late fee per day" value="50" />
            <SmallField label="Payment window (days before)" value="30" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => toast.success(isEdit ? "Fee structure updated" : "Fee structure saved")}>
            {isEdit ? "Save changes" : "Save fee structure"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SmallField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input defaultValue={value} className="mt-1 h-9" />
    </div>
  );
}
