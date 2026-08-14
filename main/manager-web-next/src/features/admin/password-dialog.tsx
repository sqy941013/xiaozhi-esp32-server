import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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

interface PasswordDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  password: string;
}

export function PasswordDialog({ onOpenChange, open, password }: PasswordDialogProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success(t("adminCenter.ui.copySuccess"));
    } catch {
      toast.error(t("adminCenter.ui.copyFailed"));
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("adminCenter.ui.newPasswordTitle")}</DialogTitle>
          <DialogDescription>{t("adminCenter.user.resetPasswordSuccess")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 px-6 py-2">
          <Label htmlFor="generated-password">{t("adminCenter.user.generatedPassword")}</Label>
          <Input id="generated-password" readOnly value={password} />
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
            {t("common.close")}
          </Button>
          <Button onClick={() => void copy()} type="button">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {t("adminCenter.ui.copyPassword")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
