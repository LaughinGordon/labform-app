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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckRow } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import {
  COMPANIES,
  SAMPLE_TYPE_META,
  SERVICE_LEVELS,
  jobQuotationRequired,
  jobSeparateReport,
  jobServiceLevel,
} from "@/lib/presets";
import { useLabStore } from "@/lib/store";
import { downloadBlob, exportJobPdf, jobFileStem } from "@/lib/export-pdf";
import type { Job, ServiceLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

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

  const onExport = async () => {
    setExporting(true);
    try {
      const blob = await exportJobPdf(job);
      downloadBlob(blob, `${jobFileStem(job)}.pdf`);
      toast.success(`Exported ${job.samples.length} form${job.samples.length > 1 ? "s" : ""}`);
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
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" asChild>
            <a href="/" aria-label="Back">
              <ArrowLeft />
            </a>
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge tone={job.sampleType}>
                {meta.en} · {meta.zh}
              </Badge>
              <span className="truncate text-sm text-muted">
                {job.samples.length} sample{job.samples.length > 1 ? "s" : ""}
              </span>
            </div>
            <p className="truncate text-sm font-medium">{job.companyName}</p>
          </div>
          <Button onClick={onExport} disabled={exporting}>
            <Download />
            {exporting ? "Exporting…" : "Export PDF"}
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

          <div className={cn("flex flex-col gap-6 p-4", tab === "preview" && "hidden lg:flex")}>
            <section className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="size-4" /> Applicant 申請公司
              </h3>
              <div className="flex flex-wrap gap-1.5">
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
              <div className="grid grid-cols-2 gap-3">
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

            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Samples 樣品</h3>
                <Button size="sm" variant="secondary" onClick={() => addSample(job.id)}>
                  <Plus /> Add
                </Button>
              </div>
              <div className="flex flex-col gap-1.5">
                {job.samples.map((s, i) => (
                  <div
                    key={s.id}
                    className={cn(
                      "flex items-center gap-1 rounded-lg border px-2 py-1",
                      s.id === sample.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-surface",
                    )}
                  >
                    <button
                      type="button"
                      className="min-h-10 min-w-0 flex-1 truncate px-1 text-left text-sm"
                      onClick={() => setActiveId(s.id)}
                    >
                      <span className="text-muted">{i + 1}.</span>{" "}
                      {s.productDescription || s.label || `Sample ${i + 1}`}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9"
                      aria-label="Duplicate sample"
                      onClick={() => duplicateSample(job.id, s.id)}
                    >
                      <Copy />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9"
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

            <section className="flex flex-col gap-3 rounded-lg border border-border bg-bg-elevated p-3">
              <h3 className="text-sm font-semibold">Always printed 必然預設</h3>
              <p className="text-xs text-muted">Defaults stay on. Untick to leave the box blank.</p>
              <CheckRow
                checked={jobQuotationRequired(job)}
                onCheckedChange={(on) => update(job.id, { quotationRequired: on })}
              >
                Quotation required 要求報價
              </CheckRow>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-muted">Service 服務</p>
                <div className="flex flex-wrap gap-1.5">
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
            "bg-bg p-4 lg:block lg:p-8",
            tab === "edit" && "hidden lg:block",
          )}
        >
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-medium text-muted">
                Form preview · {sample.productDescription || sample.label}
              </h2>
              <p className="text-xs text-subtle">SGS AFL L56</p>
            </div>
            <FormPreview job={job} sample={sample} />
          </div>
        </section>
      </div>
    </div>
  );
}
