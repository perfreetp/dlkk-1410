import { useState, useMemo, useEffect } from "react";
import { ShieldCheck, Users, Building2, Search, ChevronDown, Info, RefreshCw, Check, AlertCircle, History, Shield, Tag, ClipboardCheck, Pill, Zap, XCircle, FileText, X, CheckCircle2 } from "lucide-react";
import { DEPARTMENTS, ALL_DOCTORS, getTitleName } from "@/data/users";
import type { DrugCategory, DoctorTitle, PermissionConfig, AuditLog, AuditActionType } from "@/types";
import { cn, formatDateTime } from "@/utils/format";
import { DRUG_CATEGORY_LABELS, DOCTOR_TITLE_LABELS, AUDIT_ACTION_LABELS, AUDIT_ACTION_COLORS, AUDIT_RESULT_LABELS } from "@/utils/constants";
import { useDataStore } from "@/store/dataStore";
import { useUserStore, useDashboardStore } from "@/store/appStore";

const TITLES: DoctorTitle[] = ["PROFESSOR", "ASSOCIATE_PROFESSOR", "ATTENDING", "RESIDENT"];
const CATEGORIES: DrugCategory[] = ["NON_RESTRICTED", "RESTRICTED", "SPECIAL"];
const CAT_SHORT: Record<DrugCategory, string> = { NON_RESTRICTED: "非", RESTRICTED: "限", SPECIAL: "特" };

const CAT_COLORS: Record<DrugCategory, string> = {
  NON_RESTRICTED: "bg-emerald-500",
  RESTRICTED: "bg-amber-500",
  SPECIAL: "bg-red-500",
};

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

function PermissionCell({
  cfg,
  category,
  onChange,
}: {
  cfg: PermissionConfig;
  category: DrugCategory;
  onChange: (next: DrugCategory[]) => void;
}) {
  const has = cfg.allowedCategory.includes(category);
  const alwaysAllowed = category === "NON_RESTRICTED";

  const canGrant = (() => {
    const idx = CATEGORIES.indexOf(category);
    for (let i = 0; i < idx; i++) {
      if (!cfg.allowedCategory.includes(CATEGORIES[i])) return false;
    }
    return true;
  })();

  return (
    <button
      disabled={alwaysAllowed || !canGrant}
      onClick={() => {
        if (has) {
          const idx = CATEGORIES.indexOf(category);
          const next = cfg.allowedCategory.filter((_, i) => i < idx);
          onChange(next);
        } else {
          const idx = CATEGORIES.indexOf(category);
          const nextSet = new Set(cfg.allowedCategory);
          for (let i = 0; i <= idx; i++) nextSet.add(CATEGORIES[i]);
          onChange([...CATEGORIES].filter((c) => nextSet.has(c)));
        }
      }}
      className={cn(
        "w-full h-full min-h-[52px] rounded-lg flex items-center justify-center transition-all text-xs font-semibold",
        has
          ? cn("text-white shadow-inner", CAT_COLORS[category], !alwaysAllowed && "hover:brightness-110")
          : "bg-slate-100 text-slate-400",
        !canGrant && !has && "cursor-not-allowed opacity-60",
        !alwaysAllowed && canGrant && "cursor-pointer hover:ring-2 hover:ring-teal-500/30"
      )}
      title={`${DRUG_CATEGORY_LABELS[category]} · ${has ? "已授权" : "未授权"}${alwaysAllowed ? " · 默认允许" : ""}`}
    >
      {has ? (
        <span className="inline-flex items-center gap-1">
          <Check className="w-3.5 h-3.5" />
          {CAT_SHORT[category]}
        </span>
      ) : (
        <span>—</span>
      )}
    </button>
  );
}

