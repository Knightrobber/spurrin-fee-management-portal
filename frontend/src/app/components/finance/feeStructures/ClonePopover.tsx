import { useEffect, useState } from "react";
import { Copy, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { getLineage, listFeeStructures, type FeeStructureLineage, type FeeStructureSearchItem } from "../../../lib/api/feeCatalogApi";

/** A small hovering search popover — pick an existing fee structure to clone its fields from. */
export function ClonePopover({ onClone }: { onClone: (source: FeeStructureLineage) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<FeeStructureSearchItem[]>([]);
  const [cloning, setCloning] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const handle = setTimeout(() => {
      listFeeStructures({ searchTerm: q })
        .then((rows) => {
          if (!cancelled) setItems(rows);
        })
        .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load fee structures"));
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [open, q]);

  const selectItem = async (item: FeeStructureSearchItem) => {
    setCloning(item.lineageId);
    try {
      const lineage = await getLineage(item.lineageId);
      if (lineage) onClone(lineage);
      setOpen(false);
      setQ("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load fee structure to clone");
    } finally {
      setCloning(null);
    }
  };

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
              disabled={cloning !== null}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/60 transition-colors disabled:opacity-50"
              onClick={() => selectItem(item)}
            >
              <div className="text-sm">{cloning === item.lineageId ? "Loading…" : item.name}</div>
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
