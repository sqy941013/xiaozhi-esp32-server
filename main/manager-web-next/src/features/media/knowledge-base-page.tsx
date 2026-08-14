import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Braces,
  FileText,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  SearchCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeading } from "@/components/page-heading";
import { Pagination } from "@/components/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DocumentUploadDialog } from "@/features/media/document-upload-dialog";
import {
  createKnowledgeBase,
  deleteKnowledgeBase,
  deleteKnowledgeDocuments,
  getKnowledgeBases,
  getKnowledgeDocuments,
  getRagModels,
  parseKnowledgeDocuments,
  updateKnowledgeBase,
  uploadKnowledgeDocument,
} from "@/features/media/media-api";
import { KnowledgeBaseDialog } from "@/features/media/knowledge-base-dialog";
import { KnowledgeChunksDialog } from "@/features/media/knowledge-chunks-dialog";
import {
  canParseDocument,
  documentProgress,
  documentStatusCode,
  formatFileSize,
  formatMediaDate,
  validateKnowledgeFiles,
} from "@/features/media/media-utils";
import { RetrievalTestDialog } from "@/features/media/retrieval-test-dialog";
import type {
  KnowledgeBase,
  KnowledgeBaseInput,
  KnowledgeDocument,
} from "@/features/media/types";

function fileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function documentId(document: KnowledgeDocument) {
  return document.documentId || document.id || "";
}

