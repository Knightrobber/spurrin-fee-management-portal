import { GitBranch } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import type { FeeStructureVersion } from "../../../lib/feeCatalogStore";
import { VersionStatusBadge } from "./shared";

/** Version switcher for the detail page — every version, newest first, Active clearly labeled. */
export function VersionSelect({
  versions,
  value,
  onChange,
}: {
  versions: FeeStructureVersion[];
  value: string;
  onChange: (versionId: string) => void;
}) {
  const ordered = [...versions].sort((a, b) => b.version - a.version);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-52">
        <GitBranch className="w-4 h-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ordered.map((v) => (
          <SelectItem key={v.versionId} value={v.versionId}>
            <span>Version {v.version}</span>
            {v.status === "ACTIVE" && <VersionStatusBadge status="ACTIVE" className="ml-1" />}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
