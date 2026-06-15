import { useState, useMemo, useEffect } from "react";
import {
  ClipboardCheck,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  User,
  FileText,
  Pill,
  AlarmClock,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Zap,
  Clock4,
  Stethoscope,
  Building2,
  Send,
  RefreshCw,
  Info,
  X,
  History,
  Tag,
  Shield,
} from "lucide-react";
import type { ApprovalRequest, ApprovalStatus, AuditLog, AuditActionType } from "@/types";
import { useDataStore } from "@/store/dataStore";
import { useUserStore, useDashboardStore } from "@/store/appStore";
import { useNavStore } from "@/store/navStore";
import { cn, formatDateTime, formatDrugCategory, formatPriority, getDaysRemaining, formatTimeAgo } from "@/utils/format";
import { DRUG_CATEGORY_LABELS, APPROVAL_STATUS_LABELS, AUDIT_ACTION_LABELS, AUDIT_ACTION_COLORS, AUDIT_RESULT_LABELS } from "@/utils/constants";
import { getTitleName } from "@/data/users";

const TABS: Array<{ key: "ALL" | ApprovalStatus; label: string; count?: number }> = [
  { key: "ALL", label: "全部" },
  { key: "PENDING", label: "待我审批" },
  { key: "IN_PROGRESS", label: "审批中" },
  { key: "APPROVED", label: "已通过" },
  { key: "REJECTED", label: "已驳回" },
];

const AUDIT_ACTION_ICONS: Record<AuditActionType, React.ComponentType<{ className?: string }>> = {
  APPROVAL_REVIEWED: ClipboardCheck,
  WARNING_HANDLED: Pill,
  PERMISSION_CHANGED: Shield,
  RECTIFICATION_REVIEWED: CheckCircle2,
  RECTIFICATION_CREATED: RefreshCw,
  DRUG_ADDED: FileText,
  DRUG_UPDATED: RefreshCw,
  DRUG_DELETED: XCircle,
  DRUG_BATCH_UPDATED: Zap,
};

const AUDIT_RESULT_COLORS: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  HANDLED: "bg-teal-50 text-teal-700 ring-teal-200",
  DISMISSED: "bg-slate-50 text-slate-600 ring-slate-200",
  DONE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

function StatusBadge({ s, urgent }: { s: ApprovalStatus; urgent?: boolean }) {
  const cls =
    s === "APPROVED"
      ? "badge-success"
      : s === "REJECTED"
      ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 badge"
      : s === "IN_PROGRESS"
      ? "badge-info"
      : "badge-warning";
  return (
    <span className="inline-flex items-center gap-1">
      {urgent && <Zap className="w-3 h-3 text-red-500" />}
      <span className={cls}>{APPROVAL_STATUS_LABELS[s]}</span>
    </span>
  );
}

