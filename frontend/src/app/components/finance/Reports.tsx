import { motion } from "motion/react";
import { Download, TrendingUp, Clock, Gift, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend,
} from "recharts";
import { collectionsByQuarter, agingBuckets, inr, downloadCSV } from "../../lib/mock";
import { toast } from "sonner";

const PIE_COLORS = ["#ff6b35", "#fbbf24", "#ef4444"];

export function Reports() {
  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1>Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Adjust parameters and export to CSV.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="2025">
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">FY 2025</SelectItem>
              <SelectItem value="2024">FY 2024</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              <SelectItem value="mbbs">MBBS</SelectItem>
              <SelectItem value="mdr">MD-Radiology</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              downloadCSV(
                "collections-by-quarter.csv",
                collectionsByQuarter.map((r) => ({
                  Quarter: r.q,
                  Collected: r.collected,
                  Expected: r.expected,
                  "Collection %": Math.round((r.collected / r.expected) * 100),
                }))
              );
              toast.success("Exported collections-by-quarter.csv");
            }}
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Kpi icon={Wallet} label="Collections (Q2)" value={inr(3_800_000)} delta="+5.6%" />
        <Kpi icon={TrendingUp} label="On-time payment rate" value="86%" delta="+3pt" />
        <Kpi icon={Clock} label="Avg days-to-pay" value="6.4 d" delta="−1.1d" />
        <Kpi icon={Gift} label="Concessions granted" value={inr(420_000)} delta="+12%" tone="negative" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Collections vs expected — by quarter</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={collectionsByQuarter}>
                <defs>
                  <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b35" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ff6b35" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="c2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="q" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `${v / 1_000_000}M`} />
                <Tooltip
                  formatter={(v: number) => inr(v)}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Area type="monotone" dataKey="expected" stroke="#94a3b8" fill="url(#c2)" name="Expected" />
                <Area type="monotone" dataKey="collected" stroke="#ff6b35" fill="url(#c1)" name="Collected" strokeWidth={2} />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Aging — overdue students</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={agingBuckets} dataKey="value" nameKey="bucket" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {agingBuckets.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Receivables in current term — by course</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={[
              { course: "MBBS", receivable: 1_400_000 },
              { course: "MD-Radiology", receivable: 480_000 },
              { course: "MD-Surgery", receivable: 320_000 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="course" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => inr(v)} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <Bar dataKey="receivable" fill="#ff6b35" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({
  icon: Icon, label, value, delta, tone = "positive",
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; delta: string; tone?: "positive" | "negative" }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-md bg-secondary text-primary flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
            <span className={`text-xs ${tone === "positive" ? "text-green-600" : "text-red-600"}`}>{delta}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-3">{label}</div>
          <div className="text-xl mt-1">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
