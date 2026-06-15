import type { DrugCategory, WarningType, Severity, DoctorTitle, UserRole, AuditActionType } from "@/types";

export const DRUG_CATEGORY_LABELS: Record<DrugCategory, string> = {
  NON_RESTRICTED: "非限制级",
  RESTRICTED: "限制级",
  SPECIAL: "特殊级",
};

export const WARNING_TYPE_LABELS: Record<WarningType, string> = {
  OVER_GRADE: "越级开具",
  OVER_DURATION: "超疗程使用",
  DUPLICATE: "重复联用",
  NO_INDICATION: "无指征用药",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  CRITICAL: "危重",
};

export const DOCTOR_TITLE_LABELS: Record<DoctorTitle, string> = {
  RESIDENT: "住院医师",
  ATTENDING: "主治医师",
  ASSOCIATE_PROFESSOR: "副主任医师",
  PROFESSOR: "主任医师",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  PHARMACY_DIRECTOR: "药学部负责人",
  INFECTION_CONTROL: "感染管理人员",
  DEPARTMENT_HEAD: "科室主任",
  CLINICAL_DOCTOR: "临床医生",
};

export const RECTIFICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "待处理",
  IN_PROGRESS: "整改中",
  REVIEWING: "待审核",
  DONE: "已完成",
  REJECTED: "已退回",
};

export const APPROVAL_STATUS_LABELS: Record<string, string> = {
  PENDING: "待审批",
  IN_PROGRESS: "审批中",
  APPROVED: "已通过",
  REJECTED: "已驳回",
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  URGENT: "紧急",
};

export const WARNING_COLORS: Record<WarningType, string> = {
  OVER_GRADE: "bg-red-500",
  OVER_DURATION: "bg-orange-500",
  DUPLICATE: "bg-amber-500",
  NO_INDICATION: "bg-rose-500",
};

export const AUDIT_ACTION_LABELS: Record<AuditActionType, string> = {
  APPROVAL_REVIEWED: "会诊审批",
  WARNING_HANDLED: "处方预警处理",
  PERMISSION_CHANGED: "权限配置调整",
  RECTIFICATION_REVIEWED: "整改任务审核",
  RECTIFICATION_CREATED: "整改任务下发",
  DRUG_ADDED: "新增药品",
  DRUG_UPDATED: "更新药品信息",
  DRUG_DELETED: "删除药品",
  DRUG_BATCH_UPDATED: "批量调整药品",
};

export const AUDIT_ACTION_COLORS: Record<AuditActionType, string> = {
  APPROVAL_REVIEWED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  WARNING_HANDLED: "bg-rose-50 text-rose-700 ring-rose-200",
  PERMISSION_CHANGED: "bg-violet-50 text-violet-700 ring-violet-200",
  RECTIFICATION_REVIEWED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  RECTIFICATION_CREATED: "bg-amber-50 text-amber-700 ring-amber-200",
  DRUG_ADDED: "bg-teal-50 text-teal-700 ring-teal-200",
  DRUG_UPDATED: "bg-sky-50 text-sky-700 ring-sky-200",
  DRUG_DELETED: "bg-red-50 text-red-700 ring-red-200",
  DRUG_BATCH_UPDATED: "bg-orange-50 text-orange-700 ring-orange-200",
};

export const AUDIT_RESULT_LABELS: Record<string, string> = {
  APPROVED: "通过",
  REJECTED: "驳回",
  HANDLED: "已干预",
  DISMISSED: "忽略放行",
  DONE: "完成",
};
