import { create } from "zustand";
import type {
  Drug,
  DrugCategory,
  ApprovalRequest,
  ApprovalStatus,
  RectificationTask,
  RectificationStatus,
  PermissionConfig,
  PrescriptionWarning,
  Severity,
  WarningType,
  DoctorTitle,
  Priority,
} from "@/types";
import { DRUGS as INITIAL_DRUGS } from "@/data/drugs";
import { APPROVAL_REQUESTS as INITIAL_APPROVALS } from "@/data/approvals";
import { RECTIFICATION_TASKS as INITIAL_TASKS, INTERVENTION_TEMPLATES } from "@/data/analytics";
import { PRESCRIPTION_WARNINGS as INITIAL_WARNINGS } from "@/data/prescriptions";
import { PERMISSION_MATRIX as INITIAL_PERMISSIONS, CURRENT_USER, DEPARTMENTS, ALL_DOCTORS } from "@/data/users";
import dayjs from "dayjs";

const now = () => dayjs().format("YYYY-MM-DD HH:mm");

interface DataState {
  drugs: Drug[];
  initialDrugs: Drug[];
  approvals: ApprovalRequest[];
  initialApprovals: ApprovalRequest[];
  tasks: RectificationTask[];
  initialTasks: RectificationTask[];
  permissions: PermissionConfig[];
  initialPermissions: PermissionConfig[];
  warnings: PrescriptionWarning[];
  initialWarnings: PrescriptionWarning[];

  addDrug: (drug: Omit<Drug, "id" | "updatedAt">) => void;
  updateDrug: (id: string, changes: Partial<Drug>) => void;
  deleteDrug: (id: string) => void;
  batchUpdateDrugs: (ids: string[], changes: Partial<Drug>) => void;
  resetDrugs: () => void;

  processApproval: (
    id: string,
    result: "APPROVED" | "REJECTED",
    opinion: string,
    validHours?: number
  ) => void;

  addTask: (task: Omit<RectificationTask, "id" | "status" | "createdAt" | "creatorName">) => void;
  reviewTask: (id: string, result: "APPROVED" | "REJECTED", opinion: string) => void;

  savePermissions: (permissions: PermissionConfig[]) => void;
  resetPermissions: () => void;

  handleWarning: (
    id: string,
    action: "HANDLED" | "DISMISSED",
    opinion: string
  ) => void;

  getPendingWarnings: () => PrescriptionWarning[];
  getPendingApprovals: () => ApprovalRequest[];
  getPendingTasks: () => RectificationTask[];
  getDrugCounts: () => Record<DrugCategory | "ALL", number>;
}

