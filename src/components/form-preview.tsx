import { useEffect, useRef, useState } from "react";
import { loadFormImage, paintForm } from "@/lib/render-form";
import type { Job, Sample } from "@/lib/types";

export function FormPreview({ job, sample }: { job: Job; sample: Sample }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await document.fonts.ready.catch(() => undefined);
        const image = await loadFormImage();
        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        paintForm(canvas, image, job, sample);
        setReady(true);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Preview failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [job, sample]);

  return (
    <div className="relative overflow-hidden rounded-lg bg-bg-elevated paper-shadow">
      {!ready && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-muted">
          Loading form…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-6 text-center text-sm text-danger">
          {error}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="form-sheet block h-auto w-full bg-surface"
        aria-label="Filled SGS AFL application form preview"
      />
    </div>
  );
}
