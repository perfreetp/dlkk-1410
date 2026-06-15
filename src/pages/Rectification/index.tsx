import { useState, useMemo, useEffect } from "react";
import {
  ListChecks,
  Plus,
  LayoutGrid,
  List,
  Search,
  Filter,
  ChevronDown,
  FileText,
  User,
  Building2,
  Calendar,
  AlertCircle,
  Clock4,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Eye,
  Send,
  X,
  Sparkles,
  ClipboardList,
  Ban,
  History,
  MessageSquare,
  RotateCcw,
  FileCheck,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import type { RectificationTask, RectificationStatus, WarningType, Priority } from "@/types";
import { INTERVENTION_TEMPLATES } from "@/data/analytics";
import { DEPARTMENTS, ALL_DOCTORS } from "@/data/users";
import { cn, formatDate, formatDateTime, formatPriority, formatWarningType, getDaysRemaining, isOverdue, formatPercent } from "@/utils/format";
import { WARNING_TYPE_LABELS, RECTIFICATION_STATUS_LABELS } from "@/utils/constants";
import { getTitleName } from "@/data/users";
import { useDataStore } from "@/store/dataStore";
import { useUserStore, useDashboardStore } from "@/store/appStore";
import { useNavStore } from "@/store/navStore";
import dayjs from "dayjs";

const STATUSES: Array<{ key: RectificationStatus; label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "PENDING", label: "待处理", color: "bg-slate-500", icon: Clock4 },
  { key: "IN_PROGRESS", label: "整改中", color: "bg-amber-500", icon: RotateCcw },
  { key: "REVIEWING", label: "待审核", color: "bg-teal-500", icon: Eye },
  { key: "DONE", label: "已完成", color: "bg-emerald-500", icon: CheckCircle2 },
  { key: "REJECTED", label: "已退回", color: "bg-red-500", icon: Ban },
];

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "text-red-600 bg-red-50 ring-red-200",
  MEDIUM: "text-amber-700 bg-amber-50 ring-amber-200",
  LOW: "text-blue-700 bg-blue-50 ring-blue-200",
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  OVER_GRADE: Ban,
  OVER_DURATION: Clock4,
  DUPLICATE: ClipboardList,
  NO_INDICATION: AlertCircle,
  GENERAL: Bookmark,
};

function TaskCard({
  task,
  onClick,
}: {
  task: RectificationTask;
  onClick: () => void;
}) {
  const overdue = isOverdue(task.deadline);
  const daysLeft = getDaysRemaining(task.deadline);
  const CatIcon = CATEGORY_ICONS[task.category] || Bookmark;

  return (
    <div
      onClick={onClick}
      className={cn(
        "kanban-card group",
        overdue && task.status !== "DONE" && "border-red-300 bg-red-50/40"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-md ring-1 ring-inset uppercase tracking-wider",
              PRIORITY_COLORS[task.priority]
            )}
          >
            {formatPriority(task.priority)}
          </span>
          {task.category !== "GENERAL" && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      <CatIcon className="w-2.5 h-2.5" />
                      {WARNING_TYPE_LABELS[task.category as WarningType]}
                    </span>
                  )}
        </div>
        {overdue && task.status !== "DONE" && (
          <span className="badge-severity-critical">逾期</span>
        )}
      </div>

      <div className="text-sm font-semibold text-slate-800 group-hover:text-navy-700 leading-snug mb-2 line-clamp-2">
        {task.title}
      </div>

      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
        {task.description.split("\n\n")[0]}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-navy-200 to-navy-400 flex items-center justify-center text-white text-[9px] font-semibold">
            {task.assigneeName.slice(0, 1)}
          </div>
          <span className="truncate max-w-[80px]">{task.assigneeName}</span>
        </div>
        <div
          className={cn(
            "text-[11px] font-mono tabular-nums inline-flex items-center gap-1",
            overdue
              ? "text-red-600 font-semibold"
              : daysLeft <= 2
              ? "text-amber-600"
              : "text-slate-500"
          )}
        >
          <Calendar className="w-3 h-3" />
          {formatDate(task.deadline).slice(5)}
        </div>
      </div>
    </div>
  );
}

