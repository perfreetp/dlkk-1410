import type { ApprovalRequest, ApprovalStatus, DrugCategory, ApprovalStep, DoctorTitle } from "@/types";
import { DEPARTMENTS, ALL_DOCTORS, getTitleName } from "./users";
import { DRUGS } from "./drugs";
import dayjs from "dayjs";

function pickDoc(deptId: string, seed: number) {
  const docs = ALL_DOCTORS.filter((d) => d.departmentId === deptId);
  return docs[seed % docs.length] || ALL_DOCTORS[0];
}

const PATIENTS = [
  { name: "张建国", age: 68, gender: "M" as const, diagnosis: "重症肺炎、脓毒症休克" },
  { name: "李淑芬", age: 54, gender: "F" as const, diagnosis: "急性化脓性胆管炎" },
  { name: "王志强", age: 47, gender: "M" as const, diagnosis: "颅脑外伤术后颅内感染" },
  { name: "刘美娟", age: 62, gender: "F" as const, diagnosis: "血液科化疗后粒细胞缺乏伴发热" },
  { name: "陈大勇", age: 73, gender: "M" as const, diagnosis: "多器官功能不全合并肺部感染" },
  { name: "杨丽", age: 39, gender: "F" as const, diagnosis: "坏死性筋膜炎" },
  { name: "黄伟明", age: 56, gender: "M" as const, diagnosis: "腹腔感染、感染性休克" },
  { name: "赵晓东", age: 41, gender: "M" as const, diagnosis: "心脏瓣膜置换术后感染性心内膜炎" },
  { name: "周小芳", age: 29, gender: "F" as const, diagnosis: "急性白血病化疗后侵袭性真菌感染" },
  { name: "吴建军", age: 65, gender: "M" as const, diagnosis: "慢性阻塞性肺疾病急性加重伴铜绿假单胞菌感染" },
  { name: "徐慧", age: 49, gender: "F" as const, diagnosis: "肝移植术后腹腔感染" },
  { name: "孙宝华", age: 71, gender: "M" as const, diagnosis: "ICU获得性肺炎、耐碳青霉烯类肺炎克雷伯菌" },
];

const REASONS = [
  "患者已使用三代头孢+甲硝唑3天，高热不退，体温39.5℃，降钙素原12.8ng/ml，病情危重，拟升级治疗。",
  "痰培养回报MDR-PA，仅对多粘菌素、替加环素敏感，现血流动力学不稳定，需紧急覆盖。",
  "血培养初步报革兰阳性球菌，考虑导管相关血流感染，患者有免疫抑制基础疾病。",
  "术后第3天出现高热、腹腔引流液脓性，临床诊断严重腹腔感染，需超广谱覆盖。",
  "患者有青霉素、头孢菌素过敏史，皮试（+），需使用万古霉素+氨曲南方案。",
  "G试验、GM试验连续阳性，胸部CT示多发结节晕征，高度怀疑侵袭性肺曲霉病。",
  "多次痰培养产ESBLs大肠杆菌，已使用哌拉西林他唑巴坦治疗失败。",
];

export const APPROVAL_REQUESTS: ApprovalRequest[] = Array.from({ length: 18 }, (_, i) => {
  const dept = DEPARTMENTS[i % DEPARTMENTS.length];
  const doc = pickDoc(dept.id, i * 2);
  const patient = PATIENTS[i % PATIENTS.length];
  const drugCat: DrugCategory = i % 3 === 0 ? "SPECIAL" : "RESTRICTED";
  const drugPool = DRUGS.filter((d) => d.category === drugCat);
  const drug = drugPool[i % drugPool.length];
  const hoursAgo = i + Math.floor(Math.random() * 24);
  const isUrgent = i % 5 === 0 || drugCat === "SPECIAL";

  let status: ApprovalStatus = "PENDING";
  let currentStep = 0;
  const steps: ApprovalStep[] = [];

  if (i % 4 === 0) {
    status = "APPROVED";
    currentStep = 3;
    steps.push({
      id: `s1-${i}`,
      stepType: "FIRST",
      approverName: "科室主任",
      approverTitle: "PROFESSOR",
      opinion: "同意申请，情况属实。",
      result: "APPROVED",
      signedAt: dayjs().subtract(hoursAgo + 2, "hour").format("YYYY-MM-DD HH:mm"),
    });
    steps.push({
      id: `s2-${i}`,
      stepType: "SECOND",
      approverName: "李淑芬",
      approverTitle: "ASSOCIATE_PROFESSOR",
      opinion: "建议密切监测肾功能，疗程不超7天复查。",
      result: "APPROVED",
      signedAt: dayjs().subtract(hoursAgo + 1, "hour").format("YYYY-MM-DD HH:mm"),
    });
    steps.push({
      id: `s3-${i}`,
      stepType: "FINAL",
      approverName: "王建国",
      approverTitle: "PROFESSOR",
      opinion: "同意，授权48小时，到期自动收回。",
      result: "APPROVED",
      signedAt: dayjs().subtract(hoursAgo, "hour").format("YYYY-MM-DD HH:mm"),
    });
  } else if (i % 5 === 0) {
    status = "IN_PROGRESS";
    currentStep = 2;
    steps.push({
      id: `s1-${i}`,
      stepType: "FIRST",
      approverName: "科室主任",
      approverTitle: "PROFESSOR",
      opinion: "同意申请。",
      result: "APPROVED",
      signedAt: dayjs().subtract(hoursAgo + 3, "hour").format("YYYY-MM-DD HH:mm"),
    });
  } else if (i % 6 === 0) {
    status = "REJECTED";
    currentStep = 2;
    steps.push({
      id: `s1-${i}`,
      stepType: "FIRST",
      approverName: "科室主任",
      approverTitle: "PROFESSOR",
      opinion: "同意申请。",
      result: "APPROVED",
      signedAt: dayjs().subtract(hoursAgo + 3, "hour").format("YYYY-MM-DD HH:mm"),
    });
    steps.push({
      id: `s2-${i}`,
      stepType: "SECOND",
      approverName: "李淑芬",
      approverTitle: "ASSOCIATE_PROFESSOR",
      opinion: "请先完善细菌培养结果，考虑降级使用头孢哌酮舒巴坦。",
      result: "REJECTED",
      signedAt: dayjs().subtract(hoursAgo, "hour").format("YYYY-MM-DD HH:mm"),
    });
  }

  return {
    id: `app${String(i + 1).padStart(4, "0")}`,
    applicantName: doc.name,
    applicantTitle: doc.title,
    departmentName: dept.name,
    departmentId: dept.id,
    patientName: patient.name,
    patientAge: patient.age,
    patientGender: patient.gender,
    patientDiagnosis: patient.diagnosis,
    drugName: drug.name,
    drugCategory: drugCat,
    drugSpecification: drug.specification,
    reason: REASONS[i % REASONS.length],
    proposedDosage: i % 2 === 0 ? "1g q8h ivgtt" : "0.5g q12h ivgtt",
    proposedDuration: 3 + (i % 10),
    createdAt: dayjs().subtract(hoursAgo, "hour").format("YYYY-MM-DD HH:mm"),
    deadline: status === "PENDING" || status === "IN_PROGRESS"
      ? dayjs().add(isUrgent ? 2 : 24, "hour").format("YYYY-MM-DD HH:mm")
      : undefined,
    isUrgent,
    status,
    validHours: status === "APPROVED" ? 48 : undefined,
    currentStep,
    steps,
  };
});

export function getPendingApprovals() {
  return APPROVAL_REQUESTS.filter((a) => a.status === "PENDING" || a.status === "IN_PROGRESS");
}
