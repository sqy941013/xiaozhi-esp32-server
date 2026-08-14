import { LoaderCircle, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import { getErrorMessage } from "@/api/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField, PasswordInput } from "@/features/auth/auth-fields";
import { changePassword } from "@/features/auth/auth-api";

export function ChangePasswordDialog({ onClose }: { onClose(): void }) {
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!oldPassword || !newPassword) {
      setError(t("auth.validationPassword"));
      return;
    }
    if (newPassword !== confirmation) {
      setError(t("auth.validationPasswordMatch"));
      return;
    }
    setSubmitting(true);
    try {
      await changePassword({ password: oldPassword, newPassword });
      setSuccess(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError, t("auth.changePasswordFailed")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div aria-labelledby="change-password-title" aria-modal="true" className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" role="dialog">
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="text-xl font-semibold" id="change-password-title">{t("auth.changePassword")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("auth.changePasswordDescription")}</p></div>
          <Button aria-label={t("common.close")} onClick={onClose} size="icon" variant="ghost"><X className="size-4" /></Button>
        </div>
        {success ? (
          <div className="mt-6 space-y-4"><Alert variant="success">{t("auth.changePasswordSuccess")}</Alert><Button className="w-full" onClick={onClose}>{t("common.done")}</Button></div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={submit}>
            {error && <Alert variant="error">{error}</Alert>}
            <FormField htmlFor="old-password" label={t("auth.currentPassword")}><PasswordInput autoComplete="current-password" disabled={submitting} id="old-password" onChange={(event) => setOldPassword(event.target.value)} value={oldPassword} /></FormField>
            <FormField htmlFor="new-password" label={t("auth.newPassword")}><PasswordInput autoComplete="new-password" disabled={submitting} id="new-password" onChange={(event) => setNewPassword(event.target.value)} value={newPassword} /></FormField>
            <FormField htmlFor="confirm-new-password" label={t("auth.confirmPassword")}><PasswordInput autoComplete="new-password" disabled={submitting} id="confirm-new-password" onChange={(event) => setConfirmation(event.target.value)} value={confirmation} /></FormField>
            <div className="flex justify-end gap-2 pt-2"><Button onClick={onClose} type="button" variant="outline">{t("common.cancel")}</Button><Button disabled={submitting} type="submit">{submitting && <LoaderCircle className="size-4 animate-spin" />}{t("common.save")}</Button></div>
          </form>
        )}
      </div>
    </div>
  );
}
