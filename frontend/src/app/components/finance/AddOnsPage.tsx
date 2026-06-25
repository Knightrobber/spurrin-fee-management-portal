import { motion } from "motion/react";
import { useState } from "react";
import { Plus, TrendingDown, TrendingUp, Repeat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { addOns, inr } from "../../lib/mock";
import { toast } from "sonner";

export function AddOnsPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Add-ons</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reusable items attached to students. Negative amounts are discounts/scholarships and need approval.
          </p>
        </div>
        <NewAddOnDialog />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addOns.map((a, i) => {
          const negative = a.amount < 0;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="hover:border-primary/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center ${
                      negative ? "bg-green-50 text-green-600" : "bg-secondary text-primary"
                    }`}>
                      {negative ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                    </div>
                    {a.recurring && (
                      <Badge variant="secondary" className="gap-1">
                        <Repeat className="w-3 h-3" /> Recurring
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-3">{a.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl ${negative ? "text-green-600" : ""}`}>{inr(a.amount)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Applies {a.mode}</div>
                  {a.approval && (
                    <Badge variant="outline" className="mt-3 text-amber-700 border-amber-200 bg-amber-50">
                      Approval required
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function NewAddOnDialog() {
  const [open, setOpen] = useState(false);
  const [recurring, setRecurring] = useState(true);
  const [mode, setMode] = useState("next");
  const [needsApproval, setNeedsApproval] = useState(false);

  const reset = () => {
    setRecurring(true);
    setMode("next");
    setNeedsApproval(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="w-4 h-4" /> New add-on</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create add-on</DialogTitle>
          <DialogDescription>
            A reusable attachable item. A negative amount makes it a discount/scholarship.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Name</Label>
              <Input className="mt-2" placeholder="e.g. Hostel, Merit scholarship" />
            </div>
            <div>
              <Label className="text-sm">Amount (₹)</Label>
              <Input type="number" className="mt-2" placeholder="10000 or −10000" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="text-sm">Recurring</div>
              <div className="text-xs text-muted-foreground">Lasts as long as the fee structure</div>
            </div>
            <Switch checked={recurring} onCheckedChange={setRecurring} />
          </div>

          <div>
            <Label className="text-sm">Apply mode</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current term</SelectItem>
                <SelectItem value="next">Next term</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "current" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Days to clear</Label>
                <Input type="number" className="mt-2" defaultValue={10} />
              </div>
              <div>
                <Label className="text-sm">Late fee / day (₹)</Label>
                <Input type="number" className="mt-2" defaultValue={50} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="text-sm">Approval needed</div>
              <div className="text-xs text-muted-foreground">Routes to an approver before it applies</div>
            </div>
            <Switch checked={needsApproval} onCheckedChange={setNeedsApproval} />
          </div>

          {needsApproval && (
            <div>
              <Label className="text-sm">Approver</Label>
              <Select defaultValue="finance-approver">
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance-approver">Finance Approver</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              setOpen(false);
              reset();
              toast.success("Add-on created");
            }}
          >
            Save add-on
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
