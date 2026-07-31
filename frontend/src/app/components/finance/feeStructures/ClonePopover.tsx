import { useState } from "react";
import { Copy, Search } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { getLineage, listFeeStructures, type FeeStructureLineage } from "../../../lib/feeCatalogStore";

/** A small hovering search popover — pick an existing fee structure to clone its fields from. */
export function ClonePopover({ onClone }: { onClone: (source: FeeStructureLineage) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const ql = q.trim().toLowerCase();
  const items = listFeeStructures().filter((item) => {
    if (!ql) return true;
    return `${item.active.name} ${item.courseName} ${item.categoryName} ${item.batchName}`.toLowerCase().includes(ql);
  });

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQ("");
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Copy className="w-3.5 h-3.5" /> Clone existing
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search fee structures…"
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {items.length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">No matches.</div>}
          {items.map((item) => (
            <button
              key={item.lineageId}
              type="button"
              className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/60 transition-colors"
              onClick={() => {
                const lineage = getLineage(item.lineageId);
                if (lineage) onClone(lineage);
                setOpen(false);
                setQ("");
              }}
            >
              <div className="text-sm">{item.active.name}</div>
              <div className="text-xs text-muted-foreground">
                {item.courseName} · {item.categoryName} · {item.batchName}
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
