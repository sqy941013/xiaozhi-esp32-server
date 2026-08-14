import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DictType, DictTypeInput } from "@/features/admin/types";

interface DictTypeDialogProps {
  dictionaryType: DictType | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: DictTypeInput) => void | Promise<void>;
  open: boolean;
  pending: boolean;
}

export function DictTypeDialog(props: DictTypeDialogProps) {
  if (!props.open) return null;
  return <OpenDictTypeDialog {...props} />;
}

function OpenDictTypeDialog({ dictionaryType, onOpenChange, onSubmit, pending }: DictTypeDialogProps) {
  const { t } = useTranslation();
  const [dictName, setDictName] = useState(dictionaryType?.dictName || "");
  const [dictType, setDictType] = useState(dictionaryType?.dictType || "");
  const [remark, setRemark] = useState(dictionaryType?.remark || "");
  const [sort, setSort] = useState(Number(dictionaryType?.sort) || 0);
  const [submitted, setSubmitted] = useState(false);

  async function submit() {
    setSubmitted(true);
    if (!dictName.trim() || !dictType.trim()) return;
    await onSubmit({
      ...(dictionaryType?.id !== undefined ? { id: dictionaryType.id } : {}),
      dictName: dictName.trim(),
      dictType: dictType.trim(),
      remark: remark.trim(),
      sort,
    });
  }

  return <Dialog onOpenChange={(next) => !pending && onOpenChange(next)} open><DialogContent><DialogHeader><DialogTitle>{t(dictionaryType ? "adminCenter.dictManagement.editDictType" : "adminCenter.dictManagement.addDictType")}</DialogTitle><DialogDescription>{t("adminCenter.ui.descriptions.dictionary")}</DialogDescription></DialogHeader><div className="grid gap-5 overflow-y-auto px-6 py-1">
    <div className="grid gap-2"><Label htmlFor="dict-type-name">{t("adminCenter.dictTypeDialog.dictName")}</Label><Input aria-invalid={submitted && !dictName.trim()} id="dict-type-name" onChange={(event) => setDictName(event.target.value)} placeholder={t("adminCenter.dictTypeDialog.dictNamePlaceholder")} value={dictName} />{submitted && !dictName.trim() ? <p className="text-xs text-destructive">{t("adminCenter.dictTypeDialog.requiredDictName")}</p> : null}</div>
    <div className="grid gap-2"><Label htmlFor="dict-type-code">{t("adminCenter.dictTypeDialog.dictType")}</Label><Input aria-invalid={submitted && !dictType.trim()} id="dict-type-code" onChange={(event) => setDictType(event.target.value)} placeholder={t("adminCenter.dictTypeDialog.dictTypePlaceholder")} value={dictType} />{submitted && !dictType.trim() ? <p className="text-xs text-destructive">{t("adminCenter.dictTypeDialog.requiredDictType")}</p> : null}</div>
    <div className="grid gap-2"><Label htmlFor="dict-type-sort">{t("adminCenter.dictManagement.sort")}</Label><Input id="dict-type-sort" min={0} onChange={(event) => setSort(Math.max(0, Number(event.target.value) || 0))} type="number" value={sort} /></div>
    <div className="grid gap-2"><Label htmlFor="dict-type-remark">{t("adminCenter.paramManagement.remark")}</Label><Textarea id="dict-type-remark" onChange={(event) => setRemark(event.target.value)} rows={3} value={remark} /></div>
  </div><DialogFooter><Button disabled={pending} onClick={() => onOpenChange(false)} type="button" variant="outline">{t("common.cancel")}</Button><Button disabled={pending} onClick={() => void submit()} type="button">{pending ? <LoaderCircle className="size-4 animate-spin" /> : null}{t("common.save")}</Button></DialogFooter></DialogContent></Dialog>;
}
