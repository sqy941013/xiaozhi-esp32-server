import { LoaderCircle, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { getErrorMessage } from "@/api/client";
import { Pagination } from "@/components/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Input } from "@/components/ui/input";
import { getKnowledgeChunks } from "@/features/media/media-api";
import type { KnowledgeDocument } from "@/features/media/types";
import { useQuery } from "@tanstack/react-query";

interface KnowledgeChunksDialogProps {
  datasetId: string;
  document: KnowledgeDocument | null;
  onOpenChange: (open: boolean) => void;
}

export function KnowledgeChunksDialog({ datasetId, document, onOpenChange }: KnowledgeChunksDialogProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const open = Boolean(document);
  const chunksQuery = useQuery({
    enabled: open && Boolean(datasetId && document?.id),
    queryFn: () => getKnowledgeChunks(datasetId, document?.id || "", { keywords: keyword, page, pageSize }),
    queryKey: ["knowledge-chunks", datasetId, document?.id, keyword, page, pageSize],
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("mediaCenter.knowledgeFileUpload.viewSlices")}</DialogTitle>
          <DialogDescription>{document?.name || "—"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto px-6 py-1">
          <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); setPage(1); setKeyword(search.trim()); }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" onChange={(event) => setSearch(event.target.value)} placeholder={t("mediaCenter.knowledgeFileUpload.searchPlaceholder")} value={search} />
            </div>
            <Button type="submit" variant="outline">{t("mediaCenter.knowledgeFileUpload.search")}</Button>
          </form>
          {chunksQuery.isError ? (
            <Alert variant="destructive"><AlertTitle>{t("mediaCenter.knowledgeBaseManagement.getListFailed")}</AlertTitle><AlertDescription>{getErrorMessage(chunksQuery.error, t("mediaCenter.knowledgeBaseManagement.getListFailed"))}</AlertDescription></Alert>
          ) : null}
          {chunksQuery.isPending ? (
            <div className="flex h-48 items-center justify-center"><LoaderCircle className="size-5 animate-spin" /></div>
          ) : chunksQuery.data?.chunks.length ? (
            <div className="space-y-3">
              {chunksQuery.data.chunks.map((chunk, index) => (
                <article className="rounded-xl border bg-muted/10 p-4" key={chunk.id || index}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="secondary">{t("mediaCenter.knowledgeFileUpload.slice")} {(page - 1) * pageSize + index + 1}</Badge>
                    {chunk.important_keywords?.length ? (
                      <span className="text-xs text-muted-foreground">{chunk.important_keywords.join(" · ")}</span>
                    ) : null}
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6">{chunk.content || "—"}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">{t("mediaCenter.knowledgeFileUpload.noSliceData")}</div>
          )}
        </div>
        <Pagination
          label={t("mediaCenter.knowledgeFileUpload.totalSlices", { total: chunksQuery.data?.total || 0 })}
          nextLabel={t("mediaCenter.knowledgeFileUpload.nextPage")}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          page={page}
          pageSize={pageSize}
          pageSizeLabel={t("common.pageSize")}
          previousLabel={t("mediaCenter.knowledgeFileUpload.prevPage")}
          total={chunksQuery.data?.total || 0}
        />
        <DialogFooter><Button onClick={() => onOpenChange(false)} type="button">{t("common.close")}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
