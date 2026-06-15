import { create } from "zustand";
import type { TodoItem, User } from "@/types";
import { CURRENT_USER } from "@/data/users";
import { useDataStore } from "./dataStore";
import { RECTIFICATION_TASKS } from "@/data/analytics";

interface UserState {
  currentUser: User;
  todos: TodoItem[];
  refreshTodos: () => void;
}

export const useUserStore = create<UserState>((set) => {
  const makeTodos = (): TodoItem[] => {
    const items: TodoItem[] = [];
    const store = useDataStore.getState();

    store.getPendingApprovals().slice(0, 5).forEach((a) => {
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

    store.getPendingWarnings().slice(0, 6).forEach((w) => {
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

    store.getPendingTasks().slice(0, 4).forEach((t) => {
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
  refreshStats: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => {
  const computeStats = () => {
    const store = useDataStore.getState();
    const { warnings, tasks } = store;

    const doneCount = tasks.filter((t) => t.status === "DONE").length;
    const reviewedCount = tasks.filter((t) => t.status === "DONE" || t.status === "REJECTED").length;
    const rectificationRate = reviewedCount > 0 ? doneCount / reviewedCount : 0.872;

    return {
      stats: {
        totalWarnings: warnings.length,
        pendingWarnings: store.getPendingWarnings().length,
        pendingApprovals: store.getPendingApprovals().length,
        criticalCount: warnings.filter((w) => w.severity === "CRITICAL" && w.status === "PENDING").length,
        totalDDDs: 96.4,
        rectificationRate,
      },
      riskDepartments: [
        { name: "ICU", score: 92, warnings: 24 },
        { name: "呼吸科", score: 85, warnings: 18 },
        { name: "血液科", score: 78, warnings: 15 },
        { name: "肿瘤科", score: 71, warnings: 12 },
        { name: "急诊科", score: 66, warnings: 14 },
      ],
    };
  };

  const initial = computeStats();

  return {
    ...initial,
    refreshStats: () => set(computeStats()),
  };
});
