import type { User, Department, DoctorTitle, UserRole, PermissionConfig } from "@/types";

export const DEPARTMENTS: Department[] = [
  { id: "d01", name: "呼吸与危重症医学科", shortName: "呼吸科", directorId: "u02", doctorCount: 18 },
  { id: "d02", name: "重症医学科", shortName: "ICU", directorId: "u03", doctorCount: 12 },
  { id: "d03", name: "普通外科", shortName: "普外科", directorId: "u04", doctorCount: 16 },
  { id: "d04", name: "骨科", shortName: "骨科", directorId: "u05", doctorCount: 14 },
  { id: "d05", name: "神经外科", shortName: "神外科", directorId: "u06", doctorCount: 10 },
  { id: "d06", name: "心血管内科", shortName: "心内科", directorId: "u07", doctorCount: 15 },
  { id: "d07", name: "消化内科", shortName: "消化科", directorId: "u08", doctorCount: 13 },
  { id: "d08", name: "血液内科", shortName: "血液科", directorId: "u09", doctorCount: 9 },
  { id: "d09", name: "肿瘤科", shortName: "肿瘤科", directorId: "u10", doctorCount: 11 },
  { id: "d10", name: "儿科", shortName: "儿科", directorId: "u11", doctorCount: 17 },
  { id: "d11", name: "急诊科", shortName: "急诊科", directorId: "u12", doctorCount: 20 },
  { id: "d12", name: "泌尿外科", shortName: "泌尿科", directorId: "u13", doctorCount: 8 },
];

const TITLES: DoctorTitle[] = ["PROFESSOR", "ASSOCIATE_PROFESSOR", "ATTENDING", "RESIDENT"];
const TITLE_NAMES = ["主任医师", "副主任医师", "主治医师", "住院医师"];
const SURNAMES = ["张", "王", "李", "赵", "刘", "陈", "杨", "黄", "周", "吴", "徐", "孙", "胡", "朱", "高", "林", "何", "郭", "马", "罗"];
const GIVEN_NAMES = ["伟", "芳", "娜", "敏", "静", "强", "磊", "军", "洋", "勇", "艳", "杰", "娟", "涛", "明", "超", "秀英", "霞", "平", "刚"];

function genName(i: number): string {
  const s = SURNAMES[i % SURNAMES.length];
  const g = GIVEN_NAMES[Math.floor(i / SURNAMES.length) % GIVEN_NAMES.length];
  return s + g;
}

export const CURRENT_USER: User = {
  id: "u00",
  name: "王建国",
  title: "PROFESSOR",
  departmentId: "d00",
  departmentName: "药学部",
  role: "PHARMACY_DIRECTOR",
};

export const USERS: User[] = [
  CURRENT_USER,
  { id: "u01", name: "李淑芬", title: "ASSOCIATE_PROFESSOR", departmentId: "d00", departmentName: "感染管理科", role: "INFECTION_CONTROL" },
  { id: "u02", name: genName(2), title: "PROFESSOR", departmentId: "d01", departmentName: "呼吸与危重症医学科", role: "DEPARTMENT_HEAD" },
  { id: "u03", name: genName(3), title: "PROFESSOR", departmentId: "d02", departmentName: "重症医学科", role: "DEPARTMENT_HEAD" },
  { id: "u04", name: genName(4), title: "PROFESSOR", departmentId: "d03", departmentName: "普通外科", role: "DEPARTMENT_HEAD" },
  { id: "u05", name: genName(5), title: "PROFESSOR", departmentId: "d04", departmentName: "骨科", role: "DEPARTMENT_HEAD" },
  { id: "u06", name: genName(6), title: "PROFESSOR", departmentId: "d05", departmentName: "神经外科", role: "DEPARTMENT_HEAD" },
  { id: "u07", name: genName(7), title: "PROFESSOR", departmentId: "d06", departmentName: "心血管内科", role: "DEPARTMENT_HEAD" },
  { id: "u08", name: genName(8), title: "PROFESSOR", departmentId: "d07", departmentName: "消化内科", role: "DEPARTMENT_HEAD" },
  { id: "u09", name: genName(9), title: "PROFESSOR", departmentId: "d08", departmentName: "血液内科", role: "DEPARTMENT_HEAD" },
  { id: "u10", name: genName(10), title: "PROFESSOR", departmentId: "d09", departmentName: "肿瘤科", role: "DEPARTMENT_HEAD" },
  { id: "u11", name: genName(11), title: "PROFESSOR", departmentId: "d10", departmentName: "儿科", role: "DEPARTMENT_HEAD" },
  { id: "u12", name: genName(12), title: "PROFESSOR", departmentId: "d11", departmentName: "急诊科", role: "DEPARTMENT_HEAD" },
  { id: "u13", name: genName(13), title: "PROFESSOR", departmentId: "d12", departmentName: "泌尿外科", role: "DEPARTMENT_HEAD" },
];

let uid = 20;
export const ALL_DOCTORS: User[] = [...USERS];
DEPARTMENTS.forEach((dept) => {
  for (let i = 0; i < dept.doctorCount - 1; i++) {
    const title = TITLES[Math.min(3, Math.floor(i / 4))];
    const role: UserRole = "CLINICAL_DOCTOR";
    ALL_DOCTORS.push({
      id: `u${uid++}`,
      name: genName(uid),
      title,
      departmentId: dept.id,
      departmentName: dept.name,
      role,
    });
  }
});

export function getDoctor(id: string): User | undefined {
  return ALL_DOCTORS.find((u) => u.id === id);
}

export function getDoctorsByDepartment(deptId: string): User[] {
  return ALL_DOCTORS.filter((u) => u.departmentId === deptId);
}

export const PERMISSION_MATRIX: PermissionConfig[] = (() => {
  const result: PermissionConfig[] = [];
  DEPARTMENTS.forEach((dept) => {
    TITLES.forEach((title, idx) => {
      const allowed: ("NON_RESTRICTED" | "RESTRICTED" | "SPECIAL")[] = ["NON_RESTRICTED"];
      if (idx <= 2) allowed.push("RESTRICTED");
      if (idx === 0 || (idx === 1 && ["d01", "d02", "d05", "d08"].includes(dept.id)))
        allowed.push("SPECIAL");
      result.push({
        departmentId: dept.id,
        departmentName: dept.name,
        title,
        allowedCategory: allowed,
        modifiedAt: "2026-05-20 14:30",
        modifiedBy: "王建国",
      });
    });
  });
  return result;
})();

export function getTitleName(t: DoctorTitle) {
  return TITLE_NAMES[TITLES.indexOf(t)];
}
