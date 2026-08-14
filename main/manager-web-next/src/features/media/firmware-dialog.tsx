import { FileUp, LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { uploadFirmware } from "@/features/media/media-api";
import { formatFileSize, validateFirmwareFile, VERSION_PATTERN } from "@/features/media/media-utils";
import type { Firmware, FirmwareInput, FirmwareType } from "@/features/media/types";

interface FirmwareDialogProps {
  firmware: Firmware | null;
  firmwareTypes: readonly FirmwareType[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: FirmwareInput) => void | Promise<void>;
  open: boolean;
  pending: boolean;
}

export function FirmwareDialog({ firmware, firmwareTypes, onOpenChange, onSubmit, open, pending }: FirmwareDialogProps) {
  if (!open) return null;
  return <OpenFirmwareDialog firmware={firmware} firmwareTypes={firmwareTypes} onOpenChange={onOpenChange} onSubmit={onSubmit} pending={pending} />;
}

function OpenFirmwareDialog({ firmware, firmwareTypes, onOpenChange, onSubmit, pending }: Omit<FirmwareDialogProps, "open">) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FirmwareInput>(() => ({
    firmwareName: firmware?.firmwareName || "",
    firmwarePath: firmware?.firmwarePath || "",
    remark: firmware?.remark || "",
    size: Number(firmware?.size) || 0,
    type: firmware?.type || "",
    version: firmware?.version || "",
  }));
  const [fileName, setFileName] = useState(() => firmware?.firmwarePath?.split(/[\\/]/).at(-1) || "");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  async function upload(file: File) {
    const validation = validateFirmwareFile(file);
    if (!validation.valid) {
      toast.error(t(validation.code === "size" ? "mediaCenter.firmwareDialog.invalidFileSize" : "mediaCenter.firmwareDialog.invalidFileType"));
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const firmwarePath = await uploadFirmware(file, ({ percent }) => setProgress(percent));
      setForm((current) => ({ ...current, firmwarePath, size: file.size }));
      setFileName(file.name);
      setProgress(100);
      toast.success(t("mediaCenter.firmwareDialog.uploadSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("mediaCenter.firmwareDialog.uploadFailed")));
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    setSubmitted(true);
    if (!form.firmwareName.trim() || !form.type || !VERSION_PATTERN.test(form.version.trim()) || !form.firmwarePath) return;
    await onSubmit({ ...form, firmwareName: form.firmwareName.trim(), remark: form.remark.trim(), version: form.version.trim() });
  }

  return (
    <Dialog onOpenChange={(next) => !pending && !uploading && onOpenChange(next)} open>
      <DialogContent>
        <DialogHeader><DialogTitle>{t(firmware ? "mediaCenter.otaManagement.editFirmware" : "mediaCenter.otaManagement.addFirmware")}</DialogTitle><DialogDescription>{t("mediaCenter.firmwareDialog.uploadHint")}</DialogDescription></DialogHeader>
        <div className="grid gap-5 overflow-y-auto px-6 py-1">
          <div className="grid gap-2"><Label htmlFor="firmware-name">{t("mediaCenter.firmwareDialog.firmwareName")}</Label><Input aria-invalid={submitted && !form.firmwareName.trim()} id="firmware-name" onChange={(event) => setForm((current) => ({ ...current, firmwareName: event.target.value }))} placeholder={t("mediaCenter.firmwareDialog.firmwareNamePlaceholder")} value={form.firmwareName} />{submitted && !form.firmwareName.trim() ? <p className="text-xs text-destructive">{t("mediaCenter.firmwareDialog.requiredFirmwareName")}</p> : null}</div>
          <div className="grid gap-2"><Label htmlFor="firmware-type">{t("mediaCenter.firmwareDialog.firmwareType")}</Label><select aria-invalid={submitted && !form.type} className="h-10 rounded-md border border-input bg-background px-3 text-sm disabled:opacity-60" disabled={Boolean(firmware)} id="firmware-type" onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} value={form.type}><option value="">{t("mediaCenter.firmwareDialog.firmwareTypePlaceholder")}</option>{firmwareTypes.map((type) => <option key={type.key} value={type.key}>{type.name || type.key}</option>)}</select>{submitted && !form.type ? <p className="text-xs text-destructive">{t("mediaCenter.firmwareDialog.requiredFirmwareType")}</p> : null}</div>
          <div className="grid gap-2"><Label htmlFor="firmware-version">{t("mediaCenter.firmwareDialog.version")}</Label><Input aria-invalid={submitted && !VERSION_PATTERN.test(form.version.trim())} id="firmware-version" onChange={(event) => setForm((current) => ({ ...current, version: event.target.value }))} placeholder={t("mediaCenter.firmwareDialog.versionPlaceholder")} value={form.version} />{submitted && !VERSION_PATTERN.test(form.version.trim()) ? <p className="text-xs text-destructive">{form.version.trim() ? t("mediaCenter.firmwareDialog.versionFormatError") : t("mediaCenter.firmwareDialog.requiredVersion")}</p> : null}</div>
          <div className="grid gap-2">
            <Label htmlFor="firmware-file">{t("mediaCenter.firmwareDialog.firmwareFile")}</Label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-5 text-sm font-medium text-primary hover:bg-primary/10" htmlFor="firmware-file"><FileUp className="size-5" />{uploading ? t("common.loading") : t("mediaCenter.firmwareDialog.clickUpload")}</label>
            <input accept=".bin,.apk" className="sr-only" disabled={uploading || pending} id="firmware-file" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} type="file" />
            <p className="text-xs text-muted-foreground">{t("mediaCenter.firmwareDialog.uploadTip")}</p>
            {fileName ? <div className="flex items-center gap-3 rounded-lg border p-3"><FileUp className="size-4 text-primary" /><span className="min-w-0 flex-1 truncate text-sm">{fileName}</span><span className="text-xs text-muted-foreground">{formatFileSize(form.size)}</span><Button aria-label={t("mediaCenter.otaManagement.delete")} disabled={uploading} onClick={() => { setFileName(""); setForm((current) => ({ ...current, firmwarePath: "", size: 0 })); setProgress(0); }} size="icon" type="button" variant="ghost"><Trash2 className="size-4" /></Button></div> : null}
            {uploading || progress ? <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} /></div> : null}
            {submitted && !form.firmwarePath ? <p className="text-xs text-destructive">{t("mediaCenter.firmwareDialog.requiredFirmwareFile")}</p> : null}
          </div>
          <div className="grid gap-2"><Label htmlFor="firmware-remark">{t("mediaCenter.firmwareDialog.remark")}</Label><Textarea id="firmware-remark" onChange={(event) => setForm((current) => ({ ...current, remark: event.target.value }))} placeholder={t("mediaCenter.firmwareDialog.remarkPlaceholder")} rows={4} value={form.remark} /></div>
        </div>
        <DialogFooter><Button disabled={pending || uploading} onClick={() => onOpenChange(false)} type="button" variant="outline">{t("common.cancel")}</Button><Button disabled={pending || uploading} onClick={() => void submit()} type="button">{pending ? <LoaderCircle className="size-4 animate-spin" /> : null}{t("common.save")}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
