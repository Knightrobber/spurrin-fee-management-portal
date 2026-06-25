export type Role = "student" | "admin" | "finance" | "approver";

export const ROLE_LABELS: Record<Role, string> = {
  student: "Student",
  admin: "Admin",
  finance: "Finance",
  approver: "Finance Approver",
};

export const currentStudent = {
  name: "Aisha Khan",
  rollNo: "MBBS-2022-041",
  course: "MBBS",
  batch: "2022–2026",
  email: "aisha.khan@medcollege.edu",
};

export const currentDues = {
  termName: "Term 1 — Year 3",
  amount: 23500,
  dueDate: "18 Aug 2025",
  status: "Upcoming" as "Upcoming" | "Overdue" | "Paid",
  windowOpens: "19 Jul 2025",
  breakup: [
    { label: "Tuition", amount: 10000 },
    { label: "Examination fee", amount: 2000 },
    { label: "Clinical training fee", amount: 1000 },
    { label: "Hostel", amount: 10000 },
    { label: "Food", amount: 10000 },
    { label: "Merit Scholarship", amount: -10000 },
    { label: "Library fine", amount: 500 },
  ],
};

export const upcomingTerms = [
  { term: "Term 2 — Year 3", start: "20 Jan 2026", deadline: "05 Feb 2026", amount: 23000 },
  { term: "Term 1 — Year 4", start: "01 Aug 2026", deadline: "18 Aug 2026", amount: 23500 },
  { term: "Term 2 — Year 4", start: "20 Jan 2027", deadline: "05 Feb 2027", amount: 23000 },
];

export const paymentHistory = [
  { id: "RC-2024-08-041", date: "15 Aug 2024", term: "Term 1 — Year 2", amount: 23500, mode: "Bank transfer", status: "Paid" },
  { id: "RC-2024-02-041", date: "02 Feb 2024", term: "Term 2 — Year 1", amount: 23000, mode: "Bank transfer", status: "Paid" },
  { id: "RC-2023-08-041", date: "12 Aug 2023", term: "Term 1 — Year 1", amount: 35500, mode: "DD", status: "Paid", note: "Includes admission + deposit" },
];

export const students = [
  { id: "MBBS-2022-041", name: "Aisha Khan", course: "MBBS", batch: "2022–2026", dues: 23500, status: "Active", overdue: false },
  { id: "MBBS-2022-042", name: "Rohan Mehta", course: "MBBS", batch: "2022–2026", dues: 28000, status: "Active", overdue: true },
  { id: "MBBS-2023-018", name: "Sara Patel", course: "MBBS", batch: "2023–2027", dues: 22500, status: "Active", overdue: false },
  { id: "MDR-2024-009", name: "Vikram Singh", course: "MD-Radiology", batch: "2024–2027", dues: 45000, status: "Active", overdue: true },
  { id: "MBBS-2022-019", name: "Priya Nair", course: "MBBS", batch: "2022–2026", dues: 0, status: "Active", overdue: false },
  { id: "MBBS-2021-033", name: "Arjun Reddy", course: "MBBS", batch: "2021–2025", dues: 0, status: "Repeating", overdue: false },
  { id: "MBBS-2020-012", name: "Neha Iyer", course: "MBBS", batch: "2020–2024", dues: 0, status: "Graduated", overdue: false },
  { id: "MDR-2023-004", name: "Karan Joshi", course: "MD-Radiology", batch: "2023–2026", dues: 12000, status: "Dropped out", overdue: false },
];

export const feeStructures = [
  { id: "FS-MBBS-01", course: "MBBS", terms: 2, totalAnnual: 26000, fixedCosts: 50000, students: 142, updated: "12 May 2025" },
  { id: "FS-MDR-01", course: "MD-Radiology", terms: 2, totalAnnual: 45000, fixedCosts: 75000, students: 28, updated: "03 Apr 2025" },
  { id: "FS-MDS-01", course: "MD-Surgery", terms: 2, totalAnnual: 52000, fixedCosts: 80000, students: 19, updated: "21 Mar 2025" },
];

