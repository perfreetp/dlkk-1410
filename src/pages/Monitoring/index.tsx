import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  AlertTriangle,
  ShieldOff,
  Clock4,
  Repeat,
  BrainCircuit,
  ArrowUpDown,
  ChevronRight,
  Ban,
  Undo2,
  UsersRound,
  FileText,
  Send,
  Sparkles,
  CheckCircle2,
  Eye,
  Calendar,
} from "lucide-react";
import type { PrescriptionWarning, WarningType, Severity } from "@/types";
import { usePresStore, getFilteredWarnings } from "@/store/presStore";
import { useDataStore } from "@/store/dataStore";
import { useUserStore, useDashboardStore } from "@/store/appStore";
import { useNavStore } from "@/store/navStore";
import { DEPARTMENTS } from "@/data/users";
import { cn, formatDateTime, formatTimeAgo, formatSeverity, formatWarningType } from "@/utils/format";
import { WARNING_TYPE_LABELS, SEVERITY_LABELS } from "@/utils/constants";
import { INTERVENTION_TEMPLATES } from "@/data/analytics";

const WARN_ICONS: Record<WarningType, React.ComponentType<{ className?: string }>> = {
  OVER_GRADE: ShieldOff,
  OVER_DURATION: Clock4,
  DUPLICATE: Repeat,
  NO_INDICATION: BrainCircuit,
};

function TypeBadge({ t }: { t: WarningType }) {
  const Icon = WARN_ICONS[t];
  const cls =
    t === "OVER_GRADE"
      ? "badge-severity-high"
      : t === "OVER_DURATION"
      ? "badge-severity-medium"
      : t === "DUPLICATE"
      ? "badge-severity-medium"
      : "badge-severity-critical";
  return (
    <span className={cn(cls, "gap-1")}>
      <Icon className="w-3 h-3" />
      {formatWarningType(t)}
    </span>
  );
}

function SeverityPill({ s }: { s: Severity }) {
  const cls =
    s === "CRITICAL"
      ? "badge-severity-critical"
      : s === "HIGH"
      ? "badge-severity-high"
      : s === "MEDIUM"
      ? "badge-severity-medium"
      : "badge-severity-low";
  return <span className={cls}>{formatSeverity(s)}风险</span>;
}

