export type SampleType = "air" | "raw" | "cooked";

export type StorageCondition = "frozen" | "refrigerated" | "ambient" | "other" | "";
export type SamplingCondition = "original" | "sterile" | "other" | "";
export type Ampm = "am" | "pm" | "";
export type ServiceLevel = "regular" | "express" | "doubleExpress" | "emergency" | "";

export interface TestItem {
  on: boolean;
  methods: string[];
  specify: string;
}

export type NutritionItem =
  | "carbohydrate"
  | "fat"
  | "protein"
  | "cholesterol"
  | "sugar"
  | "fiber"
  | "minerals"
  | "vitamins";

export interface Tests {
  shelfLife: boolean;
  shelfLifeDate: string;
  tpc: TestItem;
  ecoli: TestItem;
  coliform: TestItem;
  salmonella: TestItem;
  staph: TestItem;
  yeast: TestItem;
  clostridium: TestItem;
  bacillus: TestItem;
  vibrio: TestItem;
  listeria: TestItem;
  otherMicro: TestItem;
  nutritionLabeling: boolean;
  panelRequested: boolean;
  nutritionRegion: Array<"hk" | "us" | "china" | "other">;
  regionOtherSpecify?: string;
  individualNutrition: boolean;
  nutritionItems?: NutritionItem[];
  individualOther?: string;
  heavyMetal: boolean;
  heavyMetalSpecify?: string;
  preservative: boolean;
  preservativeSpecify?: string;
  colour: boolean;
  colourSpecify?: string;
  pesticide: boolean;
  pesticideSpecify?: string;
  melamine: boolean;
  aflatoxin: boolean;
  otherChemical: string;
}

export interface Sample {
  id: string;
  label: string;
  productDescription: string;
  sampleQuantity: string;
  additionalInfo: string;
  manufacturer: string;
  styleItemNo: string;
  countryOfOrigin: string;
  poLotNo: string;
  countryOfDestination: string;
  buyerAgent: string;
  othersReference: string;
  productionDate: string;
  tests: Tests;
  storage: StorageCondition;
  storageOther: string;
  clientSamplingDate: string;
  collectionDate: string;
  collectionAmpm: Ampm;
  samplingCondition: SamplingCondition;
  samplingOther: string;
}

export interface Job {
  id: string;
  sampleType: SampleType;
  companyId: string;
  companyName: string;
  address: string;
  billingAddress: string;
  contactPerson: string;
  tel: string;
  email: string;
  fax: string;
  billTo: string;
  quotationRequired?: boolean;
  serviceLevel?: ServiceLevel;
  separateReportPerSample?: boolean;
  fontScale?: number;
  createdAt: string;
  updatedAt: string;
  samples: Sample[];
}

export interface CompanyPreset {
  id: string;
  name: string;
  address: string;
  billingAddress: string;
  defaultFor: SampleType[];
}
