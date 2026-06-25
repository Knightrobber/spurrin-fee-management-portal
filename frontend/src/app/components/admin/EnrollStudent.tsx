import { motion } from "motion/react";
import { useState } from "react";
import { ArrowLeft, Check, UserPlus, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { feeStructures, addOns, inr } from "../../lib/mock";
import { toast } from "sonner";

export function EnrollStudent({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0);
  const steps = ["Student details", "Fee structure", "Add-ons", "Review"];

  return (
    <div className="max-w-4xl">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new" className="gap-2"><UserPlus className="w-4 h-4" /> New student</TabsTrigger>
          <TabsTrigger value="re" className="gap-2"><RotateCcw className="w-4 h-4" /> Re-enroll</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-6 space-y-6">
          {/* Stepper */}
          <div className="flex items-center gap-2">
            {steps.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <motion.div
                  animate={{
                    backgroundColor: i <= step ? "var(--primary)" : "var(--muted)",
                    color: i <= step ? "#fff" : "var(--muted-foreground)",
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </motion.div>
                <div className="text-sm flex-1">{label}</div>
                {i < steps.length - 1 && <div className="h-px bg-border flex-1" />}
              </div>
            ))}
          </div>

          <Card>
            <CardContent className="p-6">
              {step === 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Full name" placeholder="e.g. Priya Nair" />
                  <Field label="Email" placeholder="student@medcollege.edu" />
                  <Field label="Roll number" placeholder="MBBS-2025-001" />
                  <div>
                    <Label className="text-sm">Batch</Label>
                    <Select>
                      <SelectTrigger className="mt-2"><SelectValue placeholder="Select batch" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25-29">2025–2029</SelectItem>
                        <SelectItem value="24-28">2024–2028</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Field label="Phone" placeholder="+91 …" />
                  <Field label="Guardian email" placeholder="parent@example.com" />
                </div>
              )}
              {step === 1 && (
                <div className="space-y-3">
                  {feeStructures.map((f) => (
                    <label
                      key={f.id}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-primary/40 transition-colors has-[:checked]:border-primary has-[:checked]:bg-secondary/40"
                    >
                      <div className="flex items-center gap-3">
                        <input type="radio" name="fs" defaultChecked={f.id === "FS-MBBS-01"} className="accent-primary" />
                        <div>
                          <div className="text-sm">{f.course}</div>
                          <div className="text-xs text-muted-foreground">
                            {f.terms} terms · Annual {inr(f.totalAnnual)} · Fixed costs {inr(f.fixedCosts)}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{f.students} enrolled</span>
                    </label>
                  ))}
                </div>
              )}
              {step === 2 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">Attach positive add-ons. Discounts and scholarships go through Finance.</p>
                  {addOns.filter((a) => a.type === "positive").map((a) => (
                    <label
                      key={a.id}
                      className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox defaultChecked={a.id === "AO-HOSTEL" || a.id === "AO-FOOD"} />
                        <div>
                          <div className="text-sm">{a.name}</div>
                          <div className="text-xs text-muted-foreground">{a.recurring ? "Recurring" : "One-time"}</div>
                        </div>
                      </div>
                      <span className="text-sm">{inr(a.amount)}</span>
                    </label>
                  ))}
                </div>
              )}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                    <Row k="Course" v="MBBS" />
                    <Row k="Batch" v="2025–2029" />
                    <Row k="Fee structure" v="FS-MBBS-01" />
                    <Row k="Add-ons" v="Hostel, Food" />
                    <Row k="One-time fixed costs" v={inr(50000)} />
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-3 text-xs text-foreground/80">
                    On enrollment, the system emails login credentials and generates the first term's dues.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
              Previous
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>Continue</Button>
            ) : (
              <Button
                onClick={() => {
                  toast.success("Student enrolled — credentials emailed");
                  onBack();
                }}
              >
                Enroll student
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="re" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Re-enroll a student into a failed term</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm">Student</Label>
                <Select>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Search student…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a">Arjun Reddy · MBBS-2021-033</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Failed term</Label>
                <Select>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Pick term to repeat" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t1y4">Term 1 — Year 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-md bg-secondary/60 p-3 text-xs">
                Re-enrollment regenerates the failed term's components plus existing add-ons. One-time fixed costs are auto-excluded.
              </div>
              <Button onClick={() => toast.success("Re-enrollment recorded")}>Re-enroll</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <Input placeholder={placeholder} className="mt-2" />
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span>{v}</span>
    </div>
  );
}