export const useDataStore = create<DataState>((set, get) => ({
  drugs: [...INITIAL_DRUGS],
  initialDrugs: [...INITIAL_DRUGS],
  approvals: [...INITIAL_APPROVALS],
  initialApprovals: [...INITIAL_APPROVALS],
  tasks: [...INITIAL_TASKS],
  initialTasks: [...INITIAL_TASKS],
  permissions: [...INITIAL_PERMISSIONS],
  initialPermissions: [...INITIAL_PERMISSIONS],
  warnings: [...INITIAL_WARNINGS],
  initialWarnings: [...INITIAL_WARNINGS],

  addDrug: (drug) => {
    const newDrug: Drug = {
      ...drug,
      id: `drug${String(get().drugs.length + 1).padStart(3, "0")}`,
      updatedAt: now(),
    };
    set((s) => ({ drugs: [newDrug, ...s.drugs] }));
  },

  updateDrug: (id, changes) => {
    set((s) => ({
      drugs: s.drugs.map((d) =>
        d.id === id ? { ...d, ...changes, updatedAt: now() } : d
      ),
    }));
  },

  deleteDrug: (id) => {
    set((s) => ({ drugs: s.drugs.filter((d) => d.id !== id) }));
  },

  batchUpdateDrugs: (ids, changes) => {
    set((s) => ({
      drugs: s.drugs.map((d) =>
        ids.includes(d.id) ? { ...d, ...changes, updatedAt: now() } : d
      ),
    }));
  },

  resetDrugs: () => {
    set({ drugs: [...get().initialDrugs] });
  },

  processApproval: (id, result, opinion, validHours) => {
    set((s) => ({
      approvals: s.approvals.map((a) => {
        if (a.id !== id) return a;

        const nextStepIndex = a.currentStep;
        const stepTypes: Array<"FIRST" | "SECOND" | "FINAL"> = ["FIRST", "SECOND", "FINAL"];
        const stepType = stepTypes[nextStepIndex];

        const approverName =
          stepType === "FIRST"
            ? "科室主任"
            : stepType === "SECOND"
            ? "李淑芬"
            : CURRENT_USER.name;
        const approverTitle: DoctorTitle =
          stepType === "FIRST" ? "PROFESSOR" : stepType === "SECOND" ? "ASSOCIATE_PROFESSOR" : "PROFESSOR";

        const newSteps = [
          ...a.steps,
          {
            id: `s${nextStepIndex + 1}-${a.id}`,
            stepType,
            approverName,
            approverTitle,
            opinion,
            result,
            signedAt: now(),
          },
        ];

        let newStatus: ApprovalStatus = a.status;
        let newCurrentStep = a.currentStep + 1;
        let newValidHours = a.validHours;

        if (result === "REJECTED") {
          newStatus = "REJECTED";
        } else if (nextStepIndex >= 2) {
          newStatus = "APPROVED";
          newValidHours = validHours || 48;
        } else {
          newStatus = "IN_PROGRESS";
        }

        return {
          ...a,
          steps: newSteps,
          currentStep: newCurrentStep,
          status: newStatus,
          validHours: newValidHours,
        };
      }),
    }));
  },

  addTask: (task) => {
    const dept = DEPARTMENTS.find((d) => d.id === task.departmentName);
    const doctor = ALL_DOCTORS.find((d) => d.name === task.assigneeName);

    const newTask: RectificationTask = {
      ...task,
      id: `rect${String(get().tasks.length + 1).padStart(4, "0")}`,
      status: "PENDING",
      createdAt: now(),
      creatorName: CURRENT_USER.name,
      departmentName: dept?.name || task.departmentName,
      assigneeTitle: doctor?.title || "ATTENDING",
    };
    set((s) => ({ tasks: [newTask, ...s.tasks] }));
  },

  reviewTask: (id, result, opinion) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: result === "APPROVED" ? "DONE" : "REJECTED",
              reviewedBy: CURRENT_USER.name,
              reviewedAt: now(),
              reviewOpinion: opinion,
            }
          : t
      ),
    }));
  },

  savePermissions: (permissions) => {
    const updated = permissions.map((p) => ({
      ...p,
      modifiedAt: now(),
      modifiedBy: CURRENT_USER.name,
    }));
    set({ permissions: updated });
  },

  resetPermissions: () => {
    set({ permissions: [...get().initialPermissions] });
  },

  handleWarning: (id, action, opinion) => {
    set((s) => ({
      warnings: s.warnings.map((w) =>
        w.id === id
          ? {
              ...w,
              status: action,
              handler: CURRENT_USER.name,
              handledAt: now(),
              handleOpinion: opinion,
            }
          : w
      ),
    }));
  },

  getPendingWarnings: () => get().warnings.filter((w) => w.status === "PENDING"),
  getPendingApprovals: () => get().approvals.filter((a) => a.status === "PENDING" || a.status === "IN_PROGRESS"),
  getPendingTasks: () => get().tasks.filter((t) => t.status === "REVIEWING"),

  getDrugCounts: () => {
    const { drugs } = get();
    return {
      ALL: drugs.length,
      NON_RESTRICTED: drugs.filter((d) => d.category === "NON_RESTRICTED").length,
      RESTRICTED: drugs.filter((d) => d.category === "RESTRICTED").length,
      SPECIAL: drugs.filter((d) => d.category === "SPECIAL").length,
    };
  },
}));
