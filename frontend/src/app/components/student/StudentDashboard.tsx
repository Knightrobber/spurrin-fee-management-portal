import { motion } from "motion/react";
import { Calendar, AlertCircle, Download, ArrowRight, Wallet, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "../ui/dialog";
import { currentDues, upcomingTerms, currentStudent, inr, downloadCSV } from "../../lib/mock";
import { toast } from "sonner";

const stagger = {
  show: { transition: { staggerChildren: 0.06 } },
  hidden: {},
};
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export function StudentDashboard({ onPay }: { onPay: () => void }) {
  const total = currentDues.breakup.reduce((s, x) => s + x.amount, 0);
  const paidPct = 0;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-6xl">
      {/* Hero */}
      <motion.div variants={fadeUp}>
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-orange-400 text-primary-foreground">
          <CardContent className="p-8 flex items-center justify-between gap-6 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80">Welcome back</div>
              <h1 className="text-primary-foreground mt-1">{currentStudent.name}</h1>
              <div className="opacity-90 text-sm mt-1">
                {currentStudent.course} · Roll no {currentStudent.rollNo} · Batch {currentStudent.batch}
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-xl px-6 py-4 border border-white/20">
              <div className="text-xs opacity-80">Current dues</div>
              <div className="text-3xl mt-1">{inr(total)}</div>
              <div className="text-xs opacity-80 mt-1">Due {currentDues.dueDate}</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Fee breakup — {currentDues.termName}</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  Payment window opens {currentDues.windowOpens}
                </div>
              </div>
              <Badge variant="secondary" className="bg-secondary text-primary">
                {currentDues.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentDues.breakup.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          row.amount < 0 ? "bg-green-500" : "bg-primary/60"
                        }`}
                      />
                      <span className="text-sm">{row.label}</span>
                    </div>
                    <span className={`text-sm ${row.amount < 0 ? "text-green-600" : ""}`}>
                      {inr(row.amount)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <span>Total due</span>
                <span className="text-xl">{inr(total)}</span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Button onClick={onPay} className="gap-2">
                  <Wallet className="w-4 h-4" /> Pay now
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    downloadCSV(
                      "fee-breakup.csv",
                      currentDues.breakup.map((r) => ({ Item: r.label, Amount: r.amount }))
                    );
                    toast.success("Fee breakup downloaded");
                  }}
                >
                  <Download className="w-4 h-4" /> Download breakup
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" /> Term progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Year 3 of 4</span>
                  <span>50%</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
              <Separator />
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Course</span>
                  <span>{currentStudent.course}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Batch</span>
                  <span>{currentStudent.batch}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                    Active
                  </Badge>
                </div>
              </div>
              <div className="rounded-md bg-secondary/60 p-3 text-xs text-foreground/80 flex gap-2">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                Online payment integration coming soon. Pay via bank transfer using the reference shown after clicking Pay now.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Upcoming terms
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  View fee structure <ArrowRight className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Fee structure — {currentStudent.course}</DialogTitle>
                  <DialogDescription>
                    Term dates resolve to calendar years from your batch ({currentStudent.batch}).
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-2">
                  {upcomingTerms.map((t) => (
                    <div key={t.term} className="flex items-center justify-between p-3 rounded-md border">
                      <div>
                        <div className="text-sm">{t.term}</div>
                        <div className="text-xs text-muted-foreground">Starts {t.start} · Due {t.deadline}</div>
                      </div>
                      <div className="text-sm">{inr(t.amount)}</div>
                    </div>
                  ))}
                  <div className="rounded-md bg-secondary/60 p-3 text-xs text-foreground/80">
                    One-time fixed costs (admission, deposit) were billed at first enrollment.
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingTerms.map((t) => (
                <motion.div
                  key={t.term}
                  whileHover={{ x: 4 }}
                  onClick={() => toast.info(`${t.term} · due ${t.deadline} · ${inr(t.amount)}`)}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="text-sm">{t.term}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Starts {t.start} · Due {t.deadline}
                    </div>
                  </div>
                  <div className="text-sm">{inr(t.amount)}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
