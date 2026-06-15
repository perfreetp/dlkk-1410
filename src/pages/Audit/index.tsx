import { useState, useMemo, useEffect } from "react";
import {
  Activity,
  ClipboardCheck,
  Pill,
  Shield,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  Clock,
  User,
  Tag,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
  Zap,
  History,
  X,
  Stethoscope,
  UserRound,
  ClipboardList,
} from "lucide-react";
import type { AuditLog, AuditActionType } from "@/types";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ACTION_COLORS,
  AUDIT_RESULT_LABELS,
} from "@/utils/constants";
import { cn, formatDateTime } from "@/utils/format";
import { useDataStore } from "@/store/dataStore";
import { useNavStore } from "@/store/navStore";
import dayjs from "dayjs";

type ObjectFilterType =
  | null
  | { type: "patient"; value: string }
  | { type: "doctor"; value: string }
  | { type: "task"; value: string; label: string };

interface ChipItem {
  value: string;
  label: string;
}

const ACTION_ICONS: Record<AuditActionType, React.ComponentType<{ className?: string }>> = {
  APPROVAL_REVIEWED: ClipboardCheck,
  WARNING_HANDLED: Pill,
  PERMISSION_CHANGED: Shield,
  RECTIFICATION_REVIEWED: CheckCircle2,
  RECTIFICATION_CREATED: RotateCcw,
  DRUG_ADDED: FileText,
  DRUG_UPDATED: RotateCcw,
  DRUG_DELETED: XCircle,
  DRUG_BATCH_UPDATED: Zap,
};

const RESULT_COLORS: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  HANDLED: "bg-teal-50 text-teal-700 ring-teal-200",
  DISMISSED: "bg-slate-50 text-slate-600 ring-slate-200",
  DONE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

function getAuditStats(logs: AuditLog[]) {
  const total = logs.length;
  const approvalCount = logs.filter(
    (l) => l.actionType === "APPROVAL_REVIEWED"
  ).length;
  const interventionCount = logs.filter(
    (l) =>
      l.actionType === "WARNING_HANDLED" ||
      l.actionType === "RECTIFICATION_CREATED" ||
      l.actionType === "RECTIFICATION_REVIEWED"
  ).length;
  const permissionCount = logs.filter(
    (l) =>
      l.actionType === "PERMISSION_CHANGED" ||
      l.actionType === "DRUG_ADDED" ||
      l.actionType === "DRUG_UPDATED" ||
      l.actionType === "DRUG_DELETED" ||
      l.actionType === "DRUG_BATCH_UPDATED"
  ).length;
  return { total, approvalCount, interventionCount, permissionCount };
}

function extractObjectChips(logs: AuditLog[]) {
  const patientMap = new Map<string, number>();
  const doctorMap = new Map<string, number>();
  const taskMap = new Map<string, { label: string; index: number }>();

  logs.forEach((log, index) => {
    if (log.extra?.patient) {
      patientMap.set(
        log.extra.patient,
        Math.min(patientMap.get(log.extra.patient) ?? index, index)
      );
    }
    if (log.extra?.doctor) {
      doctorMap.set(
        log.extra.doctor,
        Math.min(doctorMap.get(log.extra.doctor) ?? index, index)
      );
    }
    if (log.operatorName) {
      doctorMap.set(
        log.operatorName,
        Math.min(doctorMap.get(log.operatorName) ?? index, index)
      );
    }
    if (
      (log.actionType === "RECTIFICATION_CREATED" ||
        log.actionType === "RECTIFICATION_REVIEWED") &&
      log.targetId
    ) {
      const existing = taskMap.get(log.targetId);
      if (!existing || index < existing.index) {
        taskMap.set(log.targetId, {
          label: log.targetName || log.targetId,
          index,
        });
      }
    }
  });

  const patients: ChipItem[] = Array.from(patientMap.entries())
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5)
    .map(([value]) => ({ value, label: value }));

  const doctors: ChipItem[] = Array.from(doctorMap.entries())
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5)
    .map(([value]) => ({ value, label: value }));

  const tasks: ChipItem[] = Array.from(taskMap.entries())
    .sort((a, b) => a[1].index - b[1].index)
    .slice(0, 3)
    .map(([value, data]) => ({ value, label: data.label }));

  return { patients, doctors, tasks };
}