function KanbanView({
  tasks,
  onOpen,
}: {
  tasks: RectificationTask[];
  onOpen: (t: RectificationTask) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
      {STATUSES.map((s) => {
        const Icon = s.icon;
        const list = tasks.filter((t) => t.status === s.key);
        return (
          <div key={s.key} className="kanban-column shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", s.color)} />
                <span className="font-semibold text-sm text-slate-700">
                  {s.label}
                </span>
                <span className="data-number text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  {list.length}
                </span>
              </div>
              <Icon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-440px)] space-y-2.5 pr-1">
              {list.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  暂无任务
                </div>
              )}
              {list.map((t, i) => (
                <div
                  key={t.id}
                  style={{ animationDelay: `${i * 0.03}s` }}
                  className="animate-fade-in-up"
                >
                  <TaskCard task={t} onClick={() => onOpen(t)} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({
  tasks,
  onOpen,
}: {
  tasks: RectificationTask[];
  onOpen: (t: RectificationTask) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="pl-5">优先级</th>
              <th>任务标题</th>
              <th>类型</th>
              <th>责任人</th>
              <th>科室</th>
              <th>下发人</th>
              <th>截止日期</th>
              <th>状态</th>
              <th className="pr-5 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => {
              const overdue = isOverdue(t.deadline);
              const CatIcon = CATEGORY_ICONS[t.category] || Bookmark;
              return (
                <tr key={t.id} onClick={() => onOpen(t)} className="cursor-pointer group">
                  <td className="pl-5">
                    <span
                      className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-md ring-1 ring-inset",
                        PRIORITY_COLORS[t.priority]
                      )}
                    >
                      {formatPriority(t.priority)}
                    </span>
                  </td>
                  <td>
                    <div className="font-medium text-slate-800 group-hover:text-navy-700 max-w-sm line-clamp-1">
                      {t.title}
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                      <CatIcon className="w-3 h-3" />
                      {t.category === "GENERAL" ? "综合" : formatWarningType(t.category as WarningType)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-navy-200 to-navy-400 flex items-center justify-center text-white text-[10px] font-semibold">
                        {t.assigneeName.slice(0, 1)}
                      </div>
                      <div>
                        <div className="text-sm text-slate-800">{t.assigneeName}</div>
                        <div className="text-[10px] text-slate-400">
                          {getTitleName(t.assigneeTitle)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-slate-600">{t.departmentName}</td>
                  <td className="text-sm text-slate-600">{t.creatorName}</td>
                  <td>
                    <div
                      className={cn(
                        "text-xs font-mono tabular-nums",
                        overdue && t.status !== "DONE" ? "text-red-600 font-semibold" : "text-slate-600"
                      )}
                    >
                      {formatDate(t.deadline)}
                    </div>
                    {overdue && t.status !== "DONE" && (
                      <div className="text-[10px] text-red-500">已逾期</div>
                    )}
                  </td>
                  <td>
                    <span
                      className={cn(
                        "badge",
                        t.status === "DONE"
                          ? "badge-success"
                          : t.status === "REJECTED"
                          ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200"
                          : t.status === "REVIEWING"
                          ? "badge-info"
                          : t.status === "IN_PROGRESS"
                          ? "badge-warning"
                          : "badge-pending"
                      )}
                    >
                      {RECTIFICATION_STATUS_LABELS[t.status]}
                    </span>
                  </td>
                  <td className="pr-5 text-right">
                    <button className="btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      详情
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TemplateLibrary() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <h3 className="section-title !text-lg">干预模板库</h3>
        </div>
        <button className="btn-outline btn-sm">
          <Plus className="w-3.5 h-3.5" />
          新建模板
        </button>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {INTERVENTION_TEMPLATES.sort((a, b) => b.useCount - a.useCount).map((t, i) => {
          const CatIcon = CATEGORY_ICONS[t.category] || Bookmark;
          return (
            <div
              key={t.id}
              className="p-4 rounded-xl border border-border hover:border-teal-300 hover:bg-teal-50/30 transition-all group cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                    <CatIcon className="w-3 h-3" />
                    {t.category === "GENERAL" ? "综合" : WARNING_TYPE_LABELS[t.category]}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500">
                    <FileCheck className="w-3 h-3" />
                    已复用 {t.useCount} 次
                  </span>
                </div>
                <button className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="font-semibold text-sm text-slate-800 mb-2 group-hover:text-navy-700">
                {t.title}
              </div>
              <div className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                {t.standardText}
              </div>
              <div className="text-xs text-teal-700 leading-relaxed">
                💡 {t.suggestion.slice(0, 60)}...
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getRectificationStats(tasks: RectificationTask[]) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const overdue = tasks.filter((t) =>
    t.status !== "DONE" && dayjs().isAfter(dayjs(t.deadline), "day")
  ).length;
  return { total, done, inProgress: total - done, overdue, completionRate: +(done / total).toFixed(3) };
}

function StatsPanel() {
  const tasks = useDataStore((s) => s.tasks);
  const stats = useMemo(() => getRectificationStats(tasks), [tasks]);

  return (
    <div className="grid grid-cols-4 gap-4 mb-5">
      <div className="card-kpi bg-gradient-card-teal">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-teal-700" />
            </div>
            <span className="text-sm font-medium text-slate-600">整改任务总数</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="data-number text-3xl font-bold text-navy-800">{stats.total}</span>
            <span className="text-xs text-slate-500">项</span>
          </div>
        </div>
      </div>
      <div className="card-kpi bg-gradient-card-blue">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-blue-700" />
            </div>
            <span className="text-sm font-medium text-slate-600">进行中</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="data-number text-3xl font-bold text-navy-800">{stats.inProgress}</span>
            <span className="text-xs text-slate-500">项</span>
          </div>
        </div>
      </div>
      <div className="card-kpi bg-gradient-card-orange">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <Ban className="w-4 h-4 text-red-700" />
            </div>
            <span className="text-sm font-medium text-slate-600">已逾期</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="data-number text-3xl font-bold text-red-600">{stats.overdue}</span>
            <span className="text-xs text-slate-500">项</span>
          </div>
        </div>
      </div>
      <div className="card-kpi bg-gradient-to-br from-emerald-50 via-emerald-50 to-teal-50">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-sm font-medium text-slate-600">完成率</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="data-number text-3xl font-bold text-emerald-700">{formatPercent(stats.completionRate)}</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-emerald-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700" style={{ width: `${stats.completionRate * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskDetailDrawer({
  task,
  onClose,
}: {
  task: RectificationTask | null;
  onClose: () => void;
}) {
  const [reviewOpinion, setReviewOpinion] = useState("");
  const reviewTask = useDataStore((s) => s.reviewTask);

  if (!task) return null;

  const overdue = isOverdue(task.deadline) && task.status !== "DONE";
  const days = getDaysRemaining(task.deadline);
  const tpl = task.templateId ? INTERVENTION_TEMPLATES.find((t) => t.id === task.templateId) : null;
  const CatIcon = CATEGORY_ICONS[task.category] || Bookmark;

  const handleReview = (result: "APPROVED" | "REJECTED") => {
    if (!reviewOpinion.trim()) {
      alert("请填写审核意见");
      return;
    }
    reviewTask(task.id, result, reviewOpinion);
    useUserStore.getState().refreshTodos();
    useDashboardStore.getState().refreshStats();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-navy-700/20 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-4 left-auto w-[720px] max-w-[95vw] bg-white z-50 shadow-2xl rounded-2xl overflow-hidden animate-slide-in-right flex flex-col">
        <header
          className={cn(
            "px-6 py-5 border-b border-border shrink-0",
            overdue && "bg-gradient-to-r from-red-50/80 to-transparent"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 pr-4">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className={cn(
                    "text-[11px] font-bold px-2 py-0.5 rounded-md ring-1 ring-inset uppercase tracking-wider",
                    PRIORITY_COLORS[task.priority]
                  )}
                >
                  {formatPriority(task.priority)}优先级
                </span>
                {task.category !== "GENERAL" && (
                  <span className="badge-severity-medium inline-flex items-center gap-1">
                    <CatIcon className="w-3 h-3" />
                    {WARNING_TYPE_LABELS[task.category]}
                  </span>
                )}
                {overdue && <span className="badge-severity-critical">已逾期 {-days}天</span>}
                <span
                  className={cn(
                    "badge",
                    task.status === "DONE"
                      ? "badge-success"
                      : task.status === "REJECTED"
                      ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200"
                      : "badge-info"
                  )}
                >
                  {RECTIFICATION_STATUS_LABELS[task.status]}
                </span>
              </div>
              <h2 className="font-display text-2xl text-navy-700 tracking-tight leading-snug">
                {task.title}
              </h2>
              <div className="text-xs text-slate-500 mt-2 flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <History className="w-3 h-3" />
                  下发时间 {formatDateTime(task.createdAt)}
                </span>
                <span className="text-slate-300">·</span>
                <span className={cn("inline-flex items-center gap-1 font-medium", overdue ? "text-red-600" : "text-slate-600")}>
                  <Calendar className="w-3 h-3" />
                  截止 {formatDate(task.deadline)}
                </span>
              </div>
            </div>
            <button className="btn-ghost p-2" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
                <User className="w-3 h-3" />
                责任人
              </div>
              <div className="text-sm font-semibold text-slate-800">{task.assigneeName}</div>
              <div className="text-[11px] text-slate-500">{getTitleName(task.assigneeTitle)}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                所属科室
              </div>
              <div className="text-sm font-semibold text-slate-800 max-w-[120px] truncate">
                {task.departmentName}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
                <Send className="w-3 h-3" />
                下发人
              </div>
              <div className="text-sm font-semibold text-slate-800">{task.creatorName}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                关联模板
              </div>
              <div className="text-sm font-semibold text-teal-700">
                {tpl ? `#${task.templateId?.slice(-3)}` : "无"}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-navy-600" />
              <h3 className="font-semibold text-slate-800">整改要求</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {task.description}
            </p>
          </div>

          {tpl && (
            <div className="card p-5 bg-teal-50/30 border-l-4 border-l-teal-500">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-teal-700" />
                <h3 className="font-semibold text-slate-800">套用干预模板</h3>
                <span className="text-[11px] text-teal-700 font-medium bg-teal-100 px-2 py-0.5 rounded-md">
                  {tpl.title}
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    标准干预话术
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-teal-100/60">
                    {tpl.standardText}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    整改建议
                  </div>
                  <div className="text-sm text-teal-800 leading-relaxed bg-teal-100/40 p-3 rounded-lg">
                    💡 {tpl.suggestion}
                  </div>
                </div>
              </div>
            </div>
          )}

          {task.feedback && (
            <div className="card p-5 border-l-4 border-l-amber-400">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <h3 className="font-semibold text-slate-800">整改反馈</h3>
                </div>
                <div className="text-[11px] text-slate-500">
                  {task.assigneeName} · {formatDateTime(task.feedbackAt!)}
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {task.feedback}
              </p>
            </div>
          )}

          {task.reviewOpinion && (
            <div
              className={cn(
                "card p-5 border-l-4",
                task.status === "DONE" ? "border-l-emerald-500" : "border-l-red-400"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {task.status === "DONE" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <h3 className="font-semibold text-slate-800">
                    {task.status === "DONE" ? "审核通过" : "审核退回"}
                  </h3>
                </div>
                <div className="text-[11px] text-slate-500">
                  {task.reviewedBy} · {formatDateTime(task.reviewedAt!)}
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{task.reviewOpinion}</p>
            </div>
          )}

          {task.status === "REVIEWING" && (
            <div className="card p-5 border border-teal-200 bg-gradient-to-br from-teal-50/40 to-white">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-teal-700" />
                <h3 className="font-semibold text-slate-800">审核该整改反馈</h3>
              </div>
              <textarea
                value={reviewOpinion}
                onChange={(e) => setReviewOpinion(e.target.value)}
                className="form-textarea"
                placeholder="请填写审核意见，如整改是否到位、数据是否真实、是否同意结案..."
              />
              <div className="mt-4 flex items-center justify-end gap-2">
                <button className="btn btn-danger" onClick={() => handleReview("REJECTED")}>
                  <XCircle className="w-4 h-4" />
                  退回修改
                </button>
                <button className="btn btn-success" onClick={() => handleReview("APPROVED")}>
                  <CheckCircle2 className="w-4 h-4" />
                  审核通过，结案归档
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function RectificationPage() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [tab, setTab] = useState<"ALL" | RectificationStatus>("ALL");
  const [dept, setDept] = useState<string>("ALL");
  const [category, setCategory] = useState<WarningType | "ALL" | "GENERAL">("ALL");
  const [keyword, setKeyword] = useState("");
  const [openTask, setOpenTask] = useState<RectificationTask | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const consumeTarget = useNavStore((s) => s.consumeTarget);
  const tasks = useDataStore((s) => s.tasks);

  useEffect(() => {
    const id = consumeTarget("/rectification");
    if (id) {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        setOpenTask(task);
      }
    }
  }, []);

  const [newDept, setNewDept] = useState(DEPARTMENTS[0].id);
  const [newAssignee, setNewAssignee] = useState("");
  const [newType, setNewType] = useState<WarningType | "GENERAL">("OVER_GRADE");
  const [newPriority, setNewPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("HIGH");
  const [newDeadline, setNewDeadline] = useState(dayjs().add(7, "day").format("YYYY-MM-DD"));
  const [newTemplate, setNewTemplate] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const addTask = useDataStore((s) => s.addTask);

  const availableDoctors = useMemo(() => {
    return ALL_DOCTORS.filter((d) => d.departmentId === newDept);
  }, [newDept]);

  const stats = useMemo(() => getRectificationStats(tasks), [tasks]);
  const byStatusCount = useMemo(() => {
    const r: Record<string, number> = {};
    tasks.forEach((t) => (r[t.status] = (r[t.status] || 0) + 1));
    return r;
  }, [tasks]);

  const tabs = [
    { key: "ALL" as const, label: "全部", count: tasks.length },
    ...STATUSES.map((s) => ({ key: s.key, label: s.label, count: byStatusCount[s.key] || 0 })),
  ];

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (tab !== "ALL" && t.status !== tab) return false;
      if (dept !== "ALL" && t.departmentName !== DEPARTMENTS.find((d) => d.id === dept)?.name)
        return false;
      if (category !== "ALL" && t.category !== category) return false;
      if (keyword) {
        const k = keyword.toLowerCase();
        return (
          t.title.toLowerCase().includes(k) ||
          t.assigneeName.toLowerCase().includes(k) ||
          t.departmentName.toLowerCase().includes(k) ||
          t.creatorName.toLowerCase().includes(k)
        );
      }
      return true;
    }).sort((a, b) => {
      const pr = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      if (pr[a.priority] !== pr[b.priority]) return pr[a.priority] - pr[b.priority];
      return a.deadline.localeCompare(b.deadline);
    });
  }, [tasks, tab, dept, category, keyword]);

  const handleSubmitNewTask = () => {
    if (!newTitle.trim()) {
      alert("请填写整改任务标题");
      return;
    }
    if (!newDescription.trim()) {
      alert("请填写详细整改要求");
      return;
    }
    if (!newAssignee) {
      alert("请选择责任人");
      return;
    }

    const deptObj = DEPARTMENTS.find((d) => d.id === newDept);
    const doctor = ALL_DOCTORS.find((d) => d.name === newAssignee);
    addTask({
      title: newTitle,
      description: newDescription,
      category: newType,
      priority: newPriority,
      deadline: newDeadline,
      assigneeName: newAssignee,
      assigneeTitle: doctor?.title || "ATTENDING",
      departmentName: deptObj?.name || newDept,
      templateId: newTemplate || undefined,
    });

    useUserStore.getState().refreshTodos();
    useDashboardStore.getState().refreshStats();

    setShowNewModal(false);
    setNewTitle("");
    setNewDescription("");
    setNewTemplate("");
  };

  const handleTemplateSelect = (tplId: string) => {
    setNewTemplate(tplId);
    const tpl = INTERVENTION_TEMPLATES.find((t) => t.id === tplId);
    if (tpl) {
      setNewType(tpl.category);
      if (!newTitle.trim()) {
        setNewTitle(tpl.title);
      }
      if (!newDescription.trim()) {
        setNewDescription(`${tpl.standardText}\n\n整改建议：${tpl.suggestion}`);
      }
    }
  };

  return (
    <div className="space-y-5">
      <StatsPanel />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="tab-list">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={cn("tab-item inline-flex items-center gap-1.5", tab === t.key && "tab-item-active")}
              >
                {t.label}
                <span className={cn("data-number text-[11px] px-1.5 py-0.5 rounded", tab === t.key ? "bg-navy-500/10 text-navy-700" : "bg-white/60 text-slate-400")}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-border mx-1" />
          <div className="inline-flex p-1 rounded-lg bg-slate-100">
            <button
              onClick={() => setView("kanban")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                view === "kanban" ? "bg-white text-navy-700 shadow-sm" : "text-slate-500"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              看板
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                view === "list" ? "bg-white text-navy-700 shadow-sm" : "text-slate-500"
              )}
            >
              <List className="w-4 h-4" />
              列表
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索任务/责任人..."
              className="form-input w-56 pl-9"
            />
          </div>
          <select value={dept} onChange={(e) => setDept(e.target.value)} className="form-select w-40 text-sm">
            <option value="ALL">全部科室</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.shortName}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="form-select w-40 text-sm"
          >
            <option value="ALL">全部类型</option>
            {(Object.keys(WARNING_TYPE_LABELS) as WarningType[]).map((w) => (
              <option key={w} value={w}>
                {WARNING_TYPE_LABELS[w]}
              </option>
            ))}
            <option value="GENERAL">综合</option>
          </select>
          <div className="h-8 w-px bg-border mx-1" />
          <button onClick={() => setShowNewModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            下发整改任务
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="col-span-3">
          {view === "kanban" ? (
            <KanbanView tasks={filtered} onOpen={(t) => setOpenTask(t)} />
          ) : (
            <ListView tasks={filtered} onOpen={(t) => setOpenTask(t)} />
          )}
        </div>
        <TemplateLibrary />
      </div>

      <TaskDetailDrawer task={openTask} onClose={() => setOpenTask(null)} />

      {showNewModal && (
        <>
          <div
            className="fixed inset-0 bg-navy-700/30 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setShowNewModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-gradient-to-r from-teal-50/60 to-transparent">
                <div>
                  <h2 className="font-display text-2xl text-navy-700">下发整改任务</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    可选择干预模板快速生成任务内容
                  </p>
                </div>
                <button className="btn-ghost p-2" onClick={() => setShowNewModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">所属科室</label>
                    <select
                      className="form-select"
                      value={newDept}
                      onChange={(e) => {
                        setNewDept(e.target.value);
                        setNewAssignee("");
                      }}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">责任人</label>
                    <select
                      className="form-select"
                      value={newAssignee}
                      onChange={(e) => setNewAssignee(e.target.value)}
                    >
                      <option value="">请选择责任人...</option>
                      {availableDoctors.map((d) => (
                        <option key={d.id} value={d.name}>{d.name} · {getTitleName(d.title)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">整改类型</label>
                    <select
                      className="form-select"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as WarningType | "GENERAL")}
                    >
                      {(Object.keys(WARNING_TYPE_LABELS) as WarningType[]).map((w) => (
                        <option key={w} value={w}>{WARNING_TYPE_LABELS[w]}</option>
                      ))}
                      <option value="GENERAL">综合整改</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">优先级</label>
                    <select
                      className="form-select"
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
                    >
                      <option value="HIGH">高</option>
                      <option value="MEDIUM">中</option>
                      <option value="LOW">低</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">截止日期</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">套用干预模板</label>
                    <select
                      className="form-select"
                      value={newTemplate}
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                    >
                      <option value="">不使用模板</option>
                      {INTERVENTION_TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">整改任务标题</label>
                  <input
                    className="form-input"
                    placeholder="简明扼要描述整改问题..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">详细整改要求</label>
                  <textarea
                    className="form-textarea min-h-[140px]"
                    placeholder="请描述具体问题、整改要求、数据指标等..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border bg-slate-50/50 flex items-center justify-end gap-2">
                <button className="btn-secondary" onClick={() => setShowNewModal(false)}>
                  取消
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSubmitNewTask}
                >
                  <Send className="w-4 h-4" />
                  下发整改通知
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
