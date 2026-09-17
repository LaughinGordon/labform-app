import { todayIso, uid } from "./utils";
import type {
  CompanyPreset,
  Job,
  Sample,
  SampleType,
  ServiceLevel,
  TestItem,
  Tests,
} from "./types";

export const COMPANIES: CompanyPreset[] = [
  {
    id: "hfg",
    name: "HFG Procurement Ltd",
    address: "新界元朗唐人新村屏唐東路9號合興大廈二樓J至M室",
    billingAddress:
      "Flat D, UG/F, Hop Hing Industrial Building, 704 Castle Peak Road, Lai Chi Kok, HK",
    defaultFor: ["air", "raw"],
  },
  {
    id: "hhf",
    name: "Hop Hing Foods (HK) Limited",
    address: "新界元朗唐人新村屏唐東路9號合興大廈二樓A至B室 (部份)",
    billingAddress:
      "Flat D, UG/F, Hop Hing Industrial Building, 704 Castle Peak Road, Lai Chi Kok, HK",
    defaultFor: ["cooked"],
  },
];

export const DEFAULT_CONTACT = {
  contactPerson: "Gordon Lin",
  tel: "90800951",
  email: "gordonlin@hfghk.com",
  fax: "",
  billTo: "同上",
};

export const SAMPLE_TYPE_META: Record<
  SampleType,
  { en: string; zh: string; hint: string; storageLabel: string }
> = {
  air: {
    en: "Air sample",
    zh: "空氣樣本",
    hint: "生產區空氣平板 · 常溫",
    storageLabel: "Ambient",
  },
  raw: {
    en: "Raw food",
    zh: "生食樣本",
    hint: "急凍肉類及原材料 · Frozen",
    storageLabel: "Frozen",
  },
  cooked: {
    en: "Cooked food",
    zh: "熟食樣本",
    hint: "中央廚房熟食 · 冷藏 0–4°C",
    storageLabel: "Refrigerated",
  },
};

export const ORIGIN_OPTIONS = [
  "HK",
  "US",
  "China",
  "Australia",
  "Brazil",
  "New Zealand",
  "Canada",
  "Japan",
  "Thailand",
];

export const MANUFACTURER_PRESETS: Record<SampleType, string[]> = {
  air: ["YLPC", "MIHK"],
  raw: ["JBS", "Cargill", "Beipiao City Hong Fa Staff Co. Ltd"],
  cooked: ["MIHK", "YLPC"],
};

export const SERVICE_LEVELS: Array<{ id: Exclude<ServiceLevel, "">; en: string; zh: string }> = [
  { id: "regular", en: "Regular", zh: "標準" },
  { id: "express", en: "Express", zh: "加急" },
  { id: "doubleExpress", en: "Double Express", zh: "特急" },
  { id: "emergency", en: "Emergency", zh: "緊急" },
];

export function jobQuotationRequired(job: Job) {
  return job.quotationRequired !== false;
}

export function jobServiceLevel(job: Job): ServiceLevel {
  return job.serviceLevel ?? "regular";
}

export function jobSeparateReport(job: Job) {
  return job.separateReportPerSample !== false;
}

function testItem(on = false, methods: string[] = []): TestItem {
  return { on, methods: on ? methods : [], specify: "" };
}

export function defaultTests(): Tests {
  return {
    shelfLife: false,
    shelfLifeDate: "",
    tpc: testItem(true, ["AOAC"]),
    ecoli: testItem(true, ["AOAC"]),
    coliform: testItem(),
    salmonella: testItem(),
    staph: testItem(),
    yeast: testItem(),
    clostridium: testItem(),
    bacillus: testItem(),
    vibrio: testItem(),
    listeria: testItem(),
    otherMicro: testItem(),
    nutritionLabeling: false,
    panelRequested: false,
    nutritionRegion: [],
    individualNutrition: false,
    heavyMetal: false,
    preservative: false,
    colour: false,
    pesticide: false,
    melamine: false,
    aflatoxin: false,
    otherChemical: "",
  };
}

export function companyForType(type: SampleType): CompanyPreset {
  return COMPANIES.find((c) => c.defaultFor.includes(type)) ?? COMPANIES[0];
}

export function defaultStorage(type: SampleType) {
  if (type === "air") return "ambient" as const;
  if (type === "cooked") return "refrigerated" as const;
  return "frozen" as const;
}