function FiltersPanel({
  onClose,
}: {
  onClose?: () => void;
}) {
  const { filters, setFilters, resetFilters } = usePresStore();
  const warnings = useDataStore((s) => s.warnings);

  const TypeChip = ({ t, label }: { t: WarningType; label: string }) => {
    const active = filters.warningTypes.includes(t);
    return (
      <button
        onClick={() =>
          setFilters({
            warningTypes: active
              ? filters.warningTypes.filter((x) => x !== t)
              : [...filters.warningTypes, t],
          })
        }
        className={cn("filter-chip", active && "filter-chip-active")}
      >
        {label}
        <span className="data-number text-[10px] opacity-70">
          {warnings.filter((w) => w.warningType === t).length}
        </span>
      </button>
    );
  };

  const SevChip = ({ s, label }: { s: Severity; label: string }) => {
    const active = filters.severities.includes(s);
    const colors: Record<Severity, string> = {
      CRITICAL: "!bg-red-50 !border-red-300 !text-red-700",
      HIGH: "!bg-orange-50 !border-orange-300 !text-orange-700",
      MEDIUM: "!bg-amber-50 !border-amber-300 !text-amber-700",
      LOW: "!bg-blue-50 !border-blue-300 !text-blue-700",
    };
    return (
      <button
        onClick={() =>
          setFilters({
            severities: active ? filters.severities.filter((x) => x !== s) : [...filters.severities, s],
          })
        }
        className={cn("filter-chip", active && colors[s])}
      >
        {label}
      </button>
    );
  };

  const StatusChip = ({ s, label }: { s: "PENDING" | "HANDLED" | "DISMISSED"; label: string }) => {
    const active = filters.statuses.includes(s);
    return (
      <button
        onClick={() =>
          setFilters({
            statuses: active ? filters.statuses.filter((x) => x !== s) : [...filters.statuses, s],
          })
        }
        className={cn("filter-chip", active && "filter-chip-active")}
      >
        {label}
      </button>
    );
  };

  const Depts = DEPARTMENTS.slice(0, 8);

  return (
    <div className="card p-5 sticky top-4 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-navy-700 flex items-center gap-1.5">
          <Filter className="w-4 h-4" />
          筛选条件
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={resetFilters}
            className="text-xs text-slate-500 hover:text-teal-600"
          >
            重置
          </button>
          {onClose && (
            <button className="btn-ghost p-1" onClick={onClose}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="form-label">关键词搜索</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.keyword}
            onChange={(e) => setFilters({ keyword: e.target.value })}
            placeholder="患者/医生/药品..."
            className="form-input pl-9"
          />
        </div>
      </div>

      <div>
        <label className="form-label">预警类型</label>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(WARNING_TYPE_LABELS) as WarningType[]).map((t) => (
            <TypeChip key={t} t={t} label={WARNING_TYPE_LABELS[t]} />
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">严重等级</label>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(SEVERITY_LABELS) as Severity[]).map((s) => (
            <SevChip key={s} s={s} label={SEVERITY_LABELS[s]} />
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">处理状态</label>
        <div className="flex flex-wrap gap-1.5">
          <StatusChip s="PENDING" label="待处理" />
          <StatusChip s="HANDLED" label="已处理" />
          <StatusChip s="DISMISSED" label="已忽略" />
        </div>
      </div>

      <div>
        <label className="form-label mb-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            时间范围
          </div>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" className="form-input text-xs" />
          <input type="date" className="form-input text-xs" />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {["今日", "近3天", "近7天", "近30天"].map((t) => (
            <button key={t} className="filter-chip !px-2 !py-0.5 !text-[11px]">
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label mb-2">科室</label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-2 -mr-2">
          {Depts.map((d) => {
            const active = filters.departmentIds.includes(d.id);
            const count = warnings.filter((w) => w.departmentId === d.id).length;
            return (
              <label
                key={d.id}
                className={cn(
                  "flex items-center justify-between gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                  active ? "bg-teal-50" : "hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() =>
                      setFilters({
                        departmentIds: active
                          ? filters.departmentIds.filter((x) => x !== d.id)
                          : [...filters.departmentIds, d.id],
                      })
                    }
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-slate-700">{d.name}</span>
                </div>
                <span className="data-number text-xs text-slate-400">{count}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DetailDrawer({
  warning,
  onClose,
}: {
  warning: PrescriptionWarning | null;
  onClose: () => void;
}) {
  const [opinion, setOpinion] = useState("");
  const handle = usePresStore((s) => s.handleWarning);

  const handleAction = (id: string, action: "HANDLED" | "DISMISSED", opinionText: string) => {
    handle(id, action, opinionText);
    useUserStore.getState().refreshTodos();
    useDashboardStore.getState().refreshStats();
  };

  if (!warning) return null;

  const tpl = INTERVENTION_TEMPLATES.find(
    (t) => t.category === warning.warningType
  );

  return (
    <>
      <div className="fixed inset-0 bg-navy-700/20 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-[520px] bg-white z-50 shadow-2xl overflow-y-auto animate-slide-in-right flex flex-col">
        <div
          className={cn(
            "sticky top-0 z-10 px-6 py-5 border-b border-border",
            warning.severity === "CRITICAL"
              ? "bg-gradient-to-r from-red-50 via-red-50/60 to-transparent"
              : warning.severity === "HIGH"
              ? "bg-gradient-to-r from-orange-50 via-orange-50/60 to-transparent"
              : "bg-white/90 backdrop-blur"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="pr-4">
              <div className="flex items-center gap-2 mb-2">
                <TypeBadge t={warning.warningType} />
                <SeverityPill s={warning.severity} />
                {warning.status === "PENDING" && <span className="badge-pending">待处理</span>}
                {warning.status === "HANDLED" && <span className="badge-success">已处理</span>}
              </div>
              <h2 className="font-display text-xl text-navy-700 tracking-tight">
                {warning.description}
              </h2>
              <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                <Eye className="w-3 h-3" />
                处方号 <span className="data-number font-mono">{warning.prescriptionId}</span>
                <span className="text-slate-300">·</span>
                {formatTimeAgo(warning.createdAt)}触发
              </div>
            </div>
            <button className="btn-ghost p-2" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">患者信息</div>
              <div className="text-base font-semibold text-slate-800">
                {warning.patientName}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {warning.patientGender === "M" ? "男" : "女"} · {warning.patientAge}岁
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">开具医师</div>
              <div className="text-base font-semibold text-slate-800">
                {warning.doctorName}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{warning.departmentName}</div>
            </div>
          </div>

          <div className="card p-5">
            <div className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-600" />
              问题药品清单
            </div>
            <div className="space-y-2">
              {warning.drugs.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-red-50/50 border border-red-100/60"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">{d}</div>
                    <div className="text-[11px] text-slate-500">已触发规则匹配</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {tpl && warning.status === "PENDING" && (
            <div className="card p-5 border-l-4 border-l-teal-500 bg-teal-50/30">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800 mb-2">
                    AI 推荐干预模板
                    <span className="ml-2 text-xs font-normal text-teal-700">
                      （已使用 {tpl.useCount} 次）
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 leading-relaxed mb-2">
                    {tpl.standardText}
                  </div>
                  <div className="text-sm text-teal-700 leading-relaxed pt-2 border-t border-teal-100">
                    <strong>整改建议：</strong>
                    {tpl.suggestion}
                  </div>
                  <button
                    onClick={() => setOpinion(`${tpl.standardText}\n\n${tpl.suggestion}`)}
                    className="mt-3 btn-primary btn-sm"
                  >
                    应用此模板
                  </button>
                </div>
              </div>
            </div>
          )}

          {warning.status !== "PENDING" && (
            <div className="card p-5 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div className="text-sm font-semibold text-slate-800">处理记录</div>
              </div>
              <div className="text-xs text-slate-500 mb-2">
                {warning.handler} · {formatDateTime(warning.handledAt!)}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {warning.handleOpinion}
              </p>
            </div>
          )}

          {warning.status === "PENDING" && (
            <div className="space-y-3">
              <label className="form-label">处理意见</label>
              <textarea
                value={opinion}
                onChange={(e) => setOpinion(e.target.value)}
                className="form-textarea"
                placeholder="请输入处理意见，或从上方选择AI推荐模板..."
              />
            </div>
          )}
        </div>

        {warning.status === "PENDING" && (
          <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-border p-4 flex items-center gap-2">
            <button
              onClick={() => {
                handleAction(warning.id, "DISMISSED", opinion || "经核查，临床用药合理，予以放行。");
                onClose();
              }}
              className="btn-outline flex-1"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              放行
            </button>
            <button
              onClick={() => {
                handleAction(warning.id, "HANDLED", opinion || "已发会诊申请，等待审批。");
                onClose();
              }}
              className="btn-secondary flex-1"
            >
              <UsersRound className="w-4 h-4" />
              发会诊
            </button>
            <button
              onClick={() => {
                handleAction(warning.id, "HANDLED", opinion || "处方拦截，请修改后重新开具。");
                onClose();
              }}
              className="btn-danger flex-1"
            >
              <Ban className="w-4 h-4" />
              拦截退回
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function MonitoringPage() {
  const [sortBy, setSortBy] = useState<"time" | "severity">("time");
  const state = usePresStore();
  const warnings = useDataStore((s) => s.warnings);
  const [detail, setDetail] = useState<PrescriptionWarning | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const consumeTarget = useNavStore((s) => s.consumeTarget);

  useEffect(() => {
    const id = consumeTarget("/monitoring");
    if (id) {
      const warning = warnings.find((w) => w.id === id);
      if (warning) {
        setDetail(warning);
      }
    }
  }, []);

  const filteredWarnings = useMemo(() => {
    const arr = getFilteredWarnings(state);
    return arr.sort((a, b) => {
      if (sortBy === "severity") {
        const sev = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
        return sev.indexOf(a.severity) - sev.indexOf(b.severity);
      }
      return -a.createdAt.localeCompare(b.createdAt);
    });
  }, [state, sortBy, warnings]);

  const stats = useMemo(() => {
    const total = filteredWarnings.length;
    const byType: Record<string, number> = {};
    filteredWarnings.forEach((w) => {
      byType[w.warningType] = (byType[w.warningType] || 0) + 1;
    });
    return { total, byType, pending: filteredWarnings.filter((w) => w.status === "PENDING").length };
  }, [filteredWarnings]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn("btn-outline", showFilters && "bg-teal-50 border-teal-200 text-teal-700")}
          >
            <Filter className="w-4 h-4" />
            筛选器
          </button>
          <div className="h-6 w-px bg-border mx-1" />
          <button
            onClick={() => setSortBy(sortBy === "time" ? "severity" : "time")}
            className="btn-outline"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortBy === "time" ? "按触发时间" : "按严重等级"}
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {(Object.entries(stats.byType) as [WarningType, number][]).map(([t, c]) => {
            const Icon = WARN_ICONS[t];
            return (
              <div
                key={t}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border"
              >
                <Icon className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-600 text-xs">{WARNING_TYPE_LABELS[t]}</span>
                <span className="data-number font-bold text-navy-700 text-xs">{c}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-outline">
            <Undo2 className="w-4 h-4" />
            批量忽略
          </button>
          <button className="btn-outline">
            <Send className="w-4 h-4" />
            批量发整改
          </button>
          <button className="btn-primary">
            批量拦截
          </button>
        </div>
      </div>

      <div className={cn("grid gap-4", showFilters ? "grid-cols-[280px,1fr]" : "grid-cols-1")}>
        {showFilters && <FiltersPanel />}

        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-slate-50/40">
            <div className="text-sm">
              共 <span className="data-number font-bold text-navy-700">{stats.total}</span> 条
              {stats.pending > 0 && (
                <span className="ml-2 text-xs text-red-600 font-medium">
                  · 待处理 {stats.pending} 条
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-10 pl-5"></th>
                  <th>预警类型 / 描述</th>
                  <th>患者</th>
                  <th>医生 / 科室</th>
                  <th>问题药品</th>
                  <th>等级</th>
                  <th>触发时间</th>
                  <th>状态</th>
                  <th className="w-16 pr-5 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredWarnings.slice(0, 50).map((w, i) => {
                  const Icon = WARN_ICONS[w.warningType];
                  const isCrit = w.severity === "CRITICAL";
                  const isHigh = w.severity === "HIGH";
                  return (
                    <tr
                      key={w.id}
                      onClick={() => setDetail(w)}
                      className={cn(
                        isCrit && "critical-row animate-pulse-critical",
                        isHigh && !isCrit && "high-row",
                        i === 0 && isCrit && "animate-pulse-critical"
                      )}
                      style={{ animationIterationCount: isCrit ? 3 : undefined }}
                    >
                      <td className="pl-5">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            isCrit
                              ? "bg-red-100"
                              : isHigh
                              ? "bg-orange-100"
                              : w.severity === "MEDIUM"
                              ? "bg-amber-100"
                              : "bg-blue-100"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-4 h-4",
                              isCrit
                                ? "text-red-600"
                                : isHigh
                                ? "text-orange-600"
                                : w.severity === "MEDIUM"
                                ? "text-amber-600"
                                : "text-blue-600"
                            )}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="font-medium text-slate-800 text-sm leading-snug line-clamp-1 max-w-sm">
                          {w.description}
                        </div>
                        <div className="mt-1">
                          <TypeBadge t={w.warningType} />
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-slate-800 font-medium">{w.patientName}</div>
                        <div className="text-[11px] text-slate-500">
                          {w.patientGender === "M" ? "男" : "女"} · {w.patientAge}岁
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-slate-800">{w.doctorName}</div>
                        <div className="text-[11px] text-slate-500">{w.departmentName}</div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {w.drugs.slice(0, 2).map((d) => (
                            <span key={d} className="tag !bg-red-50 !text-red-700">
                              {d.length > 7 ? d.slice(0, 7) + "…" : d}
                            </span>
                          ))}
                          {w.drugs.length > 2 && (
                            <span className="tag">+{w.drugs.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <SeverityPill s={w.severity} />
                      </td>
                      <td>
                        <div className="text-xs text-slate-700 font-mono tabular-nums">
                          {w.createdAt.slice(5, 16)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {formatTimeAgo(w.createdAt)}
                        </div>
                      </td>
                      <td>
                        {w.status === "PENDING" && <span className="badge-pending">待处理</span>}
                        {w.status === "HANDLED" && <span className="badge-success">已处理</span>}
                        {w.status === "DISMISSED" && <span className="badge-info">已忽略</span>}
                      </td>
                      <td className="pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setDetail(w)}
                          className="btn-ghost p-1.5 -my-1"
                          title="查看详情"
                        >
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredWarnings.length === 0 && (
            <div className="py-24 text-center">
              <div className="text-5xl mb-3">✅</div>
              <div className="text-sm text-slate-500">当前筛选条件下暂无预警记录</div>
            </div>
          )}
        </div>
      </div>

      <DetailDrawer warning={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