export const addOns = [
  { id: "AO-HOSTEL", name: "Hostel", amount: 10000, recurring: true, mode: "next term", approval: false, type: "positive" },
  { id: "AO-FOOD", name: "Food", amount: 10000, recurring: true, mode: "next term", approval: false, type: "positive" },
  { id: "AO-FINE-ATT", name: "Low attendance fine", amount: 500, recurring: false, mode: "current term", approval: false, type: "positive" },
  { id: "AO-FINE-LIB", name: "Library fine", amount: 200, recurring: false, mode: "current term", approval: false, type: "positive" },
  { id: "AO-SCHOL-MERIT", name: "Merit scholarship", amount: -10000, recurring: true, mode: "next term", approval: true, type: "negative" },
  { id: "AO-SCHOL-NEED", name: "Need-based scholarship", amount: -15000, recurring: true, mode: "next term", approval: true, type: "negative" },
];

export const approvals = [
  { id: "AR-2041", type: "Discount", student: "Rohan Mehta", studentId: "MBBS-2022-042", amount: -10000, raisedBy: "Finance · Meera D.", raisedAt: "2 days ago", note: "Merit scholarship for academic performance" },
  { id: "AR-2042", type: "Extension", student: "Vikram Singh", studentId: "MDR-2024-009", amount: 0, raisedBy: "Admin · Suresh R.", raisedAt: "5 hours ago", note: "Family emergency — requested 21 day extension (threshold 14d)" },
  { id: "AR-2043", type: "Discount", student: "Sara Patel", studentId: "MBBS-2023-018", amount: -15000, raisedBy: "Finance · Meera D.", raisedAt: "Yesterday", note: "Need-based scholarship approved by committee" },
  { id: "AR-2044", type: "Extension", student: "Karan Joshi", studentId: "MDR-2023-004", amount: 0, raisedBy: "Admin · Suresh R.", raisedAt: "3 days ago", note: "Medical leave — 30 day extension requested" },
];

export const approvalHistory = [
  { id: "AR-2030", type: "Discount", student: "Priya Nair", decision: "Approved", amount: -10000, decidedBy: "Approver · Nikhil S.", date: "18 May 2025" },
  { id: "AR-2028", type: "Extension", student: "Arjun Reddy", decision: "Rejected", amount: 0, decidedBy: "Approver · Nikhil S.", date: "12 May 2025" },
  { id: "AR-2025", type: "Discount", student: "Sara Patel", decision: "Approved", amount: -5000, decidedBy: "Approver · Nikhil S.", date: "08 May 2025" },
];

export const collectionsByQuarter = [
  { q: "Q1 24", collected: 2_400_000, expected: 2_800_000 },
  { q: "Q2 24", collected: 2_900_000, expected: 3_100_000 },
  { q: "Q3 24", collected: 3_400_000, expected: 3_500_000 },
  { q: "Q4 24", collected: 3_100_000, expected: 3_300_000 },
  { q: "Q1 25", collected: 3_600_000, expected: 3_700_000 },
  { q: "Q2 25", collected: 3_800_000, expected: 3_900_000 },
];

export const agingBuckets = [
  { bucket: "0–30 days", value: 14, amount: 320000 },
  { bucket: "30–60 days", value: 6, amount: 180000 },
  { bucket: "60+ days", value: 3, amount: 95000 },
];

export function inr(n: number) {
  const neg = n < 0;
  const v = Math.abs(n).toLocaleString("en-IN");
  return `${neg ? "−" : ""}₹${v}`;
}

/** Trigger a client-side file download from a string payload. */
export function downloadFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Serialize an array of rows to CSV and download it. */
export function downloadCSV(filename: string, rows: Record<string, string | number>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  downloadFile(filename, csv, "text/csv");
}

/** Build a plain-text receipt for a recorded payment. */
export function buildReceiptText(p: { id: string; date: string; term: string; amount: number; mode: string }) {
  return [
    "MEDCOLLEGE TRUST — FEE RECEIPT",
    "================================",
    `Receipt no : ${p.id}`,
    `Student    : ${currentStudent.name} (${currentStudent.rollNo})`,
    `Course     : ${currentStudent.course} · Batch ${currentStudent.batch}`,
    `Term       : ${p.term}`,
    `Date       : ${p.date}`,
    `Mode       : ${p.mode}`,
    `Amount     : ${inr(p.amount)}`,
    "--------------------------------",
    "Status     : PAID",
    "This is a system-generated receipt.",
  ].join("\n");
}
