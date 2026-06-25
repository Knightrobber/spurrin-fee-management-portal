import { motion } from "motion/react";
import { CalendarClock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ExtendDeadlineDialog } from "../shared/ExtendDeadlineDialog";
import { students, agingBuckets, inr } from "../../lib/mock";

export function OutstandingDues() {
  const overdue = students.filter((s) => s.dues > 0);
  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h1>Outstanding dues</h1>
        <p className="text-sm text-muted-foreground mt-1">Worklist of overdue and upcoming dues.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {agingBuckets.map((b, i) => (
          <motion.div key={b.bucket} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-5">
                <div className="text-xs text-muted-foreground">{b.bucket}</div>
                <div className="text-2xl mt-2">{b.value} students</div>
                <div className={`text-sm mt-1 ${b.bucket === "60+ days" ? "text-red-600" : "text-muted-foreground"}`}>
                  {inr(b.amount)} outstanding
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students with dues</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll no</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Term</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Aging</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overdue.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-sm font-mono">{s.id}</TableCell>
                  <TableCell className="text-sm">{s.name}</TableCell>
                  <TableCell className="text-sm">{s.course}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">Term 1 — Year 3</TableCell>
                  <TableCell className="text-right text-sm">{inr(s.dues)}</TableCell>
                  <TableCell>
                    {s.overdue ? (
                      <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50 gap-1">
                        <AlertTriangle className="w-3 h-3" /> Overdue 12d
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                        Due in 6d
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <ExtendDeadlineDialog
                      studentName={s.name}
                      trigger={
                        <Button variant="ghost" size="sm" className="gap-1">
                          <CalendarClock className="w-3 h-3" /> Extend
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