export function KnowledgeBasePage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [kbSearch, setKbSearch] = useState("");
  const [kbKeyword, setKbKeyword] = useState("");
  const [requestedDatasetId, setRequestedDatasetId] = useState("");
  const [editingKnowledgeBase, setEditingKnowledgeBase] = useState<KnowledgeBase | null | undefined>();
  const [deleteKnowledgeTarget, setDeleteKnowledgeTarget] = useState<KnowledgeBase | null>(null);
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentKeyword, setDocumentKeyword] = useState("");
  const [documentPage, setDocumentPage] = useState(1);
  const [documentPageSize, setDocumentPageSize] = useState(10);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [deleteDocumentTargets, setDeleteDocumentTargets] = useState<string[]>([]);
  const [parseTarget, setParseTarget] = useState<KnowledgeDocument | null>(null);
  const [chunkTarget, setChunkTarget] = useState<KnowledgeDocument | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [retrievalOpen, setRetrievalOpen] = useState(false);

  const knowledgeQuery = useQuery({
    queryFn: () => getKnowledgeBases({ name: kbKeyword }),
    queryKey: ["knowledge-bases", kbKeyword],
  });
  const knowledgeBases = useMemo(() => knowledgeQuery.data?.list || [], [knowledgeQuery.data?.list]);
  const selectedDatasetId = knowledgeBases.some((item) => item.datasetId === requestedDatasetId)
    ? requestedDatasetId
    : knowledgeBases[0]?.datasetId || "";
  const selectedKnowledgeBase = knowledgeBases.find((item) => item.datasetId === selectedDatasetId) || null;

  const documentsQuery = useQuery({
    enabled: Boolean(selectedDatasetId),
    queryFn: () => getKnowledgeDocuments(selectedDatasetId, {
      name: documentKeyword,
      page: documentPage,
      pageSize: documentPageSize,
    }),
    queryKey: ["knowledge-documents", selectedDatasetId, documentKeyword, documentPage, documentPageSize],
    refetchInterval: (query) => query.state.data?.list.some((document) => documentStatusCode(document) === 1) ? 5_000 : false,
  });
  const documents = documentsQuery.data?.list || [];

  function selectDataset(datasetId: string) {
    setRequestedDatasetId(datasetId);
    setSelectedDocuments(new Set());
    setDocumentPage(1);
  }

  const ragModelsQuery = useQuery({
    enabled: editingKnowledgeBase !== undefined,
    queryFn: getRagModels,
    queryKey: ["rag-models"],
    staleTime: 5 * 60_000,
  });

  const invalidateKnowledge = () => queryClient.invalidateQueries({ queryKey: ["knowledge-bases"] });
  const invalidateDocuments = () => queryClient.invalidateQueries({ queryKey: ["knowledge-documents", selectedDatasetId] });

  const saveKnowledgeMutation = useMutation({
    mutationFn: ({ current, input }: { current: KnowledgeBase | null; input: KnowledgeBaseInput }) => current?.datasetId
      ? updateKnowledgeBase(current.datasetId, input)
      : createKnowledgeBase(input),
  });
  const statusMutation = useMutation({
    mutationFn: ({ knowledgeBase, status }: { knowledgeBase: KnowledgeBase; status: number }) => updateKnowledgeBase(knowledgeBase.datasetId || "", {
      description: knowledgeBase.description || "",
      name: knowledgeBase.name || "",
      ragModelId: knowledgeBase.ragModelId || "",
      status,
    }),
  });
  const deleteKnowledgeMutation = useMutation({ mutationFn: deleteKnowledgeBase });
  const deleteDocumentsMutation = useMutation({
    mutationFn: (ids: readonly string[]) => deleteKnowledgeDocuments(selectedDatasetId, ids),
  });
  const parseMutation = useMutation({
    mutationFn: (id: string) => parseKnowledgeDocuments(selectedDatasetId, [id]),
  });
  const uploadMutation = useMutation({
    mutationFn: async (files: readonly File[]) => Promise.allSettled(files.map((file) => uploadKnowledgeDocument(
      selectedDatasetId,
      file,
      ({ percent }) => setUploadProgress((current) => ({ ...current, [fileKey(file)]: percent })),
    ))),
  });

  async function saveKnowledge(input: KnowledgeBaseInput) {
    const current = editingKnowledgeBase || null;
    try {
      const saved = await saveKnowledgeMutation.mutateAsync({ current, input });
      setEditingKnowledgeBase(undefined);
      await invalidateKnowledge();
      if (!current && saved?.datasetId) selectDataset(saved.datasetId);
      toast.success(t(current
        ? "mediaCenter.knowledgeBaseManagement.updateSuccess"
        : "mediaCenter.knowledgeBaseManagement.addSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t(current
        ? "mediaCenter.knowledgeBaseManagement.updateFailed"
        : "mediaCenter.knowledgeBaseManagement.addFailed")));
    }
  }

  async function changeStatus(knowledgeBase: KnowledgeBase, status: number) {
    if (!knowledgeBase.datasetId) return;
    try {
      await statusMutation.mutateAsync({ knowledgeBase, status });
      await invalidateKnowledge();
      toast.success(t(status === 1
        ? "mediaCenter.knowledgeBaseManagement.enabled"
        : "mediaCenter.knowledgeBaseManagement.disabled"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("mediaCenter.knowledgeBaseManagement.updateFailed")));
    }
  }

  async function removeKnowledgeBase() {
    if (!deleteKnowledgeTarget?.datasetId) return;
    try {
      await deleteKnowledgeMutation.mutateAsync(deleteKnowledgeTarget.datasetId);
      if (selectedDatasetId === deleteKnowledgeTarget.datasetId) setRequestedDatasetId("");
      setDeleteKnowledgeTarget(null);
      await invalidateKnowledge();
      toast.success(t("mediaCenter.knowledgeBaseManagement.batchDeleteSuccess", { count: 1 }));
    } catch (error) {
      toast.error(getErrorMessage(error, t("mediaCenter.knowledgeBaseManagement.deleteFailed")));
    }
  }

  async function removeDocuments() {
    if (!deleteDocumentTargets.length) return;
    try {
      await deleteDocumentsMutation.mutateAsync(deleteDocumentTargets);
      if (documents.length <= deleteDocumentTargets.length && documentPage > 1) setDocumentPage((current) => current - 1);
      setDeleteDocumentTargets([]);
      setSelectedDocuments(new Set());
      await Promise.all([invalidateDocuments(), invalidateKnowledge()]);
      toast.success(t("mediaCenter.knowledgeFileUpload.batchDeleteSuccess", { count: deleteDocumentTargets.length }));
    } catch (error) {
      toast.error(getErrorMessage(error, t("mediaCenter.knowledgeFileUpload.batchDeleteFailed")));
    }
  }

  async function parseDocument() {
    const id = parseTarget ? documentId(parseTarget) : "";
    if (!id) return;
    try {
      await parseMutation.mutateAsync(id);
      setParseTarget(null);
      await invalidateDocuments();
      toast.success(t("mediaCenter.knowledgeFileUpload.parsing"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("mediaCenter.knowledgeFileUpload.parseFailed")));
    }
  }

  function chooseUploadFiles(files: File[]) {
    const unique = [...uploadFiles, ...files].filter((file, index, all) => all.findIndex((candidate) => fileKey(candidate) === fileKey(file)) === index);
    const validation = validateKnowledgeFiles(unique);
    if (!validation.valid) {
      toast.error(t(validation.code === "size"
        ? "mediaCenter.knowledgeFileUpload.fileSizeExceeded"
        : "mediaCenter.knowledgeFileUpload.uploadTip"));
      return;
    }
    setUploadFiles(unique);
  }

  async function uploadDocuments() {
    const validation = validateKnowledgeFiles(uploadFiles);
    if (!validation.valid || uploadFiles.length === 0) {
      toast.error(t("mediaCenter.knowledgeFileUpload.fileRequired"));
      return;
    }
    setUploadProgress({});
    const results = await uploadMutation.mutateAsync(uploadFiles);
    const failedFiles = uploadFiles.filter((_, index) => results[index]?.status === "rejected");
    const successCount = uploadFiles.length - failedFiles.length;
    if (successCount) toast.success(t("mediaCenter.knowledgeFileUpload.uploadSuccess"));
    if (failedFiles.length) toast.error(`${t("mediaCenter.knowledgeFileUpload.uploadFailed")} (${failedFiles.map((file) => file.name).join(", ")})`);
    setUploadFiles(failedFiles);
    setUploadProgress({});
    if (!failedFiles.length) setUploadOpen(false);
    if (successCount) await Promise.all([invalidateDocuments(), invalidateKnowledge()]);
  }

  const selectableDocuments = documents.filter((document) => documentStatusCode(document) !== 1);
  const allDocumentsSelected = selectableDocuments.length > 0 && selectableDocuments.every((document) => selectedDocuments.has(documentId(document)));

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        actions={<Button onClick={() => setEditingKnowledgeBase(null)}><Plus className="size-4" />{t("mediaCenter.knowledgeBaseManagement.add")}</Button>}
        description={t("mediaCenter.knowledgeBaseDialog.descriptionPlaceholder")}
        eyebrow={t("nav.knowledge")}
        title={t("mediaCenter.knowledgeBaseManagement.title")}
      />

      <form className="flex max-w-xl gap-2" onSubmit={(event) => { event.preventDefault(); setKbKeyword(kbSearch.trim()); }}>
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={t("mediaCenter.knowledgeBaseManagement.searchPlaceholder")} className="pl-9" onChange={(event) => setKbSearch(event.target.value)} placeholder={t("mediaCenter.knowledgeBaseManagement.searchPlaceholder")} value={kbSearch} /></div>
        <Button type="submit" variant="outline">{t("mediaCenter.knowledgeBaseManagement.search")}</Button>
      </form>

      {knowledgeQuery.isError ? (
        <Alert variant="destructive"><AlertTitle>{t("mediaCenter.knowledgeBaseManagement.getKnowledgeBaseListFailed")}</AlertTitle><AlertDescription>{getErrorMessage(knowledgeQuery.error, t("mediaCenter.knowledgeBaseManagement.getKnowledgeBaseListFailed"))}</AlertDescription></Alert>
      ) : null}

      <section aria-label={t("mediaCenter.knowledgeBaseManagement.switchKnowledgeBase")} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {knowledgeQuery.isPending ? (
          <div className="col-span-full flex h-40 items-center justify-center"><LoaderCircle className="size-5 animate-spin" /></div>
        ) : knowledgeBases.length ? knowledgeBases.map((knowledgeBase) => {
          const active = knowledgeBase.datasetId === selectedDatasetId;
          return (
            <Card className={`relative cursor-pointer overflow-hidden p-5 transition-all ${active ? "border-primary shadow-md ring-1 ring-primary/30" : "hover:border-primary/40"}`} key={knowledgeBase.datasetId || knowledgeBase.id} onClick={() => selectDataset(knowledgeBase.datasetId || "")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3"><div className="rounded-xl bg-primary/10 p-3 text-primary"><BookOpen className="size-5" /></div><div className="min-w-0"><h2 className="truncate font-semibold">{knowledgeBase.name || "—"}</h2><p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{knowledgeBase.description || "—"}</p></div></div>
                <Switch aria-label={t("mediaCenter.knowledgeBaseManagement.status")} checked={knowledgeBase.status === 1} disabled={statusMutation.isPending} onCheckedChange={(checked) => void changeStatus(knowledgeBase, checked ? 1 : 0)} onClick={(event) => event.stopPropagation()} />
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{t("mediaCenter.knowledgeBaseManagement.totalDocuments", { total: knowledgeBase.documentCount || 0 })}</Badge>
                {knowledgeBase.chunkCount !== undefined ? <Badge variant="outline">{knowledgeBase.chunkCount} {t("mediaCenter.knowledgeFileUpload.slice")}</Badge> : null}
                <span className="ml-auto">{formatMediaDate(knowledgeBase.updatedAt || knowledgeBase.createdAt, i18n.language)}</span>
              </div>
              <div className="mt-4 flex justify-end gap-1 border-t pt-3">
                <Button aria-label={t("mediaCenter.knowledgeBaseManagement.edit")} onClick={(event) => { event.stopPropagation(); setEditingKnowledgeBase(knowledgeBase); }} size="icon" type="button" variant="ghost"><Pencil className="size-4" /></Button>
                <Button aria-label={t("mediaCenter.knowledgeBaseManagement.delete")} onClick={(event) => { event.stopPropagation(); setDeleteKnowledgeTarget(knowledgeBase); }} size="icon" type="button" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button>
              </div>
            </Card>
          );
        }) : <Card className="col-span-full flex h-40 items-center justify-center border-dashed text-sm text-muted-foreground">{t("mediaCenter.knowledgeBaseManagement.noData")}</Card>}
      </section>

      {selectedKnowledgeBase ? (
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
            <div><h2 className="font-semibold">{t("mediaCenter.knowledgeBaseManagement.currentKnowledgeBaseDocuments")}</h2><p className="mt-1 text-sm text-muted-foreground">{selectedKnowledgeBase.name}</p></div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setRetrievalOpen(true)} size="sm" variant="outline"><SearchCheck className="size-4" />{t("mediaCenter.knowledgeFileUpload.retrievalTest")}</Button>
              <Button onClick={() => { setUploadFiles([]); setUploadOpen(true); }} size="sm"><Upload className="size-4" />{t("mediaCenter.knowledgeFileUpload.addDocument")}</Button>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Checkbox aria-label={t("mediaCenter.knowledgeFileUpload.selectAll")} checked={allDocumentsSelected} onChange={(event) => setSelectedDocuments(() => event.target.checked ? new Set(selectableDocuments.map(documentId).filter(Boolean)) : new Set())} />
              <span className="text-sm text-muted-foreground">{selectedDocuments.size}</span>
              <Button disabled={selectedDocuments.size === 0} onClick={() => setDeleteDocumentTargets([...selectedDocuments])} size="sm" variant="outline"><Trash2 className="size-4" />{t("mediaCenter.knowledgeFileUpload.batchDelete")}</Button>
            </div>
            <form className="flex w-full max-w-md gap-2" onSubmit={(event) => { event.preventDefault(); setDocumentPage(1); setDocumentKeyword(documentSearch.trim()); }}>
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={t("mediaCenter.knowledgeFileUpload.searchPlaceholder")} className="pl-9" onChange={(event) => setDocumentSearch(event.target.value)} placeholder={t("mediaCenter.knowledgeFileUpload.searchPlaceholder")} value={documentSearch} /></div>
              <Button type="submit" variant="outline">{t("mediaCenter.knowledgeFileUpload.search")}</Button>
            </form>
          </div>
          {documentsQuery.isError ? <div className="p-4"><Alert variant="destructive"><AlertTitle>{t("mediaCenter.knowledgeFileUpload.getListFailed")}</AlertTitle><AlertDescription>{getErrorMessage(documentsQuery.error, t("mediaCenter.knowledgeFileUpload.getListFailed"))}</AlertDescription></Alert></div> : null}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr><th className="w-12 px-4 py-3" /><th className="px-4 py-3">{t("mediaCenter.knowledgeFileUpload.documentName")}</th><th className="px-4 py-3">{t("mediaCenter.knowledgeFileUpload.uploadTime")}</th><th className="px-4 py-3">{t("mediaCenter.knowledgeFileUpload.sliceCount")}</th><th className="px-4 py-3">{t("mediaCenter.knowledgeFileUpload.status")}</th><th className="px-4 py-3 text-right">{t("mediaCenter.knowledgeFileUpload.operation")}</th></tr></thead>
              <tbody className="divide-y">
                {documentsQuery.isPending ? <tr><td className="h-48 text-center" colSpan={6}><LoaderCircle className="mx-auto size-5 animate-spin" /></td></tr> : documents.length ? documents.map((document) => {
                  const id = documentId(document);
                  const status = documentStatusCode(document);
                  const progress = documentProgress(document);
                  const statusKey = status === 1 ? "statusProcessing" : status === 2 ? "statusCancelled" : status === 3 ? "statusCompleted" : status === 4 ? "statusFailed" : "statusNotStarted";
                  return (
                    <tr className="hover:bg-muted/20" key={id}>
                      <td className="px-4 py-3"><Checkbox aria-label={document.name || id} checked={selectedDocuments.has(id)} disabled={status === 1} onChange={(event) => setSelectedDocuments((current) => { const next = new Set(current); if (event.target.checked) next.add(id); else next.delete(id); return next; })} /></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><FileText className="size-5 shrink-0 text-primary" /><div className="min-w-0"><p className="max-w-sm truncate font-medium" title={document.name}>{document.name || "—"}</p><p className="text-xs text-muted-foreground">{formatFileSize(document.fileSize)} · {(document.fileType || "").toUpperCase()}</p></div></div></td>
                      <td className="px-4 py-3 text-muted-foreground">{formatMediaDate(document.createdAt, i18n.language)}</td>
                      <td className="px-4 py-3"><button className="font-medium text-primary hover:underline disabled:text-muted-foreground" disabled={status !== 3} onClick={() => setChunkTarget(document)} type="button">{document.chunkCount || 0}</button></td>
                      <td className="px-4 py-3"><div className="space-y-1.5"><Badge variant={status === 4 ? "destructive" : status === 3 ? "default" : "secondary"}>{t(`mediaCenter.knowledgeFileUpload.${statusKey}`)}</Badge>{status === 1 ? <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} /></div> : null}{status === 4 && document.error ? <p className="max-w-xs truncate text-xs text-destructive" title={document.error}>{document.error}</p> : null}</div></td>
                      <td className="px-4 py-3"><div className="flex justify-end gap-1"><Button disabled={!canParseDocument(document) || parseMutation.isPending} onClick={() => setParseTarget(document)} size="sm" variant="ghost"><Braces className="size-4" />{t("mediaCenter.knowledgeFileUpload.parse")}</Button><Button disabled={status !== 3} onClick={() => setChunkTarget(document)} size="sm" variant="ghost">{t("mediaCenter.knowledgeFileUpload.viewSlices")}</Button><Button aria-label={t("mediaCenter.knowledgeFileUpload.delete")} disabled={status === 1} onClick={() => setDeleteDocumentTargets([id])} size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button></div></td>
                    </tr>
                  );
                }) : <tr><td className="h-48 text-center text-muted-foreground" colSpan={6}>{t("common.noData")}</td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination label={t("mediaCenter.knowledgeFileUpload.totalRecords", { total: documentsQuery.data?.total || 0 })} nextLabel={t("mediaCenter.knowledgeFileUpload.nextPage")} onPageChange={setDocumentPage} onPageSizeChange={(size) => { setDocumentPageSize(size); setDocumentPage(1); }} page={documentPage} pageSize={documentPageSize} pageSizeLabel={t("common.pageSize")} previousLabel={t("mediaCenter.knowledgeFileUpload.prevPage")} total={documentsQuery.data?.total || 0} />
        </Card>
      ) : null}

      <KnowledgeBaseDialog knowledgeBase={editingKnowledgeBase || null} onOpenChange={(open) => !open && setEditingKnowledgeBase(undefined)} onSubmit={saveKnowledge} open={editingKnowledgeBase !== undefined} pending={saveKnowledgeMutation.isPending} ragModels={ragModelsQuery.data || []} ragModelsPending={ragModelsQuery.isPending} />
      <DocumentUploadDialog files={uploadFiles} onFilesChange={chooseUploadFiles} onOpenChange={(open) => { setUploadOpen(open); if (!open) { setUploadFiles([]); setUploadProgress({}); } }} onSubmit={uploadDocuments} open={uploadOpen} pending={uploadMutation.isPending} progress={uploadProgress} />
      <KnowledgeChunksDialog datasetId={selectedDatasetId} document={chunkTarget} onOpenChange={(open) => !open && setChunkTarget(null)} />
      <RetrievalTestDialog datasetId={selectedDatasetId} knowledgeBaseName={selectedKnowledgeBase?.name || ""} onOpenChange={setRetrievalOpen} open={retrievalOpen} />
      <ConfirmDialog cancelLabel={t("common.cancel")} confirmLabel={t("mediaCenter.knowledgeBaseManagement.delete")} description={t("mediaCenter.knowledgeBaseManagement.confirmBatchDelete", { count: 1 })} onConfirm={removeKnowledgeBase} onOpenChange={(open) => !open && setDeleteKnowledgeTarget(null)} open={Boolean(deleteKnowledgeTarget)} pending={deleteKnowledgeMutation.isPending} title={t("mediaCenter.knowledgeBaseManagement.delete")} variant="destructive" />
      <ConfirmDialog cancelLabel={t("common.cancel")} confirmLabel={t("mediaCenter.knowledgeFileUpload.delete")} description={t("mediaCenter.knowledgeFileUpload.confirmBatchDelete", { count: deleteDocumentTargets.length })} onConfirm={removeDocuments} onOpenChange={(open) => !open && setDeleteDocumentTargets([])} open={deleteDocumentTargets.length > 0} pending={deleteDocumentsMutation.isPending} title={t("mediaCenter.knowledgeFileUpload.delete")} variant="destructive" />
      <ConfirmDialog cancelLabel={t("common.cancel")} confirmLabel={t("mediaCenter.knowledgeFileUpload.parse")} description={t("mediaCenter.knowledgeFileUpload.confirmParse")} onConfirm={parseDocument} onOpenChange={(open) => !open && setParseTarget(null)} open={Boolean(parseTarget)} pending={parseMutation.isPending} title={t("mediaCenter.knowledgeFileUpload.parse")} />
    </div>
  );
}