function ApprovalTimeline({ req }: { req: ApprovalRequest }) {
  const steps = [
    { key: "FIRST", label: "科室主任初审" },
    { key: "SECOND", label: "感染/药学复审" },
    { key: "FINAL", label: "负责人终审" },
  ];
  return (
    <div className="space-y-4">
      {steps.map((s, i) => {
        const step = req.steps.find((x) => x.stepType === s.key);
        const done = step?.result === "APPROVED";
        const rejected = step?.result === "REJECTED";
        const active = req.currentStep > i || (req.currentStep === i && !step);
        return (
          <div key={s.key} className="timeline-step">
            <div
              className={cn(
                "timeline-dot ring-4",
                done
                  ? "bg-emerald-500 ring-emerald-100 text-white"
                  : rejected
                  ? "bg-red-500 ring-red-100 text-white"
                  : active
                  ? "bg-amber-400 ring-amber-100 text-white animate-pulse"
                  : "bg-slate-200 ring-slate-50 text-slate-400"
              )}
            >
              {done ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : rejected ? (
                <XCircle className="w-3 h-3" />
              ) : active ? (
                <Clock className="w-3 h-3" />
              ) : (
                <span className="text-[10px] font-bold">{i + 1}</span>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-800">{s.label}</div>
                {step?.signedAt && (
                  <div className="text-xs text-slate-400 font-mono tabular-nums">
                    {formatDateTime(step.signedAt).slice(5)}
                  </div>
                )}
              </div>
              {step ? (
                <div className="mt-1.5">
                  <div className="text-xs text-slate-500 mb-1.5">
                    {step.approverName} · {getTitleName(step.approverTitle)}
                  </div>
                  <div
                    className={cn(
                      "text-sm leading-relaxed p-3 rounded-lg",
                      rejected ? "bg-red-50 text-red-700" : "bg-slate-50 text-slate-600"
                    )}
                  >
                    {step.opinion}
                  </div>
                </div>
              ) : active ? (
                <div className="mt-1 text-xs text-amber-700 inline-flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md">
                  <Clock4 className="w-3 h-3" />
                  正在等待处理
                </div>
              ) : (
                <div className="mt-1 text-xs text-slate-400">尚未到达此节点</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DetailPanel({
  req,
  onClose,
  onOpenAudit,
}: {
  req: ApprovalRequest | null;
  onClose: () => void;
  onOpenAudit: () => void;
}) {
  const [opinion, setOpinion] = useState("");
  const [result, setResult] = useState<"APPROVED" | "REJECTED" | null>(null);
  const processApproval = useDataStore((s) => s.processApproval);
  const approvals = useDataStore((s) => s.approvals);

  const currentReq = req ? approvals.find((a) => a.id === req.id) || req : null;

  if (!currentReq) return null;

  const isMyTurn =
    currentReq.status === "PENDING" ||
    (currentReq.status === "IN_PROGRESS" && (currentReq.currentStep === 1 || currentReq.currentStep === 2));

  const days = currentReq.deadline ? getDaysRemaining(currentReq.deadline) : null;
  const overdue = days !== null && days < 0;

  const handleSubmit = () => {
    if (!result || !opinion || !currentReq) return;
    processApproval(currentReq.id, result, opinion);
    useUserStore.getState().refreshTodos();
    useDashboardStore.getState().refreshStats();
    setResult(null);
    setOpinion("");
  };

  return (
    <>
      <div className="fixed inset-0 bg-navy-700/20 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-4 left-auto w-[860px] max-w-[95vw] bg-white z-50 shadow-2xl rounded-2xl overflow-hidden animate-slide-in-right flex flex-col">
        <header
          className={cn(
            "px-6 py-4 border-b border-border shrink-0",
            currentReq.isUrgent && "bg-gradient-to-r from-red-50 via-amber-50/40 to-transparent"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge s={currentReq.status} urgent={currentReq.isUrgent} />
                {currentReq.drugCategory === "SPECIAL" && (
                  <span className="badge-drug-special">特殊级药物</span>
                )}
                {currentReq.drugCategory === "RESTRICTED" && (
                  <span className="badge-drug-restricted">限制级药物</span>
                )}
                {currentReq.isUrgent && (
                  <span className="badge-severity-critical inline-flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    紧急绿色通道
                  </span>
                )}
              </div>
              <h2 className="font-display text-2xl text-navy-700 tracking-tight mt-2.5">
                {currentReq.patientName} · {currentReq.drugName}
              </h2>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>
                  <span className="inline-flex items-center gap-1">
                    <ClipboardCheck className="w-3 h-3" />
                    申请单号 {currentReq.id.toUpperCase()}
                  </span>
                </span>
                <span className="text-slate-300">·</span>
                <span>
                  {formatTimeAgo(currentReq.createdAt)}申请 · {formatDateTime(currentReq.createdAt)}
                </span>
                {currentReq.deadline && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-medium",
                        overdue
                          ? "text-red-600"
                          : days! <= 1
                          ? "text-amber-600"
                          : "text-slate-500"
                      )}
                    >
                      <AlarmClock className="w-3 h-3" />
                      {overdue ? `已逾期${-days!}小时` : `剩余${Math.ceil((days! * 24) % 24 || 24)}小时`}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="btn-outline btn-sm inline-flex items-center gap-1"
                onClick={onOpenAudit}
              >
                <History className="w-3.5 h-3.5" />
                查看操作追溯
              </button>
              <button className="btn-ghost p-2" onClick={onClose}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-[320px,1fr] gap-6 p-6">
            <aside className="space-y-4">
              <div className="card p-5 bg-gradient-to-br from-slate-50 to-teal-50/40 border-slate-200/60">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <User className="w-3.5 h-3.5" />
                  患者信息
                </div>
                <div className="text-xl font-bold text-navy-700">{currentReq.patientName}</div>
                <div className="text-sm text-slate-600 mt-0.5">
                  {currentReq.patientGender === "M" ? "男" : "女"} · {currentReq.patientAge}岁
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200/60">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                    临床诊断
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed">
                    {currentReq.patientDiagnosis}
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <Building2 className="w-3.5 h-3.5" />
                  申请方
                </div>
                <div className="text-sm font-medium text-slate-800">{currentReq.applicantName}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {getTitleName(currentReq.applicantTitle)} · {currentReq.departmentName}
                </div>
              </div>

              <div className="card p-5 border-l-4 border-l-amber-400">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <Pill className="w-3.5 h-3.5" />
                  申请用药方案
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500">药品</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {currentReq.drugName}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500">规格</span>
                    <span className="text-xs text-slate-600">{currentReq.drugSpecification}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500">剂量</span>
                    <span className="text-sm text-slate-700 font-mono">{currentReq.proposedDosage}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500">疗程</span>
                    <span className="text-sm text-slate-700">{currentReq.proposedDuration} 天</span>
                  </div>
                </div>
              </div>

              {currentReq.validHours && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/60">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    已授权
                  </div>
                  <div className="text-xs text-emerald-600">
                    授权时长 {currentReq.validHours} 小时，到期自动收回权限
                  </div>
                </div>
              )}
            </aside>

            <section className="space-y-6">
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <h3 className="font-display text-lg text-slate-800">申请理由</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {currentReq.reason}
                </p>
              </div>

              <div className="card p-5 bg-slate-50/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-navy-600" />
                    <h3 className="font-display text-lg text-slate-800">审批流程</h3>
                  </div>
                  {isMyTurn && (
                    <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md inline-flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      当前节点待您审批
                    </span>
                  )}
                </div>
                <ApprovalTimeline req={currentReq} />
              </div>

              {isMyTurn && (
                <div className="card p-5 border border-teal-200 bg-gradient-to-br from-teal-50/40 to-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-4 h-4 text-teal-700" />
                    <h3 className="font-display text-lg text-slate-800">填写审批意见</h3>
                  </div>
                  <textarea
                    value={opinion}
                    onChange={(e) => setOpinion(e.target.value)}
                    className="form-textarea"
                    placeholder="请填写详细的审批意见，包括用药建议、监测要求、授权时限等..."
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">推荐模板：</span>
                      {["同意，授权72小时，需监测TDM", "建议降级用药，请补充培养结果", "请先完善PCT/病原学检测"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setOpinion(t)}
                          className="filter-chip !text-[11px]"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setResult("REJECTED")}
                        className={cn(
                          "btn",
                          result === "REJECTED"
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "btn-outline border-red-300 text-red-700 hover:bg-red-50"
                        )}
                      >
                        <XCircle className="w-4 h-4" />
                        驳回申请
                      </button>
                      <button
                        onClick={() => setResult("APPROVED")}
                        className={cn(
                          "btn",
                          result === "APPROVED"
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "btn-primary"
                        )}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        通过审批
                      </button>
                    </div>
                  </div>
                  {result && opinion && (
                    <div className="mt-4 p-3 rounded-lg bg-navy-50 border border-navy-100 flex items-center justify-between animate-fade-in">
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-navy-700">
                          {result === "APPROVED" ? "将通过此申请" : "将驳回此申请"}
                        </span>
                        ，并记录审批意见及电子签名
                      </div>
                      <button className="btn-sm btn-primary" onClick={handleSubmit}>
                        <Send className="w-3.5 h-3.5" />
                        确认提交
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

function AuditTrailDrawer({
  open,
  onClose,
  approvalId,
  patientName,
}: {
  open: boolean;
  onClose: () => void;
  approvalId: string;
  patientName: string;
}) {
  const auditLogs = useDataStore((s) => s.auditLogs);

  const logs = useMemo(() => {
    return auditLogs
      .filter((log) => {
        if (log.targetId === approvalId) return true;
        if (log.extra?.patient === patientName) return true;
        return false;
      })
      .sort((a, b) => -a.createdAt.localeCompare(b.createdAt));
  }, [auditLogs, approvalId, patientName]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-navy-700/20 backdrop-blur-sm z-[60] animate-fade-in" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-[400px] bg-white z-[70] shadow-2xl overflow-y-auto animate-slide-in-right flex flex-col">
        <div className="sticky top-0 z-10 px-6 py-5 border-b border-border bg-white/90 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="pr-4">
              <div className="flex items-center gap-2 mb-1">
                <History className="w-4 h-4 text-navy-600" />
                <span className="text-xs text-slate-500">操作追溯台账</span>
              </div>
              <h2 className="font-display text-xl text-navy-700 tracking-tight">
                审批流程追溯台账
              </h2>
              <div className="text-xs text-slate-500 mt-1">
                患者：<span className="font-medium text-slate-700">{patientName}</span>
              </div>
            </div>
            <button className="btn-ghost p-2" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-5">
          {logs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">暂无操作记录</h3>
              <p className="text-sm text-slate-400">该审批申请暂无相关操作记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative pl-6">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200" />
                {logs.map((log, i) => {
                  const ActionIcon = AUDIT_ACTION_ICONS[log.actionType];
                  return (
                    <div key={log.id} className="relative pb-5 last:pb-0">
                      <div
                        className={cn(
                          "absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm",
                          AUDIT_ACTION_COLORS[log.actionType]
                        )}
                      >
                        <ActionIcon className="w-3 h-3" />
                      </div>
                      <div className="card p-4 ml-2">
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
                                AUDIT_RESULT_COLORS[log.result] ||
                                  "bg-slate-50 text-slate-600 ring-slate-200"
                              )}
                            >
                              {AUDIT_RESULT_LABELS[log.result] || log.result}
                            </span>
                          )}
                          {log.extra &&
                            Object.entries(log.extra).map(([k, v]) =>
                              v && k !== "patient" ? (
                                <span
                                  key={k}
                                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200"
                                >
                                  <Tag className="w-2.5 h-2.5" />
                                  {k === "count"
                                    ? `共${v}项`
                                    : k === "changedCount"
                                    ? `变更${v}项`
                                    : k === "step"
                                    ? v
                                    : k === "validHours"
                                    ? `有效期${v}h`
                                    : k === "deadline"
                                    ? `截止${v.slice(5)}`
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
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs">
                            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-navy-200 to-navy-400 flex items-center justify-center text-white text-[9px] font-semibold shrink-0">
                              {log.operatorName.slice(0, 1)}
                            </div>
                            <span className="font-medium text-slate-700">
                              {log.operatorName}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono tabular-nums shrink-0">
                            {formatDateTime(log.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function ApprovalPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("PENDING");
  const [keyword, setKeyword] = useState("");
  const [detail, setDetail] = useState<ApprovalRequest | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const approvals = useDataStore((s) => s.approvals);
  const consumeTarget = useNavStore((s) => s.consumeTarget);

  useEffect(() => {
    const id = consumeTarget("/approval");
    if (id) {
      const req = approvals.find((a) => a.id === id);
      if (req) {
        setDetail(req);
      }
    }
  }, []);

  const tabsWithCount = useMemo(
    () =>
      TABS.map((t) => ({
        ...t,
        count:
          t.key === "ALL"
            ? approvals.length
            : approvals.filter((a) => a.status === t.key).length,
      })),
    [approvals]
  );

  const requests = useMemo(() => {
    return approvals.filter((a) => {
      if (tab !== "ALL" && a.status !== tab) return false;
      if (keyword) {
        const k = keyword.toLowerCase();
        return (
          a.patientName.toLowerCase().includes(k) ||
          a.applicantName.toLowerCase().includes(k) ||
          a.drugName.toLowerCase().includes(k) ||
          a.departmentName.toLowerCase().includes(k)
        );
      }
      return true;
    }).sort((a, b) => {
      if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
      return -a.createdAt.localeCompare(b.createdAt);
    });
  }, [tab, keyword, approvals]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="tab-list">
          {tabsWithCount.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn("tab-item inline-flex items-center gap-2", tab === t.key && "tab-item-active")}
            >
              {t.label}
              <span
                className={cn(
                  "data-number text-[11px] px-1.5 py-0.5 rounded",
                  tab === t.key
                    ? t.key === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : t.key === "APPROVED"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-navy-500/10 text-navy-700"
                    : "bg-white/60 text-slate-400"
                )}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索患者/医生/药品/科室..."
              className="form-input w-72 pl-9"
            />
          </div>
          <button className="btn-outline">
            <Filter className="w-4 h-4" />
            高级筛选
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="pl-5">优先级</th>
                <th>患者</th>
                <th>申请药品</th>
                <th>诊断</th>
                <th>申请人</th>
                <th>审批进度</th>
                <th>申请时间</th>
                <th>状态</th>
                <th className="pr-5 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((a, i) => {
                const stepsDone = a.steps.filter((s) => s.result).length;
                return (
                  <tr
                    key={a.id}
                    onClick={() => setDetail(a)}
                    className={cn(
                      "cursor-pointer group",
                      a.isUrgent && i < 3 && "bg-red-50/30 hover:bg-red-50/50!"
                    )}
                  >
                    <td className="pl-5">
                      {a.isUrgent ? (
                        <span className="badge-severity-critical inline-flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          紧急
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">常规</span>
                      )}
                    </td>
                    <td>
                      <div className="text-sm font-medium text-slate-800 group-hover:text-navy-700">
                        {a.patientName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {a.patientGender === "M" ? "男" : "女"} · {a.patientAge}岁
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            a.drugCategory === "SPECIAL"
                              ? "bg-red-100"
                              : "bg-amber-100"
                          )}
                        >
                          <Pill
                            className={cn(
                              "w-4 h-4",
                              a.drugCategory === "SPECIAL" ? "text-red-600" : "text-amber-600"
                            )}
                          />
                        </div>
                        <div>
                          <div className="text-sm text-slate-800 font-medium max-w-[160px] truncate">
                            {a.drugName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {formatDrugCategory(a.drugCategory)} · {a.proposedDuration}天
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-slate-700 max-w-[200px] line-clamp-1">
                        {a.patientDiagnosis}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-slate-800">{a.applicantName}</div>
                      <div className="text-[11px] text-slate-500">{a.departmentName}</div>
                    </td>
                    <td>
                      <div className="w-24">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span>进度</span>
                          <span className="font-mono">{stepsDone}/3</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              a.status === "REJECTED"
                                ? "bg-red-500"
                                : stepsDone === 3
                                ? "bg-emerald-500"
                                : "bg-gradient-to-r from-teal-400 to-teal-600"
                            )}
                            style={{ width: `${(stepsDone / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs font-mono tabular-nums text-slate-700">
                        {a.createdAt.slice(5, 16)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatTimeAgo(a.createdAt)}
                      </div>
                    </td>
                    <td>
                      <StatusBadge s={a.status} urgent={a.isUrgent} />
                    </td>
                    <td className="pr-5 text-right">
                      <button className="btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        审批
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {requests.length === 0 && (
          <div className="py-24 text-center">
            <div className="text-5xl mb-3">📋</div>
            <div className="text-sm text-slate-500">暂无审批记录</div>
          </div>
        )}
      </div>

      <DetailPanel req={detail} onClose={() => setDetail(null)} onOpenAudit={() => setAuditOpen(true)} />
      <AuditTrailDrawer
        open={auditOpen && detail !== null}
        onClose={() => setAuditOpen(false)}
        approvalId={detail?.id || ""}
        patientName={detail?.patientName || ""}
      />
    </div>
  );
}
