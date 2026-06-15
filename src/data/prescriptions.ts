import type { PrescriptionWarning, WarningType, Severity, DoctorTitle } from "@/types";
import { DEPARTMENTS, ALL_DOCTORS } from "./users";
import { DRUGS } from "./drugs";
import dayjs from "dayjs";

const WARN_TYPES: WarningType[] = ["OVER_GRADE", "OVER_DURATION", "DUPLICATE", "NO_INDICATION"];
const SEVERITIES: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const SEV_WEIGHTS: Record<WarningType, Severity[]> = {
  OVER_GRADE: ["HIGH", "CRITICAL", "HIGH", "MEDIUM"],
  OVER_DURATION: ["MEDIUM", "MEDIUM", "HIGH", "LOW"],
  DUPLICATE: ["HIGH", "MEDIUM", "MEDIUM", "LOW"],
  NO_INDICATION: ["CRITICAL", "HIGH", "HIGH", "MEDIUM"],
};

const DESCRIPTIONS: Record<WarningType, string[]> = {
  OVER_GRADE: [
    "住院医师越级开具限制级抗菌药物头孢哌酮舒巴坦钠",
    "主治医师无特殊级权限，开具美罗培南注射液",
    "该医师未获得特殊级授权，擅自使用万古霉素",
    "住院医师越级使用莫西沙星注射液",
  ],
  OVER_DURATION: [
    "头孢呋辛酯片预防用药处方开具14天，建议≤7天",
    "左氧氟沙星注射液连续使用21天，建议复查评估",
    "万古霉素疗程超过14天，建议TDM监测并评估必要性",
    "哌拉西林他唑巴坦使用18天，疑似超疗程",
  ],
  DUPLICATE: [
    "同时使用头孢呋辛钠和头孢西丁钠，同类药物重复联用",
    "左氧氟沙星+莫西沙星同时处方，喹诺酮类重复",
    "万古霉素与去甲万古霉素联合使用，药理作用重叠",
    "甲硝唑+奥硝唑联用，硝基咪唑类重复",
  ],
  NO_INDICATION: [
    "诊断为上呼吸道感染（病毒性），无抗菌药物使用指征",
    "发热待查未明确细菌感染，即经验性使用限制级药物",
    "清洁手术（甲状腺切除术）术后预防用药超48小时",
    "诊断为偏头痛，无感染证据处方抗菌药物",
  ],
};

const PATIENT_SURNAMES = ["王", "李", "张", "刘", "陈", "杨", "黄", "赵", "吴", "周", "徐", "孙", "马", "朱", "胡", "林", "郭", "何", "高", "罗"];
const PATIENT_GIVEN = ["建国", "淑芬", "志强", "丽娟", "伟", "敏", "静", "磊", "芳", "娜", "军", "洋", "勇", "艳", "杰", "涛", "明", "超", "平", "刚"];

function pickRandom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function genPatient(i: number) {
  return {
    name: PATIENT_SURNAMES[i % PATIENT_SURNAMES.length] + PATIENT_GIVEN[Math.floor(i / PATIENT_SURNAMES.length) % PATIENT_GIVEN.length],
    age: 20 + (i * 7) % 70,
    gender: (i % 2 === 0 ? "M" : "F") as "M" | "F",
  };
}

function pickDoctor(deptId: string, seed: number): { name: string; title: DoctorTitle } {
  const doctors = ALL_DOCTORS.filter((d) => d.departmentId === deptId);
  const d = doctors[seed % doctors.length] || ALL_DOCTORS[0];
  return { name: d.name, title: d.title };
}

function pickDrugs(cat: WarningType, seed: number): string[] {
  const special = DRUGS.filter((d) => d.category === "SPECIAL").map((d) => d.name);
  const restricted = DRUGS.filter((d) => d.category === "RESTRICTED").map((d) => d.name);
  const normal = DRUGS.filter((d) => d.category === "NON_RESTRICTED").map((d) => d.name);
  switch (cat) {
    case "OVER_GRADE":
      return [pickRandom([...special, ...restricted], seed)];
    case "DUPLICATE":
      return [pickRandom(restricted, seed), pickRandom(restricted, seed + 1)];
    case "OVER_DURATION":
      return [pickRandom([...normal, ...restricted], seed)];
    case "NO_INDICATION":
      return [pickRandom(normal, seed), pickRandom(restricted, seed + 1)];
  }
}

export const PRESCRIPTION_WARNINGS: PrescriptionWarning[] = Array.from({ length: 80 }, (_, i) => {
  const type = WARN_TYPES[i % WARN_TYPES.length];
  const severity = SEV_WEIGHTS[type][i % SEV_WEIGHTS[type].length];
  const dept = pickRandom(DEPARTMENTS, i * 3);
  const doc = pickDoctor(dept.id, i * 5);
  const patient = genPatient(i);
  const hoursAgo = i * 3 + Math.floor(Math.random() * 12);
  const isHandled = i % 3 === 0;
  const isDismissed = i % 7 === 0;

  return {
    id: `warn${String(i + 1).padStart(4, "0")}`,
    prescriptionId: `RX${String(20260616000 + i).padStart(12, "0")}`,
    patientName: patient.name,
    patientAge: patient.age,
    patientGender: patient.gender,
    doctorName: doc.name,
    doctorTitle: doc.title,
    departmentName: dept.name,
    departmentId: dept.id,
    warningType: type,
    severity,
    description: pickRandom(DESCRIPTIONS[type], i),
    drugs: pickDrugs(type, i),
    createdAt: dayjs().subtract(hoursAgo, "hour").format("YYYY-MM-DD HH:mm"),
    status: isDismissed ? "DISMISSED" : isHandled ? "HANDLED" : "PENDING",
    handler: isHandled ? "李淑芬" : undefined,
    handledAt: isHandled ? dayjs().subtract(hoursAgo - 1, "hour").format("YYYY-MM-DD HH:mm") : undefined,
    handleOpinion: isHandled ? pickRandom([
      "已电话告知主管医生，建议降级用药",
      "科室主任已确认，予以放行并记录备案",
      "已退回修改，要求补充细菌培养结果",
      "已发会诊申请，等待感染科意见",
    ], i) : undefined,
  };
});

export function getPendingWarnings() {
  return PRESCRIPTION_WARNINGS.filter((w) => w.status === "PENDING");
}
export function getWarningsByDepartment(deptId: string) {
  return PRESCRIPTION_WARNINGS.filter((w) => w.departmentId === deptId);
}
export function getWarningStats() {
  const total = PRESCRIPTION_WARNINGS.length;
  const byType: Record<WarningType, number> = { OVER_GRADE: 0, OVER_DURATION: 0, DUPLICATE: 0, NO_INDICATION: 0 };
  const bySev: Record<Severity, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  const pending = PRESCRIPTION_WARNINGS.filter((w) => w.status === "PENDING").length;
  PRESCRIPTION_WARNINGS.forEach((w) => {
    byType[w.warningType]++;
    bySev[w.severity]++;
  });
  return { total, byType, bySev, pending };
}
