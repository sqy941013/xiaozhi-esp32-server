import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatParamValue,
  isSensitiveParamCode,
  normalizeParamValueType,
  serializeParamValue,
} from "@/features/admin/admin-utils";
import type { Param, ParamInput, ParamValueType } from "@/features/admin/types";

interface ParamDialogProps {
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: ParamInput) => void | Promise<void>;
  open: boolean;
  parameter: Param | null;
  pending: boolean;
}

export function ParamDialog(props: ParamDialogProps) {
  if (!props.open) return null;
  return <OpenParamDialog {...props} />;
}

function OpenParamDialog({
  onOpenChange,
  onSubmit,
  parameter,
  pending,
}: ParamDialogProps) {
  const { t } = useTranslation();
  const initialType = normalizeParamValueType(parameter?.valueType);
  const [paramCode, setParamCode] = useState(parameter?.paramCode || "");
  const [paramValue, setParamValue] = useState(() =>
    formatParamValue(parameter?.paramValue || "", initialType),
  );
  const [remark, setRemark] = useState(parameter?.remark || "");
  const [valueType, setValueType] = useState<ParamValueType>(initialType);
  const [submitted, setSubmitted] = useState(false);
  const [formatError, setFormatError] = useState("");
  const [showSensitive, setShowSensitive] = useState(false);
  const sensitive = isSensitiveParamCode(paramCode);

  function changeType(nextType: ParamValueType) {
    setParamValue((current) => {
      try {
        const serialized = serializeParamValue(current, valueType);
        return formatParamValue(serialized, nextType);
      } catch {
        return current;
      }
    });
    setValueType(nextType);
    setFormatError("");
  }

  async function submit() {
    setSubmitted(true);
    setFormatError("");
    if (!paramCode.trim() || !paramValue.trim()) return;
    let serialized: string;
    try {
      serialized = serializeParamValue(paramValue, valueType);
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      setFormatError(
        t(
          code === "invalidNumber"
            ? "adminCenter.ui.invalidNumber"
            : code === "invalidBoolean"
              ? "adminCenter.ui.invalidBoolean"
              : "adminCenter.ui.invalidJson",
        ),
      );
      return;
    }
    await onSubmit({
      ...(parameter?.id !== undefined ? { id: parameter.id } : {}),
      paramCode: paramCode.trim(),
      paramValue: serialized,
      remark: remark.trim(),
      valueType,
    });
  }

  const multiline = valueType === "array" || valueType === "json";
  return (
    <Dialog onOpenChange={(next) => !pending && onOpenChange(next)} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(
              parameter
                ? "adminCenter.paramManagement.editParam"
                : "adminCenter.paramManagement.addParam",
            )}
          </DialogTitle>
          <DialogDescription>
            {t("adminCenter.ui.descriptions.parameters")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 overflow-y-auto px-6 py-1">
          <div className="grid gap-2">
            <Label htmlFor="param-code">{t("adminCenter.paramDialog.paramCode")}</Label>
            <Input
              aria-invalid={submitted && !paramCode.trim()}
              id="param-code"
              onChange={(event) => setParamCode(event.target.value)}
              placeholder={t("adminCenter.paramDialog.paramCodePlaceholder")}
              value={paramCode}
            />
            {submitted && !paramCode.trim() ? (
              <p className="text-xs text-destructive">
                {t("adminCenter.paramDialog.requiredParamCode")}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="param-type">{t("adminCenter.paramDialog.valueType")}</Label>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              id="param-type"
              onChange={(event) => changeType(event.target.value as ParamValueType)}
              value={valueType}
            >
              {(["string", "number", "boolean", "array", "json"] as const).map(
                (type) => (
                  <option key={type} value={type}>
                    {t(`adminCenter.paramDialog.${type}Type`)}
                  </option>
                ),
              )}
            </select>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="param-value">{t("adminCenter.paramDialog.paramValue")}</Label>
              {sensitive ? (
                <Button
                  aria-label={t(
                    showSensitive
                      ? "adminCenter.paramManagement.hide"
                      : "adminCenter.paramManagement.view",
                  )}
                  onClick={() => setShowSensitive((current) => !current)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  {showSensitive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  {t(
                    showSensitive
                      ? "adminCenter.paramManagement.hide"
                      : "adminCenter.paramManagement.view",
                  )}
                </Button>
              ) : null}
            </div>
            {valueType === "boolean" ? (
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                id="param-value"
                onChange={(event) => setParamValue(event.target.value)}
                value={paramValue}
              >
                <option value="">—</option>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : multiline ? (
              <Textarea
                aria-invalid={Boolean((submitted && !paramValue.trim()) || formatError)}
                id="param-value"
                onChange={(event) => {
                  setParamValue(event.target.value);
                  setFormatError("");
                }}
                placeholder={t("adminCenter.paramDialog.paramValuePlaceholder")}
                rows={8}
                value={paramValue}
              />
            ) : (
              <Input
                aria-invalid={Boolean((submitted && !paramValue.trim()) || formatError)}
                autoComplete="off"
                id="param-value"
                inputMode={valueType === "number" ? "decimal" : undefined}
                onChange={(event) => {
                  setParamValue(event.target.value);
                  setFormatError("");
                }}
                placeholder={t("adminCenter.paramDialog.paramValuePlaceholder")}
                type={sensitive && !showSensitive ? "password" : "text"}
                value={paramValue}
              />
            )}
            {submitted && !paramValue.trim() ? (
              <p className="text-xs text-destructive">
                {t("adminCenter.paramDialog.requiredParamValue")}
              </p>
            ) : formatError ? (
              <p className="text-xs text-destructive">{formatError}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="param-remark">{t("adminCenter.paramDialog.remark")}</Label>
            <Textarea
              id="param-remark"
              onChange={(event) => setRemark(event.target.value)}
              placeholder={t("adminCenter.paramDialog.remarkPlaceholder")}
              rows={3}
              value={remark}
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={pending} onClick={() => onOpenChange(false)} type="button" variant="outline">
            {t("common.cancel")}
          </Button>
          <Button disabled={pending} onClick={() => void submit()} type="button">
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
