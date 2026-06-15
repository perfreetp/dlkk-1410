export type DrugCategory = "NON_RESTRICTED" | "RESTRICTED" | "SPECIAL";

export type WarningType =
  | "OVER_GRADE"
  | "OVER_DURATION"
  | "DUPLICATE"
  | "NO_INDICATION";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ApprovalStatus = "PENDING" | "IN_PROGRESS" | "APPROVED" | "REJECTED";

export type RectificationStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "REVIEWING"
  | "DONE"
  | "REJECTED";

export type DoctorTitle =
  | "RESIDENT"
  | "ATTENDING"
  | "ASSOCIATE_PROFESSOR"
  | "PROFESSOR";

export type UserRole =
  | "PHARMACY_DIRECTOR"
  | "INFECTION_CONTROL"
  | "DEPARTMENT_HEAD"
  | "CLINICAL_DOCTOR";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface User {
  id: string;
  name: string;
  title: DoctorTitle;
  departmentId: string;
  departmentName: string;
  role: UserRole;
  avatar?: string;
}

export interface Department {
  id: string;
  name: string;
  shortName: string;
  directorId: string;
  doctorCount: number;
}

export interface Drug {
  id: string;
  name: string;
  genericName: string;
  specification: string;
  category: DrugCategory;
  manufacturer: string;
  indication: string;
  contraindication: string;
  dosage: string;
  warningLevel: Severity;
  dddValue: number;
  dddUnit: string;
  updatedAt: string;
}

export interface PrescriptionWarning {
  id: string;
  prescriptionId: string;
  patientName: string;
  patientAge: number;
  patientGender: "M" | "F";
  doctorName: string;
  doctorTitle: DoctorTitle;
  departmentName: string;
  departmentId: string;
  warningType: WarningType;
  severity: Severity;
  description: string;
  drugs: string[];
  createdAt: string;
  status: "PENDING" | "HANDLED" | "DISMISSED";
  handler?: string;
  handledAt?: string;
  handleOpinion?: string;
}

export interface ApprovalStep {
  id: string;
  stepType: "FIRST" | "SECOND" | "FINAL";
  approverName: string;
  approverTitle: DoctorTitle;
  opinion?: string;
  result?: "APPROVED" | "REJECTED";
  signedAt?: string;
}

export interface ApprovalRequest {
  id: string;
  applicantName: string;
  applicantTitle: DoctorTitle;
  departmentName: string;
  departmentId: string;
  patientName: string;
  patientAge: number;
  patientGender: "M" | "F";
  patientDiagnosis: string;
  drugName: string;
  drugCategory: DrugCategory;
  drugSpecification: string;
  reason: string;
  proposedDosage: string;
  proposedDuration: number;
  createdAt: string;
  deadline?: string;
  isUrgent: boolean;
  status: ApprovalStatus;
  validHours?: number;
  currentStep: number;
  steps: ApprovalStep[];
}

export interface DepartmentKPI {
  departmentId: string;
  departmentName: string;
  ddds: number;
  dddsRank: number;
  restrictedRatio: number;
  specialRatio: number;
  warningCount: number;
  warningRank: number;
  rectificationRate: number;
  lastMonthDDDs: number;
  lastMonthWarnings: number;
}

export interface DoctorRanking {
  id: string;
  name: string;
  title: DoctorTitle;
  departmentId: string;
  ddds: number;
  warningCount: number;
  rank: number;
  lastMonthRank: number;
}

export interface MonthlyTrend {
  month: string;
  ddds: number;
  warningCount: number;
  restrictedCount: number;
  specialCount: number;
}

export interface InterventionTemplate {
  id: string;
  category: WarningType | "GENERAL";
  title: string;
  standardText: string;
  suggestion: string;
  useCount: number;
}

export interface RectificationTask {
  id: string;
  warningId?: string;
  title: string;
  description: string;
  category: WarningType | "GENERAL";
  assigneeName: string;
  assigneeTitle: DoctorTitle;
  departmentName: string;
  creatorName: string;
  templateId?: string;
  status: RectificationStatus;
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  deadline: string;
  feedback?: string;
  feedbackAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewOpinion?: string;
}

export interface PermissionConfig {
  departmentId: string;
  departmentName: string;
  title: DoctorTitle;
  allowedCategory: DrugCategory[];
  modifiedAt: string;
  modifiedBy: string;
}

export interface TodoItem {
  id: string;
  type: "APPROVAL" | "WARNING" | "RECTIFICATION";
  title: string;
  subtitle: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: string;
  deadline?: string;
  link: string;
  targetId?: string;
}

export type AuditActionType =
  | "APPROVAL_REVIEWED"
  | "WARNING_HANDLED"
  | "PERMISSION_CHANGED"
  | "RECTIFICATION_REVIEWED"
  | "RECTIFICATION_CREATED"
  | "DRUG_ADDED"
  | "DRUG_UPDATED"
  | "DRUG_DELETED"
  | "DRUG_BATCH_UPDATED";

export interface AuditLog {
  id: string;
  actionType: AuditActionType;
  operatorName: string;
  targetName: string;
  targetId?: string;
  description: string;
  result?: "APPROVED" | "REJECTED" | "HANDLED" | "DISMISSED" | "DONE";
  createdAt: string;
  extra?: Record<string, string>;
}
