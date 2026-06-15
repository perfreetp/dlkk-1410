import type { DepartmentKPI, MonthlyTrend, DoctorRanking, InterventionTemplate, RectificationTask, WarningType, DoctorTitle, RectificationStatus } from "@/types";
import { DEPARTMENTS, ALL_DOCTORS } from "./users";
import dayjs from "dayjs";

export const DEPARTMENT_KPIS: DepartmentKPI[] = DEPARTMENTS.map((d, i) => {
  const base = 80 - i * 3;
  const ddds = base + ((i * 17) % 40);
  const warnCount = 12 - Math.floor(i * 0.7) + ((i * 5) % 8);
  return {
    departmentId: d.id,
    departmentName: d.name,
    ddds: +ddds.toFixed(1),
    dddsRank: i + 1,
    restrictedRatio: +(0.25 + (i * 0.03) % 0.3).toFixed(3),
    specialRatio: +(0.05 + (i * 0.015) % 0.2).toFixed(3),
    warningCount: warnCount,
    warningRank: i + 1,
    rectificationRate: +(0.85 - (i * 0.02) % 0.25).toFixed(3),
    lastMonthDDDs: +(ddds * (0.9 + (i * 0.05) % 0.2)).toFixed(1),
    lastMonthWarnings: Math.floor(warnCount * (1.1 + (i * 0.1) % 0.3)),
  };
});

export const MONTHLY_TRENDS: MonthlyTrend[] = Array.from({ length: 12 }, (_, i) => {
  const month = dayjs().subtract(11 - i, "month").format("YYYY-MM");
  const base = 95 - Math.abs(i - 6) * 3;
  return {
    month,
    ddds: +(base + ((i * 11) % 12)).toFixed(1),
    warningCount: 180 - Math.abs(i - 5) * 15 + ((i * 7) % 30),
    restrictedCount: 400 + i * 18 + ((i * 13) % 60),
    specialCount: 60 + i * 7 + ((i * 5) % 25),
  };
});

export const DEPARTMENT_TRENDS: Record<string, MonthlyTrend[]> = Object.fromEntries(
  DEPARTMENTS.map((dept, di) => [
    dept.id,
    Array.from({ length: 12 }, (_, i) => {
      const month = dayjs().subtract(11 - i, "month").format("YYYY-MM");
      const base = 80 - di * 3;
      return {
        month,
        ddds: +(base + ((i + di) * 7) % 25 - 12).toFixed(1),
        warningCount: 10 + ((di * 3 + i * 2) % 20),
        restrictedCount: 30 + ((di * 5 + i) % 50),
        specialCount: 5 + ((di * 2 + i) % 15),
      };
    }),
  ])
);

export const DOCTOR_RANKINGS: Record<string, DoctorRanking[]> = Object.fromEntries(
  DEPARTMENTS.map((dept) => {
    const docs = ALL_DOCTORS.filter((u) => u.departmentId === dept.id).slice(0, 10);
    return [
      dept.id,
      docs.map((d, i) => ({
        id: d.id,
        name: d.name,
        title: d.title,
        departmentId: dept.id,
        ddds: +(15 + ((i * 7) % 60)).toFixed(1),
        warningCount: i + ((i * 3) % 5),
        rank: i + 1,
        lastMonthRank: (i + (i % 3) - 1 + docs.length) % docs.length + 1,
      })),
    ];
  })
);

