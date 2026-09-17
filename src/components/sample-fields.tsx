import { Chip } from "@/components/chip";
import { CheckRow } from "@/components/ui/checkbox";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import {
  MANUFACTURER_PRESETS,
  MICRO_TESTS,
  ORIGIN_OPTIONS,
} from "@/lib/presets";
import type { Job, Sample, TestItem } from "@/lib/types";

export function SampleFields({
  job,
  sample,
  onChange,
}: {
  job: Job;
  sample: Sample;
  onChange: (patch: Partial<Sample>) => void;
}) {
  const makers = MANUFACTURER_PRESETS[job.sampleType];

  const setTest = (key: keyof Sample["tests"], item: TestItem) => {
    onChange({ tests: { ...sample.tests, [key]: item } });
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
            placeholder="Sample Date / Holiday Cert #"
            onChange={(e) => onChange({ othersReference: e.target.value })}
          />
        </Field>
        <Field label="Production date 生產日期">
          <Input
            type="date"
            value={sample.productionDate}
            onChange={(e) => onChange({ productionDate: e.target.value })}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Microbiological tests 微生物測試</h3>
        <div className="flex flex-col gap-3">
          {MICRO_TESTS.map((row) => {
            const item = sample.tests[row.key];
            return (
              <div key={row.key} className="rounded-lg border border-border bg-bg-elevated p-3">
                <CheckRow
                  checked={item.on}
                  onCheckedChange={(on) => toggleTest(row.key, on, row.methods)}
                >
                  <span className="font-medium">{row.en}</span>
                  <span className="ml-2 text-muted">{row.zh}</span>
                </CheckRow>
                {item.on && row.methods.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 pl-8">
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
