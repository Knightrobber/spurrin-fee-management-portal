import { useReducer, useState } from "react";
import { motion } from "motion/react";
import {
  AlarmClock,
  ArrowLeft,
  CalendarRange,
  GraduationCap,
  IndianRupee,
  Layers,
  Pencil,
  Receipt,
  Tag,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { inr } from "../../../lib/mock";
import { toDDMMYYYY } from "../../../lib/dates";
import {
  computeAnnualTotal,
  computeOneTimeTotal,
  getActiveVersion,
  getLineage,
  listBatches,
  listCategories,
  listCourses,
  type FeeStructureVersion,
} from "../../../lib/feeCatalogStore";
import { DeleteVersionDialog, PublishVersionButton, VersionStatusBadge } from "./shared";
import { VersionSelect } from "./VersionSelect";

const TONE_STYLES = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
} as const;

export function FeeStructureDetail({
  lineageId,
  onBack,
  onEdit,
}: {
  lineageId: string;
  onBack: () => void;
  onEdit: () => void;
}) {
  const [, refresh] = useReducer((c) => c + 1, 0);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FeeStructureVersion | null>(null);

  const lineage = getLineage(lineageId);

  if (!lineage) {
    return (
      <div className="max-w-3xl space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to fee structures
        </Button>
        <p className="text-sm text-muted-foreground">This fee structure could not be found.</p>
      </div>
    );
  }

  const version = lineage.versions.find((v) => v.versionId === selectedVersionId) ?? getActiveVersion(lineage);
  const course = listCourses().find((c) => c.id === lineage.courseId);
  const category = listCategories().find((c) => c.id === lineage.categoryId);
  const batch = listBatches().find((b) => b.id === lineage.batchId);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to fee structures
      </Button>

      <Card>
        <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-secondary text-primary flex items-center justify-center shrink-0">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2>{course?.name ?? "Unknown course"}</h2>
                <VersionStatusBadge status={version.status} />
              </div>
              <div className="text-sm text-muted-foreground mt-1">{version.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <VersionSelect versions={lineage.versions} value={version.versionId} onChange={setSelectedVersionId} />
            {version.status !== "ACTIVE" && (
              <>
                <PublishVersionButton lineageId={lineage.lineageId} versionId={version.versionId} onPublished={refresh} />
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => setPendingDelete(version)}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </>
            )}
            <Button size="sm" className="gap-2" onClick={onEdit}>
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <OverviewCard
          icon={GraduationCap}
          label="Course"
          value={course?.name ?? "—"}
          detail={course ? `${course.durationYears}-year program` : undefined}
        />
        <OverviewCard icon={Tag} label="Category" value={category?.name ?? "—"} />
        <OverviewCard
          icon={CalendarRange}
          label="Batch"
          value={batch?.name ?? "—"}
          detail={batch ? `${toDDMMYYYY(batch.startDate)} – ${toDDMMYYYY(batch.endDate)}` : undefined}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile icon={Layers} tone="blue" label="Terms" value={String(version.terms.length)} />
        <StatTile icon={IndianRupee} tone="green" label="Annual total" value={inr(computeAnnualTotal(version))} />
        <StatTile icon={Receipt} tone="amber" label="One-time costs" value={inr(computeOneTimeTotal(version))} />
        <StatTile icon={AlarmClock} tone="rose" label="Late fee / day" value={inr(version.lateFeePerDay)} />
      </div>

      <Card>
        <CardContent className="p-2">
          <Accordion type="multiple" defaultValue={["terms", "onetime"]}>
            <AccordionItem value="terms" className="px-4">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-2">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" /> Terms
                  </span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {version.terms.length} terms · {inr(computeAnnualTotal(version))}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {version.terms.map((t, i) => (
                    <div key={t.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Term {i + 1}</span>
                        <span className="text-muted-foreground">
                          {toDDMMYYYY(t.startDate)} – {toDDMMYYYY(t.endDate)}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                        <span>Due {toDDMMYYYY(t.dueDate)}</span>
                        <span>Window opens {toDDMMYYYY(t.paymentWindowOpenDate)}</span>
                      </div>
                      <div className="mt-3 space-y-1.5">
                        {t.components.map((c) => (
                          <div key={c.id} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{c.name}</span>
                            <span>{inr(c.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t flex items-center justify-between text-sm">
                        <span>Term subtotal</span>
                        <span>{inr(t.components.reduce((s, c) => s + c.amount, 0))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="onetime" className="px-4">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-2">
                  <span className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-primary" /> One-time costs
                  </span>
                  <span className="text-xs text-muted-foreground font-normal">{inr(computeOneTimeTotal(version))}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {version.oneTimeCosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No one-time costs on this version.</p>
                ) : (
                  <div className="space-y-1.5">
                    {version.oneTimeCosts.map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{c.name}</span>
                        <span>{inr(c.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <DeleteVersionDialog
        lineageId={lineage.lineageId}
        version={pendingDelete}
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        onDeleted={() => {
          setPendingDelete(null);
          setSelectedVersionId(null);
          refresh();
        }}
      />
    </motion.div>
  );
}

function OverviewCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary text-primary flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-0.5 truncate">{value}</div>
          {detail && <div className="text-xs text-muted-foreground mt-0.5">{detail}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function StatTile({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof TONE_STYLES;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${TONE_STYLES[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-0.5 truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
