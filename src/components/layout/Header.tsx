import {
  Bell,
  Search,
  Moon,
  Settings,
  ChevronDown,
  Sparkles,
  Clock,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/appStore";
import { formatDate, formatTimeAgo } from "@/utils/format";

const TITLES: Record<string, string> = {
  "/": "首页总览",
  "/catalog": "抗菌药物分级目录",
  "/permissions": "处方权限管理",
  "/monitoring": "处方智能监测",
  "/approval": "会诊与特殊用药审批",
  "/analytics": "科室用药分析",
  "/rectification": "整改任务跟踪",
};

export default function Header() {
  const loc = useLocation();
  const title = TITLES[loc.pathname] || "抗菌药物管理系统";
  const todos = useUserStore((s) => s.todos);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  const pendingCount = todos.length;

  return (
    <header className="top-header">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl text-navy-700 tracking-tight leading-none">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(now, "YYYY年MM月DD日 dddd")}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-teal-700 font-medium">
              今日预警实时刷新 · 最后同步{" "}
              <span className="tabular-nums">{formatTimeAgo(now)}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <div className="relative mr-2 hidden lg:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索药品 / 处方 / 患者 / 医生..."
            className="w-72 pl-9 pr-3 py-2 rounded-lg border border-border bg-slate-50/80 text-sm text-slate-700 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 focus:bg-white"
          />
          <kbd className="hidden xl:inline-flex absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-400 font-mono">
            Ctrl + K
          </kbd>
        </div>

        <button className="btn-ghost relative" title="通知中心">
          <Bell className="w-5 h-5" />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </button>
        <button className="btn-ghost" title="AI智能助手">
          <Sparkles className="w-5 h-5 text-teal-600" />
        </button>
        <button className="btn-ghost" title="主题切换">
          <Moon className="w-5 h-5" />
        </button>
        <button className="btn-ghost" title="系统设置">
          <Settings className="w-5 h-5" />
        </button>
        <div className="w-px h-8 bg-border mx-2" />
        <button className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-400 to-navy-600 flex items-center justify-center text-white text-xs font-semibold">
            王建
          </div>
          <span className="text-sm font-medium text-slate-700">王建国</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </header>
  );
}
