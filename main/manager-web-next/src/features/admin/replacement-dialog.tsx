import { FileUp, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { replacementLines, utf8Size, validateReplacementContent } from "@/features/admin/admin-utils";
import type { CorrectWordFile, CorrectWordInput } from "@/features/admin/types";

const MAX_FILE_SIZE = 1024 * 1024;

interface ReplacementDialogProps {
  file: CorrectWordFile | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CorrectWordInput) => void | Promise<void>;
  open: boolean;
  pending: boolean;
}

export function ReplacementDialog(props: ReplacementDialogProps) {
  if (!props.open) return null;
  return <OpenReplacementDialog {...props} />;
}

function OpenReplacementDialog({ file, onOpenChange, onSubmit, pending }: ReplacementDialogProps) {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState(file?.fileName || "");
  const [content, setContent] = useState(() => [...(file?.content || [])].join("\n"));
  const [submitted, setSubmitted] = useState(false);
  const lines = useMemo(() => replacementLines(content), [content]);
  const validation = useMemo(() => validateReplacementContent(content), [content]);
  const contentSize = useMemo(() => utf8Size(lines.join("\n")), [lines]);

  async function importFile(upload: File) {
    if (!/\.txt$/i.test(upload.name) || (upload.type && upload.type !== "text/plain")) {
      toast.error(t("adminCenter.ui.txtOnly"));
      return;
    }
    if (upload.size > MAX_FILE_SIZE) {
      toast.error(t("adminCenter.ui.fileTooLarge"));
      return;
    }
    try {
      const text = await upload.text();
      if (text.includes("\uFFFD")) throw new Error("encoding");
      setContent(text);
      if (!fileName.trim()) setFileName(upload.name.replace(/\.txt$/i, ""));
    } catch {
      toast.error(t("adminCenter.replacementDialog.readFileError"));
    }
  }

  async function submit() {
    setSubmitted(true);
    if (!fileName.trim() || validation || contentSize > MAX_FILE_SIZE) return;
    await onSubmit({
      content: lines,
      fileName: fileName.trim(),
      fileSize: contentSize,
    });
  }

  const validationMessage = validation
    ? t(`adminCenter.replacementDialog.${validation.key}`, validation.values)
    : contentSize > MAX_FILE_SIZE
      ? t("adminCenter.ui.fileTooLarge")
      : "";

  return <Dialog onOpenChange={(next) => !pending && onOpenChange(next)} open><DialogContent><DialogHeader><DialogTitle>{t(file ? "adminCenter.replacementWordManagement.edit" : "adminCenter.replacementWordManagement.addFile")}</DialogTitle><DialogDescription>{t("adminCenter.ui.descriptions.replacementWords")}</DialogDescription></DialogHeader><div className="grid gap-5 overflow-y-auto px-6 py-1">
    <div className="grid gap-2"><Label htmlFor="replacement-file-name">{t("adminCenter.replacementDialog.fileName")}</Label><Input aria-invalid={submitted && !fileName.trim()} id="replacement-file-name" onChange={(event) => setFileName(event.target.value)} placeholder={t("adminCenter.replacementDialog.fileNamePlaceholder")} value={fileName} />{submitted && !fileName.trim() ? <p className="text-xs text-destructive">{t("adminCenter.replacementDialog.requiredFileName")}</p> : null}</div>
    <div className="grid gap-2"><Label htmlFor="replacement-content">{t("adminCenter.replacementDialog.content")}</Label><Textarea aria-invalid={Boolean(submitted && validationMessage)} id="replacement-content" onChange={(event) => setContent(event.target.value)} placeholder={t("adminCenter.replacementDialog.contentPlaceholder")} rows={10} value={content} /><div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between"><span className={validationMessage && submitted ? "text-destructive" : "text-muted-foreground"}>{submitted && validationMessage ? validationMessage : t("adminCenter.replacementDialog.formatTip")}</span><span className={lines.length > 4_000 || contentSize > MAX_FILE_SIZE ? "font-medium text-destructive" : "text-muted-foreground"}>{lines.length} / 4000 {t("adminCenter.replacementDialog.wordCountUnit")}</span></div></div>
    <div><label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm font-medium text-primary hover:bg-primary/10" htmlFor="replacement-upload"><FileUp className="size-5" /><span><span className="block">{t("adminCenter.replacementDialog.clickUploadTip")}</span><span className="block text-xs font-normal text-muted-foreground">{t("adminCenter.replacementDialog.uploadCoverTip")}</span></span></label><input accept=".txt,text/plain" className="sr-only" disabled={pending} id="replacement-upload" onChange={(event) => { const upload = event.target.files?.[0]; if (upload) void importFile(upload); event.target.value = ""; }} type="file" /></div>
  </div><DialogFooter><Button disabled={pending} onClick={() => onOpenChange(false)} type="button" variant="outline">{t("common.cancel")}</Button><Button disabled={pending} onClick={() => void submit()} type="button">{pending ? <LoaderCircle className="size-4 animate-spin" /> : null}{t("common.save")}</Button></DialogFooter></DialogContent></Dialog>;
}
