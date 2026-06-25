import { motion } from "motion/react";
import { useState } from "react";
import { Plus, Clock, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { approvals, approvalHistory, inr } from "../../lib/mock";
import { toast } from "sonner";

export function RequestsPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Requests & approvals</h1>
          <p className="text-sm text-muted-foreground mt-1">Raise discount/scholarship requests and track their status.</p>
        </div>
        <RaiseDiscountDialog />
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Pending</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {approvals.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between border rounded-md p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={a.type === "Discount" ? "text-primary border-primary/30 bg-secondary" : "text-purple-700 border-purple-200 bg-purple-50"}>
                    {a.type}
                  </Badge>
                  <span className="text-sm">{a.student}</span>
                  <span className="text-xs text-muted-foreground font-mono">{a.studentId}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{a.note}</div>
                <div className="text-xs text-muted-foreground mt-1">Raised by {a.raisedBy} · {a.raisedAt}</div>
              </div>
              <div className="text-right">
                {a.amount !== 0 && <div className="text-sm text-green-600">{inr(a.amount)}</div>}
                <Badge variant="secondary" className="mt-1">Awaiting approver</Badge>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {approvalHistory.map((h) => (
            <div key={h.id} className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <div className="text-sm">{h.student} · <span className="text-muted-foreground">{h.type}</span></div>
                <div className="text-xs text-muted-foreground">{h.decidedBy} · {h.date}</div>
              </div>
              <Badge
                variant="outline"
                className={
                  h.decision === "Approved"
                    ? "text-green-700 border-green-200 bg-green-50 gap-1"
                    : "text-red-700 border-red-200 bg-red-50 gap-1"
                }
              >
                {h.decision === "Approved" ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                {h.decision}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function RaiseDiscountDialog() {
  const [amount, setAmount] = useState("10000");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Raise discount</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise discount / scholarship</DialogTitle>
          <DialogDescription>Creates a negative-amount add-on for the student, routed to the Finance Approver.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-sm">Student</Label>
            <Select>
              <SelectTrigger className="mt-2"><SelectValue placeholder="Search student…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Rohan Mehta · MBBS-2022-042</SelectItem>
                <SelectItem value="b">Sara Patel · MBBS-2023-018</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Add-on template</Label>
              <Select>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Pick scholarship" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="merit">Merit scholarship</SelectItem>
                  <SelectItem value="need">Need-based scholarship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Amount (₹)</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-2" />
            </div>
          </div>
          <div>
            <Label className="text-sm">Note</Label>
            <Textarea placeholder="Reason for the approver" className="mt-2" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => toast.success("Request sent to Finance Approver")}>Send for approval</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
