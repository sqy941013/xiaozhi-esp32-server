import { ArrowLeft, LoaderCircle } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import { getErrorMessage } from "@/api/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CaptchaField,
  FormField,
  PasswordInput,
  PhoneField,
} from "@/features/auth/auth-fields";
import { AuthFrame } from "@/features/auth/auth-frame";
import {
  retrievePassword,
  sendSmsVerification,
} from "@/features/auth/auth-api";
import {
  encryptPassword,
  internationalPhone,
  validateMobile,
} from "@/features/auth/auth-utils";
import { useAuth } from "@/features/auth/use-auth";
import { useCaptcha } from "@/features/auth/use-captcha";
import { useCountdown } from "@/features/auth/use-countdown";

export function RetrievePasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { configLoading, publicConfig } = useAuth();
  const captcha = useCaptcha();
  const countdown = useCountdown();
  const [areaCode, setAreaCode] = useState("+86");
  const [mobile, setMobile] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendSms = async () => {
    setError(null);
    if (!validateMobile(mobile, areaCode)) {
      setError(t("auth.validationMobile"));
      return;
    }
    if (!captchaText || !captcha.captchaId) {
      setError(t("auth.validationCaptcha"));
      return;
    }
    setSendingSms(true);
    try {
      await sendSmsVerification({
        captcha: captchaText,
        captchaId: captcha.captchaId,
        phone: internationalPhone(areaCode, mobile),
      });
      countdown.start();
    } catch (requestError) {
      countdown.reset();
      setError(getErrorMessage(requestError, t("auth.smsFailed")));
      setCaptchaText("");
      void captcha.refresh();
    } finally {
      setSendingSms(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!validateMobile(mobile, areaCode)) {
      setError(t("auth.validationMobile"));
      return;
    }
    if (!captchaText || !captcha.captchaId) {
      setError(t("auth.validationCaptcha"));
      return;
    }
    if (!smsCode) {
      setError(t("auth.validationSms"));
      return;
    }
    if (!password) {
      setError(t("auth.validationPassword"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.validationPasswordMatch"));
      return;
    }
    if (!publicConfig?.sm2PublicKey) {
      setError(t("auth.publicConfigUnavailable"));
      return;
    }

    setSubmitting(true);
    try {
      await retrievePassword({
        captchaId: captcha.captchaId,
        code: smsCode,
        password: encryptPassword(publicConfig.sm2PublicKey, captchaText, password),
        phone: internationalPhone(areaCode, mobile),
      });
      navigate("/login?reset=1", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, t("auth.resetFailed")));
      setCaptchaText("");
      void captcha.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  if (!configLoading && publicConfig && !publicConfig.enableMobileRegister) {
    return (
      <AuthFrame description={t("auth.resetDisabledDescription")} title={t("auth.resetDisabledTitle")}>
        <Alert>{t("auth.resetDisabledDescription")}</Alert>
        <Button asChild className="mt-5 w-full" variant="outline">
          <Link to="/login"><ArrowLeft aria-hidden="true" className="size-4" />{t("auth.backToLogin")}</Link>
        </Button>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame description={t("auth.resetDescription")} title={t("auth.resetTitle")}>
      <form className="space-y-5" noValidate onSubmit={submit}>
        {error && <Alert variant="error">{error}</Alert>}
        <FormField htmlFor="reset-mobile" label={t("auth.mobile")}>
          <PhoneField areaCode={areaCode} areas={publicConfig?.mobileAreaList ?? []} disabled={submitting} id="reset-mobile" mobile={mobile} onAreaCodeChange={setAreaCode} onMobileChange={setMobile} />
        </FormField>
        <FormField htmlFor="reset-captcha" label={t("auth.captcha")}>
          <CaptchaField disabled={submitting} error={captcha.error} id="reset-captcha" loading={captcha.loading} onChange={setCaptchaText} onRefresh={() => void captcha.refresh()} url={captcha.captchaUrl} value={captchaText} />
        </FormField>
        <FormField htmlFor="reset-sms" label={t("auth.smsCode")}>
          <div className="grid grid-cols-[1fr_8.5rem] gap-2">
            <Input disabled={submitting} id="reset-sms" inputMode="numeric" onChange={(event) => setSmsCode(event.target.value)} value={smsCode} />
            <Button disabled={sendingSms || countdown.seconds > 0 || submitting} onClick={() => void sendSms()} type="button" variant="outline">
              {sendingSms ? <LoaderCircle className="size-4 animate-spin" /> : countdown.seconds > 0 ? `${countdown.seconds}s` : t("auth.sendSms")}
            </Button>
          </div>
        </FormField>
        <FormField htmlFor="reset-password" label={t("auth.newPassword")}>
          <PasswordInput autoComplete="new-password" disabled={submitting} id="reset-password" onChange={(event) => setPassword(event.target.value)} value={password} />
        </FormField>
        <FormField htmlFor="reset-confirm" label={t("auth.confirmPassword")}>
          <PasswordInput autoComplete="new-password" disabled={submitting} id="reset-confirm" onChange={(event) => setConfirmPassword(event.target.value)} value={confirmPassword} />
        </FormField>
        <Button className="h-11 w-full" disabled={submitting || configLoading || captcha.loading} type="submit">
          {submitting && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
          {submitting ? t("auth.resetting") : t("auth.resetAction")}
        </Button>
        <div className="text-center text-sm">
          <Link className="inline-flex items-center gap-1 font-medium text-primary hover:underline" to="/login">
            <ArrowLeft aria-hidden="true" className="size-4" />{t("auth.backToLogin")}
          </Link>
        </div>
      </form>
    </AuthFrame>
  );
}
