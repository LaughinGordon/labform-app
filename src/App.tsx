import { format } from "date-fns";
import { Copy, Plus, Trash2, Wind, Beef, Soup, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JobEditor } from "@/components/job-editor";
import { SAMPLE_TYPE_META } from "@/lib/presets";
import { useLabStore, useStoreHydrated } from "@/lib/store";
import type { SampleType } from "@/lib/types";

const TYPES: Array<{ type: SampleType; icon: typeof Wind }> = [
  { type: "air", icon: Wind },
  { type: "raw", icon: Beef },
  { type: "cooked", icon: Soup },
];

function Home() {
  const hydrated = useStoreHydrated();
  const jobs = useLabStore((s) => s.jobs);
  const create = useLabStore((s) => s.create);
  const remove = useLabStore((s) => s.remove);
  const duplicate = useLabStore((s) => s.duplicate);

  const start = (type: SampleType) => {
    const job = create(type);
    window.location.assign(`/jobs/${job.id}`);
  };

  return (
    <main className="min-h-svh bg-bg">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10 sm:py-14">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
            SGS AFL L56
          </p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            LabForm
          </h1>
          <p className="max-w-xl text-pretty text-muted">
            填寫食物及微生物測試申請表，預覽後匯出成 SGS 原表格 PDF。空氣、生食、熟食三類樣本，一張表格一個樣品。
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          {TYPES.map(({ type, icon: Icon }) => {
            const meta = SAMPLE_TYPE_META[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => start(type)}
                className="group flex flex-col items-start gap-4 rounded-xl bg-surface p-5 text-left paper-shadow transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-bg text-primary">
                  <Icon className="size-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-base font-semibold">
                    {meta.en}
                    <span className="ml-2 text-muted">{meta.zh}</span>
                  </span>
                  <span className="text-sm text-muted">{meta.hint}</span>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                  <Plus className="size-4" /> New application
                </span>
              </button>
            );
          })}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Saved applications</h2>
            <span className="text-xs text-subtle">{hydrated ? jobs.length : ""}</span>
          </div>
          {!hydrated ? (
            <Card className="h-20 animate-pulse bg-bg-elevated" />
          ) : jobs.length === 0 ? (
            <Card className="flex items-center gap-3 text-sm text-muted">
              <FileText className="size-4 shrink-0" />
              No applications yet. Choose a sample type above.
            </Card>
          ) : (
            <ul className="flex flex-col gap-2">
              {jobs.map((job) => {
                const meta = SAMPLE_TYPE_META[job.sampleType];
                const first = job.samples[0]?.productDescription;
                return (
                  <li key={job.id}>
                    <div className="flex items-stretch gap-1 rounded-xl bg-surface paper-shadow">
                      <button
                        type="button"
                        className="flex min-h-16 min-w-0 flex-1 flex-col items-start gap-1 px-4 py-3 text-left"
                        onClick={() => window.location.assign(`/jobs/${job.id}`)}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={job.sampleType}>
                            {meta.zh} · {meta.en}
                          </Badge>
                          <span className="text-xs text-subtle">
                            {format(new Date(job.updatedAt), "d MMM yyyy HH:mm")}
                          </span>
                        </div>
                        <p className="w-full truncate text-sm font-medium">
                          {first || job.companyName}
                        </p>
                        <p className="text-xs text-muted">
                          {job.companyName} · {job.samples.length} sample
                          {job.samples.length > 1 ? "s" : ""}
                        </p>
                      </button>
                      <div className="flex flex-col justify-center pr-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10"
                          aria-label="Duplicate"
                          onClick={() => {
                            const copy = duplicate(job.id);
                            if (copy) {
                              window.location.assign(`/jobs/${copy.id}`);
                            }
                          }}
                        >
                          <Copy />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10"
                          aria-label="Delete"
                          onClick={() => remove(job.id)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function JobPage({ jobId }: { jobId: string }) {
  const hydrated = useStoreHydrated();
  const job = useLabStore((s) => s.jobs.find((j) => j.id === jobId));

  if (!hydrated) {
    return (
      <main className="flex min-h-svh items-center justify-center text-sm text-muted">
        Loading application…
      </main>
    );
  }

  if (!job) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-lg font-semibold">Application not found</h1>
        <p className="max-w-sm text-sm text-muted">
          This form is not in local history on this device.
        </p>
        <Button asChild>
          <a href="/">Back to LabForm</a>
        </Button>
      </main>
    );
  }

  return <JobEditor job={job} />;
}

export function App() {
  const path = window.location.pathname;
  const match = path.match(/^\/jobs\/([^/]+)/);
  if (match?.[1]) return <JobPage jobId={match[1]} />;
  return <Home />;
}
