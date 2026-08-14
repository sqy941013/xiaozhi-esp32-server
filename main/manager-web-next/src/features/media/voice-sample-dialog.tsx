import { LoaderCircle, RotateCcw, Scissors, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { audioBufferToWav, trimAudioBuffer, waveformSamples } from "@/features/media/audio-utils";
import { uploadVoiceSample } from "@/features/media/media-api";
import { validateVoiceDuration, validateVoiceFile } from "@/features/media/media-utils";
import type { VoiceClone } from "@/features/media/types";

interface VoiceSampleDialogProps {
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
  voice: VoiceClone | null;
}

export function VoiceSampleDialog({ onOpenChange, onSuccess, voice }: VoiceSampleDialogProps) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [originalBuffer, setOriginalBuffer] = useState<AudioBuffer | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);
  useEffect(() => () => {
    void contextRef.current?.close();
  }, []);

  function replaceAudioUrl(nextFile: File) {
    setAudioUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(nextFile);
    });
  }

  async function selectFile(nextFile: File) {
    const validation = validateVoiceFile(nextFile);
    if (!validation.valid) {
      toast.error(t(validation.code === "size" ? "mediaCenter.voiceClone.uploadFailed" : "mediaCenter.voiceClone.pleaseSelectAudio"));
      return;
    }
    try {
      const AudioContextClass = window.AudioContext;
      const context = contextRef.current || new AudioContextClass();
      contextRef.current = context;
      const decoded = await context.decodeAudioData(await nextFile.arrayBuffer());
      setFile(nextFile);
      setOriginalFile(nextFile);
      setBuffer(decoded);
      setOriginalBuffer(decoded);
      setStart(0);
      setEnd(Number(decoded.duration.toFixed(2)));
      replaceAudioUrl(nextFile);
    } catch {
      toast.error(t("mediaCenter.voiceClone.loadAudioFailed"));
    }
  }

  function reset() {
    if (!originalFile || !originalBuffer) return;
    setFile(originalFile);
    setBuffer(originalBuffer);
    setStart(0);
    setEnd(Number(originalBuffer.duration.toFixed(2)));
    replaceAudioUrl(originalFile);
    toast.success(t("mediaCenter.voiceClone.resetSuccess"));
  }

  function trim() {
    if (!buffer || !contextRef.current || end <= start) return;
    const trimmed = trimAudioBuffer(contextRef.current, buffer, start, end);
    const nextFile = new File([audioBufferToWav(trimmed)], "voice-sample.wav", { type: "audio/wav" });
    setBuffer(trimmed);
    setFile(nextFile);
    setStart(0);
    setEnd(Number(trimmed.duration.toFixed(2)));
    replaceAudioUrl(nextFile);
    toast.success(t("mediaCenter.voiceClone.trimSuccess"));
  }

  function close(force = false) {
    if (pending && !force) return;
    setFile(null);
    setOriginalFile(null);
    setBuffer(null);
    setOriginalBuffer(null);
    setAudioUrl("");
    setStart(0);
    setEnd(0);
    setProgress(0);
    onOpenChange(false);
  }

  async function submit() {
    if (!file || !voice?.id) {
      toast.error(t("mediaCenter.voiceClone.pleaseSelectAudio"));
      return;
    }
    if (!validateVoiceDuration(buffer?.duration || end - start).valid) {
      toast.error(t("mediaCenter.voiceClone.durationError"));
      return;
    }
    setPending(true);
    try {
      await uploadVoiceSample(voice.id, file, ({ percent }) => setProgress(percent));
      toast.success(t("mediaCenter.voiceClone.uploadSuccess"));
      await onSuccess();
      setPending(false);
      close(true);
    } catch (error) {
      toast.error(getErrorMessage(error, t("mediaCenter.voiceClone.uploadFailed")));
      setPending(false);
    }
  }

  const samples = buffer ? waveformSamples(buffer) : [];
  const duration = buffer?.duration || 0;

  return (
    <Dialog onOpenChange={(open) => !open && close()} open={Boolean(voice)}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("mediaCenter.voiceClone.dialogTitle")}</DialogTitle>
          <DialogDescription>{voice?.name || voice?.voiceId || "—"} · {t("mediaCenter.voiceClone.uploadTip")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 overflow-y-auto px-6 py-1">
          {!file ? (
            <button className="flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6 hover:bg-primary/10" onClick={() => inputRef.current?.click()} type="button">
              <UploadCloud className="size-9 text-primary" />
              <span className="font-medium">{t("mediaCenter.voiceClone.dragOrClick")}</span>
              <span className="text-xs text-muted-foreground">MP3 / WAV · 10 MB</span>
            </button>
          ) : (
            <div className="space-y-5">
              <div className="flex h-28 items-center gap-0.5 overflow-hidden rounded-xl bg-primary/5 px-4" aria-label={t("mediaCenter.voiceClone.stepEdit")}>
                {samples.map((sample, index) => <span className="min-w-0 flex-1 rounded-full bg-primary/70" key={index} style={{ height: `${Math.max(4, sample * 88)}%` }} />)}
              </div>
              <audio className="w-full" controls src={audioUrl} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2"><Label htmlFor="voice-start">{t("mediaCenter.voiceClone.selectedDuration").split(":")[0]} · 0s</Label><Input id="voice-start" max={Math.max(0, end - 0.1)} min={0} onChange={(event) => setStart(Math.min(Number(event.target.value), end - 0.1))} step="0.1" type="number" value={start} /></div>
                <div className="grid gap-2"><Label htmlFor="voice-end">{duration.toFixed(1)}s</Label><Input id="voice-end" max={duration} min={start + 0.1} onChange={(event) => setEnd(Math.max(Number(event.target.value), start + 0.1))} step="0.1" type="number" value={end} /></div>
              </div>
              <p className="text-sm text-muted-foreground">{t("mediaCenter.voiceClone.selectedDuration", { duration: Math.max(0, end - start).toFixed(1) })}</p>
              <div className="flex flex-wrap gap-2"><Button onClick={trim} type="button" variant="outline"><Scissors className="size-4" />{t("mediaCenter.voiceClone.trim")}</Button><Button onClick={reset} type="button" variant="outline"><RotateCcw className="size-4" />{t("mediaCenter.voiceClone.reset")}</Button><Button onClick={() => inputRef.current?.click()} type="button" variant="ghost">{t("mediaCenter.voiceClone.stepUpload")}</Button></div>
            </div>
          )}
          <input accept=".mp3,.wav,audio/mpeg,audio/wav" className="sr-only" onChange={(event) => { const next = event.target.files?.[0]; if (next) void selectFile(next); event.target.value = ""; }} ref={inputRef} type="file" />
          {pending ? <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} /></div> : null}
        </div>
        <DialogFooter>
          <Button disabled={pending} onClick={() => close()} type="button" variant="outline">{t("mediaCenter.voiceClone.cancel")}</Button>
          <Button disabled={pending || !file} onClick={() => void submit()} type="button">{pending ? <LoaderCircle className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}{t("mediaCenter.voiceClone.upload")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
