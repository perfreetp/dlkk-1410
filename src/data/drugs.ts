import type { Drug, DrugCategory, Severity } from "@/types";

const NAMES: Array<{ name: string; generic: string; spec: string; cat: DrugCategory; ddd: number; unit: string; sev: Severity }> = [
  { name: "青霉素钠注射液", generic: "Benzylpenicillin Sodium", spec: "80万U/瓶", cat: "NON_RESTRICTED", ddd: 3.6, unit: "g", sev: "LOW" },
  { name: "阿莫西林胶囊", generic: "Amoxicillin", spec: "0.25g×24粒", cat: "NON_RESTRICTED", ddd: 1.0, unit: "g", sev: "LOW" },
  { name: "头孢氨苄片", generic: "Cefalexin", spec: "0.25g×24片", cat: "NON_RESTRICTED", ddd: 2.0, unit: "g", sev: "LOW" },
  { name: "头孢呋辛酯片", generic: "Cefuroxime Axetil", spec: "0.25g×12片", cat: "NON_RESTRICTED", ddd: 0.5, unit: "g", sev: "LOW" },
  { name: "头孢唑林钠注射液", generic: "Cefazolin Sodium", spec: "1.0g/瓶", cat: "NON_RESTRICTED", ddd: 3.0, unit: "g", sev: "LOW" },
  { name: "左氧氟沙星片", generic: "Levofloxacin", spec: "0.5g×5片", cat: "NON_RESTRICTED", ddd: 0.5, unit: "g", sev: "MEDIUM" },
  { name: "阿奇霉素分散片", generic: "Azithromycin", spec: "0.25g×6片", cat: "NON_RESTRICTED", ddd: 0.3, unit: "g", sev: "LOW" },
  { name: "克林霉素注射液", generic: "Clindamycin", spec: "0.3g/支", cat: "NON_RESTRICTED", ddd: 1.2, unit: "g", sev: "MEDIUM" },
  { name: "复方磺胺甲噁唑片", generic: "SMZ-TMP", spec: "0.48g×100片", cat: "NON_RESTRICTED", ddd: 2.0, unit: "g", sev: "MEDIUM" },
  { name: "甲硝唑注射液", generic: "Metronidazole", spec: "0.5g/100ml", cat: "NON_RESTRICTED", ddd: 1.5, unit: "g", sev: "LOW" },
  { name: "头孢替安注射液", generic: "Cefotiam", spec: "1.0g/瓶", cat: "RESTRICTED", ddd: 3.0, unit: "g", sev: "MEDIUM" },
  { name: "头孢孟多酯钠注射液", generic: "Cefamandole", spec: "1.0g/瓶", cat: "RESTRICTED", ddd: 4.0, unit: "g", sev: "MEDIUM" },
  { name: "头孢西丁钠注射液", generic: "Cefoxitin Sodium", spec: "1.0g/瓶", cat: "RESTRICTED", ddd: 4.0, unit: "g", sev: "MEDIUM" },
  { name: "头孢地嗪钠注射液", generic: "Cefodizime", spec: "1.0g/瓶", cat: "RESTRICTED", ddd: 2.0, unit: "g", sev: "MEDIUM" },
  { name: "阿奇霉素注射液", generic: "Azithromycin", spec: "0.25g/支", cat: "RESTRICTED", ddd: 0.3, unit: "g", sev: "MEDIUM" },
  { name: "莫西沙星片", generic: "Moxifloxacin", spec: "0.4g×3片", cat: "RESTRICTED", ddd: 0.4, unit: "g", sev: "HIGH" },
  { name: "莫西沙星注射液", generic: "Moxifloxacin", spec: "0.4g/250ml", cat: "RESTRICTED", ddd: 0.4, unit: "g", sev: "HIGH" },
  { name: "环丙沙星注射液", generic: "Ciprofloxacin", spec: "0.2g/100ml", cat: "RESTRICTED", ddd: 1.0, unit: "g", sev: "MEDIUM" },
  { name: "阿莫西林克拉维酸钾", generic: "Amoxicillin/Clav", spec: "0.6g/瓶", cat: "RESTRICTED", ddd: 1.2, unit: "g", sev: "MEDIUM" },
  { name: "哌拉西林他唑巴坦", generic: "Piperacillin/Tazobactam", spec: "4.5g/瓶", cat: "RESTRICTED", ddd: 14.0, unit: "g", sev: "HIGH" },
  { name: "头孢哌酮舒巴坦钠", generic: "Cefoperazone/Sulbactam", spec: "1.5g/瓶", cat: "RESTRICTED", ddd: 4.0, unit: "g", sev: "HIGH" },
  { name: "万古霉素注射液", generic: "Vancomycin", spec: "0.5g/瓶", cat: "SPECIAL", ddd: 2.0, unit: "g", sev: "HIGH" },
  { name: "去甲万古霉素注射液", generic: "Norvancomycin", spec: "0.4g/瓶", cat: "SPECIAL", ddd: 1.6, unit: "g", sev: "HIGH" },
  { name: "美罗培南注射液", generic: "Meropenem", spec: "0.5g/瓶", cat: "SPECIAL", ddd: 1.5, unit: "g", sev: "CRITICAL" },
  { name: "亚胺培南西司他丁", generic: "Imipenem/Cilastatin", spec: "1.0g/瓶", cat: "SPECIAL", ddd: 2.0, unit: "g", sev: "CRITICAL" },
  { name: "比阿培南注射液", generic: "Biapenem", spec: "0.3g/瓶", cat: "SPECIAL", ddd: 1.2, unit: "g", sev: "CRITICAL" },
  { name: "利奈唑胺注射液", generic: "Linezolid", spec: "0.6g/300ml", cat: "SPECIAL", ddd: 1.2, unit: "g", sev: "CRITICAL" },
  { name: "利奈唑胺片", generic: "Linezolid", spec: "0.6g×10片", cat: "SPECIAL", ddd: 1.2, unit: "g", sev: "CRITICAL" },
  { name: "伏立康唑注射液", generic: "Voriconazole", spec: "0.2g/瓶", cat: "SPECIAL", ddd: 0.4, unit: "g", sev: "CRITICAL" },
  { name: "伏立康唑片", generic: "Voriconazole", spec: "0.2g×10片", cat: "SPECIAL", ddd: 0.4, unit: "g", sev: "CRITICAL" },
  { name: "卡泊芬净注射液", generic: "Caspofungin", spec: "50mg/瓶", cat: "SPECIAL", ddd: 50, unit: "mg", sev: "CRITICAL" },
  { name: "米卡芬净注射液", generic: "Micafungin", spec: "50mg/瓶", cat: "SPECIAL", ddd: 150, unit: "mg", sev: "CRITICAL" },
  { name: "两性霉素B脂质体", generic: "AmB Liposome", spec: "10mg/瓶", cat: "SPECIAL", ddd: 3.0, unit: "mg", sev: "CRITICAL" },
  { name: "替加环素注射液", generic: "Tigecycline", spec: "50mg/瓶", cat: "SPECIAL", ddd: 100, unit: "mg", sev: "CRITICAL" },
  { name: "粘菌素甲磺酸钠", generic: "Colistimethate", spec: "1MU/瓶", cat: "SPECIAL", ddd: 5.0, unit: "MU", sev: "CRITICAL" },
];

