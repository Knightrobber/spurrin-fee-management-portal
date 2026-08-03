import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Layers, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import {
  searchFeeStructuresPage,
  type FeeStructureFacets,
  type FeeStructureSearchItem,
} from "../../lib/api/feeCatalogApi";
import { VersionStatusBadge } from "./feeStructures/shared";

/** "2026-2027" -> ["2026", "2027"] */
function splitBatchYears(batchYears: string): [string, string] {
  const [start, end] = batchYears.split("-");
  return [start ?? "—", end ?? "—"];
}

const EMPTY_FACETS: FeeStructureFacets = { courses: [], categories: [], batches: [] };

export function FeeStructures({
  onOpen,
  onCreate,
}: {
  onOpen: (lineageId: string) => void;
  onCreate: () => void;
}) {
  const [items, setItems] = useState<FeeStructureSearchItem[]>([]);
  const [facets, setFacets] = useState<FeeStructureFacets>(EMPTY_FACETS);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(() => {
      searchFeeStructuresPage({
        searchTerm: q,
        courseId: courseFilter === "all" ? undefined : courseFilter,
        categoryId: categoryFilter === "all" ? undefined : categoryFilter,
        batchId: batchFilter === "all" ? undefined : batchFilter,
      })
        .then((result) => {
          if (cancelled) return;
          setItems(result.items);
          setFacets(result.facets);
        })
        .catch((err) => {
          if (!cancelled) toast.error(err instanceof Error ? err.message : "Could not load fee structures");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [q, courseFilter, categoryFilter, batchFilter]);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Fee structures</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set up every term for a course, category and batch up front. Click a row to view or edit it.
          </p>
        </div>
        <Button className="gap-2" onClick={onCreate}>
          <Plus className="w-4 h-4" /> New fee structure
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
                placeholder="Search by fee structure name…"
                className="pl-9"
              />
            </div>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {facets.courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {facets.categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All batches</SelectItem>
                {facets.batches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
              Loading fee structures…
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
              No fee structures match your search.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Start year</TableHead>
                  <TableHead>End year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => {
                  const [startYear, endYear] = splitBatchYears(item.batchYears);
                  return (
                    <motion.tr
                      key={item.lineageId}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() => onOpen(item.lineageId)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-md bg-secondary text-primary flex items-center justify-center shrink-0">
                            <Layers className="w-4 h-4" />
                          </div>
                          <span className="text-sm">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{item.courseName}</TableCell>
                      <TableCell className="text-sm">{item.categoryName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.batchName}</TableCell>
                      <TableCell className="text-sm">{startYear}</TableCell>
                      <TableCell className="text-sm">{endYear}</TableCell>
                      <TableCell>
                        <VersionStatusBadge status="ACTIVE" />
                      </TableCell>
                      <TableCell>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
