import { create } from "zustand";
import type {
  Drug,
  DrugCategory,
  ApprovalRequest,
  ApprovalStatus,
  RectificationTask,
  PermissionConfig,
  PrescriptionWarning,
  Severity,
  WarningType,
  DoctorTitle,
  AuditLog,
  AuditActionType,
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
  auditLogs: AuditLog[];

  addAuditLog: (entry: Omit<AuditLog, "id" | "createdAt" | "operatorName">) => void;

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
  getDashboardStats: () => {
    totalWarnings: number;
    pendingWarnings: number;
    pendingApprovals: number;
    criticalCount: number;
    totalDDDs: number;
    rectificationRate: number;
  };
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
  auditLogs: [],

  addAuditLog: (entry) => {
    const log: AuditLog = {
      ...entry,
      id: `audit${String(get().auditLogs.length + 1).padStart(5, "0")}`,
      createdAt: now(),
      operatorName: CURRENT_USER.name,
    };
    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
  },

  addDrug: (drug) => {
    const newDrug: Drug = {
      ...drug,
      id: `drug${String(get().drugs.length + 1).padStart(3, "0")}`,
      updatedAt: now(),
    };
    set((s) => ({ drugs: [newDrug, ...s.drugs] }));
    get().addAuditLog({
      actionType: "DRUG_ADDED",
      targetId: newDrug.id,
      targetName: newDrug.name,
      description: `新增抗菌药物【${newDrug.name}】，分级：${newDrug.category}，DDD值：${newDrug.dddValue}${newDrug.dddUnit}`,
    });
  },

  updateDrug: (id, changes) => {
    const old = get().drugs.find((d) => d.id === id);
    set((s) => ({
      drugs: s.drugs.map((d) =>
        d.id === id ? { ...d, ...changes, updatedAt: now() } : d
      ),
    }));
    if (old) {
      const changeDesc = Object.entries(changes)
        .filter(([k]) => k !== "updatedAt")
        .map(([k, v]) => {
          const labelMap: Record<string, string> = {
            category: "分级",
            warningLevel: "警示等级",
            name: "通用名",
            specification: "规格",
          };
          return `${labelMap[k] || k}: ${String(old[k as keyof Drug] ?? "—")} → ${String(v ?? "—")}`;
        })
        .join("；");
      get().addAuditLog({
        actionType: "DRUG_UPDATED",
        targetId: id,
        targetName: old.name,
        description: `更新药品【${old.name}】信息：${changeDesc || "编辑详情"}`,
      });
    }
  },

  deleteDrug: (id) => {
    const old = get().drugs.find((d) => d.id === id);
    set((s) => ({ drugs: s.drugs.filter((d) => d.id !== id) }));
    if (old) {
      get().addAuditLog({
        actionType: "DRUG_DELETED",
        targetId: id,
        targetName: old.name,
        description: `删除抗菌药物【${old.name}】（${old.category}）`,
      });
    }
  },

  batchUpdateDrugs: (ids, changes) => {
    const affected = get().drugs.filter((d) => ids.includes(d.id));
    set((s) => ({
      drugs: s.drugs.map((d) =>
        ids.includes(d.id) ? { ...d, ...changes, updatedAt: now() } : d
      ),
    }));
    const changeDesc = Object.entries(changes)
      .filter(([k]) => k !== "updatedAt")
      .map(([k, v]) => {
        const labelMap: Record<string, string> = { category: "分级", warningLevel: "警示等级" };
        return `${labelMap[k] || k}=${String(v)}`;
      })
      .join("，");
    get().addAuditLog({
      actionType: "DRUG_BATCH_UPDATED",
      targetName: `批量${ids.length}项`,
      description: `批量调整 ${ids.length} 个药品：${affected.map((d) => d.name).slice(0, 3).join("、")}${affected.length > 3 ? "等" : ""} → ${changeDesc}`,
      extra: { count: String(ids.length) },
    });
  },

  resetDrugs: () => {
    set({ drugs: [...get().initialDrugs] });
  },

  processApproval: (id, result, opinion, validHours) => {
    let newLog: any = null;
    set((s) => ({
      approvals: s.approvals.map((a) => {
        if (a.id !== id) return a;

        const nextStepIndex = a.currentStep;
        const stepTypes: Array<"FIRST" | "SECOND" | "FINAL"> = ["FIRST", "SECOND", "FINAL"];
        const stepType = stepTypes[nextStepIndex];
        const stepLabelMap: Record<string, string> = { FIRST: "科室主任初审", SECOND: "感染/药学复审", FINAL: "负责人终审" };

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

        newLog = {
          actionType: "APPROVAL_REVIEWED" as AuditActionType,
          targetId: a.id,
          targetName: `${a.patientName}·${a.drugName}`,
          description: `${stepLabelMap[stepType]}：${result === "APPROVED" ? "通过" : "驳回"}特殊用药申请。患者${a.patientName}，药品：${a.drugName}（${a.drugCategory}）。意见：${opinion.slice(0, 40)}${opinion.length > 40 ? "..." : ""}`,
          result: result as "APPROVED" | "REJECTED",
          extra: {
            step: stepLabelMap[stepType],
            patient: a.patientName,
            department: a.departmentName,
            validHours: newValidHours ? String(newValidHours) : undefined,
          },
        };

        return {
          ...a,
          steps: newSteps,
          currentStep: newCurrentStep,
          status: newStatus,
          validHours: newValidHours,
        };
      }),
    }));
    if (newLog) get().addAuditLog(newLog);
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
    get().addAuditLog({
      actionType: "RECTIFICATION_CREATED",
      targetId: newTask.id,
      targetName: newTask.title,
      description: `下发整改任务：${newTask.title} → 责任人：${newTask.assigneeName}（${newTask.departmentName}），截止：${newTask.deadline}`,
      extra: {
        assignee: newTask.assigneeName,
        department: newTask.departmentName,
        deadline: newTask.deadline,
        priority: newTask.priority,
      },
    });
  },

  reviewTask: (id, result, opinion) => {
    const old = get().tasks.find((t) => t.id === id);
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
    if (old) {
      get().addAuditLog({
        actionType: "RECTIFICATION_REVIEWED",
        targetId: id,
        targetName: old.title,
        description: `${result === "APPROVED" ? "审核通过" : "退回修改"}整改任务【${old.title}】，责任人：${old.assigneeName}。审核意见：${opinion.slice(0, 40)}${opinion.length > 40 ? "..." : ""}`,
        result: result === "APPROVED" ? "DONE" : "REJECTED",
        extra: { assignee: old.assigneeName },
      });
    }
  },

  savePermissions: (permissions) => {
    const updated = permissions.map((p) => ({
      ...p,
      modifiedAt: now(),
      modifiedBy: CURRENT_USER.name,
    }));
    set({ permissions: updated });

    const changedCount = updated.filter((p, i) => {
      const old = get().initialPermissions[i];
      return old && JSON.stringify(old.allowedCategory.sort()) !== JSON.stringify(p.allowedCategory.sort());
    }).length;
    get().addAuditLog({
      actionType: "PERMISSION_CHANGED",
      targetName: `权限矩阵·${changedCount}项变更`,
      description: `保存处方权限配置：共更新 ${changedCount} 项科室×职称 授权规则，其他 ${updated.length - changedCount} 项无变化`,
      extra: { changedCount: String(changedCount), total: String(updated.length) },
    });
  },

  resetPermissions: () => {
    set({ permissions: [...get().initialPermissions] });
    get().addAuditLog({
      actionType: "PERMISSION_CHANGED",
      targetName: "权限矩阵·重置",
      description: "重置全部处方权限配置为系统默认规则",
    });
  },

  handleWarning: (id, action, opinion) => {
    const old = get().warnings.find((w) => w.id === id);
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
    if (old) {
      const actionLabel = action === "HANDLED" ? "已干预" : "忽略放行";
      const typeMap: Record<string, string> = {
        OVER_GRADE: "越级开具",
        OVER_DURATION: "超疗程",
        DUPLICATE: "重复联用",
        NO_INDICATION: "无指征倾向",
      };
      get().addAuditLog({
        actionType: "WARNING_HANDLED",
        targetId: id,
        targetName: `${old.patientName}·${typeMap[old.warningType]}`,
        description: `${actionLabel}处方预警：${old.patientName}（${old.departmentName}·${old.doctorName}），类型【${typeMap[old.warningType]}】。处理意见：${opinion.slice(0, 40)}${opinion.length > 40 ? "..." : ""}`,
        result: action,
        extra: {
          patient: old.patientName,
          doctor: old.doctorName,
          department: old.departmentName,
          warningType: typeMap[old.warningType],
          severity: old.severity,
        },
      });
    }
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

  getDashboardStats: () => {
    const { warnings, tasks, approvals } = get();
    const doneCount = tasks.filter((t) => t.status === "DONE").length;
    const reviewedCount = tasks.filter((t) => t.status === "DONE" || t.status === "REJECTED").length;
    const rectificationRate = reviewedCount > 0 ? doneCount / reviewedCount : 0.872;
    const pending = warnings.filter((w) => w.status === "PENDING");
    return {
      totalWarnings: warnings.length,
      pendingWarnings: pending.length,
      pendingApprovals: approvals.filter((a) => a.status === "PENDING" || a.status === "IN_PROGRESS").length,
      criticalCount: pending.filter((w) => w.severity === "CRITICAL").length,
      totalDDDs: 96.4,
      rectificationRate,
    };
  },
}));
