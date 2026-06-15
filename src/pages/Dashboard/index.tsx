import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  Flame,
  ShieldAlert,
  ArrowRight,
  AlertOctagon,
  Clock,
  Activity,
  FileCheck,
  ListChecks,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDashboardStore, useUserStore } from "@/store/appStore";
import { useDataStore } from "@/store/dataStore";
import { useNavStore } from "@/store/navStore";
import {
  formatNumber,
  formatPercent,
  formatTimeAgo,
  getDaysRemaining,
  cn,
} from "@/utils/format";
import { MONTHLY_TRENDS, DEPARTMENT_KPIS } from "@/data/analytics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Legend,
  BarChart,
  Cell,
} from "recharts";
import { useState, useEffect } from "react";

interface KpiCardProps {
  gradient: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  title: string;
  value: string | number;
  unit?: string;
  delta: number;
  deltaLabel: string;
  badge?: string;
  badgeColor?: string;
}

function KpiCard({
  gradient,
  icon: Icon,
  iconBg,
  title,
  value,
  unit,
  delta,
  deltaLabel,
  badge,
  badgeColor,
}: KpiCardProps) {
  const isGood = delta < 0;
  return (
    <div
      className={cn(
        "card-kpi group animate-fade-in-up",
        gradient
      )}
      style={{ animationDelay: "0.05s" }}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shadow-inner", iconBg)}>
              <Icon className="w-5 h-5 text-navy-700" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-600">{title}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-md font-semibold ring-1 ring-inset",
                      badgeColor
                    )}
                  >
                    {badge}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold",
              isGood
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200"
            )}
          >
            {isGood ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <TrendingUp className="w-3 h-3" />
            )}
            {Math.abs(delta)}% {deltaLabel}
          </div>
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="data-number text-4xl text-navy-800 leading-none tracking-tight">
              {value}
            </span>
            {unit && (
              <span className="ml-1.5 text-sm font-medium text-slate-500">
                {unit}
              </span>
            )}
          </div>
          <MiniSparkline delta={delta} />
        </div>
      </div>
    </div>
  );
}

