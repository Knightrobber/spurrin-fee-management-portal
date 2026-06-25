import { useState } from "react";
import { motion } from "motion/react";
import { Search, Filter, Plus, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { students, inr } from "../../lib/mock";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  Active: "text-green-700 border-green-200 bg-green-50",
  Repeating: "text-amber-700 border-amber-200 bg-amber-50",
  "Dropped out": "text-red-700 border-red-200 bg-red-50",
  Graduated: "text-slate-700 border-slate-200 bg-slate-50",
};

export function AdminStudents({ onOpen, onEnroll }: { onOpen: (id: string) => void; onEnroll: () => void }) {
  const [q, setQ] = useState("");
  const [course, setCourse] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = students.filter((s) => {
    const ql = q.toLowerCase();
    return (
      (course === "all" || s.course === course) &&
      (status === "all" || s.status === status) &&
      (s.name.toLowerCase().includes(ql) || s.id.toLowerCase().includes(ql))
    );
  });

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Students</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {students.length} total · {students.filter((s) => s.overdue).length} with overdue dues
          </p>
        </div>
        <Button onClick={onEnroll} className="gap-2">
          <Plus className="w-4 h-4" /> Enroll student
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or roll no…"
                className="pl-9"
              />
            </div>
            <Select value={course} onValueChange={setCourse}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                <SelectItem value="MBBS">MBBS</SelectItem>
                <SelectItem value="MD-Radiology">MD-Radiology</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Repeating">Repeating</SelectItem>
                <SelectItem value="Dropped out">Dropped out</SelectItem>
                <SelectItem value="Graduated">Graduated</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => toast.info("Filter by dues, aging and fee structure — coming soon")}
            >
              <Filter className="w-4 h-4" /> More filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll no</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => onOpen(s.id)}
                >
                  <TableCell className="text-sm font-mono">{s.id}</TableCell>
                  <TableCell className="text-sm">{s.name}</TableCell>
                  <TableCell className="text-sm">{s.course}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.batch}</TableCell>
                  <TableCell className="text-right text-sm">
                    {s.dues > 0 ? (
                      <span className={s.overdue ? "text-red-600" : ""}>{inr(s.dues)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_STYLES[s.status]}>
                      {s.status}
                    </Badge>
                    {s.overdue && (
                      <Badge variant="outline" className="ml-1 text-red-700 border-red-200 bg-red-50">
                        Overdue
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
