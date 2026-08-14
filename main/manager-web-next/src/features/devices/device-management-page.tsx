import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Link2,
  LoaderCircle,
  MessageCircle,
  Palette,
  Pencil,
  Plus,
  Search,
  Trash2,
  Unlink,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
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
import { Switch } from "@/components/ui/switch";
import { AgentSelect } from "@/features/agents/agent-select";
import {
  bindDevice,
  getBoundDevices,
  getDeviceOnlineStatus,
  getFirmwareTypes,
  manualAddDevice,
  unbindDevice,
  updateDevice,
} from "@/features/devices/device-api";
import {
  deviceGeneratorPath,
  formatDeviceTime,
  isDeviceOnline,
  MAC_ADDRESS_PATTERN,
  parseDeviceOnlineMap,
} from "@/features/devices/device-utils";
import type { BoundDevice, ManualDeviceInput } from "@/features/devices/types";

const EMPTY_MANUAL_DEVICE: ManualDeviceInput = {
  agentId: "",
  appVersion: "",
  board: "",
  macAddress: "",
};

export function DeviceManagementPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const agentId = searchParams.get("agentId") || "";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bindOpen, setBindOpen] = useState(false);
  const [bindCode, setBindCode] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState(EMPTY_MANUAL_DEVICE);
  const [editDevice, setEditDevice] = useState<BoundDevice | null>(null);
  const [editAlias, setEditAlias] = useState("");
  const [unbindTargets, setUnbindTargets] = useState<string[]>([]);

  const setAgentId = useCallback((nextAgentId: string) => {
    setSelected(new Set());
    setPage(1);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextAgentId) next.set("agentId", nextAgentId);
      else next.delete("agentId");
      return next;
    });
  }, [setSearchParams]);

  const devicesQuery = useQuery({
    enabled: Boolean(agentId),
    queryFn: () => getBoundDevices(agentId),
    queryKey: ["bound-devices", agentId],
  });
  const statusQuery = useQuery({
    enabled: Boolean(agentId),
    queryFn: () => getDeviceOnlineStatus(agentId),
    queryKey: ["device-online-status", agentId],
    refetchInterval: 30_000,
    retry: false,
  });
  const firmwareTypesQuery = useQuery({
    enabled: manualOpen,
    queryFn: getFirmwareTypes,
    queryKey: ["dict-data", "FIRMWARE_TYPE"],
    staleTime: 5 * 60_000,
  });
  const onlineMap = parseDeviceOnlineMap(statusQuery.data);
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return devicesQuery.data || [];
    return (devicesQuery.data || []).filter((device) =>
      [device.alias, device.macAddress, device.board, device.appVersion]
        .some((value) => value?.toLowerCase().includes(keyword)),
    );
  }, [devicesQuery.data, search]);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allPageSelected = paged.length > 0 && paged.every((device) => device.id && selected.has(device.id));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["bound-devices", agentId] });
  const bindMutation = useMutation({ mutationFn: (code: string) => bindDevice(agentId, code), onSuccess: invalidate });
  const manualMutation = useMutation({ mutationFn: manualAddDevice, onSuccess: invalidate });
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: { alias?: string; autoUpdate?: number } }) => updateDevice(id, input),
    onSuccess: invalidate,
  });
  const unbindMutation = useMutation({
    mutationFn: async (ids: readonly string[]) => {
      const results = await Promise.allSettled(ids.map(unbindDevice));
      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length) throw new Error(t("agentCenter.device.batchUnbindError"));
    },
    onSuccess: async () => {
      setUnbindTargets([]);
      setSelected(new Set());
      await invalidate();
      toast.success(t("agentCenter.device.batchUnbindSuccess"));
    },
  });

  async function submitBind() {
    if (!/^\d{6}$/.test(bindCode)) return;
    try {
      await bindMutation.mutateAsync(bindCode);
      setBindCode("");
      setBindOpen(false);
      toast.success(t("agentCenter.device.bindSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("agentCenter.device.bindFailed")));
    }
  }

  async function submitManual() {
    const input = {
      ...manual,
      agentId,
      appVersion: manual.appVersion.trim(),
      board: manual.board.trim(),
      macAddress: manual.macAddress.trim().replaceAll("-", ":").toUpperCase(),
    };
    if (!input.board.trim() || !input.appVersion.trim() || !MAC_ADDRESS_PATTERN.test(input.macAddress)) return;
    try {
      await manualMutation.mutateAsync(input);
      setManual(EMPTY_MANUAL_DEVICE);
      setManualOpen(false);
      toast.success(t("agentCenter.manualAddDeviceDialog.addSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("agentCenter.manualAddDeviceDialog.addFailed")));
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        actions={
          <>
            <Button disabled={!agentId} onClick={() => setBindOpen(true)} variant="outline"><Link2 className="size-4" />{t("agentCenter.device.bindWithCode")}</Button>
            <Button disabled={!agentId} onClick={() => setManualOpen(true)}><Plus className="size-4" />{t("agentCenter.device.manualAdd")}</Button>
          </>
        }
        description={t("agentCenter.addressBookManagement.subTitle")}
        title={t("agentCenter.device.management")}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full max-w-md"><AgentSelect onChange={setAgentId} value={agentId} /></div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label={t("agentCenter.device.searchPlaceholder")} className="pl-9" onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={t("agentCenter.device.searchPlaceholder")} value={search} />
        </div>
      </div>

      {devicesQuery.isError ? (
        <Alert variant="destructive"><AlertTitle>{t("agentCenter.device.getListFailed")}</AlertTitle><AlertDescription>{getErrorMessage(devicesQuery.error, t("agentCenter.device.getListFailed"))}</AlertDescription></Alert>
      ) : null}

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="flex items-center gap-3">
            <Checkbox
              aria-label={t("agentCenter.device.selectAll")}
              checked={allPageSelected}
              onChange={(event) => setSelected((current) => {
                const next = new Set(current);
                paged.forEach((device) => {
                  if (!device.id) return;
                  if (event.target.checked) next.add(device.id);
                  else next.delete(device.id);
                });
                return next;
              })}
            />
            <span className="text-sm text-muted-foreground">{selected.size}</span>
          </div>
          <Button disabled={selected.size === 0} onClick={() => setUnbindTargets([...selected])} size="sm" variant="outline"><Unlink className="size-4" />{t("agentCenter.device.unbind")}</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground">
              <tr>
                <th className="w-12 px-4 py-3" />
                <th className="px-4 py-3">{t("agentCenter.device.macAddress")}</th>
                <th className="px-4 py-3">{t("agentCenter.device.remark")}</th>
                <th className="px-4 py-3">{t("agentCenter.device.model")}</th>
                <th className="px-4 py-3">{t("agentCenter.device.firmwareVersion")}</th>
                <th className="px-4 py-3">{t("agentCenter.device.deviceStatus")}</th>
                <th className="px-4 py-3">{t("agentCenter.device.bindTime")}</th>
                <th className="px-4 py-3">{t("agentCenter.device.autoUpdate")}</th>
                <th className="px-4 py-3 text-right">{t("agentCenter.device.operation")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!agentId ? (
                <tr><td className="h-56 text-center text-muted-foreground" colSpan={9}>{t("agentCenter.addressBookManagement.selectAgentFirst")}</td></tr>
              ) : devicesQuery.isPending ? (
                <tr><td className="h-56 text-center" colSpan={9}><LoaderCircle className="mx-auto size-5 animate-spin" /></td></tr>
              ) : paged.length === 0 ? (
                <tr><td className="h-56 text-center text-muted-foreground" colSpan={9}>{t("common.noData")}</td></tr>
              ) : paged.map((device) => {
                const online = isDeviceOnline(device, onlineMap);
                return (
                  <tr className="hover:bg-muted/20" key={device.id}>
                    <td className="px-4 py-3"><Checkbox aria-label={device.macAddress || device.id} checked={Boolean(device.id && selected.has(device.id))} onChange={(event) => setSelected((current) => { const next = new Set(current); if (device.id) { if (event.target.checked) next.add(device.id); else next.delete(device.id); } return next; })} /></td>
                    <td className="px-4 py-3 font-mono text-xs">{device.macAddress || "—"}</td>
                    <td className="px-4 py-3">{device.alias || "—"}</td>
                    <td className="px-4 py-3">{device.board || device.deviceType || "—"}</td>
                    <td className="px-4 py-3">{device.appVersion || "—"}</td>
                    <td className="px-4 py-3"><Badge variant={online ? "default" : "secondary"}>{online ? t("agentCenter.device.online") : t("agentCenter.device.offline")}</Badge></td>
                    <td className="px-4 py-3">{formatDeviceTime(device.createDateTimestamp || device.createDate, i18n.language)}</td>
                    <td className="px-4 py-3"><Switch aria-label={t("agentCenter.device.autoUpdate")} checked={device.autoUpdate === 1} disabled={updateMutation.isPending} onCheckedChange={async (checked) => { if (!device.id) return; try { await updateMutation.mutateAsync({ id: device.id, input: { autoUpdate: checked ? 1 : 0 } }); toast.success(t(checked ? "agentCenter.device.autoUpdateEnabled" : "agentCenter.device.autoUpdateDisabled")); } catch (error) { toast.error(getErrorMessage(error, t("agentCenter.device.remarkSaveFailed"))); } }} /></td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-1">{device.id ? <Button asChild size="icon" variant="ghost"><Link aria-label={t("deviceChat.open")} title={t("deviceChat.open")} to={`/device-chat?deviceId=${encodeURIComponent(device.id)}&agentId=${encodeURIComponent(agentId)}`}><MessageCircle className="size-4" /></Link></Button> : null}{device.id ? <Button asChild size="icon" variant="ghost"><a aria-label={t("agentCenter.device.deviceThemeGeneration")} href={deviceGeneratorPath(device.id, import.meta.env.BASE_URL)} onClick={() => sessionStorage.setItem("devicePath", window.location.href)} title={t("agentCenter.device.deviceThemeGeneration")}><Palette className="size-4" /></a></Button> : null}<Button aria-label={t("agentCenter.device.edit")} onClick={() => { setEditDevice(device); setEditAlias(device.alias || ""); }} size="icon" variant="ghost"><Pencil className="size-4" /></Button><Button aria-label={t("agentCenter.device.unbind")} onClick={() => device.id && setUnbindTargets([device.id])} size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination
          label="{{page}} / {{pages}} · {{total}}"
          nextLabel={t("common.next")}
          onPageChange={setPage}
          onPageSizeChange={(next) => { setPageSize(next); setPage(1); }}
          page={page}
          pageSize={pageSize}
          pageSizeLabel={t("common.pageSize")}
          previousLabel={t("common.previous")}
          total={filtered.length}
        />
      </Card>

      <Dialog onOpenChange={(open) => !bindMutation.isPending && setBindOpen(open)} open={bindOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{t("agentCenter.device.bindWithCode")}</DialogTitle><DialogDescription>{t("agentCenter.device.input6DigitCode")}</DialogDescription></DialogHeader><div className="space-y-2 px-6 py-4"><Label htmlFor="bind-code">{t("agentCenter.device.verificationCode")}</Label><Input autoFocus id="bind-code" inputMode="numeric" maxLength={6} onChange={(event) => setBindCode(event.target.value.replace(/\D/g, ""))} placeholder={t("agentCenter.device.verificationCodePlaceholder")} value={bindCode} /></div><DialogFooter><Button onClick={() => setBindOpen(false)} variant="outline">{t("agentCenter.device.cancelButton")}</Button><Button disabled={!/^\d{6}$/.test(bindCode) || bindMutation.isPending} onClick={() => void submitBind()}>{bindMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Link2 className="size-4" />}{t("agentCenter.device.confirmButton")}</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog onOpenChange={(open) => !manualMutation.isPending && setManualOpen(open)} open={manualOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{t("agentCenter.manualAddDeviceDialog.title")}</DialogTitle><DialogDescription>{t("agentCenter.addressBookManagement.addDeviceTip")}</DialogDescription></DialogHeader><div className="grid gap-4 px-6 py-4 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label htmlFor="manual-mac">{t("agentCenter.manualAddDeviceDialog.macAddress")}</Label><Input id="manual-mac" onChange={(event) => setManual({ ...manual, macAddress: event.target.value })} placeholder="AA:BB:CC:DD:EE:FF" value={manual.macAddress} /></div><div className="space-y-2"><Label htmlFor="manual-board">{t("agentCenter.manualAddDeviceDialog.deviceType")}</Label><select aria-label={t("agentCenter.manualAddDeviceDialog.deviceType")} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50" disabled={firmwareTypesQuery.isPending} id="manual-board" onChange={(event) => setManual({ ...manual, board: event.target.value })} value={manual.board}><option value="">{t("agentCenter.manualAddDeviceDialog.deviceTypePlaceholder")}</option>{(firmwareTypesQuery.data || []).map((item) => item.key ? <option key={item.key} value={item.key}>{item.name || item.key}</option> : null)}</select>{firmwareTypesQuery.isError ? <p className="text-xs text-destructive">{getErrorMessage(firmwareTypesQuery.error, t("agentCenter.manualAddDeviceDialog.getFirmwareTypeFailed"))}</p> : null}</div><div className="space-y-2"><Label htmlFor="manual-version">{t("agentCenter.manualAddDeviceDialog.firmwareVersion")}</Label><Input id="manual-version" onChange={(event) => setManual({ ...manual, appVersion: event.target.value })} placeholder={t("agentCenter.manualAddDeviceDialog.firmwareVersionPlaceholder")} value={manual.appVersion} /></div></div><DialogFooter><Button onClick={() => setManualOpen(false)} variant="outline">{t("agentCenter.manualAddDeviceDialog.cancel")}</Button><Button disabled={!manual.board.trim() || !manual.appVersion.trim() || !MAC_ADDRESS_PATTERN.test(manual.macAddress.trim()) || manualMutation.isPending} onClick={() => void submitManual()}>{manualMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}{t("agentCenter.manualAddDeviceDialog.confirm")}</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog onOpenChange={(open) => !updateMutation.isPending && !open && setEditDevice(null)} open={Boolean(editDevice)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{t("agentCenter.device.edit")}</DialogTitle><DialogDescription>{editDevice?.macAddress}</DialogDescription></DialogHeader><div className="space-y-2 px-6 py-4"><Label htmlFor="edit-device-alias">{t("agentCenter.device.remark")}</Label><Input id="edit-device-alias" maxLength={64} onChange={(event) => setEditAlias(event.target.value)} value={editAlias} /></div><DialogFooter><Button onClick={() => setEditDevice(null)} variant="outline">{t("common.cancel")}</Button><Button disabled={!editDevice?.id || updateMutation.isPending} onClick={async () => { if (!editDevice?.id) return; try { await updateMutation.mutateAsync({ id: editDevice.id, input: { alias: editAlias.trim() } }); setEditDevice(null); toast.success(t("agentCenter.device.remarkSaved")); } catch (error) { toast.error(getErrorMessage(error, t("agentCenter.device.remarkSaveFailed"))); } }}>{t("common.save")}</Button></DialogFooter></DialogContent>
      </Dialog>

      <ConfirmDialog
        cancelLabel={t("common.cancel")}
        confirmLabel={t("agentCenter.device.unbind")}
        description={unbindTargets.length > 1 ? t("agentCenter.device.confirmBatchUnbind") : t("agentCenter.device.confirmUnbind")}
        onConfirm={async () => { try { await unbindMutation.mutateAsync(unbindTargets); } catch (error) { toast.error(getErrorMessage(error, t("agentCenter.device.unbindFailed"))); } }}
        onOpenChange={(open) => !open && setUnbindTargets([])}
        open={unbindTargets.length > 0}
        pending={unbindMutation.isPending}
        title={t("agentCenter.device.unbind")}
        variant="destructive"
      />
    </div>
  );
}
