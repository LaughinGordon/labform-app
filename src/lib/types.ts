export type SampleType = "air" | "raw" | "cooked";

export type StorageCondition = "frozen" | "refrigerated" | "ambient" | "other" | "";
export type SamplingCondition = "original" | "sterile" | "other" | "";
export type Ampm = "am" | "pm" | "";

export interface TestItem {
  on: boolean;
  methods: string[];
  specify: string;
}

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
  individualNutrition: boolean;
  heavyMetal: boolean;
  preservative: boolean;
  colour: boolean;
  pesticide: boolean;
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
