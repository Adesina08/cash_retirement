import { DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CloudUpload, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils/cn';
import { runLocalOcr } from '@lib/utils/ocr';

type UploadState =
  | { status: 'idle' }
  | { status: 'processing' }
  | { status: 'unsupported'; warnings: string[] }
  | { status: 'error'; message: string; warnings?: string[] }
  | { status: 'done'; text: string; warnings: string[] };

export interface ReceiptUploadInputProps {
  value?: string;
  onChange: (value?: string) => void;
  onTextExtracted?: (text: string) => void;
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Unable to read the selected file.'));
    reader.readAsDataURL(file);
  });

export function ReceiptUploadInput({ value, onChange, onTextExtracted }: ReceiptUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(value);
  const [fileName, setFileName] = useState<string | undefined>();
  const [state, setState] = useState<UploadState>({ status: 'idle' });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (value) {
      setPreview(value);
    } else {
      setPreview(undefined);
      setFileName(undefined);
      setState({ status: 'idle' });
    }
  }, [value]);

  const showOcrCard = state.status === 'done' && Boolean(state.text.trim());
  const warnings = useMemo(() => {
    if (state.status === 'unsupported' || state.status === 'done') return state.warnings;
    if (state.status === 'error') return state.warnings ?? [];
    return [];
  }, [state]);

  const reset = () => {
    onChange(undefined);
    setPreview(undefined);
    setFileName(undefined);
    setState({ status: 'idle' });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const processFile = async (file: File) => {
    setState({ status: 'processing' });
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onChange(dataUrl);
      setPreview(dataUrl);
      setFileName(file.name);

      const result = await runLocalOcr(file);
      if (result.text) {
        setState({ status: 'done', text: result.text, warnings: result.warnings });
        onTextExtracted?.(result.text);
      } else if (result.warnings.length) {
        setState({ status: 'unsupported', warnings: result.warnings });
      } else {
        setState({ status: 'unsupported', warnings: ['No text detected in the uploaded receipt.'] });
      }
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred while reading the file.'
      });
    }
  };

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    await processFile(file);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    await handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-colors',
          isDragging
            ? 'border-brand-500 bg-brand-50/70 dark:border-brand-400 dark:bg-slate-900/70'
            : 'border-slate-300/70 bg-white/70 shadow-sm dark:border-slate-700 dark:bg-slate-900/50'
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <CloudUpload className="h-10 w-10 text-brand-600 dark:text-brand-400" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Upload your receipt</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Drag & drop a photo of the receipt or choose a file from your device. High-contrast photos improve OCR accuracy.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
            className="shadow-sm"
          >
            Choose file
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={reset} className="text-rose-600 hover:text-rose-700">
              <X className="mr-1 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
        {fileName && <p className="text-xs text-slate-500 dark:text-slate-400">Selected: {fileName}</p>}
      </div>

      {state.status === 'processing' && (
        <div className="flex items-center gap-2 text-sm text-brand-700 dark:text-brand-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Scanning receipt for text…</span>
        </div>
      )}

      {preview && (
        <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white/80 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
          {preview.startsWith('data:application/pdf') ? (
            <iframe title="Receipt preview" src={preview} className="h-64 w-full" />
          ) : (
            <img src={preview} alt="Receipt preview" className="h-64 w-full bg-slate-900/80 object-contain" />
          )}
        </div>
      )}

      {showOcrCard && state.status === 'done' && (
        <div className="space-y-3 rounded-2xl border border-emerald-400/40 bg-emerald-50/80 p-4 shadow-sm dark:border-emerald-400/30 dark:bg-emerald-900/30">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
              <Sparkles className="h-4 w-4" />
              Suggested text from OCR
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-3 text-xs text-emerald-700 hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-emerald-800/70"
              onClick={() => onTextExtracted?.(state.text)}
            >
              Use in description
            </Button>
          </div>
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-white/80 p-3 text-xs leading-relaxed text-emerald-900 shadow-inner dark:bg-emerald-950/60 dark:text-emerald-100">
            {state.text}
          </pre>
        </div>
      )}

      {state.status === 'unsupported' && (
        <div className="rounded-2xl border border-amber-300/50 bg-amber-50/80 p-4 text-sm text-amber-800 shadow-sm dark:border-amber-400/40 dark:bg-amber-900/40 dark:text-amber-100">
          <p className="font-semibold">We uploaded your receipt but could not read text automatically.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            {state.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {state.status === 'error' && (
        <div className="rounded-2xl border border-rose-300/60 bg-rose-50/80 p-4 text-sm text-rose-700 shadow-sm dark:border-rose-400/40 dark:bg-rose-900/40 dark:text-rose-100">
          <p className="font-semibold">We could not process this file.</p>
          <p className="text-xs">{state.message}</p>
        </div>
      )}

      {warnings.length > 0 && state.status !== 'unsupported' && state.status !== 'error' && (
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/70 p-3 text-xs text-amber-700 shadow-sm dark:border-amber-400/40 dark:bg-amber-900/40 dark:text-amber-100">
          <ul className="list-disc space-y-1 pl-4">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