function MiniSparkline({ delta }: { delta: number }) {
  const pts = Array.from({ length: 14 }, (_, i) =>
    50 + Math.sin(i / 2) * 10 + (delta / 20) * i + Math.random() * 4
  );
  const path = pts
    .map((y, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * 120} ${100 - y}`)
    .join(" ");
  const isGood = delta < 0;
  return (
    <svg viewBox="0 0 120 100" className="w-24 h-12 opacity-70">
      <path
        d={path}
        fill="none"
        stroke={isGood ? "#10B981" : "#DC2626"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TodoSection() {
  const [tab, setTab] = useState<"APPROVAL" | "WARNING" | "RECTIFICATION">("APPROVAL");
  const { todos } = useUserStore();
  const filtered = todos.filter((t) => t.type === tab);
  const navigate = useNavigate();
  const setTarget = useNavStore((s) => s.setTarget);

  const TABS = [
    { key: "APPROVAL" as const, label: "待审批", icon: ClipboardList, count: todos.filter((t) => t.type === "APPROVAL").length },
    { key: "WARNING" as const, label: "待处理预警", icon: AlertTriangle, count: todos.filter((t) => t.type === "WARNING").length },
    { key: "RECTIFICATION" as const, label: "待反馈整改", icon: ListChecks, count: todos.filter((t) => t.type === "RECTIFICATION").length },
  ];

  const handleTodoClick = (todo: typeof todos[0]) => {
    const page = todo.type === "APPROVAL" ? "/approval" : todo.type === "WARNING" ? "/monitoring" : "/rectification";
    setTarget(page, todo.targetId!);
    navigate(todo.link);
  };

  return (
    <div className="card-section h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="section-title">今日待办</h3>
        <Link
          to={tab === "APPROVAL" ? "/approval" : tab === "WARNING" ? "/monitoring" : "/rectification"}
          className="text-xs font-medium text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
        >
          查看全部 <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="tab-list mb-4">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn("tab-item inline-flex items-center gap-1.5", tab === t.key && "tab-item-active")}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              <span className={cn("data-number text-[11px] px-1.5 py-0.5 rounded", tab === t.key ? "bg-teal-50 text-teal-700" : "bg-white/60 text-slate-400")}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2 -mx-2">
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            🎉 暂无待办事项，继续保持！
          </div>
        )}
        {filtered.map((t, i) => {
          const days = t.deadline ? getDaysRemaining(t.deadline) : null;
          const isOverdue = days !== null && days < 0;
          return (
            <div
              key={t.id}
              onClick={() => handleTodoClick(t)}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group animate-fade-in-up cursor-pointer"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full mt-2 shrink-0",
                  t.priority === "URGENT" ? "bg-red-500 animate-pulse-critical"
                    : t.priority === "HIGH" ? "bg-orange-500"
                    : t.priority === "MEDIUM" ? "bg-amber-500"
                    : "bg-blue-400"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium text-slate-800 group-hover:text-navy-700 truncate">
                    {t.title}
                  </div>
                  {t.priority === "URGENT" && (
                    <span className="badge-severity-critical shrink-0">紧急</span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span className="truncate">{t.subtitle}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(t.createdAt)}
                  </span>
                  {t.deadline && (
                    <>
                      <span>·</span>
                      <span className={cn("font-medium", isOverdue ? "text-red-600" : days! <= 1 ? "text-orange-600" : "text-slate-500")}>
                        {isOverdue ? `已逾期${-days!}天` : days === 0 ? "今日截止" : `剩余${days}天`}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all mt-1.5 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrendCharts() {
  const data = MONTHLY_TRENDS.slice(-6).map((m) => ({
    ...m,
    label: m.month.slice(5) + "月",
  }));
  return (
    <div className="card-section">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="section-title">近半年用药趋势</h3>
          <p className="text-xs text-slate-500 mt-1">全院 DDDs 走势与预警次数对比（双轴）</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="tab-list">
            <button className="tab-item tab-item-active">6个月</button>
            <button className="tab-item">12个月</button>
          </div>
        </div>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradDdds" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0891B2" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#0891B2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="label" stroke="#94A3B8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" stroke="#94A3B8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} label={{ value: "DDDs", angle: -90, position: "insideLeft", style: { fill: "#64748B", fontSize: 11 }, offset: 8 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} label={{ value: "预警次数", angle: 90, position: "insideRight", style: { fill: "#64748B", fontSize: 11 }, offset: 8 }} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", fontSize: 12 }}
              labelStyle={{ fontWeight: 600, color: "#0F2C59", marginBottom: 4 }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Bar yAxisId="left" dataKey="ddds" name="DDDs" fill="url(#gradDdds)" stroke="#0891B2" strokeWidth={1.5} radius={[6, 6, 0, 0]} barSize={28} />
            <Line yAxisId="right" type="monotone" dataKey="warningCount" name="预警次数" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DrugCategoryChart() {
  const data = [
    { name: "非限制级", value: 3268, color: "#10B981", ratio: 0.572 },
    { name: "限制级", value: 1872, color: "#F59E0B", ratio: 0.328 },
    { name: "特殊级", value: 572, color: "#EF4444", ratio: 0.100 },
  ];
  return (
    <div className="card-section">
      <div className="mb-5">
        <h3 className="section-title">分级药物使用占比</h3>
        <p className="text-xs text-slate-500 mt-1">本月全院抗菌药物使用人次分布</p>
      </div>
      <div className="space-y-4">
        {data.map((d, i) => (
          <div key={d.name} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-sm font-medium text-slate-700">{d.name}</span>
              </div>
              <div className="text-right">
                <span className="data-number text-sm font-semibold text-slate-800">{formatNumber(d.value)}</span>
                <span className="text-xs text-slate-500 ml-1">人 · {formatPercent(d.ratio)}</span>
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${d.ratio * 100}%`,
                  backgroundColor: d.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="divider" />

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">合计使用人次</span>
        <span className="data-number font-bold text-navy-700 text-base">
          {formatNumber(5712)}
        </span>
      </div>
    </div>
  );
}

