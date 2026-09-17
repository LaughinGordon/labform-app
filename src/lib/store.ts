import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createJob, createSample, COMPANIES } from "./presets";
import type { Job, Sample, SampleType } from "./types";

interface LabState {
  jobs: Job[];
  create: (type: SampleType) => Job;
  update: (id: string, patch: Partial<Job>) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => Job | null;
  addSample: (jobId: string) => void;
  updateSample: (jobId: string, sampleId: string, patch: Partial<Sample>) => void;
  duplicateSample: (jobId: string, sampleId: string) => void;
  removeSample: (jobId: string, sampleId: string) => void;
  applyCompany: (jobId: string, companyId: string) => void;
}

function touch(job: Job, patch: Partial<Job> = {}): Job {
  return { ...job, ...patch, updatedAt: new Date().toISOString() };
}

export const useLabStore = create<LabState>()(
  persist(
    (set, get) => ({
      jobs: [],
      create: (type) => {
        const job = createJob(type);
        set({ jobs: [job, ...get().jobs] });
        return job;
      },
      update: (id, patch) =>
        set({
          jobs: get().jobs.map((j) => (j.id === id ? touch(j, patch) : j)),
        }),
      remove: (id) => set({ jobs: get().jobs.filter((j) => j.id !== id) }),
      duplicate: (id) => {
        const src = get().jobs.find((j) => j.id === id);
        if (!src) return null;
        const copy: Job = {
          ...structuredClone(src),
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          samples: src.samples.map((s, i) => ({
            ...structuredClone(s),
            id: crypto.randomUUID(),
            label: s.label ? `${s.label} copy` : `Sample ${i + 1}`,
          })),
        };
        set({ jobs: [copy, ...get().jobs] });
        return copy;
      },
      addSample: (jobId) =>
        set({
          jobs: get().jobs.map((j) => {
            if (j.id !== jobId) return j;
            const sample = createSample(j.sampleType, j.samples.length + 1);
            if (j.samples[0]) {
              sample.collectionDate = j.samples[0].collectionDate;
              sample.storage = j.samples[0].storage;
              sample.samplingCondition = j.samples[0].samplingCondition;
              sample.countryOfDestination = j.samples[0].countryOfDestination;
              sample.tests = structuredClone(j.samples[0].tests);
            }
            return touch(j, { samples: [...j.samples, sample] });
          }),
        }),
      updateSample: (jobId, sampleId, patch) =>
        set({
          jobs: get().jobs.map((j) => {
            if (j.id !== jobId) return j;
            return touch(j, {
              samples: j.samples.map((s) => (s.id === sampleId ? { ...s, ...patch } : s)),
            });
          }),
        }),
      duplicateSample: (jobId, sampleId) =>
        set({
          jobs: get().jobs.map((j) => {
            if (j.id !== jobId) return j;
            const src = j.samples.find((s) => s.id === sampleId);
            if (!src) return j;
            const copy: Sample = {
              ...structuredClone(src),
              id: crypto.randomUUID(),
              label: `${src.label || "Sample"} copy`,
            };
            const idx = j.samples.findIndex((s) => s.id === sampleId);
            const samples = [...j.samples];
            samples.splice(idx + 1, 0, copy);
            return touch(j, { samples });
          }),
        }),
      removeSample: (jobId, sampleId) =>
        set({
          jobs: get().jobs.map((j) => {
            if (j.id !== jobId) return j;
            if (j.samples.length <= 1) return j;
            return touch(j, { samples: j.samples.filter((s) => s.id !== sampleId) });
          }),
        }),
      applyCompany: (jobId, companyId) => {
        const preset = COMPANIES.find((c) => c.id === companyId);
        set({
          jobs: get().jobs.map((j) => {
            if (j.id !== jobId) return j;
            if (!preset) return touch(j, { companyId: "custom" });
            return touch(j, {
              companyId: preset.id,
              companyName: preset.name,
              address: preset.address,
              billingAddress: preset.billingAddress,
            });
          }),
        });
      },
    }),
    { name: "labform-jobs-v1" },
  ),
);

export function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const finish = () => setHydrated(true);
    if (useLabStore.persist.hasHydrated()) finish();
    const unsub = useLabStore.persist.onFinishHydration(finish);
    return unsub;
  }, []);
  return hydrated;
}
