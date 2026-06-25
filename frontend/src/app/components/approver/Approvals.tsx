import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Check, X, Clock, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { approvals as initialApprovals, approvalHistory, inr } from "../../lib/mock";
import { toast } from "sonner";

export function Approvals() {
  const [pending, setPending] = useState(initialApprovals);

  const decide = (id: string, decision: "Approved" | "Rejected") => {
    setPending((p) => p.filter((x) => x.id !== id));
    toast.success(`${id} ${decision.toLowerCase()}`);
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1>Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discount/scholarship and beyond-threshold extension requests.
        </p>
      </div>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" /> Pending
            <Badge variant="secondary" className="ml-1">{pending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><History className="w-4 h-4" /> History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6 space-y-3">
          <AnimatePresence>
            {pending.length === 0 ? (
              <Card><CardContent className="p-10 text-center text-muted-foreground">All caught up.</CardContent></Card>
            ) : (
              pending.map((a) => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={
                            a.type === "Discount"
                              ? "text-primary border-primary/30 bg-secondary"
                              : "text-purple-700 border-purple-200 bg-purple-50"
                          }>{a.type}</Badge>
                          <CardTitle>{a.student}</CardTitle>
                          <span className="text-xs text-muted-foreground font-mono">{a.studentId}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{a.raisedAt}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm">{a.note}</div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <Field k="Raised by" v={a.raisedBy} />
                        <Field k="Type" v={a.type} />
                        <Field k="Amount" v={a.amount !== 0 ? inr(a.amount) : "—"} />
                      </div>
                      <Textarea placeholder="Optional note for audit trail" className="resize-none" />
                      <div className="flex items-center gap-2">
                        <Button onClick={() => decide(a.id, "Approved")} className="gap-2">
                          <Check className="w-4 h-4" /> Approve
                        </Button>
                        <Button variant="outline" onClick={() => decide(a.id, "Rejected")} className="gap-2 text-red-600 hover:text-red-700">
                          <X className="w-4 h-4" /> Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardContent className="p-0">
              {approvalHistory.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-4 border-b last:border-0">
                  <div>
                    <div className="text-sm">{h.student} · <span className="text-muted-foreground">{h.type}</span></div>
                    <div className="text-xs text-muted-foreground">{h.decidedBy} · {h.date} · {h.id}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      h.decision === "Approved"
                        ? "text-green-700 border-green-200 bg-green-50"
                        : "text-red-700 border-red-200 bg-red-50"
                    }
                  >
                    {h.decision}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md bg-muted/40 p-3">
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="mt-1">{v}</div>
    </div>
  );
}
