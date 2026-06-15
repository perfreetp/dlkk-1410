import type { DrugCategory, WarningType, Severity, DoctorTitle, UserRole } from "@/types";

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