const TEMPLATES: Array<{ cat: WarningType | "GENERAL"; title: string; std: string; sugg: string; cnt: number }> = [
  {
    cat: "OVER_GRADE",
    title: "越级开具限制级抗菌药物",
    std: "根据《抗菌药物临床应用管理办法》及本院分级目录，您当前职称/岗位未获得【限制级/特殊级】抗菌药物处方权限，已临时拦截该处方。",
    sugg: "请先完善细菌培养及药敏结果，如有必要请发起特殊用药会诊申请，经科室主任+药学部审批后方可使用。",
    cnt: 127,
  },
  {
    cat: "OVER_DURATION",
    title: "预防用药疗程超48小时",
    std: "依据《抗菌药物临床应用指导原则》，清洁手术预防用药时间不超过24小时，污染手术可延长至48小时。本次处方疗程超标。",
    sugg: "建议评估患者感染控制情况，如体温、血象、引流液均正常，尽早停用抗菌药物，避免耐药风险。",
    cnt: 94,
  },
  {
    cat: "DUPLICATE",
    title: "β-内酰胺类抗菌药物重复联用",
    std: "同时使用的两种抗菌药物作用靶点均为细菌细胞壁，存在药理学作用重叠，未体现协同效应反而增加不良反应风险。",
    sugg: "建议保留一种广谱β-内酰胺类药物，如需抗厌氧菌覆盖，可联合甲硝唑而非两种同类药物联用。",
    cnt: 61,
  },
  {
    cat: "NO_INDICATION",
    title: "病毒性上呼吸道感染使用抗菌药物",
    std: "患者主诉、体征及辅助检查结果均提示病毒性感染可能，未发现明确细菌感染证据，抗菌药物使用指征不足。",
    sugg: "建议以对症支持治疗为主，如临床高度怀疑细菌感染，请完善PCT、CRP及细菌培养检查后再评估。",
    cnt: 88,
  },
  {
    cat: "NO_INDICATION",
    title: "发热待查无指征经验性使用广谱抗菌药物",
    std: "目前患者诊断为'发热待查'，热程＜3天且无感染高危因素，即启动限制级抗菌药物经验治疗不符合指南要求。",
    sugg: "建议先完善血常规、PCT、血培养、胸部影像等病因学检查，待有明确感染证据后再启动抗菌治疗。",
    cnt: 52,
  },
  {
    cat: "GENERAL",
    title: "DDDs异常偏高科室综合整改",
    std: "您科室本月抗菌药物使用强度（DDDs）超过全院控制目标，需要对重点医生、重点品种进行专项点评。",
    sugg: "建议组织科室内部学习，建立DDDs预警谈话机制，对抗菌药物使用前10%的医生进行一对一反馈。",
    cnt: 38,
  },
  {
    cat: "OVER_DURATION",
    title: "特殊级抗菌药物疗程超14天",
    std: "万古霉素/碳青霉烯类连续使用超过14天，存在诱导耐药、肾毒性及艰难梭菌感染的高风险。",
    sugg: "请重新评估感染控制情况，结合病原学结果考虑降阶梯治疗，必要时每周复查TDM、肝肾功能及便常规。",
    cnt: 41,
  },
  {
    cat: "DUPLICATE",
    title: "喹诺酮类+β-内酰胺联用无明确指征",
    std: "两药联用未发现明确的混合感染或难治性感染证据，存在随意联合用药倾向。",
    sugg: "除非明确为铜绿假单胞菌感染或重症感染需要协同作用，否则请选择单一抗菌药物治疗。",
    cnt: 33,
  },
];

export const INTERVENTION_TEMPLATES: InterventionTemplate[] = TEMPLATES.map((t, i) => ({
  id: `tpl${String(i + 1).padStart(3, "0")}`,
  category: t.cat,
  title: t.title,
  standardText: t.std,
  suggestion: t.sugg,
  useCount: t.cnt,
}));

const RECT_TITLES = [
  "呼吸科3组越级开具限制级药物问题整改",
  "ICU特殊级用药48h审批流程不规范整改",
  "普外科I类切口围术期预防用药超标整改",
  "儿科门诊抗菌药物使用率超标专项整改",
  "肿瘤科化疗后粒缺伴发热抗菌药物使用规范",
  "急诊科经验性使用碳青霉烯类点评整改",
  "骨科植入物围术期用药时长专项整改",
  "血液科万古霉素TDM监测依从性整改",
];

