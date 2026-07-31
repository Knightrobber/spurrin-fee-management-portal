/**
 * Date helpers. The portal shows every date as DD/MM/YYYY; internally we keep
 * ISO (YYYY-MM-DD) so values sort lexicographically and match the `@db.Date`
 * columns in the FeeCatalog schema.
 */

const DDMMYYYY = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/** ISO (YYYY-MM-DD) → DD/MM/YYYY. Returns "" for empty/malformed input. */
export function toDDMMYYYY(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

/** DD/MM/YYYY → ISO (YYYY-MM-DD). Returns null when the date is not real. */
export function fromDDMMYYYY(value: string): string | null {
  const m = DDMMYYYY.exec((value ?? "").trim());
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  if (month < 1 || month > 12 || day < 1) return null;
  // Rejects 31/02 and friends by checking against the real month length.
  if (day > daysInMonth(year, month)) return null;
  return `${yyyy}-${mm}-${dd}`;
}

export function isValidDDMMYYYY(value: string): boolean {
  return fromDDMMYYYY(value) !== null;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Progressive input mask: lets someone type "01082025" or "1/8/2025" and get
 * "01/08/2025", without fighting them mid-keystroke (backspace still works).
 */
export function maskDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Version-history timestamp, e.g. "12/05/2025 · 14:32". */
export function stamp(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  return `${date} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Shift an ISO date by a number of days, returning ISO. */
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "18 Aug 2025" — used where a date sits inside running prose. */
export function toLongDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}
