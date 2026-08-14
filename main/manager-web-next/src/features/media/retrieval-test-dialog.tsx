import { LoaderCircle, SearchCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { runRetrievalTest } from "@/features/media/media-api";
import type { RetrievalResult } from "@/features/media/types";

interface RetrievalTestDialogProps {
  datasetId: string;
  knowledgeBaseName: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function RetrievalTestDialog({ datasetId, knowledgeBaseName, onOpenChange, open }: RetrievalTestDialogProps) {
  const { t } = useTranslation();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<RetrievalResult | null>(null);
  const [pending, setPending] = useState(false);

  async function run() {
    const value = question.trim();
    if (!value) {
      toast.error(t("mediaCenter.knowledgeFileUpload.testQuestionRequired"));
      return;
    }
    setPending(true);
    try {
      setResult(await runRetrievalTest(datasetId, value));
    } catch (error) {
      toast.error(getErrorMessage(error, t("mediaCenter.knowledgeFileUpload.parseFailed")));
    } finally {
      setPending(false);
    }
  }

  function changeOpen(next: boolean) {
    if (!next && !pending) {
      setQuestion("");
      setResult(null);
    }
    if (!pending) onOpenChange(next);
  }

  return (
    <Dialog onOpenChange={changeOpen} open={open}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("mediaCenter.knowledgeFileUpload.retrievalTest")}</DialogTitle>
          <DialogDescription>{knowledgeBaseName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 overflow-y-auto px-6 py-1">
          <div className="grid gap-2">
            <Label htmlFor="retrieval-question">{t("mediaCenter.knowledgeFileUpload.testQuestion")}</Label>
            <Textarea id="retrieval-question" onChange={(event) => setQuestion(event.target.value)} placeholder={t("mediaCenter.knowledgeFileUpload.testQuestionPlaceholder")} rows={3} value={question} />
          </div>
          {result ? (
            <section className="space-y-3" aria-live="polite">
              <h3 className="font-semibold">{t("mediaCenter.knowledgeFileUpload.testResult")} ({result.total})</h3>
              {result.chunks.length ? result.chunks.map((hit, index) => (
                <article className="rounded-xl border p-4" key={hit.id || index}>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge>{(Math.max(0, Number(hit.similarity) || 0) * 100).toFixed(1)}%</Badge>
                    <span className="text-sm font-medium">{hit.document_name || hit.document_keyword || hit.document_id}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{hit.content}</p>
                </article>
              )) : <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">{t("mediaCenter.knowledgeFileUpload.noRelatedSlices")}</p>}
            </section>
          ) : null}
        </div>
        <DialogFooter>
          <Button disabled={pending} onClick={() => changeOpen(false)} type="button" variant="outline">{t("common.cancel")}</Button>
          <Button disabled={pending} onClick={() => void run()} type="button">
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <SearchCheck className="size-4" />}
            {t("mediaCenter.knowledgeFileUpload.runTest")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