function MatrixMode({
  onOpenAudit,
}: {
  onOpenAudit: () => void;
}) {
  const storePermissions = useDataStore((s) => s.permissions);
  const savePermissions = useDataStore((s) => s.savePermissions);
  const resetPermissions = useDataStore((s) => s.resetPermissions);
  const [configs, setConfigs] = useState<PermissionConfig[]>(storePermissions);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setConfigs(storePermissions);
  }, [storePermissions]);

  const visibleDepts = useMemo(
    () => DEPARTMENTS.filter((d) => !search || d.name.includes(search) || d.shortName.includes(search)),
    [search]
  );

  const updateCfg = (deptId: string, title: DoctorTitle, allowed: DrugCategory[]) => {
    setConfigs((cs) =>
      cs.map((c) =>
        c.departmentId === deptId && c.title === title ? { ...c, allowedCategory: allowed, modifiedAt: formatDateTime(new Date()), modifiedBy: "王建国" } : c
      )
    );
  };

  const handleSave = () => {
    savePermissions(configs);
    useUserStore.getState().refreshTodos();
    useDashboardStore.getState().refreshStats();
  };

  const handleReset = () => {
    resetPermissions();
    setConfigs(useDataStore.getState().permissions);
    useUserStore.getState().refreshTodos();
    useDashboardStore.getState().refreshStats();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索科室..."
              className="form-input w-60 pl-9"
            />
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-border">
            <Info className="w-3.5 h-3.5" />
            点击色块可快速调整权限（必须从低到高逐级授权）
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4" />
            重置为默认
          </button>
          <button className="btn-outline" onClick={onOpenAudit}>
            <History className="w-4 h-4" />
            配置变更记录
          </button>
          <button className="btn-primary" onClick={handleSave}>保存权限配置</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table border-separate" style={{ borderSpacing: 0 }}>
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-slate-50 w-56 pl-5 border-b border-border">科室</th>
                <th className="w-32 border-b border-border">职称</th>
                {CATEGORIES.map((c) => (
                  <th key={c} className="w-32 border-b border-border text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <span className={cn("w-2 h-2 rounded-full", CAT_COLORS[c])} />
                      {DRUG_CATEGORY_LABELS[c]}
                    </div>
                  </th>
                ))}
                <th className="w-36 border-b border-border text-center">上次修改</th>
              </tr>
            </thead>
            <tbody>
              {visibleDepts.flatMap((dept, di) =>
                TITLES.map((title, ti) => {
                  const cfg = configs.find(
                    (c) => c.departmentId === dept.id && c.title === title
                  )!;
                  const isFirstOfDept = ti === 0;
                  return (
                    <tr key={`${dept.id}-${title}`} className={cn(ti === TITLES.length - 1 && "border-b-2 border-b-slate-100/80")}>
                      {isFirstOfDept ? (
                        <td
                          className="sticky left-0 z-10 bg-white border-r border-border/60 pl-5"
                          rowSpan={TITLES.length}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-100 to-navy-200/60 flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-navy-600" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-800">{dept.name}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {dept.doctorCount} 位医师
                              </div>
                            </div>
                          </div>
                        </td>
                      ) : null}
                      <td className={cn(isFirstOfDept && "border-l-0", "border-l border-border/60")}>
                        <div className="text-sm text-slate-700">{getTitleName(title)}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
                          {DOCTOR_TITLE_LABELS[title]}
                        </div>
                      </td>
                      {CATEGORIES.map((c) => (
                        <td key={c} className="p-2 border-l border-border/60">
                          <PermissionCell cfg={cfg} category={c} onChange={(next) => updateCfg(dept.id, title, next)} />
                        </td>
                      ))}
                      <td className="pl-4 border-l border-border/60 text-center text-xs text-slate-500">
                        <div className="font-mono tabular-nums">{cfg.modifiedAt.slice(5, 16)}</div>
                        <div className="text-slate-400 mt-0.5">{cfg.modifiedBy}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="data-number text-2xl font-bold text-slate-800">
              {ALL_DOCTORS.filter((d) => d.role !== "PHARMACY_DIRECTOR" && d.role !== "INFECTION_CONTROL").length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">总授权医师数</div>
          </div>
        </div>
        <div className="card p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="data-number text-2xl font-bold text-slate-800">
              {configs.filter((c) => c.allowedCategory.includes("RESTRICTED") && c.title === "RESIDENT").length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">住院医师获限制级授权（特殊配置）</div>
          </div>
        </div>
        <div className="card p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400/20 to-rose-500/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="data-number text-2xl font-bold text-slate-800">
              {configs.filter((c) => c.allowedCategory.includes("SPECIAL")).length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">岗位授权特殊级（需主任+）</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StaffMode() {
  const permissions = useDataStore((s) => s.permissions);
  const [dept, setDept] = useState<string>(DEPARTMENTS[0].id);
  const doctors = ALL_DOCTORS.filter((d) => d.departmentId === dept);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="form-label mb-0">选择科室</label>
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="form-select w-56"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1" />
        <button className="btn-outline">
          <History className="w-4 h-4" />
          权限变更日志
        </button>
        <button className="btn-primary">
          <ShieldCheck className="w-4 h-4" />
          批量授予权限
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {doctors.map((d, i) => {
          const cfg = permissions.find(
            (p) => p.departmentId === d.departmentId && p.title === d.title
          );
          const titles: Record<DrugCategory, boolean> = {
            NON_RESTRICTED: cfg?.allowedCategory.includes("NON_RESTRICTED") ?? true,
            RESTRICTED: cfg?.allowedCategory.includes("RESTRICTED") ?? false,
            SPECIAL: cfg?.allowedCategory.includes("SPECIAL") ?? false,
          };
          return (
            <div
              key={d.id}
              className="card p-5 group animate-fade-in-up"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-navy-400 to-navy-600 flex items-center justify-center text-white font-semibold shadow-inner">
                    {d.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{d.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{getTitleName(d.title)}</div>
                  </div>
                </div>
                <button className="btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  编辑
                </button>
              </div>

              <div className="space-y-2">
                {CATEGORIES.map((c) => (
                  <div key={c} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", CAT_COLORS[c])} />
                      <span className="text-sm text-slate-700">{DRUG_CATEGORY_LABELS[c]}</span>
                    </div>
                    {titles[c] ? (
                      <span className="badge-success">已授权</span>
                    ) : (
                      <span className="badge-pending">未授权</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
                <span className="text-slate-400">最近变更：{cfg?.modifiedAt.slice(0, 10) || "2026-05-20"}</span>
                <span className="text-teal-600 font-medium">{cfg?.modifiedBy || "王建国"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AuditTrailDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const auditLogs = useDataStore((s) => s.auditLogs);

  const logs = useMemo(() => {
    return auditLogs
      .filter((log) => log.actionType === "PERMISSION_CHANGED")
      .sort((a, b) => -a.createdAt.localeCompare(b.createdAt));
  }, [auditLogs]);

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
                <span className="text-xs text-slate-500">权限配置追溯</span>
              </div>
              <h2 className="font-display text-xl text-navy-700 tracking-tight">
                权限配置变更台账
              </h2>
              <div className="text-xs text-slate-500 mt-1">
                共 <span className="font-medium text-slate-700">{logs.length}</span> 条变更记录
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
              <h3 className="text-lg font-semibold text-slate-700 mb-1">暂无变更记录</h3>
              <p className="text-sm text-slate-400">权限配置暂无变更操作记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative pl-6">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200" />
                {logs.map((log) => {
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
                              v ? (
                                <span
                                  key={k}
                                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200"
                                >
                                  <Tag className="w-2.5 h-2.5" />
                                  {k === "changedCount"
                                    ? `变更${v}项`
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

export default function PermissionsPage() {
  const [mode, setMode] = useState<"matrix" | "staff">("matrix");
  const [auditOpen, setAuditOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="tab-list">
            <button
              onClick={() => setMode("matrix")}
              className={cn("tab-item inline-flex items-center gap-1.5", mode === "matrix" && "tab-item-active")}
            >
              <ShieldCheck className="w-4 h-4" />
              权限矩阵
            </button>
            <button
              onClick={() => setMode("staff")}
              className={cn("tab-item inline-flex items-center gap-1.5", mode === "staff" && "tab-item-active")}
            >
              <Users className="w-4 h-4" />
              人员级配置
            </button>
          </div>
        </div>
      </div>

      <div className="card p-4 bg-gradient-to-r from-navy-50/60 to-teal-50/40 border-navy-100">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
            <Info className="w-4 h-4 text-navy-600" />
          </div>
          <div className="flex-1 text-sm">
            <div className="font-medium text-slate-800 mb-0.5">分级授权规则说明</div>
            <div className="text-slate-600 leading-relaxed">
              根据《抗菌药物临床应用管理办法》及本院药事委员会规定，分级权限遵循逐级授权原则：
              <span className="text-emerald-700 font-medium">非限制级</span>全院医师默认享有；
              <span className="text-amber-700 font-medium">限制级</span>需主治医师及以上；
              <span className="text-red-700 font-medium">特殊级</span>
              仅限主任医师（部分重点科室副主任医师），使用前必须经过会诊审批流程。
            </div>
          </div>
        </div>
      </div>

      {mode === "matrix" ? <MatrixMode onOpenAudit={() => setAuditOpen(true)} /> : <StaffMode />}
      <AuditTrailDrawer open={auditOpen} onClose={() => setAuditOpen(false)} />
    </div>
  );
}
