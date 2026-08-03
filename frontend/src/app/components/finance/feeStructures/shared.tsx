import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { deleteVersion, publishVersion, type FeeStructureVersion, type VersionStatus } from "../../../lib/api/feeCatalogApi";

const STATUS_STYLES: Record<VersionStatus, string> = {
  ACTIVE: "text-green-700 border-green-200 bg-green-50",
  DRAFT: "text-amber-700 border-amber-200 bg-amber-50",
  SUPERSEDED: "text-slate-600 border-slate-200 bg-slate-50",
};

const STATUS_LABELS: Record<VersionStatus, string> = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  SUPERSEDED: "Superseded",
};

export function VersionStatusBadge({ status, className }: { status: VersionStatus; className?: string }) {
  return (
    <Badge variant="outline" className={`${STATUS_STYLES[status]} ${className ?? ""}`}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

type ActionButtonProps = {
  size?: "sm" | "default" | "icon";
  variant?: "outline" | "ghost" | "default";
  className?: string;
  label?: string;
};

export function PublishVersionButton({
  lineageId,
  versionId,
  onPublished,
  size = "sm",
  variant = "outline",
  label = "Publish",
  className,
}: { lineageId: string; versionId: string; onPublished: () => void } & ActionButtonProps) {
  const [publishing, setPublishing] = useState(false);

  return (
    <Button
      size={size}
      variant={variant}
      className={`gap-1.5 ${className ?? ""}`}
      disabled={publishing}
      onClick={async () => {
        setPublishing(true);
        try {
          await publishVersion(lineageId, versionId);
          toast.success("Version published — now active");
          onPublished();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not publish version");
        } finally {
          setPublishing(false);
        }
      }}
    >
      <UploadCloud className="w-3.5 h-3.5" /> {label}
    </Button>
  );
}

/**
 * Deliberately rendered as a sibling of any DropdownMenu/Select it's used
 * near, not nested inside one — a DropdownMenuContent that closes unmounts
 * everything inside it, which would kill this confirmation before the user
 * can act on it. Callers own the `open`/version state and render this once,
 * top-level, alongside the trigger that sets that state.
 */
export function DeleteVersionDialog({
  lineageId,
  version,
  open,
  onOpenChange,
  onDeleted,
}: {
  lineageId: string;
  version: FeeStructureVersion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete version {version?.version}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes this {version?.status === "DRAFT" ? "draft" : "superseded"} version. The active
            version is unaffected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={async () => {
              if (!version) return;
              try {
                await deleteVersion(lineageId, version.versionId);
                toast.success("Version deleted");
                onDeleted();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not delete version");
              }
            }}
          >
            Delete version
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
