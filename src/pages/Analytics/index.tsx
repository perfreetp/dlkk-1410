import { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  AlertTriangle,
  Calendar,
  Activity,
  Pill,
  ShieldAlert,
  FileCheck,
  Users,
} from "lucide-react";
import { DEPARTMENT_KPIS, MONTHLY_TRENDS, DEPARTMENT_TRENDS, DOCTOR_RANKINGS } from "@/data/analytics";
import { DEPARTMENTS } from "@/data/users";
import type { DepartmentKPI, DoctorRanking } from "@/types";
import { cn, formatNumber, formatPercent, formatSeverity } from "@/utils/format";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  Cell,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { getTitleName } from "@/data/users";

function KpiCard({
  icon: Icon,
  title,
  value,
  unit,
  subTitle,
  delta,
  deltaUnit = "%",
  iconBg,
  valueColor = "text-navy-800",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  unit?: string;
  subTitle?: string;
  delta?: number;
  deltaUnit?: string;
  iconBg: string;
  valueColor?: string;
}) {
  const isGood = typeof delta === "number" && delta < 0;
  return (
    <div className="card-kpi animate-fade-in-up">
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", iconBg)}>
              <Icon className="w-5 h-5 text-navy-700" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-600">{title}</div>
              {subTitle && <div className="text-[11px] text-slate-400 mt-0.5">{subTitle}</div>}
            </div>
          </div>
          {typeof delta === "number" && (
            <div
              className={cn(
                "inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-[11px] font-semibold",
                isGood
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                  : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200"
              )}
            >
              {isGood ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {Math.abs(delta)}
              {deltaUnit}
            </div>
          )}
        </div>
        <div className="mt-5 flex items-baseline gap-1.5">
          <span className={cn("data-number text-4xl tracking-tight leading-none", valueColor)}>
            {value}
          </span>
          {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

function OverviewKpis({ kpi }: { kpi?: DepartmentKPI }) {
  const all = DEPARTMENT_KPIS;
  const avgDdds = +(all.reduce((s, x) => s + x.ddds, 0) / all.length).toFixed(1);
  const totalWarn = all.reduce((s, x) => s + x.warningCount, 0);
  const avgRect = +(all.reduce((s, x) => s + x.rectificationRate, 0) / all.length).toFixed(3);
  const totalSpec = +(
    all.reduce((s, x) => s + x.ddds * x.specialRatio, 0) / all.length
  ).toFixed(2);

  const kpis = kpi
    ? [
        { icon: Activity, title: "使用强度 DDDs", value: formatNumber(kpi.ddds, 1), unit: "/100人天", delta: +(((kpi.ddds - kpi.lastMonthDDDs) / kpi.lastMonthDDDs) * 100).toFixed(1), iconBg: "bg-teal-100" },
        { icon: ShieldAlert, title: "本月预警次数", value: kpi.warningCount, delta: +(((kpi.warningCount - kpi.lastMonthWarnings) / kpi.lastMonthWarnings) * 100).toFixed(1), iconBg: "bg-amber-100" },
        { icon: FileCheck, title: "整改完成率", value: formatPercent(kpi.rectificationRate), delta: +(((kpi.rectificationRate - 0.82) / 0.82) * 100).toFixed(1), iconBg: "bg-emerald-100", valueColor: "text-emerald-700" },
        { icon: AlertTriangle, title: "特殊级占比", value: formatPercent(kpi.specialRatio), delta: +3.2, iconBg: "bg-red-100" },
      ]
    : [
        { icon: Activity, title: "全院DDDs均值", value: formatNumber(avgDdds, 1), unit: "/100人天", subTitle: "上月 93.2", delta: +3.4, iconBg: "bg-teal-100" },
        { icon: ShieldAlert, title: "预警总数", value: totalWarn, subTitle: "较上月 ↓", delta: -12.5, iconBg: "bg-amber-100" },
        { icon: FileCheck, title: "整改平均完成率", value: formatPercent(avgRect), delta: +4.1, iconBg: "bg-emerald-100", valueColor: "text-emerald-700" },
        { icon: Pill, title: "特殊级DDDs均值", value: formatNumber(totalSpec, 2), subTitle: "需关注ICU/呼吸科", delta: +8.7, iconBg: "bg-red-100" },
      ];

  return (
    <div className="grid grid-cols-4 gap-5">
      {kpis.map((k, i) => (
        <KpiCard key={k.title} {...k} />
      ))}
    </div>
  );
}

function DepartmentCompare() {
  const COLORS = ["#0891B2", "#0F2C59", "#F59E0B", "#EF4444", "#10B981", "#8B5CF6", "#EC4899", "#6366F1", "#14B8A6", "#F97316", "#84CC16", "#06B6D4"];
  const data = DEPARTMENT_KPIS.slice(0, 10).map((d) => ({
    name: d.departmentName
      .replace("与危重症医学科", "")
      .replace("心血管内科", "心内科")
      .replace("普通外科", "普外科"),
    DDDs: d.ddds,
    预警次数: d.warningCount,
    整改率: +(d.rectificationRate * 100).toFixed(1),
  }));

  return (
    <div className="card-section">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-title">全院科室 DDDs 横向对比 TOP10</h3>
          <p className="text-xs text-slate-500 mt-1">使用强度越高代表抗菌药物消耗越多，需重点关注</p>
        </div>
        <div className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          按DDDs降序排列
        </div>
      </div>
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradDdds2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0891B2" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#0F2C59" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={60} />
            <YAxis yAxisId="left" stroke="#64748B" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "DDDs", angle: -90, position: "insideLeft", style: { fill: "#64748B", fontSize: 11 }, offset: 8 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#64748B" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "预警次数/整改率", angle: 90, position: "insideRight", style: { fill: "#64748B", fontSize: 11 }, offset: 8 }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Bar yAxisId="left" dataKey="DDDs" name="DDDs" radius={[6, 6, 0, 0]} barSize={26}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
            <Line yAxisId="right" type="monotone" dataKey="预警次数" name="预警次数" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} />
            <Line yAxisId="right" type="monotone" dataKey="整改率" name="整改率(%)" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} strokeDasharray="4 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MonthlyTrendChart({ deptId }: { deptId?: string }) {
  const trends = deptId ? DEPARTMENT_TRENDS[deptId] : MONTHLY_TRENDS;
  const data = trends.map((m) => ({
    label: m.month.slice(5) + "月",
    DDDs: m.ddds,
    预警次数: m.warningCount,
    限制级: m.restrictedCount,
    特殊级: m.specialCount,
  }));

  return (
    <div className="card-section">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-title">近12个月 DDDs 与预警趋势</h3>
          <p className="text-xs text-slate-500 mt-1">
            {deptId ? DEPARTMENTS.find((d) => d.id === deptId)?.name : "全院"} 月度走势
          </p>
        </div>
        <div className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-border">
          <Calendar className="w-3.5 h-3.5" />
          2025.07 - 2026.06
        </div>
      </div>
      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradDdds3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0891B2" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0891B2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="label" stroke="#64748B" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" stroke="#64748B" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "DDDs", angle: -90, position: "insideLeft", style: { fill: "#64748B", fontSize: 11 }, offset: 8 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#64748B" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Area yAxisId="left" type="monotone" dataKey="DDDs" name="DDDs" fill="url(#gradDdds3)" stroke="#0891B2" strokeWidth={2.5} />
            <Bar yAxisId="right" dataKey="限制级" name="限制级使用" stackId="a" radius={[4, 4, 0, 0]} fill="#F59E0B" barSize={14} />
            <Bar yAxisId="right" dataKey="特殊级" name="特殊级使用" stackId="a" radius={[4, 4, 0, 0]} fill="#EF4444" barSize={14} />
            <Line yAxisId="left" type="monotone" dataKey="预警次数" name="预警次数" stroke="#DC2626" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: "#fff" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DepartmentTable({
  onSelect,
  selected,
}: {
  onSelect: (id: string) => void;
  selected?: string;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="section-title flex items-center gap-2">
          <Users className="w-5 h-5 text-navy-600" />
          科室 KPI 明细
        </h3>
        <div className="text-xs text-slate-500">
          点击行可查看该科室详细分析
        </div>
      </div>
      <div className="max-h-[480px] overflow-auto">
        <table className="data-table">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="pl-5 w-16">排名</th>
              <th>科室</th>
              <th className="text-right">DDDs</th>
              <th className="text-right">环比</th>
              <th className="text-right">限制级%</th>
              <th className="text-right">特殊级%</th>
              <th className="text-right">预警</th>
              <th className="text-right">整改率</th>
              <th className="pr-5"></th>
            </tr>
          </thead>
          <tbody>
            {DEPARTMENT_KPIS.sort((a, b) => a.dddsRank - b.dddsRank).map((d) => {
              const deltaDdds = +(((d.ddds - d.lastMonthDDDs) / d.lastMonthDDDs) * 100).toFixed(1);
              const isSelected = selected === d.departmentId;
              return (
                <tr
                  key={d.departmentId}
                  onClick={() => onSelect(d.departmentId)}
                  className={cn(
                    "cursor-pointer",
                    isSelected && "bg-teal-50/60 hover:bg-teal-50/80!"
                  )}
                >
                  <td className="pl-5">
                    <span
                      className={cn(
                        "data-number inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold",
                        d.dddsRank === 1
                          ? "bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-sm"
                          : d.dddsRank === 2
                          ? "bg-gradient-to-br from-slate-200 to-slate-400 text-white"
                          : d.dddsRank === 3
                          ? "bg-gradient-to-br from-orange-300 to-orange-500 text-white"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {d.dddsRank}
                    </span>
                  </td>
                  <td>
                    <div className="font-medium text-slate-800">{d.departmentName}</div>
                  </td>
                  <td className="text-right">
                    <span className={cn("data-number font-bold text-base", d.ddds > 100 ? "text-red-600" : d.ddds > 80 ? "text-amber-600" : "text-slate-700")}>
                      {formatNumber(d.ddds, 1)}
                    </span>
                  </td>
                  <td className="text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 text-xs font-semibold",
                        deltaDdds < 0 ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      {deltaDdds < 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      {Math.abs(deltaDdds)}%
                    </span>
                  </td>
                  <td className="text-right data-number text-sm text-amber-700">
                    {formatPercent(d.restrictedRatio)}
                  </td>
                  <td className="text-right data-number text-sm text-red-700">
                    {formatPercent(d.specialRatio)}
                  </td>
                  <td className="text-right">
                    <span
                      className={cn(
                        "data-number font-semibold",
                        d.warningCount > 15 ? "text-red-600" : d.warningCount > 10 ? "text-amber-600" : "text-slate-700"
                      )}
                    >
                      {d.warningCount}
                    </span>
                    <span className="ml-1 text-[10px] text-slate-400">#{d.warningRank}</span>
                  </td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", d.rectificationRate >= 0.9 ? "bg-emerald-500" : d.rectificationRate >= 0.7 ? "bg-teal-500" : "bg-amber-500")}
                          style={{ width: `${d.rectificationRate * 100}%` }}
                        />
                      </div>
                      <span className="data-number text-xs font-medium text-slate-700 w-12 text-right">
                        {formatPercent(d.rectificationRate, 0)}
                      </span>
                    </div>
                  </td>
                  <td className="pr-5 text-right">
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-slate-400 transition-transform inline-block",
                        isSelected && "rotate-180 text-teal-600"
                      )}
                    />
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

function DoctorRankingTable({ deptId }: { deptId?: string }) {
  const dept = deptId || DEPARTMENTS[0].id;
  const rankings: DoctorRanking[] = DOCTOR_RANKINGS[dept] || [];
  const deptName = DEPARTMENTS.find((d) => d.id === dept)?.name;

  return (
    <div className="card-section">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="section-title flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-navy-600" />
            {deptName} · 医生 DDDs 排名
          </h3>
          <p className="text-xs text-slate-500 mt-1">展示科室内部医生抗菌药物使用情况</p>
        </div>
        <div className="relative">
          <select
            value={dept}
            onChange={(e) => e.target.value}
            className="form-select w-48 text-sm"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {rankings.slice(0, 8).map((r) => {
          const delta = r.rank - r.lastMonthRank;
          return (
            <div
              key={r.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center data-number font-bold shrink-0",
                  r.rank === 1
                    ? "bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-md"
                    : r.rank === 2
                    ? "bg-gradient-to-br from-slate-200 to-slate-400 text-white"
                    : r.rank === 3
                    ? "bg-gradient-to-br from-orange-300 to-orange-500 text-white"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {r.rank}
              </div>

              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-navy-200 to-navy-400 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {r.name.slice(0, 2)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{r.name}</span>
                    <span className="text-[11px] text-slate-400">{getTitleName(r.title)}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 text-[11px] font-semibold",
                        delta < 0
                          ? "text-emerald-600"
                          : delta > 0
                          ? "text-red-500"
                          : "text-slate-400"
                      )}
                    >
                      {delta < 0 ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : delta > 0 ? (
                        <ArrowDownRight className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                      {Math.abs(delta) === 0 ? "持平" : `${Math.abs(delta)}位`}
                    </span>
                    {r.warningCount > 3 && (
                      <span className="badge-severity-high">⚠ {r.warningCount}</span>
                    )}
                    <span className="data-number font-bold text-navy-700 text-lg tabular-nums w-14 text-right">
                      {formatNumber(r.ddds, 1)}
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      r.ddds > 50
                        ? "bg-gradient-to-r from-orange-400 to-red-500"
                        : r.ddds > 30
                        ? "bg-gradient-to-r from-teal-400 to-teal-600"
                        : "bg-gradient-to-r from-teal-300 to-teal-500"
                    )}
                    style={{ width: `${Math.min(100, (r.ddds / 80) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DrugMixPie() {
  const data = [
    { name: "青霉素类", value: 28, color: "#0891B2" },
    { name: "头孢菌素类", value: 34, color: "#0F2C59" },
    { name: "喹诺酮类", value: 15, color: "#F59E0B" },
    { name: "碳青霉烯类", value: 8, color: "#EF4444" },
    { name: "糖肽类", value: 6, color: "#8B5CF6" },
    { name: "抗真菌药", value: 5, color: "#EC4899" },
    { name: "其他", value: 4, color: "#94A3B8" },
  ];
  return (
    <div className="card-section">
      <h3 className="section-title mb-4">抗菌药物类别分布</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v: number) => [`${v}%`, "占比"]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-slate-600 truncate">{d.name}</span>
            <span className="data-number font-semibold text-slate-800 ml-auto">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [dept, setDept] = useState<string | undefined>(undefined);
  const [keyword, setKeyword] = useState("");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="tab-list">
            <button
              onClick={() => setDept(undefined)}
              className={cn("tab-item", dept === undefined && "tab-item-active")}
            >
              全院视角
            </button>
            <button
              onClick={() => setDept(DEPARTMENTS[0].id)}
              className={cn("tab-item", dept !== undefined && "tab-item-active")}
            >
              科室对比
            </button>
          </div>
          {dept && (
            <>
              <div className="h-6 w-px bg-border mx-1" />
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="form-select w-56 text-sm"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索科室/医生..."
              className="form-input w-60 pl-9"
            />
          </div>
          <button className="btn-outline">
            <BarChart3 className="w-4 h-4" />
            导出月报
          </button>
        </div>
      </div>

      <OverviewKpis kpi={dept ? DEPARTMENT_KPIS.find((d) => d.departmentId === dept) : undefined} />

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          {dept ? <MonthlyTrendChart deptId={dept} /> : <DepartmentCompare />}
        </div>
        <DrugMixPie />
      </div>

      <div className="grid grid-cols-3 gap-5">
        {dept ? (
          <>
            <div className="col-span-2">
              <DoctorRankingTable deptId={dept} />
            </div>
            <div className="card-section">
              <h3 className="section-title mb-4">完成率总览</h3>
              <div className="h-[300px] -mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="80%"
                    data={[
                      { name: "整改完成率", value: 87.2, fill: "#10B981" },
                      { name: "审批响应率", value: 94.5, fill: "#0891B2" },
                      { name: "权限合规率", value: 91.8, fill: "#0F2C59" },
                    ]}
                    startAngle={180}
                    endAngle={0}
                    barSize={14}
                  >
                    <RadialBar dataKey="value" background={{ fill: "#F1F5F9" }} cornerRadius={10} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 12, paddingBottom: 20 }} formatter={(v: string) => <span className="text-slate-600">{v}</span>} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v: number) => [`${v}%`]} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-4 pt-4 border-t border-border">
                <div className="text-xs text-slate-500 mb-1">综合管理指数</div>
                <div className="data-number text-4xl font-bold text-navy-700">91.2</div>
                <div className="text-[11px] text-emerald-600 mt-1 inline-flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> 较上月 +3.8
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="col-span-2">
              <DepartmentTable onSelect={(id) => setDept(id)} selected={dept} />
            </div>
            <DoctorRankingTable deptId={dept || DEPARTMENTS[0].id} />
          </>
        )}
      </div>

      {!dept && <MonthlyTrendChart />}
    </div>
  );
}