export function createSample(type: SampleType, index = 1): Sample {
  const date = todayIso();
  return {
    id: uid(),
    label: `Sample ${index}`,
    productDescription: "",
    sampleQuantity: "1",
    additionalInfo: "",
    manufacturer: "",
    styleItemNo: "",
    countryOfOrigin: type === "raw" ? "" : "HK",
    poLotNo: "",
    countryOfDestination: "HK",
    buyerAgent: "",
    othersReference: "",
    productionDate: "",
    tests: defaultTests(),
    storage: defaultStorage(type),
    storageOther: "",
    clientSamplingDate: "",
    collectionDate: date,
    collectionAmpm: "",
    samplingCondition: "original",
    samplingOther: "",
  };
}

export function createJob(type: SampleType): Job {
  const company = companyForType(type);
  const now = new Date().toISOString();
  return {
    id: uid(),
    sampleType: type,
    companyId: company.id,
    companyName: company.name,
    address: company.address,
    billingAddress: company.billingAddress,
    ...DEFAULT_CONTACT,
    quotationRequired: true,
    serviceLevel: "regular",
    separateReportPerSample: true,
    createdAt: now,
    updatedAt: now,
    samples: [createSample(type, 1)],
  };
}

export const MICRO_TESTS: Array<{
  key: keyof Pick<
    Tests,
    | "tpc"
    | "ecoli"
    | "coliform"
    | "salmonella"
    | "staph"
    | "yeast"
    | "clostridium"
    | "bacillus"
    | "vibrio"
    | "listeria"
    | "otherMicro"
  >;
  en: string;
  zh: string;
  methods: string[];
}> = [
  { key: "tpc", en: "Total Plate Count", zh: "菌落總數", methods: ["AOAC", "FDA", "APHA", "GB", "Others"] },
  { key: "ecoli", en: "E.Coli", zh: "大腸埃希氏菌", methods: ["AOAC", "FDA", "DoE", "GB", "Others"] },
  { key: "coliform", en: "Coliform", zh: "大腸菌群", methods: ["AOAC", "FDA", "DoE", "GB", "Others"] },
  { key: "salmonella", en: "Salmonella", zh: "沙門氏菌", methods: ["AOAC", "FDA", "GB", "Others"] },
  { key: "staph", en: "Staph. Aureus", zh: "金黃色葡萄球菌", methods: ["AOAC", "FDA", "GB", "Others"] },
  { key: "yeast", en: "Yeast & Mould", zh: "霉菌及酵母菌", methods: ["AOAC", "FDA", "GB", "Others"] },
  { key: "clostridium", en: "C. Perfringens", zh: "產氣莢膜梭菌", methods: ["FDA", "GB", "Others"] },
  { key: "bacillus", en: "Bacillus Cereus", zh: "蠟狀芽孢桿菌", methods: ["DAS", "ISO", "Others"] },
  { key: "vibrio", en: "Vibrio", zh: "霍亂 / 副溶血弧菌", methods: ["FDA", "Others"] },
  { key: "listeria", en: "Listeria Mono.", zh: "李斯特菌", methods: ["FDA", "GB", "Others"] },
  { key: "otherMicro", en: "Other micro", zh: "其他微生物", methods: [] },
];

export const CHEMICAL_TESTS: Array<{
  key: keyof Pick<
    Tests,
    | "nutritionLabeling"
    | "panelRequested"
    | "individualNutrition"
    | "heavyMetal"
    | "preservative"
    | "colour"
    | "pesticide"
    | "melamine"
    | "aflatoxin"
  >;
  en: string;
  zh: string;
}> = [
  { key: "nutritionLabeling", en: "Nutrition Labeling", zh: "營養標籤" },
  { key: "panelRequested", en: "Panel requested", zh: "營養標籤組合" },
  { key: "individualNutrition", en: "Individual items", zh: "個別營養素" },
  { key: "heavyMetal", en: "Heavy Metal", zh: "重金屬" },
  { key: "preservative", en: "Preservative", zh: "防腐劑" },
  { key: "colour", en: "Colouring Matter", zh: "色素" },
  { key: "pesticide", en: "Pesticide Residue", zh: "除害劑殘餘" },
  { key: "melamine", en: "Melamine", zh: "三聚氰胺" },
  { key: "aflatoxin", en: "Aflatoxin", zh: "黃曲霉毒素" },
];

export const NUTRITION_REGIONS: Array<{ id: "hk" | "us" | "china" | "other"; en: string }> = [
  { id: "hk", en: "HK" },
  { id: "us", en: "US" },
  { id: "china", en: "China" },
  { id: "other", en: "Other" },
];