const STATUSES: RectificationStatus[] = ["PENDING", "IN_PROGRESS", "REVIEWING", "DONE", "REJECTED"];
const STATUS_WEIGHTS = [2, 3, 2, 4, 1];

export const RECTIFICATION_TASKS: RectificationTask[] = Array.from({ length: 24 }, (_, i) => {
  const dept = DEPARTMENTS[i % DEPARTMENTS.length];
  const tpl = INTERVENTION_TEMPLATES[i % INTERVENTION_TEMPLATES.length];
  const docs = ALL_DOCTORS.filter((u) => u.departmentId === dept.id);
  const assignee = docs[i % docs.length];
  const daysCreated = (i * 2) % 20;
  const daysDeadline = 3 + (i % 10);
  let statusIdx = 0;
  let cumsum = 0;
  const r = i % STATUS_WEIGHTS.reduce((a, b) => a + b, 0);
  for (let j = 0; j < STATUS_WEIGHTS.length; j++) {
    cumsum += STATUS_WEIGHTS[j];
    if (r < cumsum) { statusIdx = j; break; }
  }
  const status = STATUSES[statusIdx];
  const hasFeedback = status !== "PENDING";
  const hasReview = status === "DONE" || status === "REJECTED";

  return {
    id: `rect${String(i + 1).padStart(4, "0")}`,
    title: `${dept.shortName}·${tpl.title}`,
    description: `根据${dayjs().subtract(daysCreated, "day").format("YYYY年M月")}抗菌药物临床应用专项检查结果，您科室存在以下问题：\n\n1. ${tpl.title}\n2. 涉及处方${3 + (i % 8)}张，覆盖医生${2 + (i % 5)}人\n3. ${tpl.standardText}`,
    category: tpl.category,
    templateId: tpl.id,
    assigneeName: assignee.name,
    assigneeTitle: assignee.title as DoctorTitle,
    departmentName: dept.name,
    creatorName: i % 2 === 0 ? "李淑芬" : "王建国",
    status,
    priority: i % 4 === 0 ? "HIGH" : i % 3 === 0 ? "MEDIUM" : "LOW",
    createdAt: dayjs().subtract(daysCreated, "day").format("YYYY-MM-DD HH:mm"),
    deadline: dayjs().subtract(daysCreated, "day").add(daysDeadline, "day").format("YYYY-MM-DD"),
    feedback: hasFeedback ? `整改措施：\n1. 已组织科室全员学习《抗菌药物分级管理细则》并完成考核，通过率100%。\n2. 针对本次涉及的${2 + (i % 5)}位医生进行一对一反馈和谈话。\n3. 调整科室HIS权限配置，对超权限处方强制预审。\n4. 自即日起每月公示DDDs排名前3位医生。` : undefined,
    feedbackAt: hasFeedback ? dayjs().subtract(daysCreated, "day").add(Math.max(1, daysDeadline - 1), "day").format("YYYY-MM-DD HH:mm") : undefined,
    reviewedBy: hasReview ? "王建国" : undefined,
    reviewedAt: hasReview ? dayjs().subtract(daysCreated, "day").add(daysDeadline + 1, "day").format("YYYY-MM-DD HH:mm") : undefined,
    reviewOpinion: hasReview ? (status === "DONE" ? "整改措施到位，同意结案。建议持续监测3个月。" : "整改措施过于笼统，请补充具体数据对比（整改前后DDDs、预警次数）。") : undefined,
  };
});

export function getTasksByStatus(s: RectificationStatus) {
  return RECTIFICATION_TASKS.filter((t) => t.status === s);
}

export function getRectificationStats() {
  const total = RECTIFICATION_TASKS.length;
  const done = RECTIFICATION_TASKS.filter((t) => t.status === "DONE").length;
  const overdue = RECTIFICATION_TASKS.filter((t) =>
    t.status !== "DONE" && dayjs().isAfter(dayjs(t.deadline), "day")
  ).length;
  return { total, done, inProgress: total - done, overdue, completionRate: +(done / total).toFixed(3) };
}
