import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import type { DrugCategory, WarningType, Severity, RectificationStatus, ApprovalStatus, Priority } from "@/types";
import { DRUG_CATEGORY_LABELS, WARNING_TYPE_LABELS, SEVERITY_LABELS, RECTIFICATION_STATUS_LABELS, APPROVAL_STATUS_LABELS, PRIORITY_LABELS } from "./constants";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

export const formatDate = (date: string | Date, format = "YYYY-MM-DD") =>
  dayjs(date).format(format);

export const formatDateTime = (date: string | Date) =>
  dayjs(date).format("YYYY-MM-DD HH:mm");

export const formatTimeAgo = (date: string | Date) =>
  dayjs(date).fromNow();

export const formatNumber = (num: number, digits = 0) =>
  new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);

export const formatPercent = (num: number, digits = 1) =>
  `${formatNumber(num * 100, digits)}%`;

export const formatCurrency = (num: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(num);

export const formatDrugCategory = (c: DrugCategory) => DRUG_CATEGORY_LABELS[c];
export const formatWarningType = (t: WarningType) => WARNING_TYPE_LABELS[t];
export const formatSeverity = (s: Severity) => SEVERITY_LABELS[s];
export const formatRectificationStatus = (s: RectificationStatus) =>
  RECTIFICATION_STATUS_LABELS[s];
export const formatApprovalStatus = (s: ApprovalStatus) =>
  APPROVAL_STATUS_LABELS[s];
export const formatPriority = (p: Priority | string) => PRIORITY_LABELS[p] || p;

export const cn = (...classes: (string | false | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

export const getDaysRemaining = (deadline: string | Date): number => {
  const diff = dayjs(deadline).endOf("day").diff(dayjs(), "day");
  return diff;
};

export const isOverdue = (deadline: string | Date): boolean =>
  dayjs().isAfter(dayjs(deadline), "day");
