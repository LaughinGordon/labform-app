import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Download,
  Plus,
  Trash2,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { FormPreview } from "@/components/form-preview";
import { SampleFields } from "@/components/sample-fields";
import { Chip } from "@/components/chip";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckRow } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import {
  COMPANIES,
  RAW_KINDS,
  SAMPLE_TYPE_META,
  SERVICE_LEVELS,
  applyMicroDefaults,
  jobFontScale,
  jobQuotationRequired,
  jobSeparateReport,
  jobServiceLevel,
} from "@/lib/presets";
import { useLabStore } from "@/lib/store";
import { downloadBlob, exportJobPdf, jobFileStem } from "@/lib/export-pdf";
import type { Job, ServiceLevel } from "@/lib/types";
import { cn, rawKindsEn, rawKindsZh, sampleRawKind } from "@/lib/utils";

export function JobEditor({ job }: { job: Job }) {
  const { update, applyCompany, addSample, updateSample, duplicateSample, removeSample } =
    useLabStore();
  const [activeId, setActiveId] = useState(job.samples[0]?.id ?? "");
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  const sample = useMemo(
    () => job.samples.find((s) => s.id === activeId) ?? job.samples[0],
    [job.samples, activeId],
  );
  const meta = SAMPLE_TYPE_META[job.sampleType];
  const isCustom = job.companyId === "custom" || !COMPANIES.some((c) => c.id === job.companyId);
  const service = jobServiceLevel(job);
  const fontScale = jobFontScale(job);

  const bumpFont = (delta: number) => {
    const next = Math.round((fontScale + delta) * 10) / 10;
    update(job.id, { fontScale: Math.min(1.5, Math.max(0.7, next)) });
  };

  const fileStem = jobFileStem(job);

  const onExport = async () => {
    setExporting(true);
    try {
      const blob = await exportJobPdf(job);
      downloadBlob(blob, `${fileStem}.pdf`);
      toast.success(`Saved ${fileStem}.pdf`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (!sample) return null;

  return (
    <div className="flex min-h-svh flex-col bg-bg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2">
          <Button variant="ghost" size="icon" asChild>
            <a href="/" aria-label="Back">
              <ArrowLeft />
            </a>
          </Button>
          <Logo className="size-7" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge tone={job.sampleType}>
                {job.sampleType === "raw"
                  ? `${rawKindsEn(job)} · ${rawKindsZh(job)}`
                  : `${meta.en} · ${meta.zh}`}
              </Badge>
              <span className="truncate text-xs text-muted">
                {job.samples.length} sample{job.samples.length > 1 ? "s" : ""}
              </span>
            </div>
            <p className="truncate text-sm font-medium">{job.companyName}</p>
            <p className="truncate text-[10px] text-muted" title={`${fileStem}.pdf`}>
              {fileStem}.pdf
            </p>
          </div>
          <div className="flex items-center gap-0.5 rounded-md border border-border bg-surface px-1">
            <Button
              variant="ghost"
              size="sm"
              className="px-1.5"
              onClick={() => bumpFont(-0.1)}
              disabled={fontScale <= 0.7}
              aria-label="Smaller form text"
            >
              A−
            </Button>
            <span className="w-8 text-center text-[11px] tabular-nums text-muted">
              {Math.round(fontScale * 100)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="px-1.5"
              onClick={() => bumpFont(0.1)}
              disabled={fontScale >= 1.5}
              aria-label="Larger form text"
            >
              A+
            </Button>
          </div>
          <Button onClick={onExport} disabled={exporting} title={`${fileStem}.pdf`}>
            <Download />
            {exporting ? "Exporting…" : "PDF"}
          </Button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-0 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <aside className="border-b border-border lg:border-r lg:border-b-0">
          <div className="flex gap-1 border-b border-border p-2 lg:hidden">
            <button
              type="button"
              className={cn(
                "h-10 flex-1 rounded-md text-sm font-medium",
                tab === "edit" ? "bg-primary text-primary-fg" : "text-muted",
              )}
              onClick={() => setTab("edit")}
            >
              Edit
            </button>
            <button
              type="button"
              className={cn(
                "h-10 flex-1 rounded-md text-sm font-medium",
                tab === "preview" ? "bg-primary text-primary-fg" : "text-muted",
              )}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
          </div>

          <div className={cn("flex flex-col gap-4 p-3", tab === "preview" && "hidden lg:flex")}>
            <section className="flex flex-col gap-2">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase text-muted">
                <Building2 className="size-3.5" /> Applicant 申請公司
              </h3>
              <div className="flex flex-wrap gap-1">
                {COMPANIES.map((c) => (
                  <Chip
                    key={c.id}
                    active={job.companyId === c.id}
                    onClick={() => applyCompany(job.id, c.id)}
                  >
                    {c.id === "hfg" ? "HFG Procurement" : "Hop Hing Foods"}
                  </Chip>
                ))}
                <Chip active={isCustom} onClick={() => update(job.id, { companyId: "custom" })}>
                  Custom
                </Chip>
              </div>
              <Field label="Company name 公司名稱">
                <Input
                  value={job.companyName}
                  onChange={(e) =>
                    update(job.id, { companyName: e.target.value, companyId: "custom" })
                  }
                />
              </Field>
              <Field label="Address 地址">
                <Input
                  value={job.address}
                  onChange={(e) =>
                    update(job.id, { address: e.target.value, companyId: "custom" })
                  }
                />
              </Field>
              <Field label="Billing address 發票地址">
                <Input
                  value={job.billingAddress}
                  onChange={(e) => update(job.id, { billingAddress: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Contact 聯絡人">
                  <Input
                    value={job.contactPerson}
                    onChange={(e) => update(job.id, { contactPerson: e.target.value })}
                  />
                </Field>
                <Field label="Tel 電話">
                  <Input value={job.tel} onChange={(e) => update(job.id, { tel: e.target.value })} />
                </Field>
              </div>
              <Field label="Email">
                <Input
                  value={job.email}
                  onChange={(e) => update(job.id, { email: e.target.value })}
                />
              </Field>
              <Field label="Bill to / Payer 發票抬頭">
                <Input
                  value={job.billTo}
                  onChange={(e) => update(job.id, { billTo: e.target.value })}
                />
              </Field>
            </section>

            {job.sampleType === "raw" && (
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold tracking-wide uppercase text-muted">
                  Raw type 生食種類
                </h3>
                <div className="flex flex-wrap gap-1">
                  {RAW_KINDS.map((k) => (
                    <Chip
                      key={k.id}
                      active={sampleRawKind(sample, job) === k.id}
                      onClick={() => {
                        update(job.id, {
                          rawKind: k.id,
                          samples: job.samples.map((s) => {
                            if (s.id === sample.id) {
                              return {
                                ...s,
                                rawKind: k.id,
                                tests: applyMicroDefaults(s.tests, "raw", k.id),
                              };
                            }
                            if (!s.rawKind) return { ...s, rawKind: job.rawKind ?? "beef" };
                            return s;
                          }),
                        });
                      }}
                    >
                      {k.en} {k.zh}
                    </Chip>
                  ))}
                </div>
              </section>
            )}

            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold tracking-wide uppercase text-muted">Samples 樣品</h3>
                <Button size="sm" variant="secondary" onClick={() => addSample(job.id)}>
                  <Plus /> Add
                </Button>
              </div>
              <div className="flex flex-col gap-1.5">
                {job.samples.map((s, i) => (
                  <div
                    key={s.id}
                    className={cn(
                      "flex items-center gap-1 rounded-md border px-1.5 py-0.5",
                      s.id === sample.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-surface",
                    )}
                  >
                    <button
                      type="button"
                      className="min-h-8 min-w-0 flex-1 truncate px-1 text-left text-sm"
                      onClick={() => setActiveId(s.id)}
                    >
                      <span className="text-muted">{i + 1}.</span>{" "}
                      {s.productDescription || s.label || `Sample ${i + 1}`}
                      {job.sampleType === "raw" ? (
                        <span className="ml-1 text-[11px] text-muted">
                          {RAW_KINDS.find((k) => k.id === sampleRawKind(s, job))?.en}
                        </span>
                      ) : null}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label="Duplicate sample"
                      onClick={() => duplicateSample(job.id, s.id)}
                    >
                      <Copy />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label="Remove sample"
                      disabled={job.samples.length <= 1}
                      onClick={() => {
                        if (s.id === activeId) {
                          const next = job.samples.find((x) => x.id !== s.id);
                          if (next) setActiveId(next.id);
                        }
                        removeSample(job.id, s.id);
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <SampleFields
              job={job}
              sample={sample}
              onChange={(patch) => updateSample(job.id, sample.id, patch)}
            />

            <section className="flex flex-col gap-2 rounded-md border border-border bg-bg-elevated p-2.5">
              <h3 className="text-xs font-semibold tracking-wide uppercase text-muted">Service Required 所需服務</h3>
              <p className="text-[11px] text-muted">Defaults stay on. Untick to leave the box blank.</p>
              <CheckRow
                checked={jobQuotationRequired(job)}
                onCheckedChange={(on) => update(job.id, { quotationRequired: on })}
              >
                Quotation required 要求報價
              </CheckRow>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-muted">Service 服務</p>
                <div className="flex flex-wrap gap-1">
                  {SERVICE_LEVELS.map((s) => (
                    <Chip
                      key={s.id}
                      active={service === s.id}
                      onClick={() =>
                        update(job.id, {
                          serviceLevel: (service === s.id ? "" : s.id) as ServiceLevel,
                        })
                      }
                    >
                      {s.en} {s.zh}
                    </Chip>
                  ))}
                </div>
              </div>
              <CheckRow
                checked={jobSeparateReport(job)}
                onCheckedChange={(on) => update(job.id, { separateReportPerSample: on })}
              >
                Separate report per sample 獨立樣板報告
              </CheckRow>
            </section>
          </div>
        </aside>

        <section
          className={cn(
            "bg-bg p-3 lg:block lg:p-4",
            tab === "edit" && "hidden lg:block",
          )}
        >
          <div className="mx-auto max-w-3xl">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h2 className="truncate text-xs font-medium text-muted">
                Preview · {sample.productDescription || sample.label}
              </h2>
              <p className="text-[11px] text-subtle">SGS AFL L56 · 字體 {Math.round(fontScale * 100)}%</p>
            </div>
            <FormPreview job={job} sample={sample} />
          </div>
        </section>
      </div>
    </div>
  );
}
