import { Chip } from "@/components/chip";
import { CheckRow } from "@/components/ui/checkbox";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import {
  CHEMICAL_TESTS,
  EXTRA_MANUFACTURERS,
  MANUFACTURER_PRESETS,
  MICRO_TESTS,
  NUTRITION_ITEMS,
  NUTRITION_REGIONS,
  ORIGIN_OPTIONS,
} from "@/lib/presets";
import type { Job, NutritionItem, Sample, TestItem, Tests } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SampleFields({
  job,
  sample,
  onChange,
}: {
  job: Job;
  sample: Sample;
  onChange: (patch: Partial<Sample>) => void;
}) {
  const makers = [...MANUFACTURER_PRESETS[job.sampleType], ...EXTRA_MANUFACTURERS];

  const setTest = (key: keyof Sample["tests"], item: TestItem) => {
    onChange({ tests: { ...sample.tests, [key]: item } });
  };

  const setFlag = (key: (typeof CHEMICAL_TESTS)[number]["key"], on: boolean) => {
    onChange({ tests: { ...sample.tests, [key]: on } });
  };

  const setSpecify = (
    key: "heavyMetalSpecify" | "preservativeSpecify" | "colourSpecify" | "pesticideSpecify" | "regionOtherSpecify" | "individualOther" | "otherChemical",
    value: string,
  ) => {
    onChange({ tests: { ...sample.tests, [key]: value } });
  };

  const toggleNutritionItem = (id: NutritionItem) => {
    const prev = sample.tests.nutritionItems ?? [];
    const nutritionItems = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
    onChange({
      tests: {
        ...sample.tests,
        nutritionItems,
        individualNutrition: nutritionItems.length > 0 || Boolean(sample.tests.individualOther?.trim()) || sample.tests.individualNutrition,
      },
    });
  };

  const toggleTest = (key: (typeof MICRO_TESTS)[number]["key"], on: boolean, methods: string[]) => {
    const prev = sample.tests[key];
    const nextMethods = on
      ? prev.methods.length
        ? prev.methods
        : methods.includes("AOAC")
          ? ["AOAC"]
          : methods.slice(0, 1)
      : [];
    setTest(key, { ...prev, on, methods: nextMethods });
  };

  const toggleMethod = (key: (typeof MICRO_TESTS)[number]["key"], method: string) => {
    const prev = sample.tests[key];
    const has = prev.methods.includes(method);
    const methods = has ? prev.methods.filter((m) => m !== method) : [...prev.methods, method];
    setTest(key, { ...prev, on: true, methods });
  };

  const toggleRegion = (id: Tests["nutritionRegion"][number]) => {
    const has = sample.tests.nutritionRegion.includes(id);
    const nutritionRegion = has
      ? sample.tests.nutritionRegion.filter((r) => r !== id)
      : [...sample.tests.nutritionRegion, id];
    onChange({ tests: { ...sample.tests, nutritionRegion } });
  };

  const showRegions = sample.tests.nutritionLabeling || sample.tests.panelRequested;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Product 產品</h3>
        <Field label="Product description 產品敘述">
          <Textarea
            rows={3}
            value={sample.productDescription}
            placeholder="e.g. 火鍋牛肉生產及包裝區 / Swift 918G (Shipment 588) US Beef"
            onChange={(e) => onChange({ productDescription: e.target.value })}
          />
        </Field>
        <p className="text-xs text-muted">
          Long descriptions shrink automatically so they stay inside the printed box.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sample quantity 樣品數量">
            <Input
              value={sample.sampleQuantity}
              onChange={(e) => onChange({ sampleQuantity: e.target.value })}
            />
          </Field>
          <Field label="Sample label">
            <Input
              value={sample.label}
              onChange={(e) => onChange({ label: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Additional info on report 附加資料">
          <Input
            value={sample.additionalInfo}
            onChange={(e) => onChange({ additionalInfo: e.target.value })}
          />
        </Field>
        <Field label="Manufacturer / Supplier 製造商">
          <Input
            value={sample.manufacturer}
            onChange={(e) => onChange({ manufacturer: e.target.value })}
          />
        </Field>
        <div className="flex flex-wrap gap-1.5">
          {makers.map((m) => (
            <Chip
              key={m}
              active={sample.manufacturer === m}
              onClick={() => onChange({ manufacturer: m })}
            >
              {m}
            </Chip>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Style / Item No. 款號">
            <Input
              value={sample.styleItemNo}
              onChange={(e) => onChange({ styleItemNo: e.target.value })}
            />
          </Field>
          <Field label="P.O. / Lot No. 訂單 / 批號">
            <Input value={sample.poLotNo} onChange={(e) => onChange({ poLotNo: e.target.value })} />
          </Field>
        </div>
        <Field label="Country of origin 原產地">
          <Input
            value={sample.countryOfOrigin}
            onChange={(e) => onChange({ countryOfOrigin: e.target.value })}
          />
        </Field>
        <div className="flex flex-wrap gap-1.5">
          {ORIGIN_OPTIONS.map((o) => (
            <Chip
              key={o}
              active={sample.countryOfOrigin === o}
              onClick={() => onChange({ countryOfOrigin: o })}
            >
              {o}
            </Chip>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Country of destination 目的地">
            <Input
              value={sample.countryOfDestination}
              onChange={(e) => onChange({ countryOfDestination: e.target.value })}
            />
          </Field>
          <Field label="Buyer / Agent 買家">
            <Input
              value={sample.buyerAgent}
              onChange={(e) => onChange({ buyerAgent: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Others / Reference No. 參考編號">
          <Input
            value={sample.othersReference}
            placeholder="Sample Date / Health Cert."
            onChange={(e) => onChange({ othersReference: e.target.value })}
          />
        </Field>
        <Field label="Production date 生產日期">
          <Input
            value={sample.productionDate}
            placeholder="e.g. 17/9/2026"
            onChange={(e) => onChange({ productionDate: e.target.value })}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Microbiological tests 微生物測試</h3>
        <div className="grid grid-cols-2 gap-2">
          {MICRO_TESTS.map((row) => {
            const item = sample.tests[row.key];
            const wide = row.key === "otherMicro";
            return (
              <div
                key={row.key}
                className={cn(
                  "rounded-lg border border-border bg-bg-elevated p-2",
                  wide && "col-span-2",
                )}
              >
                <CheckRow
                  checked={item.on}
                  onCheckedChange={(on) => toggleTest(row.key, on, row.methods)}
                >
                  <span className="font-medium">{row.en}</span>
                  <span className="ml-1.5 text-muted">{row.zh}</span>
                </CheckRow>
                {item.on && row.methods.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1 pl-8">
                    {row.methods.map((m) => (
                      <Chip
                        key={m}
                        active={item.methods.includes(m)}
                        onClick={() => toggleMethod(row.key, m)}
                      >
                        {m}
                      </Chip>
                    ))}
                  </div>
                )}
                {item.on && row.key === "otherMicro" && (
                  <div className="mt-2 pl-8">
                    <Input
                      placeholder="Please specify"
                      value={item.specify}
                      onChange={(e) => setTest("otherMicro", { ...item, specify: e.target.value })}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Chemical tests 化學測試</h3>
        <div className="grid grid-cols-2 gap-2">
          {CHEMICAL_TESTS.map((row) => (
            <div
              key={row.key}
              className={cn(
                "rounded-lg border border-border bg-bg-elevated p-2",
                row.key === "individualNutrition" && "col-span-2",
              )}
            >
              <CheckRow
                checked={sample.tests[row.key]}
                onCheckedChange={(on) => setFlag(row.key, on)}
              >
                <span className="font-medium">{row.en}</span>
                <span className="ml-1.5 text-muted">{row.zh}</span>
              </CheckRow>
              {row.key === "individualNutrition" && sample.tests.individualNutrition && (
                <div className="mt-2 grid grid-cols-2 gap-1.5 pl-1">
                  {NUTRITION_ITEMS.map((item) => (
                    <CheckRow
                      key={item.id}
                      checked={(sample.tests.nutritionItems ?? []).includes(item.id)}
                      onCheckedChange={() => toggleNutritionItem(item.id)}
                    >
                      <span className="font-medium">{item.en}</span>
                      <span className="ml-1 text-muted">{item.zh}</span>
                    </CheckRow>
                  ))}
                  <div className="col-span-2 pt-1">
                    <Input
                      placeholder="Other 其他，Please specify"
                      value={sample.tests.individualOther ?? ""}
                      onChange={(e) => {
                        const individualOther = e.target.value;
                        onChange({
                          tests: {
                            ...sample.tests,
                            individualOther,
                            individualNutrition:
                              sample.tests.individualNutrition || Boolean(individualOther.trim()),
                          },
                        });
                      }}
                    />
                  </div>
                </div>
              )}
              {row.specify && sample.tests[row.key] && (
                <div className="mt-2">
                  <Input
                    placeholder="Please specify 請註明"
                    value={sample.tests[row.specify] ?? ""}
                    onChange={(e) => setSpecify(row.specify!, e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        {showRegions && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted">Nutrition region 地區</p>
            <div className="flex flex-wrap gap-1.5">
              {NUTRITION_REGIONS.map((r) => (
                <Chip
                  key={r.id}
                  active={sample.tests.nutritionRegion.includes(r.id)}
                  onClick={() => toggleRegion(r.id)}
                >
                  {r.en}
                </Chip>
              ))}
            </div>
            {sample.tests.nutritionRegion.includes("other") && (
              <Input
                placeholder="Other region, please specify"
                value={sample.tests.regionOtherSpecify ?? ""}
                onChange={(e) => setSpecify("regionOtherSpecify", e.target.value)}
              />
            )}
          </div>
        )}
        <Field label="Others 其他化學">
          <Input
            placeholder="Please specify 請註明"
            value={sample.tests.otherChemical}
            onChange={(e) => setSpecify("otherChemical", e.target.value)}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Sampling 收取樣品</h3>
        <Field label="Original storage 儲存狀況">
          <NativeSelect
            value={sample.storage}
            onChange={(e) =>
              onChange({ storage: e.target.value as Sample["storage"] })
            }
          >
            <option value="frozen">Frozen 急凍</option>
            <option value="refrigerated">Refrigerated 冷藏</option>
            <option value="ambient">Ambient 常溫</option>
            <option value="other">Other 其他</option>
          </NativeSelect>
        </Field>
        {sample.storage === "other" && (
          <Field label="Storage other">
            <Input
              value={sample.storageOther}
              onChange={(e) => onChange({ storageOther: e.target.value })}
            />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Client sampling date">
            <Input
              type="date"
              value={sample.clientSamplingDate}
              onChange={(e) => onChange({ clientSamplingDate: e.target.value })}
            />
          </Field>
          <Field label="SGS collection date 收板日期">
            <Input
              type="date"
              value={sample.collectionDate}
              onChange={(e) => onChange({ collectionDate: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Collection time">
          <NativeSelect
            value={sample.collectionAmpm}
            onChange={(e) =>
              onChange({ collectionAmpm: e.target.value as Sample["collectionAmpm"] })
            }
          >
            <option value="">—</option>
            <option value="am">am</option>
            <option value="pm">pm</option>
          </NativeSelect>
        </Field>
        <Field label="Sampling condition">
          <NativeSelect
            value={sample.samplingCondition}
            onChange={(e) =>
              onChange({
                samplingCondition: e.target.value as Sample["samplingCondition"],
              })
            }
          >
            <option value="original">In original unopened 原裝未開</option>
            <option value="sterile">Sterile container 無菌容器</option>
            <option value="other">Other 其他</option>
          </NativeSelect>
        </Field>
      </section>
    </div>
  );
}
