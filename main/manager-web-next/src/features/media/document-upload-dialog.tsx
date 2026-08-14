import { FileText, LoaderCircle, Trash2, UploadCloud } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatFileSize } from "@/features/media/media-utils";

interface DocumentUploadDialogProps {
  files: readonly File[];
  onFilesChange: (files: File[]) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void | Promise<void>;
  open: boolean;
  pending: boolean;
  progress: Readonly<Record<string, number>>;
}

export function DocumentUploadDialog({
  files,
  onFilesChange,
  onOpenChange,
  onSubmit,
  open,
  pending,
  progress,
}: DocumentUploadDialogProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog onOpenChange={(next) => !pending && onOpenChange(next)} open={open}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("mediaCenter.knowledgeFileUpload.uploadDocument")}</DialogTitle>
          <DialogDescription>{t("mediaCenter.knowledgeFileUpload.uploadTip")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto px-6 py-1">
          <button
            className="flex min-h-36 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center transition-colors hover:bg-primary/10"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              onFilesChange([...event.dataTransfer.files]);
            }}
            type="button"
          >
            <UploadCloud className="size-8 text-primary" />
            <span className="font-medium">{t("mediaCenter.knowledgeFileUpload.dragOrClick")}</span>
          </button>
          <input
            accept=".doc,.docx,.pdf,.txt,.md,.mdx,.csv,.xls,.xlsx,.ppt,.pptx"
            className="sr-only"
            disabled={pending}
            multiple
            onChange={(event) => {
              onFilesChange([...(event.target.files || [])]);
              event.target.value = "";
            }}
            ref={inputRef}
            type="file"
          />
          {files.length ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("mediaCenter.knowledgeFileUpload.selectedFiles")} ({files.length}/32)</p>
              {files.map((file, index) => {
                const key = `${file.name}:${file.size}:${file.lastModified}`;
                const value = progress[key] || 0;
                return (
                  <div className="rounded-lg border p-3" key={key}>
                    <div className="flex items-center gap-3">
                      <FileText className="size-4 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      <Button aria-label={t("mediaCenter.knowledgeFileUpload.delete")} disabled={pending} onClick={() => onFilesChange(files.filter((_, itemIndex) => itemIndex !== index))} size="icon" type="button" variant="ghost">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    {pending ? (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${value}%` }} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button disabled={pending} onClick={() => onOpenChange(false)} type="button" variant="outline">{t("mediaCenter.knowledgeFileUpload.cancel")}</Button>
          <Button disabled={pending || files.length === 0} onClick={() => void onSubmit()} type="button">
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
            {t("mediaCenter.knowledgeFileUpload.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
