import { KeyRound, LoaderCircle, Search, Trash2, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  changeUserStatus,
  deleteUser,
  getUsers,
  resetUserPassword,
} from "@/features/admin/admin-api";
import { PasswordDialog } from "@/features/admin/password-dialog";
import type { AdminUser } from "@/features/admin/types";

type UserAction =
  | { kind: "delete"; users: AdminUser[] }
  | { kind: "reset"; users: [AdminUser] }
  | { kind: "status"; status: 0 | 1; users: AdminUser[] };

function formatDate(value: string | undefined, locale: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function UserManagementPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [mobile, setMobile] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<UserAction | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState("");

  const usersQuery = useQuery({
    queryFn: () => getUsers({ limit: pageSize, mobile, page }),
    queryKey: ["admin-users", mobile, page, pageSize],
  });
  const users = usersQuery.data?.list || [];
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  const actionMutation = useMutation({
    mutationFn: async (current: UserAction) => {
      if (current.kind === "reset") {
        const id = current.users[0].userid;
        if (!id) throw new Error("invalidUserId");
        return { kind: current.kind, password: await resetUserPassword(id) } as const;
      }
      const ids = current.users.flatMap((user) => user.userid ? [user.userid] : []);
      if (!ids.length) throw new Error("invalidUserId");
      if (current.kind === "status") {
        await changeUserStatus(current.status, ids);
        return { count: ids.length, kind: current.kind, status: current.status } as const;
      }
      const results = await Promise.allSettled(ids.map((id) => deleteUser(id)));
      return {
        failed: results.filter((result) => result.status === "rejected").length,
        kind: current.kind,
        succeeded: results.filter((result) => result.status === "fulfilled").length,
      } as const;
    },
  });

  async function runAction() {
    if (!action) return;
    const current = action;
    try {
      const result = await actionMutation.mutateAsync(current);
      setAction(null);
      if (result.kind === "reset") {
        setGeneratedPassword(result.password);
        toast.success(t("adminCenter.user.resetPasswordSuccess"));
      } else if (result.kind === "status") {
        const actionLabel = t(result.status === 1 ? "adminCenter.user.enable" : "adminCenter.user.disable");
        toast.success(t("adminCenter.user.statusChangeSuccess", { action: actionLabel, count: result.count }));
        setSelected(new Set());
        await invalidate();
      } else {
        if (result.failed === 0) toast.success(t("adminCenter.user.deleteSuccess", { count: result.succeeded }));
        else if (result.succeeded === 0) toast.error(t("adminCenter.user.deleteFailed"));
        else toast.warning(t("adminCenter.user.partialDelete", { failCount: result.failed, successCount: result.succeeded }));
        if (users.length <= result.succeeded && page > 1) setPage((currentPage) => currentPage - 1);
        setSelected(new Set());
        await invalidate();
      }
    } catch (error) {
      toast.error(getErrorMessage(error, t("adminCenter.user.operationFailed")));
    }
  }

  const validUsers = users.filter((user): user is AdminUser & { userid: string } => Boolean(user.userid));
  const allSelected = validUsers.length > 0 && validUsers.every((user) => selected.has(user.userid));
  const selectedUsers = validUsers.filter((user) => selected.has(user.userid));
  const actionText = action?.kind === "status"
    ? t(action.status === 1 ? "adminCenter.user.enable" : "adminCenter.user.disable")
    : "";
  const confirmDescription = action?.kind === "reset"
    ? t("adminCenter.user.confirmResetPassword")
    : action?.kind === "status"
      ? t("adminCenter.user.confirmStatusChange", { action: actionText, count: action.users.length })
      : action?.kind === "delete" && action.users.length === 1
        ? t("adminCenter.user.confirmDeleteUser")
        : t("adminCenter.user.confirmDeleteSelected", { count: action?.users.length || 0 });

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading description={t("adminCenter.ui.descriptions.users")} eyebrow={t("nav.groups.admin")} title={t("nav.users")} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Checkbox aria-label={t("adminCenter.user.selectAll")} checked={allSelected} onChange={(event) => setSelected(event.target.checked ? new Set(validUsers.map((user) => user.userid)) : new Set())} />
          <span className="text-sm text-muted-foreground">{t("adminCenter.ui.selected", { count: selected.size })}</span>
          <Button disabled={!selectedUsers.length} onClick={() => setAction({ kind: "status", status: 0, users: selectedUsers })} size="sm" variant="outline"><UserX className="size-4" />{t("adminCenter.user.disable")}</Button>
          <Button disabled={!selectedUsers.length} onClick={() => setAction({ kind: "status", status: 1, users: selectedUsers })} size="sm" variant="outline"><UserCheck className="size-4" />{t("adminCenter.user.enable")}</Button>
          <Button disabled={!selectedUsers.length} onClick={() => setAction({ kind: "delete", users: selectedUsers })} size="sm" variant="outline"><Trash2 className="size-4 text-destructive" />{t("adminCenter.user.delete")}</Button>
        </div>
        <form className="flex w-full max-w-md gap-2" onSubmit={(event) => { event.preventDefault(); setPage(1); setSelected(new Set()); setMobile(search.trim()); }}>
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={t("adminCenter.user.searchPhone")} className="pl-9" onChange={(event) => setSearch(event.target.value)} placeholder={t("adminCenter.user.searchPhone")} value={search} /></div>
          <Button type="submit" variant="outline">{t("adminCenter.user.search")}</Button>
        </form>
      </div>
      {usersQuery.isError ? <Alert variant="destructive"><AlertTitle>{t("adminCenter.user.operationFailed")}</AlertTitle><AlertDescription>{getErrorMessage(usersQuery.error, t("adminCenter.user.operationFailed"))}</AlertDescription></Alert> : null}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr><th className="w-12 px-4 py-3" /><th className="px-4 py-3">{t("adminCenter.user.userid")}</th><th className="px-4 py-3">{t("adminCenter.user.mobile")}</th><th className="px-4 py-3">{t("adminCenter.user.deviceCount")}</th><th className="px-4 py-3">{t("adminCenter.user.createDate")}</th><th className="px-4 py-3">{t("adminCenter.user.status")}</th><th className="px-4 py-3 text-right">{t("adminCenter.serverSideManager.operation")}</th></tr></thead><tbody className="divide-y">
          {usersQuery.isPending ? <tr><td className="h-56 text-center" colSpan={7}><LoaderCircle className="mx-auto size-5 animate-spin" /></td></tr> : users.length ? users.map((user) => <tr className="hover:bg-muted/20" key={user.userid || user.mobile}><td className="px-4 py-3"><Checkbox aria-label={user.mobile || user.userid} checked={Boolean(user.userid && selected.has(user.userid))} disabled={!user.userid} onChange={(event) => setSelected((current) => { const next = new Set(current); if (user.userid) { if (event.target.checked) next.add(user.userid); else next.delete(user.userid); } return next; })} /></td><td className="px-4 py-3 font-mono text-xs">{user.userid || "—"}</td><td className="px-4 py-3 font-medium">{user.mobile || "—"}</td><td className="px-4 py-3">{user.deviceCount || "0"}</td><td className="px-4 py-3 text-muted-foreground">{formatDate(user.createDate, i18n.language)}</td><td className="px-4 py-3"><Badge variant={user.status === 1 ? "default" : "destructive"}>{t(user.status === 1 ? "adminCenter.user.normal" : "adminCenter.user.disabled")}</Badge></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button aria-label={t("adminCenter.user.resetPassword")} disabled={!user.userid} onClick={() => setAction({ kind: "reset", users: [user] })} size="icon" variant="ghost"><KeyRound className="size-4" /></Button><Button aria-label={t(user.status === 1 ? "adminCenter.user.disableAccount" : "adminCenter.user.enableAccount")} disabled={!user.userid} onClick={() => setAction({ kind: "status", status: user.status === 1 ? 0 : 1, users: [user] })} size="icon" variant="ghost">{user.status === 1 ? <UserX className="size-4" /> : <UserCheck className="size-4" />}</Button><Button aria-label={t("adminCenter.user.deleteUser")} disabled={!user.userid} onClick={() => setAction({ kind: "delete", users: [user] })} size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button></div></td></tr>) : <tr><td className="h-56 text-center text-muted-foreground" colSpan={7}>{t("common.noData")}</td></tr>}
        </tbody></table></div>
        <Pagination label={t("adminCenter.paramManagement.totalRecords", { total: usersQuery.data?.total || 0 })} nextLabel={t("adminCenter.paramManagement.nextPage")} onPageChange={(nextPage) => { setPage(nextPage); setSelected(new Set()); }} onPageSizeChange={(size) => { setPageSize(size); setPage(1); setSelected(new Set()); }} page={page} pageSize={pageSize} pageSizeLabel={t("common.pageSize")} previousLabel={t("adminCenter.paramManagement.prevPage")} total={usersQuery.data?.total || 0} />
      </Card>
      <ConfirmDialog cancelLabel={t("common.cancel")} confirmLabel={action?.kind === "reset" ? t("adminCenter.user.resetPassword") : action?.kind === "status" ? actionText : t("adminCenter.user.delete")} description={confirmDescription} onConfirm={runAction} onOpenChange={(open) => !open && setAction(null)} open={Boolean(action)} pending={actionMutation.isPending} title={t("adminCenter.common.warning")} variant={action?.kind === "delete" ? "destructive" : "default"} />
      <PasswordDialog onOpenChange={(open) => !open && setGeneratedPassword("")} open={Boolean(generatedPassword)} password={generatedPassword} />
    </div>
  );
}
