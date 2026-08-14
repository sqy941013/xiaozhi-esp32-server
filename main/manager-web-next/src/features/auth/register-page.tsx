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
  TermsNotice,
} from "@/features/auth/auth-fields";
import { AuthFrame } from "@/features/auth/auth-frame";
import {
  register as registerUser,
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

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { configLoading, publicConfig } = useAuth();
  const captcha = useCaptcha();
  const countdown = useCountdown();
  const [username, setUsername] = useState("");
  const [areaCode, setAreaCode] = useState("+86");
  const [mobile, setMobile] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mobileRegistration = publicConfig?.enableMobileRegister === true;

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
    const loginName = mobileRegistration
      ? internationalPhone(areaCode, mobile)
      : username.trim();

    if (mobileRegistration && !validateMobile(mobile, areaCode)) {
      setError(t("auth.validationMobile"));
      return;
    }
    if (!loginName) {
      setError(t("auth.validationUsername"));
      return;
    }
    if (mobileRegistration && !smsCode) {
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
    if (!captchaText || !captcha.captchaId) {
      setError(t("auth.validationCaptcha"));
      return;
    }
    if (!publicConfig?.sm2PublicKey) {
      setError(t("auth.publicConfigUnavailable"));
      return;
    }

    setSubmitting(true);
    try {
      await registerUser({
        captchaId: captcha.captchaId,
        mobileCaptcha: mobileRegistration ? smsCode : undefined,
        password: encryptPassword(publicConfig.sm2PublicKey, captchaText, password),
        username: loginName,
      });
      navigate("/login?registered=1", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, t("auth.registerFailed")));
      setCaptchaText("");
      void captcha.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  if (!configLoading && publicConfig && !publicConfig.allowUserRegister) {
    return (
      <AuthFrame description={t("auth.registerDisabledDescription")} title={t("auth.registerDisabledTitle")}>
        <Alert>{t("auth.registerDisabledDescription")}</Alert>
        <Button asChild className="mt-5 w-full" variant="outline">
          <Link to="/login"><ArrowLeft aria-hidden="true" className="size-4" />{t("auth.backToLogin")}</Link>
        </Button>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame description={t("auth.registerDescription")} title={t("auth.registerTitle")}>
      <form className="space-y-5" noValidate onSubmit={submit}>
        {error && <Alert variant="error">{error}</Alert>}
        {mobileRegistration ? (
          <FormField htmlFor="register-mobile" label={t("auth.mobile")}>
            <PhoneField
              areaCode={areaCode}
              areas={publicConfig?.mobileAreaList ?? []}
              disabled={submitting}
              id="register-mobile"
              mobile={mobile}
              onAreaCodeChange={setAreaCode}
              onMobileChange={setMobile}
            />
          </FormField>
        ) : (
          <FormField htmlFor="register-username" label={t("auth.username")}>
            <Input autoComplete="username" disabled={submitting} id="register-username" onChange={(event) => setUsername(event.target.value)} value={username} />
          </FormField>
        )}
        <FormField htmlFor="register-captcha" label={t("auth.captcha")}>
          <CaptchaField disabled={submitting} error={captcha.error} id="register-captcha" loading={captcha.loading} onChange={setCaptchaText} onRefresh={() => void captcha.refresh()} url={captcha.captchaUrl} value={captchaText} />
        </FormField>
        {mobileRegistration && (
          <FormField htmlFor="register-sms" label={t("auth.smsCode")}>
            <div className="grid grid-cols-[1fr_8.5rem] gap-2">
              <Input disabled={submitting} id="register-sms" inputMode="numeric" onChange={(event) => setSmsCode(event.target.value)} value={smsCode} />
              <Button disabled={sendingSms || countdown.seconds > 0 || submitting} onClick={() => void sendSms()} type="button" variant="outline">
                {sendingSms ? <LoaderCircle className="size-4 animate-spin" /> : countdown.seconds > 0 ? `${countdown.seconds}s` : t("auth.sendSms")}
              </Button>
            </div>
          </FormField>
        )}
        <FormField htmlFor="register-password" label={t("auth.password")}>
          <PasswordInput autoComplete="new-password" disabled={submitting} id="register-password" onChange={(event) => setPassword(event.target.value)} value={password} />
        </FormField>
        <FormField htmlFor="register-confirm" label={t("auth.confirmPassword")}>
          <PasswordInput autoComplete="new-password" disabled={submitting} id="register-confirm" onChange={(event) => setConfirmPassword(event.target.value)} value={confirmPassword} />
        </FormField>
        <Button className="h-11 w-full" disabled={submitting || configLoading || captcha.loading} type="submit">
          {submitting && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
          {submitting ? t("auth.registering") : t("auth.registerAction")}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          {t("auth.haveAccount")} {" "}<Link className="font-medium text-primary hover:underline" to="/login">{t("auth.signIn")}</Link>
        </div>
        <TermsNotice />
      </form>
    </AuthFrame>
  );
}