function StatsPanel() {
  const logs = useDataStore((s) => s.auditLogs);
  const stats = useMemo(() => getAuditStats(logs), [logs]);

  return (
    <div className="grid grid-cols-4 gap-4 mb-5">
      <div className="card-kpi bg-gradient-card-blue">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-700" />
            </div>
            <span className="text-sm font-medium text-slate-600">总操作数</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="data-number text-3xl font-bold text-navy-800">
              {stats.total}
            </span>
            <span className="text-xs text-slate-500">条</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 inline-flex items-center gap-1">
            <History className="w-3 h-3" />
            累计系统操作记录
          </div>
        </div>
      </div>

      <div className="card-kpi bg-gradient-card-teal">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-teal-700" />
            </div>
            <span className="text-sm font-medium text-slate-600">审批处理数</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="data-number text-3xl font-bold text-navy-800">
              {stats.approvalCount}
            </span>
            <span className="text-xs text-slate-500">次</span>
          </div>
          <div className="mt-2 text-[11px] text-teal-600 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            特殊用药审批流转
          </div>
        </div>
      </div>

      <div className="card-kpi bg-gradient-card-orange">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
              <Pill className="w-4 h-4 text-rose-700" />
            </div>
            <span className="text-sm font-medium text-slate-600">处方干预数</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="data-number text-3xl font-bold text-navy-800">
              {stats.interventionCount}
            </span>
            <span className="text-xs text-slate-500">次</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-600 inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            预警处理 + 整改任务
          </div>
        </div>
      </div>

      <div className="card-kpi bg-gradient-to-br from-violet-50 via-violet-50 to-indigo-50">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-violet-700" />
            </div>
            <span className="text-sm font-medium text-slate-600">
              权限/目录调整
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="data-number text-3xl font-bold text-navy-800">
              {stats.permissionCount}
            </span>
            <span className="text-xs text-slate-500">次</span>
          </div>
          <div className="mt-2 text-[11px] text-violet-600 inline-flex items-center gap-1">
            <FileText className="w-3 h-3" />
            药品目录 + 权限配置
          </div>
        </div>
      </div>
    </div>
  );
}

