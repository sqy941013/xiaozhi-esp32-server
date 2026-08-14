import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DictData, DictDataInput } from "@/features/admin/types";

interface DictDataDialogProps {
  data: DictData | null;
  dictTypeId: number;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: DictDataInput) => void | Promise<void>;
  open: boolean;
  pending: boolean;
}

export function DictDataDialog(props: DictDataDialogProps) {
  if (!props.open) return null;
  return <OpenDictDataDialog {...props} />;
}

function OpenDictDataDialog({ data, dictTypeId, onOpenChange, onSubmit, pending }: DictDataDialogProps) {
  const { t } = useTranslation();
  const [dictLabel, setDictLabel] = useState(data?.dictLabel || "");
  const [dictValue, setDictValue] = useState(data?.dictValue || "");
  const [remark, setRemark] = useState(data?.remark || "");
  const [sort, setSort] = useState(Number(data?.sort) || 0);
  const [submitted, setSubmitted] = useState(false);

  async function submit() {
    setSubmitted(true);
    if (!dictLabel.trim() || !dictValue.trim()) return;
    await onSubmit({
      ...(data?.id !== undefined ? { id: data.id } : {}),
      dictLabel: dictLabel.trim(),
      dictTypeId,
      dictValue: dictValue.trim(),
      remark: remark.trim(),
      sort,
    });
  }

  return <Dialog onOpenChange={(next) => !pending && onOpenChange(next)} open><DialogContent><DialogHeader><DialogTitle>{t(data ? "adminCenter.dictManagement.editDictData" : "adminCenter.dictManagement.addDictData")}</DialogTitle><DialogDescription>{t("adminCenter.ui.descriptions.dictionary")}</DialogDescription></DialogHeader><div className="grid gap-5 overflow-y-auto px-6 py-1">
    <div className="grid gap-2"><Label htmlFor="dict-data-label">{t("adminCenter.dictDataDialog.dictLabel")}</Label><Input aria-invalid={submitted && !dictLabel.trim()} id="dict-data-label" onChange={(event) => setDictLabel(event.target.value)} placeholder={t("adminCenter.dictDataDialog.dictLabelPlaceholder")} value={dictLabel} />{submitted && !dictLabel.trim() ? <p className="text-xs text-destructive">{t("adminCenter.dictDataDialog.requiredDictLabel")}</p> : null}</div>
    <div className="grid gap-2"><Label htmlFor="dict-data-value">{t("adminCenter.dictDataDialog.dictValue")}</Label><Input aria-invalid={submitted && !dictValue.trim()} id="dict-data-value" onChange={(event) => setDictValue(event.target.value)} placeholder={t("adminCenter.dictDataDialog.dictValuePlaceholder")} value={dictValue} />{submitted && !dictValue.trim() ? <p className="text-xs text-destructive">{t("adminCenter.dictDataDialog.requiredDictValue")}</p> : null}</div>
    <div className="grid gap-2"><Label htmlFor="dict-data-sort">{t("adminCenter.dictDataDialog.sort")}</Label><Input id="dict-data-sort" max={999} min={0} onChange={(event) => setSort(Math.min(999, Math.max(0, Number(event.target.value) || 0)))} type="number" value={sort} /></div>
    <div className="grid gap-2"><Label htmlFor="dict-data-remark">{t("adminCenter.paramManagement.remark")}</Label><Textarea id="dict-data-remark" onChange={(event) => setRemark(event.target.value)} rows={3} value={remark} /></div>
  </div><DialogFooter><Button disabled={pending} onClick={() => onOpenChange(false)} type="button" variant="outline">{t("common.cancel")}</Button><Button disabled={pending} onClick={() => void submit()} type="button">{pending ? <LoaderCircle className="size-4 animate-spin" /> : null}{t("common.save")}</Button></DialogFooter></DialogContent></Dialog>;
}
