import { useState } from "react";
import {
  LayoutDashboard, Receipt, Users, UserPlus, AlertCircle, Layers,
  Tag, FileText, CreditCard, BarChart3, CheckSquare,
} from "lucide-react";
import { AppShell } from "./components/shell/AppShell";
import { Login } from "./components/auth/Login";
import { Toaster } from "./components/ui/sonner";
import { Role } from "./lib/mock";

import { StudentDashboard } from "./components/student/StudentDashboard";
import { StudentPayments } from "./components/student/StudentPayments";
import { AdminStudents } from "./components/admin/AdminStudents";
import { StudentDetail } from "./components/admin/StudentDetail";
import { EnrollStudent } from "./components/admin/EnrollStudent";
import { OutstandingDues } from "./components/admin/OutstandingDues";
import { FeeStructures } from "./components/finance/FeeStructures";
import { AddOnsPage } from "./components/finance/AddOnsPage";
import { RequestsPage } from "./components/finance/RequestsPage";
import { RecordPayment } from "./components/finance/RecordPayment";
import { Reports } from "./components/finance/Reports";
import { Approvals } from "./components/approver/Approvals";

const NAV: Record<Role, { id: string; label: string; icon: any }[]> = {
  student: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "payments", label: "Payments & receipts", icon: Receipt },
  ],
  admin: [
    { id: "students", label: "Students", icon: Users },
    { id: "enroll", label: "Enroll", icon: UserPlus },
    { id: "outstanding", label: "Outstanding dues", icon: AlertCircle },
  ],
  finance: [
    { id: "structures", label: "Fee structures", icon: Layers },
    { id: "addons", label: "Add-ons", icon: Tag },
    { id: "requests", label: "Requests", icon: FileText },
    { id: "record", label: "Record payment", icon: CreditCard },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ],
  approver: [
    { id: "approvals", label: "Approvals", icon: CheckSquare },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ],
};

const DEFAULT_PAGE: Record<Role, string> = {
  student: "dashboard",
  admin: "students",
  finance: "structures",
  approver: "approvals",
};

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<Role>("student");
  const [page, setPage] = useState<string>(DEFAULT_PAGE.student);
  const [openStudentId, setOpenStudentId] = useState<string | null>(null);

  const onLogin = (r: Role) => {
    setRole(r);
    setPage(DEFAULT_PAGE[r]);
    setOpenStudentId(null);
    setAuthed(true);
  };

  const onLogout = () => {
    setAuthed(false);
    setOpenStudentId(null);
  };

  const onRoleChange = (r: Role) => {
    setRole(r);
    setPage(DEFAULT_PAGE[r]);
    setOpenStudentId(null);
  };

  const onNav = (id: string) => {
    setPage(id);
    setOpenStudentId(null);
  };

  const renderPage = () => {
    if (role === "student") {
      if (page === "dashboard") return <StudentDashboard onPay={() => setPage("payments")} />;
      return <StudentPayments />;
    }
    if (role === "admin") {
      if (openStudentId) return <StudentDetail studentId={openStudentId} onBack={() => setOpenStudentId(null)} />;
      if (page === "students") return <AdminStudents onOpen={setOpenStudentId} onEnroll={() => setPage("enroll")} />;
      if (page === "enroll") return <EnrollStudent onBack={() => setPage("students")} />;
      return <OutstandingDues />;
    }
    if (role === "finance") {
      if (page === "structures") return <FeeStructures />;
      if (page === "addons") return <AddOnsPage />;
      if (page === "requests") return <RequestsPage />;
      if (page === "record") return <RecordPayment />;
      return <Reports />;
    }
    if (page === "approvals") return <Approvals />;
    return <Reports />;
  };

  if (!authed) {
    return (
      <>
        <Login onLogin={onLogin} />
        <Toaster position="bottom-right" />
      </>
    );
  }

  return (
    <>
      <AppShell
        role={role}
        onRoleChange={onRoleChange}
        onLogout={onLogout}
        nav={NAV[role]}
        active={page}
        onNav={onNav}
      >
        {renderPage()}
      </AppShell>
      <Toaster position="bottom-right" />
    </>
  );
}
