import { NavLink, useLocation } from "react-router-dom";
import type { ComponentType } from "react";
import {
  LayoutDashboard,
  BookText,
  ShieldCheck,
  Activity,
  ClipboardCheck,
  BarChart3,
  FileX2,
  Pill,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/utils/format";
import { useDataStore } from "@/store/dataStore";

interface NavItemDef {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  end?: boolean;
  badge?: number;
}

const BASE_NAV: NavItemDef[] = [
  { to: "/", label: "首页总览", icon: LayoutDashboard, end: true },
  { to: "/catalog", label: "分级目录", icon: BookText },
  { to: "/permissions", label: "权限管理", icon: ShieldCheck },
  { to: "/monitoring", label: "处方监测", icon: Activity },
  { to: "/approval", label: "会诊审批", icon: ClipboardCheck },
  { to: "/analytics", label: "科室分析", icon: BarChart3 },
  { to: "/rectification", label: "整改跟踪", icon: FileX2 },
];

export default function Sidebar() {
  const loc = useLocation();
  const auditBadge = useDataStore((s) => s.auditLogs.length || 0);
  const criticalWarnings = useDataStore((s) => s.warnings.filter((w) => w.severity === "CRITICAL" && w.status === "PENDING").length);
  const pendingApprovals = useDataStore((s) => s.approvals.filter((a) => a.status === "PENDING" || a.status === "IN_PROGRESS").length);
  const pendingTasks = useDataStore((s) => s.tasks.filter((t) => t.status === "REVIEWING").length);

  const BASE_WITH_BADGES: NavItemDef[] = BASE_NAV.map((item) => {
    if (item.to === "/monitoring") return { ...item, badge: criticalWarnings };
    if (item.to === "/approval") return { ...item, badge: pendingApprovals };
    if (item.to === "/rectification") return { ...item, badge: pendingTasks };
    return item;
  });

  const NAV: NavItemDef[] = [
    ...BASE_WITH_BADGES,
    { to: "/audit", label: "操作记录", icon: ClipboardList, badge: auditBadge },
  ];

  return (
    <aside className="sidebar">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Pill className="w-5 h-5 text-white" strokeWidth={2.4} />
        </div>
        <div>
          <div className="text-white font-serif font-semibold text-lg leading-tight tracking-tight">
            AMS · 抗菌药物管理
          </div>
          <div className="text-navy-100/50 text-[11px] leading-tight mt-0.5">
            Antimicrobial Stewardship
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 pt-1 text-[11px] uppercase tracking-widest text-navy-100/30 font-semibold">
          工作面板
        </div>
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.end
            ? loc.pathname === item.to
            : loc.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn("nav-item group", isActive && "nav-item-active")}
            >
              <Icon
                className={cn(
                  "transition-colors",
                  isActive ? "text-teal-300" : "group-hover:text-teal-300"
                )}
              />
              <span className="flex-1 font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold",
                    isActive
                      ? "bg-red-500 text-white"
                      : "bg-white/10 text-navy-100/80"
                  )}
                >
                  {item.badge}
                </span>
              )}
              <ChevronRight
                className={cn(
                  "w-3.5 h-3.5 opacity-0 -mr-1 transition-all",
                  isActive && "opacity-100 translate-x-0"
                )}
              />
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 shrink-0">
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-400 to-navy-600 flex items-center justify-center text-white font-semibold text-sm shrink-0 border-2 border-white/10">
              王建
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white font-medium text-sm truncate">
                王建国
              </div>
              <div className="text-navy-100/50 text-[11px] truncate">
                药学部负责人 · 主任药师
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
