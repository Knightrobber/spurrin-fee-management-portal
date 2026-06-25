import { motion, AnimatePresence } from "motion/react";
import { GraduationCap, Bell, ChevronDown, LogOut } from "lucide-react";
import { Role, ROLE_LABELS, currentStudent } from "../../lib/mock";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";

type Props = {
  role: Role;
  onRoleChange: (r: Role) => void;
  onLogout: () => void;
  nav: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  active: string;
  onNav: (id: string) => void;
  children: React.ReactNode;
};

const ROLE_PERSONS: Record<Role, { name: string; sub: string }> = {
  student: { name: currentStudent.name, sub: currentStudent.rollNo },
  admin: { name: "Suresh Rao", sub: "Admin · Operations" },
  finance: { name: "Meera Desai", sub: "Finance Officer" },
  approver: { name: "Nikhil Sharma", sub: "Finance Approver" },
};

export function AppShell({ role, onRoleChange, onLogout, nav, active, onNav, children }: Props) {
  const person = ROLE_PERSONS[role];
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col sticky top-0 h-screen">
        <div className="h-16 flex items-center gap-2 px-5 border-b">
          <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-foreground leading-tight">Cohort</div>
            <div className="text-xs text-muted-foreground leading-tight">Fee Portal</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => {
            const isActive = item.id === active;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 bg-secondary rounded-md"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <div className="text-xs text-muted-foreground px-2 pb-2">Demo · switch role</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                    {person.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left flex-1 min-w-0">
                  <div className="text-sm truncate">{person.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{person.sub}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Switch persona</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <DropdownMenuItem key={r} onClick={() => onRoleChange(r)}>
                  <div className="flex items-center justify-between w-full">
                    <span>{ROLE_LABELS[r]}</span>
                    {r === role && <Badge variant="secondary" className="ml-2">current</Badge>}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-700">
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b bg-card/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
          <div>
            <div className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</div>
            <div className="text-foreground">{nav.find((n) => n.id === active)?.label}</div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${role}-${active}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
