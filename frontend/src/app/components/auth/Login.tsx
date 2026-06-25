import { useState } from "react";
import { motion } from "motion/react";
import { GraduationCap, ArrowRight, ShieldCheck } from "lucide-react";
import { Role, ROLE_LABELS } from "../../lib/mock";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";

/** Demo credentials — one login serves all roles; the role decides the landing page. */
const DEMO_ACCOUNTS: Record<Role, { email: string; sub: string }> = {
  student: { email: "aisha.khan@medcollege.edu", sub: "Aisha Khan" },
  admin: { email: "suresh.rao@medcollege.edu", sub: "Suresh Rao" },
  finance: { email: "meera.desai@medcollege.edu", sub: "Meera Desai" },
  approver: { email: "nikhil.sharma@medcollege.edu", sub: "Nikhil Sharma" },
};

export function Login({ onLogin }: { onLogin: (r: Role) => void }) {
  const [selected, setSelected] = useState<Role>("student");
  const account = DEMO_ACCOUNTS[selected];

  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-orange-400 text-primary-foreground flex-col justify-between p-12 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="leading-tight text-lg">Cohort</div>
            <div className="text-xs opacity-80 leading-tight">Fee Portal</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md"
        >
          <h1 className="text-primary-foreground text-3xl leading-tight">
            Fee collection & monitoring for medical colleges.
          </h1>
          <p className="opacity-90 mt-4">
            Maker-checker control on everything that changes what a student owes — from
            enrollment to discounts, deadlines and reports.
          </p>
        </motion.div>

        <div className="text-xs opacity-70 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Role-based access · enforced server-side
        </div>
        <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute right-24 -top-10 w-40 h-40 rounded-full bg-white/10" />
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="leading-tight">Cohort <span className="text-muted-foreground text-sm">· Fee Portal</span></div>
          </div>

          <h2>Sign in</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back. Your role determines what you see.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              onLogin(selected);
            }}
          >
            <div>
              <Label className="text-sm">Email</Label>
              <Input value={account.email} readOnly className="mt-2" />
            </div>
            <div>
              <Label className="text-sm">Password</Label>
              <Input type="password" defaultValue="demo-password" className="mt-2" />
            </div>

            <Button type="submit" className="w-full gap-2">
              Sign in as {ROLE_LABELS[selected]} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-8">
            <div className="text-xs text-muted-foreground mb-2">Demo · choose a persona to sign in as</div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(DEMO_ACCOUNTS) as Role[]).map((r) => (
                <Card
                  key={r}
                  onClick={() => setSelected(r)}
                  className={`cursor-pointer transition-colors ${
                    r === selected ? "border-primary bg-secondary/50" : "hover:border-primary/40"
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="text-sm">{ROLE_LABELS[r]}</div>
                    <div className="text-xs text-muted-foreground truncate">{DEMO_ACCOUNTS[r].sub}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