function RiskDepartments() {
  const { riskDepartments } = useDashboardStore();
  const topDepts = DEPARTMENT_KPIS.slice(0, 5);
  return (
    <div className="card-section">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h3 className="section-title">高风险科室 TOP5</h3>
        </div>
        <Link to="/analytics" className="text-xs font-medium text-teal-600 hover:text-teal-700 inline-flex items-center gap-1">
          全科室分析 <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topDepts.map((d) => ({
              name: d.departmentName.replace("科", "").replace("与危重症医学科", "呼吸科").replace("心血管内科", "心内科").replace("普通外科", "普外科"),
              预警次数: d.warningCount,
              DDDs: +(d.ddds / 6).toFixed(1),
            }))}
            layout="vertical"
            margin={{ left: 10, right: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
            <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} width={70} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} cursor={{ fill: "#F8FAFC" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="预警次数" name="预警次数" radius={[0, 6, 6, 0]} barSize={14}>
              {topDepts.map((_, i) => (
                <Cell key={i} fill={["#DC2626", "#F97316", "#F59E0B", "#EAB308", "#84CC16"][i]} />
              ))}
            </Bar>
            <Bar dataKey="DDDs" name="DDDs (归一)" radius={[0, 6, 6, 0]} barSize={14} fill="#0891B2" fillOpacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2 text-center">
        {riskDepartments.slice(0, 5).map((r, i) => (
          <div key={r.name} className="py-2 rounded-lg bg-slate-50">
            <div className="text-[10px] text-slate-500 mb-0.5">#{i + 1} {r.name}</div>
            <div className="data-number text-lg font-bold text-slate-800">{r.score}</div>
            <div className="text-[10px] text-slate-400">风险分</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickEntries() {
  const ENTRIES = [
    { to: "/catalog", title: "分级目录", desc: "维护抗菌药物目录", icon: "💊", count: 35, color: "bg-emerald-50 border-emerald-200" },
    { to: "/permissions", title: "授权管理", desc: "配置科室人员权限", icon: "🛡️", count: 12, color: "bg-blue-50 border-blue-200" },
    { to: "/monitoring", title: "预警处理", desc: "处方审核与干预", icon: "⚠️", count: 57, color: "bg-red-50 border-red-200" },
    { to: "/approval", title: "审批会诊", desc: "特殊用药申请审批", icon: "📋", count: 8, color: "bg-amber-50 border-amber-200" },
    { to: "/analytics", title: "数据分析", desc: "DDDs/预警/排名", icon: "📊", count: "-", color: "bg-teal-50 border-teal-200" },
    { to: "/rectification", title: "整改追踪", desc: "闭环管理与模板", icon: "✅", count: 24, color: "bg-violet-50 border-violet-200" },
  ];
  return (
    <div className="grid grid-cols-6 gap-4">
      {ENTRIES.map((e, i) => (
        <Link
          key={e.to}
          to={e.to}
          className={cn("group card p-5 relative overflow-hidden border animate-fade-in-up", e.color)}
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="text-2xl mb-3">{e.icon}</div>
          <div className="flex items-baseline justify-between">
            <div className="font-display text-lg text-slate-800 group-hover:text-navy-700">
              {e.title}
            </div>
            <div className="data-number text-sm font-bold text-slate-500 group-hover:text-teal-600">
              {e.count}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-1">{e.desc}</div>
          <ArrowRight className="absolute right-4 top-5 w-4 h-4 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
        </Link>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const refreshStats = useDashboardStore((s) => s.refreshStats);

  const dashboardStats = useDataStore((s) => s.getDashboardStats());
  const pendingWarnings = useDataStore((s) => s.warnings.filter((w) => w.status === "PENDING"));
  const pendingApprovals = useDataStore((s) => s.approvals.filter((a) => a.status === "PENDING" || a.status === "IN_PROGRESS"));
  const tasks = useDataStore((s) => s.tasks);

  useEffect(() => {
    refreshStats();
  }, [dashboardStats, refreshStats]);

  const criticalCount = pendingWarnings.filter((w) => w.severity === "CRITICAL").length;
  const urgentApprovals = pendingApprovals.filter((a) => a.isUrgent).length;
  const doneCount = tasks.filter((t) => t.status === "DONE").length;
  const reviewedCount = tasks.filter((t) => t.status === "DONE" || t.status === "REJECTED").length;
  const reviewingCount = tasks.filter((t) => t.status === "REVIEWING").length;
  const rectificationRate = reviewedCount > 0 ? doneCount / reviewedCount : 0.872;

  const KPI_DATA: KpiCardProps[] = [
    {
      gradient: "bg-gradient-card-red",
      icon: AlertOctagon,
      iconBg: "bg-red-100/80",
      title: "危重预警待处理",
      value: pendingWarnings.length,
      unit: "条",
      delta: 23.5,
      deltaLabel: "较昨日",
      badge: criticalCount > 0 ? `${criticalCount}条危重` : "需立即处理",
      badgeColor: "bg-red-100 text-red-700 ring-red-200",
    },
    {
      gradient: "bg-gradient-card-orange",
      icon: ShieldAlert,
      iconBg: "bg-amber-100/80",
      title: "特殊用药待审批",
      value: pendingApprovals.length,
      unit: "份",
      delta: -12.8,
      deltaLabel: "较昨日",
      badge: urgentApprovals > 0 ? `${urgentApprovals}份紧急` : "待处理",
      badgeColor: "bg-amber-100 text-amber-800 ring-amber-200",
    },
    {
      gradient: "bg-gradient-card-teal",
      icon: Activity,
      iconBg: "bg-teal-100/80",
      title: "全院使用强度 DDDs",
      value: formatNumber(dashboardStats.totalDDDs, 1),
      unit: "/100人天",
      delta: -5.2,
      deltaLabel: "环比",
      badge: "优于目标",
      badgeColor: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    },
    {
      gradient: "bg-gradient-card-blue",
      icon: FileCheck,
      iconBg: "bg-blue-100/80",
      title: "整改完成率",
      value: formatPercent(rectificationRate, 1),
      delta: 3.4,
      deltaLabel: "环比提升",
      badge: reviewingCount > 0 ? `待审核${reviewingCount}项` : "全部完成",
      badgeColor: "bg-blue-100 text-blue-700 ring-blue-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-5">
        {KPI_DATA.map((k, i) => (
          <KpiCard key={k.title} {...k} />
        ))}
      </div>

      <QuickEntries />

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <TrendCharts />
        </div>
        <TodoSection />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <DrugCategoryChart />
        <div className="col-span-2">
          <RiskDepartments />
        </div>
      </div>
    </div>
  );
}