function ObjectFilterChips({
  patients,
  doctors,
  tasks,
  objectFilter,
  setObjectFilter,
}: {
  patients: ChipItem[];
  doctors: ChipItem[];
  tasks: ChipItem[];
  objectFilter: ObjectFilterType;
  setObjectFilter: (f: ObjectFilterType) => void;
}) {
  if (patients.length === 0 && doctors.length === 0 && tasks.length === 0) {
    return null;
  }

  const isActive = (type: "patient" | "doctor" | "task", value: string) =>
    objectFilter?.type === type && objectFilter.value === value;

  const toggleChip = (type: "patient" | "doctor" | "task", item: ChipItem) => {
    if (isActive(type, item.value)) {
      setObjectFilter(null);
    } else {
      if (type === "task") {
        setObjectFilter({ type, value: item.value, label: item.label });
      } else {
        setObjectFilter({ type, value: item.value } as ObjectFilterType);
      }
    }
  };

  return (
    <div className="border-t border-border pt-4 mt-4 space-y-3">
      {patients.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 shrink-0 w-16">
            <UserRound className="w-3 h-3 text-blue-500" />
            按患者
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {patients.map((item) => (
              <button
                key={`patient-${item.value}`}
                onClick={() => toggleChip("patient", item)}
                className={cn(
                  "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all",
                  isActive("patient", item.value)
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100 hover:bg-blue-100"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {doctors.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 shrink-0 w-16">
            <Stethoscope className="w-3 h-3 text-teal-500" />
            按医生
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {doctors.map((item) => (
              <button
                key={`doctor-${item.value}`}
                onClick={() => toggleChip("doctor", item)}
                className={cn(
                  "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all",
                  isActive("doctor", item.value)
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100 hover:bg-teal-100"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 shrink-0 w-16">
            <ClipboardList className="w-3 h-3 text-orange-500" />
            整改任务
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {tasks.map((item) => (
              <button
                key={`task-${item.value}`}
                onClick={() => toggleChip("task", item)}
                className={cn(
                  "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all max-w-[240px]",
                  isActive("task", item.value)
                    ? "bg-orange-600 text-white shadow-sm"
                    : "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-100 hover:bg-orange-100"
                )}
              >
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({
  selectedTypes,
  setSelectedTypes,
  keyword,
  setKeyword,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onReset,
  objectFilter,
  setObjectFilter,
  patientChips,
  doctorChips,
  taskChips,
}: {
  selectedTypes: AuditActionType[];
  setSelectedTypes: (t: AuditActionType[]) => void;
  keyword: string;
  setKeyword: (k: string) => void;
  dateFrom: string;
  setDateFrom: (d: string) => void;
  dateTo: string;
  setDateTo: (d: string) => void;
  onReset: () => void;
  objectFilter: ObjectFilterType;
  setObjectFilter: (f: ObjectFilterType) => void;
  patientChips: ChipItem[];
  doctorChips: ChipItem[];
  taskChips: ChipItem[];
}) {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const allTypes = Object.keys(AUDIT_ACTION_LABELS) as AuditActionType[];

  const toggleType = (t: AuditActionType) => {
    setSelectedTypes(
      selectedTypes.includes(t)
        ? selectedTypes.filter((x) => x !== t)
        : [...selectedTypes, t]
    );
  };

  return (
    <div className="card p-4 mb-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <div
              className="form-select w-60 cursor-pointer flex items-center justify-between pr-9"
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            >
              <div className="flex items-center gap-2 flex-wrap">
                {selectedTypes.length === 0 ? (
                  <span className="text-slate-400 text-sm">全部操作类型</span>
                ) : (
                  <>
                    <span className="text-sm text-slate-700">
                      已选 {selectedTypes.length} 项
                    </span>
                    {selectedTypes.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.5 rounded-md bg-navy-50 text-navy-700 ring-1 ring-navy-100"
                      >
                        {AUDIT_ACTION_LABELS[t]}
                      </span>
                    ))}
                    {selectedTypes.length > 2 && (
                      <span className="text-[10px] text-slate-400">
                        +{selectedTypes.length - 2}
                      </span>
                    )}
                  </>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-slate-400 absolute right-3 transition-transform",
                  showTypeDropdown && "rotate-180"
                )}
              />
            </div>

            {showTypeDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowTypeDropdown(false)}
                />
                <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-border z-40 p-2 max-h-80 overflow-y-auto">
                  <div className="p-2 border-b border-border mb-1">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                        <Filter className="w-3 h-3" />
                        操作类型筛选
                      </div>
                      <button
                        className="text-[11px] text-navy-600 hover:text-navy-800 font-medium"
                        onClick={() => setSelectedTypes([])}
                      >
                        清空
                      </button>
                    </div>
                  </div>
                  {allTypes.map((t) => {
                    const checked = selectedTypes.includes(t);
                    const Icon = ACTION_ICONS[t];
                    return (
                      <div
                        key={t}
                        onClick={() => toggleType(t)}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors",
                          checked
                            ? "bg-navy-50 text-navy-800"
                            : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                            checked
                              ? "bg-navy-600 border-navy-600"
                              : "border-slate-300"
                          )}
                        >
                          {checked && (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <Icon
                          className={cn(
                            "w-3.5 h-3.5",
                            checked ? "text-navy-600" : "text-slate-400"
                          )}
                        />
                        <span className="flex-1">{AUDIT_ACTION_LABELS[t]}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <ObjectFilterChips
            patients={patientChips}
            doctors={doctorChips}
            tasks={taskChips}
            objectFilter={objectFilter}
            setObjectFilter={setObjectFilter}
          />

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索操作人姓名..."
              className="form-input w-56 pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="form-input w-36 text-sm"
            />
            <span className="text-slate-400 text-sm">至</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="form-input w-36 text-sm"
            />
          </div>
        </div>

        <button
          onClick={onReset}
          className="btn-ghost btn-sm inline-flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置筛选
        </button>
      </div>
    </div>
  );
}

function AuditListItem({ log, index }: { log: AuditLog; index: number }) {
  const ActionIcon = ACTION_ICONS[log.actionType];

  return (
    <div
      className="card p-4 hover:shadow-md transition-all group animate-fade-in-up"
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-inset",
            AUDIT_ACTION_COLORS[log.actionType]
          )}
        >
          <ActionIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={cn(
                "badge ring-1 ring-inset",
                AUDIT_ACTION_COLORS[log.actionType]
              )}
            >
              {AUDIT_ACTION_LABELS[log.actionType]}
            </span>
            {log.result && (
              <span
                className={cn(
                  "badge ring-1 ring-inset",
                  RESULT_COLORS[log.result] ||
                    "bg-slate-50 text-slate-600 ring-slate-200"
                )}
              >
                {AUDIT_RESULT_LABELS[log.result] || log.result}
              </span>
            )}
            {log.extra &&
              Object.entries(log.extra).map(([k, v]) =>
                v ? (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {k === "count"
                      ? `共${v}项`
                      : k === "changedCount"
                      ? `变更${v}项`
                      : k === "total"
                      ? `总计${v}项`
                      : k === "step"
                      ? v
                      : k === "validHours"
                      ? `有效期${v}h`
                      : k === "deadline"
                      ? `截止${v.slice(5)}`
                      : k === "priority"
                      ? `优先级:${v === "HIGH" ? "高" : v === "MEDIUM" ? "中" : "低"}`
                      : k === "severity"
                      ? `严重度:${v === "CRITICAL" ? "危重" : v === "HIGH" ? "高" : v === "MEDIUM" ? "中" : "低"}`
                      : typeof v === "string" && v.length > 8
                      ? `${v.slice(0, 8)}...`
                      : v}
                  </span>
                ) : null
              )}
          </div>

          <p className="text-sm text-slate-700 leading-relaxed mb-3">
            {log.description}
          </p>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-navy-200 to-navy-400 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                {log.operatorName.slice(0, 1)}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <User className="w-3 h-3 text-slate-400" />
                <span className="font-medium text-slate-700">
                  {log.operatorName}
                </span>
                {log.targetName && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 truncate max-w-[200px]">
                      关联: {log.targetName}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono tabular-nums shrink-0">
              <Clock className="w-3 h-3" />
              {formatDateTime(log.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card py-16 flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <History className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">
        暂无审计日志
      </h3>
      <p className="text-sm text-slate-400">
        当前筛选条件下没有找到相关操作记录
      </p>
    </div>
  );
}

function TimelineBanner({
  objectFilter,
  onClear,
}: {
  objectFilter: NonNullable<ObjectFilterType>;
  onClear: () => void;
}) {
  const config = {
    patient: {
      label: "患者",
      icon: UserRound,
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-700",
      ring: "ring-blue-200",
    },
    doctor: {
      label: "医生",
      icon: Stethoscope,
      color: "from-teal-500 to-teal-600",
      bg: "bg-teal-50",
      text: "text-teal-700",
      ring: "ring-teal-200",
    },
    task: {
      label: "整改任务",
      icon: ClipboardList,
      color: "from-orange-500 to-orange-600",
      bg: "bg-orange-50",
      text: "text-orange-700",
      ring: "ring-orange-200",
    },
  }[objectFilter.type];

  const Icon = config.icon;
  const displayValue =
    objectFilter.type === "task" ? objectFilter.label : objectFilter.value;

  return (
    <div className={cn("card p-3 mb-4 ring-1", config.bg, config.ring)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
              config.color
            )}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-700">
                正在查看
              </span>
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium ring-1 ring-inset truncate max-w-[280px]",
                  config.bg,
                  config.text,
                  config.ring
                )}
              >
                {config.label}：{displayValue}
              </span>
              <span className="text-sm font-semibold text-slate-700">
                的完整时间线
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-white/60 hover:bg-white text-slate-600 hover:text-slate-800 ring-1 ring-slate-200 transition-colors shrink-0"
        >
          <X className="w-3 h-3" />
          取消筛选
        </button>
      </div>
    </div>
  );
}

export default function AuditPage() {
  const logs = useDataStore((s) => s.auditLogs);
  const [selectedTypes, setSelectedTypes] = useState<AuditActionType[]>([]);
  const [keyword, setKeyword] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [objectFilter, setObjectFilter] = useState<ObjectFilterType>(null);

  useEffect(() => {
    const filter = useNavStore.getState().consumeAuditFilter();
    if (!filter) return;
    if (filter.actionType && !selectedTypes.includes(filter.actionType)) {
      setSelectedTypes([filter.actionType]);
    }
    if (filter.operatorName) {
      setKeyword(filter.operatorName);
    }
    if (filter.targetId) {
      // 尝试通过 targetId 找到对应日志并匹配对象
      const hit = logs.find((l) => l.targetId === filter.targetId);
      if (hit) {
        if (hit.actionType === "APPROVAL_REVIEWED" && hit.extra?.patient) {
          setObjectFilter({ type: "patient", value: hit.extra.patient });
        } else if (hit.actionType === "WARNING_HANDLED" && hit.extra?.patient) {
          setObjectFilter({ type: "patient", value: hit.extra.patient });
        } else if (
          (hit.actionType === "RECTIFICATION_CREATED" ||
            hit.actionType === "RECTIFICATION_REVIEWED") &&
          hit.targetId
        ) {
          setObjectFilter({
            type: "task",
            value: hit.targetId,
            label: hit.targetName,
          } as any);
        }
      }
    }
  }, []);

  const { patients: patientChips, doctors: doctorChips, tasks: taskChips } =
    useMemo(() => extractObjectChips(logs), [logs]);

  const filtered = useMemo(() => {
    return logs
      .filter((log) => {
        if (selectedTypes.length > 0 && !selectedTypes.includes(log.actionType))
          return false;
        if (
          keyword &&
          !log.operatorName.toLowerCase().includes(keyword.toLowerCase())
        )
          return false;
        if (dateFrom && dayjs(log.createdAt).isBefore(dayjs(dateFrom), "day"))
          return false;
        if (
          dateTo &&
          dayjs(log.createdAt).isAfter(dayjs(dateTo).endOf("day"), "day")
        )
          return false;
        if (objectFilter) {
          if (objectFilter.type === "patient") {
            if (log.extra?.patient !== objectFilter.value) return false;
          } else if (objectFilter.type === "doctor") {
            const matchDoctor =
              log.extra?.doctor === objectFilter.value ||
              log.operatorName === objectFilter.value;
            if (!matchDoctor) return false;
          } else if (objectFilter.type === "task") {
            const isRectType =
              log.actionType === "RECTIFICATION_CREATED" ||
              log.actionType === "RECTIFICATION_REVIEWED";
            if (!isRectType || log.targetId !== objectFilter.value)
              return false;
          }
        }
        return true;
      })
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  }, [logs, selectedTypes, keyword, dateFrom, dateTo, objectFilter]);

  const handleReset = () => {
    setSelectedTypes([]);
    setKeyword("");
    setDateFrom("");
    setDateTo("");
    setObjectFilter(null);
  };

  return (
    <div className="space-y-5">
      <StatsPanel />

      <FilterPanel
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        keyword={keyword}
        setKeyword={setKeyword}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        onReset={handleReset}
        objectFilter={objectFilter}
        setObjectFilter={setObjectFilter}
        patientChips={patientChips}
        doctorChips={doctorChips}
        taskChips={taskChips}
      />

      {objectFilter && (
        <TimelineBanner
          objectFilter={objectFilter}
          onClear={() => setObjectFilter(null)}
        />
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-500 flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-400" />
          共
          <span className="font-semibold text-navy-700 data-number">
            {filtered.length}
          </span>
          条记录
          {filtered.length !== logs.length && (
            <span className="text-slate-400">
              （系统总记录 {logs.length} 条）
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-400 inline-flex items-center gap-1">
          <Clock className="w-3 h-3" />
          按操作时间倒序排列
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {filtered.map((log, i) => (
            <AuditListItem key={log.id} log={log} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
