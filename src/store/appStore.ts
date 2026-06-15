import { create } from "zustand";
import type { TodoItem, User } from "@/types";
import { CURRENT_USER } from "@/data/users";
import { PRESCRIPTION_WARNINGS, getPendingWarnings } from "@/data/prescriptions";
import { APPROVAL_REQUESTS, getPendingApprovals } from "@/data/approvals";
import { RECTIFICATION_TASKS } from "@/data/analytics";

interface UserState {
  currentUser: User;
  todos: TodoItem[];
  refreshTodos: () => void;
}

export const useUserStore = create<UserState>((set) => {
  const makeTodos = (): TodoItem[] => {
    const items: TodoItem[] = [];
    getPendingApprovals().slice(0, 5).forEach((a) => {
      items.push({
        id: `todo-app-${a.id}`,
        type: "APPROVAL",
        title: `${a.patientName} · ${a.drugName} 特殊用药申请`,
        subtitle: `${a.applicantName} · ${a.departmentName}`,
        priority: a.isUrgent ? "URGENT" : "HIGH",
        createdAt: a.createdAt,
        deadline: a.deadline,
        link: "/approval",
      });
    });
    getPendingWarnings().slice(0, 6).forEach((w) => {
      items.push({
        id: `todo-warn-${w.id}`,
        type: "WARNING",
        title: `${w.patientName} · 处方${w.warningType}`,
        subtitle: `${w.doctorName} · ${w.departmentName}`,
        priority: w.severity === "CRITICAL" ? "URGENT" : w.severity === "HIGH" ? "HIGH" : w.severity === "MEDIUM" ? "MEDIUM" : "LOW",
        createdAt: w.createdAt,
        link: "/monitoring",
      });
    });
    RECTIFICATION_TASKS.filter((t) => t.status === "REVIEWING").slice(0, 4).forEach((t) => {
      items.push({
        id: `todo-rect-${t.id}`,
        type: "RECTIFICATION",
        title: `整改反馈待审核 · ${t.departmentName}`,
        subtitle: `${t.assigneeName}`,
        priority: t.priority,
        createdAt: t.feedbackAt || t.createdAt,
        deadline: t.deadline,
        link: "/rectification",
      });
    });
    return items;
  };

  return {
    currentUser: CURRENT_USER,
    todos: makeTodos(),
    refreshTodos: () => set({ todos: makeTodos() }),
  };
});

interface DashboardState {
  stats: {
    totalWarnings: number;
    pendingWarnings: number;
    pendingApprovals: number;
    criticalCount: number;
    totalDDDs: number;
    rectificationRate: number;
  };
  riskDepartments: { name: string; score: number; warnings: number }[];
}

export const useDashboardStore = create<DashboardState>(() => ({
  stats: {
    totalWarnings: PRESCRIPTION_WARNINGS.length,
    pendingWarnings: getPendingWarnings().length,
    pendingApprovals: getPendingApprovals().length,
    criticalCount: PRESCRIPTION_WARNINGS.filter((w) => w.severity === "CRITICAL").length,
    totalDDDs: 96.4,
    rectificationRate: 0.872,
  },
  riskDepartments: [
    { name: "ICU", score: 92, warnings: 24 },
    { name: "呼吸科", score: 85, warnings: 18 },
    { name: "血液科", score: 78, warnings: 15 },
    { name: "肿瘤科", score: 71, warnings: 12 },
    { name: "急诊科", score: 66, warnings: 14 },
  ],
}));
