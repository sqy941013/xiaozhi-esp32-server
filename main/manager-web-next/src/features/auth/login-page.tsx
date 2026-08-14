import { ArrowRight, LoaderCircle, Smartphone, UserRound } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router";

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
import { login as requestLogin } from "@/features/auth/auth-api";
import {
  encryptPassword,
  internationalPhone,
  safeRedirect,
  validateMobile,
} from "@/features/auth/auth-utils";
import { useAuth } from "@/features/auth/use-auth";
import { useCaptcha } from "@/features/auth/use-captcha";
import { cn } from "@/lib/utils";

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    authenticate,
    configError,
    configLoading,
    publicConfig,
    refreshPublicConfig,
  } = useAuth();
  const captcha = useCaptcha();
  const [loginMode, setLoginMode] = useState<"auto" | "mobile" | "username">(
    "auto",
  );
  const [username, setUsername] = useState("");
  const [areaCode, setAreaCode] = useState("+86");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mobileMode = publicConfig?.enableMobileRegister
    ? loginMode === "auto" || loginMode === "mobile"
    : false;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const loginName = mobileMode
      ? internationalPhone(areaCode, mobile)
      : username.trim();

    if (mobileMode && !validateMobile(mobile, areaCode)) {
      setError(t("auth.validationMobile"));
      return;
    }
    if (!loginName) {
      setError(t("auth.validationUsername"));
      return;
    }
    if (!password) {
      setError(t("auth.validationPassword"));
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
      const token = await requestLogin({
        captchaId: captcha.captchaId,
        password: encryptPassword(
          publicConfig.sm2PublicKey,
          captchaText,
          password,
        ),
        username: loginName,
      });
      await authenticate(token);
      navigate(safeRedirect(searchParams.get("redirect")), { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, t("auth.loginFailed")));
      setCaptchaText("");
      void captcha.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const notice = searchParams.has("registered")
    ? t("auth.registerSuccess")
    : searchParams.has("reset")
      ? t("auth.resetSuccess")
      : null;

  return (
    <AuthFrame description={t("auth.loginDescription")} title={t("auth.loginTitle")}>
      <form className="space-y-5" noValidate onSubmit={submit}>
        {notice && <Alert variant="success">{notice}</Alert>}
        {configError && !publicConfig && (
          <Alert variant="error">
            <div className="flex flex-wrap items-center gap-2">
              <span>{t("auth.publicConfigUnavailable")}</span>
              <button className="font-medium underline" onClick={() => void refreshPublicConfig()} type="button">
                {t("common.retry")}
              </button>
            </div>
          </Alert>
        )}
        {error && <Alert variant="error">{error}</Alert>}

        {publicConfig?.enableMobileRegister && (
          <div className="grid grid-cols-2 rounded-xl bg-muted p-1" role="tablist">
            <button
              aria-selected={mobileMode}
              className={cn(
                "flex h-9 items-center justify-center gap-2 rounded-lg text-sm font-medium transition",
                mobileMode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
              onClick={() => setLoginMode("mobile")}
              role="tab"
              type="button"
            >
              <Smartphone aria-hidden="true" className="size-4" />
              {t("auth.mobileLogin")}
            </button>
            <button
              aria-selected={!mobileMode}
              className={cn(
                "flex h-9 items-center justify-center gap-2 rounded-lg text-sm font-medium transition",
                !mobileMode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
              onClick={() => setLoginMode("username")}
              role="tab"
              type="button"
            >
              <UserRound aria-hidden="true" className="size-4" />
              {t("auth.usernameLogin")}
            </button>
          </div>
        )}

        {mobileMode ? (
          <FormField htmlFor="login-mobile" label={t("auth.mobile")}>
            <PhoneField
              areaCode={areaCode}
              areas={publicConfig?.mobileAreaList ?? []}
              disabled={submitting}
              id="login-mobile"
              mobile={mobile}
              onAreaCodeChange={setAreaCode}
              onMobileChange={setMobile}
            />
          </FormField>
        ) : (
          <FormField htmlFor="login-username" label={t("auth.username")}>
            <Input
              autoComplete="username"
              disabled={submitting}
              id="login-username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder={t("auth.usernamePlaceholder")}
              value={username}
            />
          </FormField>
        )}

        <FormField htmlFor="login-password" label={t("auth.password")}>
          <PasswordInput
            autoComplete="current-password"
            disabled={submitting}
            id="login-password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("auth.passwordPlaceholder")}
            value={password}
          />
        </FormField>

        <FormField htmlFor="login-captcha" label={t("auth.captcha")}>
          <CaptchaField
            disabled={submitting}
            error={captcha.error}
            id="login-captcha"
            loading={captcha.loading}
            onChange={setCaptchaText}
            onRefresh={() => void captcha.refresh()}
            url={captcha.captchaUrl}
            value={captchaText}
          />
        </FormField>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {publicConfig?.allowUserRegister && (
              <>
                {t("auth.noAccount")} {" "}
                <Link className="font-medium text-primary hover:underline" to="/register">
                  {t("auth.registerAction")}
                </Link>
              </>
            )}
          </span>
          {publicConfig?.enableMobileRegister && (
            <Link className="font-medium text-primary hover:underline" to="/retrieve-password">
              {t("auth.forgotPassword")}
            </Link>
          )}
        </div>

        <Button
          className="h-11 w-full"
          disabled={submitting || (configLoading && !publicConfig) || captcha.loading}
          type="submit"
        >
          {submitting ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <ArrowRight aria-hidden="true" className="size-4" />}
          {submitting ? t("auth.signingIn") : t("auth.signIn")}
        </Button>
        <TermsNotice />
      </form>
    </AuthFrame>
  );
}