const MFR = ["华北制药", "石药集团", "齐鲁制药", "扬子江药业", "恒瑞医药", "豪森药业", "正大天晴", "复星医药", "科伦药业", "上药集团"];

const INDICATIONS: Record<DrugCategory, string[]> = {
  NON_RESTRICTED: [
    "适用于敏感细菌所致的呼吸道感染、尿路感染、皮肤软组织感染等轻中度感染",
    "用于革兰阳性菌及部分革兰阴性菌所致的各类感染",
    "用于敏感菌所致的中耳炎、鼻窦炎、咽炎、扁桃体炎等上呼吸道感染",
    "可用于外科手术预防用药",
  ],
  RESTRICTED: [
    "用于敏感菌所致的中重度呼吸道、泌尿道、腹腔感染等",
    "适用于革兰阴性杆菌包括产酶菌所致的下呼吸道、尿路等感染",
    "用于需氧菌与厌氧菌混合感染的治疗",
    "用于对常规抗菌药物疗效不佳的中重度感染",
  ],
  SPECIAL: [
    "限用于多重耐药菌(MDR)感染、免疫功能低下合并感染等",
    "用于耐甲氧西林金黄色葡萄球菌(MRSA)、肠球菌等革兰阳性菌严重感染",
    "用于革兰阴性菌产ESBLs/AmpC酶所致的严重感染",
    "用于侵袭性真菌感染的一线/挽救治疗",
  ],
};

const CONTRA = ["对本品或同类药物过敏者禁用", "新生儿、孕妇及哺乳期妇女慎用或遵医嘱", "严重肝肾功能不全者禁用或减量", "有青霉素类过敏史者慎用"];

const DOSAGES: Record<DrugCategory, string[]> = {
  NON_RESTRICTED: [
    "成人一次0.5g，一日3-4次；儿童按体重一日50-100mg/kg，分3-4次",
    "成人一日2-4g，分2-4次静脉滴注；重症可酌情加量",
    "口服，成人一次0.25g，每6-8小时1次，疗程7-14天",
  ],
  RESTRICTED: [
    "成人一次1-2g，每8-12小时一次静脉滴注；严重感染可加量至一日6g",
    "成人一日0.4g，分1-2次给药，口服或静脉滴注，疗程5-14天",
    "成人一次4.5g，每6-8小时一次静脉滴注，最大日剂量18g",
  ],
  SPECIAL: [
    "成人一次0.5g，每6-12小时一次静脉滴注，需根据血药浓度监测调整剂量",
    "成人起始剂量0.4g每12小时，维持量0.2g每12小时，严重感染可加量",
    "成人一日1.5-2.0g，分3-4次静脉滴注，需TDM监测",
  ],
};

export const DRUGS: Drug[] = NAMES.map((d, i) => ({
  id: `drug${String(i + 1).padStart(3, "0")}`,
  name: d.name,
  genericName: d.generic,
  specification: d.spec,
  category: d.cat,
  manufacturer: MFR[i % MFR.length],
  indication: INDICATIONS[d.cat][i % INDICATIONS[d.cat].length],
  contraindication: CONTRA[i % CONTRA.length],
  dosage: DOSAGES[d.cat][i % DOSAGES[d.cat].length],
  warningLevel: d.sev,
  dddValue: d.ddd,
  dddUnit: d.unit,
  updatedAt: `2026-0${(i % 5) + 1}-${(i % 27) + 1} ${String((i % 12) + 8).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
}));

export function getDrug(id: string): Drug | undefined {
  return DRUGS.find((d) => d.id === id);
}

export function getDrugsByCategory(cat: DrugCategory): Drug[] {
  return DRUGS.filter((d) => d.category === cat);
}
