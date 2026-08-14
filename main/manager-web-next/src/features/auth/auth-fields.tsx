import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MobileArea } from "@/features/auth/types";
import { cn } from "@/lib/utils";

export function FormField({
  children,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function PasswordInput(
  props: Omit<React.ComponentProps<typeof Input>, "type">,
) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} className={cn("pr-11", props.className)} type={visible ? "text" : "password"} />
      <button
        aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
        onClick={() => setVisible((value) => !value)}
        type="button"
      >
        {visible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
      </button>
    </div>
  );
}

export function PhoneField({
  areaCode,
  areas,
  disabled,
  id,
  mobile,
  onAreaCodeChange,
  onMobileChange,
}: {
  areaCode: string;
  areas: MobileArea[];
  disabled?: boolean;
  id: string;
  mobile: string;
  onAreaCodeChange(value: string): void;
  onMobileChange(value: string): void;
}) {
  const { t } = useTranslation();
  const availableAreas = areas.length ? areas : [{ key: "+86", name: "中国大陆" }];
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-2">
      <select
        aria-label={t("auth.areaCode")}
        className="h-11 min-w-0 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        disabled={disabled}
        onChange={(event) => onAreaCodeChange(event.target.value)}
        value={areaCode}
      >
        {availableAreas.map((area) => (
          <option key={area.key} value={area.key}>
            {area.key} {area.name}
          </option>
        ))}
      </select>
      <Input
        autoComplete="tel-national"
        disabled={disabled}
        id={id}
        inputMode="tel"
        onChange={(event) => onMobileChange(event.target.value)}
        placeholder={t("auth.mobilePlaceholder")}
        value={mobile}
      />
    </div>
  );
}

export function CaptchaField({
  disabled,
  error,
  id,
  loading,
  onChange,
  onRefresh,
  url,
  value,
}: {
  disabled?: boolean;
  error: boolean;
  id: string;
  loading: boolean;
  onChange(value: string): void;
  onRefresh(): void;
  url: string;
  value: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-[1fr_8.5rem] gap-2">
      <Input
        autoComplete="off"
        disabled={disabled}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("auth.captchaPlaceholder")}
        value={value}
      />
      <Button
        aria-label={t("auth.refreshCaptcha")}
        className="h-11 overflow-hidden px-1"
        disabled={disabled || loading}
        onClick={onRefresh}
        type="button"
        variant="outline"
      >
        {url && !error ? (
          <img alt={t("auth.captchaImage")} className="h-9 w-full rounded object-cover" src={url} />
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <RefreshCw aria-hidden="true" className={cn("size-3.5", loading && "animate-spin")} />
            {error ? t("common.retry") : t("common.loading")}
          </span>
        )}
      </Button>
    </div>
  );
}

export function TermsNotice() {
  const { i18n, t } = useTranslation();
  const suffix = i18n.resolvedLanguage?.startsWith("zh") ? "" : "-en";
  return (
    <p className="text-xs leading-5 text-muted-foreground">
      {t("auth.agreementPrefix")}{" "}
      <a className="text-primary hover:underline" href={`/user-agreement${suffix}.html`} rel="noreferrer" target="_blank">
        {t("auth.userAgreement")}
      </a>{" "}
      {t("auth.and")} {" "}
      <a className="text-primary hover:underline" href={`/privacy-policy${suffix}.html`} rel="noreferrer" target="_blank">
        {t("auth.privacyPolicy")}
      </a>
    </p>
  );
}
