import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCheck,
  ContactRound,
  LoaderCircle,
  Pencil,
  Save,
  Search,
} from "lucide-react";
import { useCallback, useMemo, useState, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { PageHeading } from "@/components/page-heading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getAgents } from "@/features/agents/agent-api";
import type { AgentSummary } from "@/features/agents/types";
import {
  getAddressBook,
  getBoundDevices,
  getDeviceOnlineStatus,
  updateAddressBookAlias,
  updateAddressBookPermission,
  updateDevice,
} from "@/features/devices/device-api";
import {
  formatDeviceTime,
  isDeviceOnline,
  parseDeviceOnlineMap,
} from "@/features/devices/device-utils";
import type { BoundDevice, DeviceOnlineMap } from "@/features/devices/types";
import { cn } from "@/lib/utils";

interface AgentDevices {
  agent: AgentSummary;
  devices: readonly BoundDevice[];
  online: DeviceOnlineMap;
}

interface DeviceWithAgent extends BoundDevice {
  agent: AgentSummary;
  onlineState: boolean;
}

export function AddressBookPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedMac, setSelectedMac] = useState("");
  const [permissionDraft, setPermissionDraft] = useState<{
    macAddress: string;
    value: Set<string>;
  } | null>(null);
  const [aliasTarget, setAliasTarget] = useState<DeviceWithAgent | null>(null);
  const [alias, setAlias] = useState("");
  const [deviceAliasOpen, setDeviceAliasOpen] = useState(false);
  const [deviceAlias, setDeviceAlias] = useState("");

  const dataQuery = useQuery({
    queryFn: async (): Promise<AgentDevices[]> => {
      const agents = await getAgents();
      return Promise.all(agents.map(async (agent) => {
        if (!agent.id) return { agent, devices: [], online: {} };
        const [devices, onlineResult] = await Promise.all([
          getBoundDevices(agent.id),
          getDeviceOnlineStatus(agent.id).catch(() => ""),
        ]);
        return { agent, devices, online: parseDeviceOnlineMap(onlineResult) };
      }));
    },
    queryKey: ["address-book-device-tree"],
  });
  const allDevices = useMemo<DeviceWithAgent[]>(() =>
    (dataQuery.data || []).flatMap((group) => group.devices.map((device) => ({
      ...device,
      agent: group.agent,
      onlineState: isDeviceOnline(device, group.online),
    }))), [dataQuery.data]);
  const effectiveSelectedMac = selectedMac || allDevices[0]?.macAddress || "";
  const selectedDevice = allDevices.find((device) => device.macAddress === effectiveSelectedMac);
  const targetDevices = allDevices.filter((device) => device.macAddress && device.macAddress !== effectiveSelectedMac);

  const addressQuery = useQuery({
    enabled: Boolean(effectiveSelectedMac),
    queryFn: () => getAddressBook(effectiveSelectedMac),
    queryKey: ["address-book", effectiveSelectedMac],
  });
  const entriesByMac = useMemo(() => new Map(
    (addressQuery.data || []).map((entry) => [(entry.targetMac || "").toLowerCase(), entry]),
  ), [addressQuery.data]);

  const originalPermissions = useMemo(() => new Set((addressQuery.data || [])
      .filter((entry) => entry.hasPermission === true && entry.targetMac)
      .map((entry) => (entry.targetMac || "").toLowerCase())), [addressQuery.data]);
  const permissions = permissionDraft?.macAddress === effectiveSelectedMac
    ? permissionDraft.value
    : originalPermissions;
  const setPermissions = useCallback((action: SetStateAction<Set<string>>) => {
    setPermissionDraft((current) => {
      const previous = current?.macAddress === effectiveSelectedMac
        ? current.value
        : originalPermissions;
      return {
        macAddress: effectiveSelectedMac,
        value: typeof action === "function" ? action(previous) : action,
      };
    });
  }, [effectiveSelectedMac, originalPermissions]);

  const permissionMutation = useMutation({
    mutationFn: async () => {
      const changed = targetDevices.filter((device) => {
        const mac = device.macAddress || "";
        const normalizedMac = mac.toLowerCase();
        return permissions.has(normalizedMac) !== originalPermissions.has(normalizedMac);
      });
      if (!changed.length) return 0;
      const results = await Promise.allSettled(changed.map((device) =>
        updateAddressBookPermission({
          hasPermission: permissions.has((device.macAddress || "").toLowerCase()),
          macAddress: effectiveSelectedMac,
          targetMac: device.macAddress || "",
        }),
      ));
      const failed = results.filter((result) => result.status === "rejected");
      if (failed.length) throw new Error(t("agentCenter.addressBookManagement.partialSaveFailed"));
      return changed.length;
    },
    onSuccess: async (count) => {
      if (!count) toast.info(t("agentCenter.addressBookManagement.noChanges"));
      else toast.success(t("agentCenter.addressBookManagement.permissionSaved"));
      setPermissionDraft(null);
      await queryClient.invalidateQueries({ queryKey: ["address-book", effectiveSelectedMac] });
    },
  });
  const aliasMutation = useMutation({
    mutationFn: async () => {
      if (!aliasTarget?.macAddress) return;
      await updateAddressBookAlias({
        alias: alias.trim(),
        macAddress: effectiveSelectedMac,
        targetMac: aliasTarget.macAddress,
      });
    },
    onSuccess: async () => {
      setAliasTarget(null);
      await queryClient.invalidateQueries({ queryKey: ["address-book", effectiveSelectedMac] });
      toast.success(t("agentCenter.addressBookManagement.aliasSaved"));
    },
  });
  const deviceAliasMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDevice?.id) return;
      await updateDevice(selectedDevice.id, { alias: deviceAlias.trim() });
    },
    onSuccess: async () => {
      setDeviceAliasOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["address-book-device-tree"] });
      toast.success(t("agentCenter.addressBookManagement.aliasSaved"));
    },
  });

  const visibleGroups = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return dataQuery.data || [];
    return (dataQuery.data || []).flatMap((group) => {
      const devices = group.devices.filter((device) =>
        [device.alias, device.macAddress, device.board]
          .some((value) => value?.toLowerCase().includes(keyword)),
      );
      return group.agent.agentName?.toLowerCase().includes(keyword) || devices.length
        ? [{ ...group, devices: group.agent.agentName?.toLowerCase().includes(keyword) ? group.devices : devices }]
        : [];
    });
  }, [dataQuery.data, search]);

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        description={t("agentCenter.addressBookManagement.subTitle")}
        title={t("agentCenter.addressBookManagement.mainTitle")}
      />

      {dataQuery.isError ? (
        <Alert variant="destructive"><AlertTitle>{t("agentCenter.addressBookManagement.getAddressBookListFailed")}</AlertTitle><AlertDescription>{getErrorMessage(dataQuery.error, t("agentCenter.addressBookManagement.getAddressBookListFailed"))}</AlertDescription></Alert>
      ) : null}

      <div className="grid min-h-[650px] gap-5 xl:grid-cols-[330px_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b p-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={t("agentCenter.addressBookManagement.searchPlaceholder")} className="pl-9" onChange={(event) => setSearch(event.target.value)} placeholder={t("agentCenter.addressBookManagement.searchPlaceholder")} value={search} /></div>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-3">
            {dataQuery.isPending ? <LoaderCircle className="mx-auto mt-20 size-5 animate-spin" /> : visibleGroups.map((group) => (
              <div className="mb-4" key={group.agent.id}>
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.agent.agentName}</p>
                <div className="space-y-1">
                  {group.devices.map((device) => {
                    const online = isDeviceOnline(device, group.online);
                    return (
                      <button className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-muted", effectiveSelectedMac === device.macAddress && "bg-primary/10 text-primary")} key={device.id} onClick={() => setSelectedMac(device.macAddress || "")} type="button">
                        <span className={cn("size-2 rounded-full bg-slate-300", online && "bg-emerald-500")} />
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{device.alias || device.macAddress}</span><span className="block truncate font-mono text-[11px] text-muted-foreground">{device.macAddress}</span></span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          {!selectedDevice ? (
            <Card><CardContent className="flex h-96 flex-col items-center justify-center gap-3 text-muted-foreground"><ContactRound className="size-10 opacity-40" /><p>{t("agentCenter.addressBookManagement.selectDevice")}</p></CardContent></Card>
          ) : (
            <>
              <Card>
                <CardContent className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ContactRound className="size-6" /></div>
                    <div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate text-lg font-semibold">{selectedDevice.alias || selectedDevice.macAddress}</h2><Button aria-label={t("agentCenter.device.edit")} onClick={() => { setDeviceAlias(selectedDevice.alias || ""); setDeviceAliasOpen(true); }} size="icon" variant="ghost"><Pencil className="size-4" /></Button></div><p className="font-mono text-xs text-muted-foreground">{selectedDevice.macAddress}</p></div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm"><Badge variant={selectedDevice.onlineState ? "default" : "secondary"}>{selectedDevice.onlineState ? t("agentCenter.addressBookManagement.online") : t("agentCenter.addressBookManagement.offline")}</Badge><span className="text-muted-foreground">{selectedDevice.agent.agentName}</span><span className="text-muted-foreground">{formatDeviceTime(selectedDevice.createDateTimestamp || selectedDevice.createDate, i18n.language)}</span></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle>{t("agentCenter.addressBookManagement.deviceCallPermission")}</CardTitle><p className="mt-2 text-sm text-muted-foreground">{t("agentCenter.addressBookManagement.setPermissionDesc", { count: permissions.size })}</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => setPermissions(new Set(originalPermissions))} size="sm" variant="outline">{t("common.cancel")}</Button><Button onClick={() => setPermissions(permissions.size === targetDevices.length ? new Set() : new Set(targetDevices.flatMap((device) => device.macAddress ? [device.macAddress.toLowerCase()] : [])))} size="sm" variant="outline"><CheckCheck className="size-4" />{permissions.size === targetDevices.length ? t("agentCenter.addressBookManagement.deselectAll") : t("agentCenter.addressBookManagement.selectAll")}</Button><Button disabled={permissionMutation.isPending} onClick={async () => { try { await permissionMutation.mutateAsync(); } catch (error) { toast.error(getErrorMessage(error, t("agentCenter.addressBookManagement.partialSaveFailed"))); } }} size="sm"><Save className="size-4" />{t("agentCenter.addressBookManagement.save")}</Button></div></CardHeader>
                <CardContent>
                  {addressQuery.isPending ? <LoaderCircle className="mx-auto my-20 size-5 animate-spin" /> : (
                    <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                      {targetDevices.map((device) => {
                        const mac = device.macAddress || "";
                        const normalizedMac = mac.toLowerCase();
                        const entry = entriesByMac.get(mac.toLowerCase());
                        return (
                          <div className={cn("rounded-xl border p-4 transition", permissions.has(normalizedMac) && "border-primary/30 bg-primary/5")} key={device.id}>
                            <div className="flex items-start gap-3">
                              <Checkbox aria-label={entry?.alias || device.alias || mac} checked={permissions.has(normalizedMac)} onChange={(event) => setPermissions((current) => { const next = new Set(current); if (event.target.checked) next.add(normalizedMac); else next.delete(normalizedMac); return next; })} />
                              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{entry?.alias || device.alias || mac}</p><p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{mac}</p><p className="mt-1 text-xs text-muted-foreground">{device.agent.agentName}</p></div>
                              <Button aria-label={t("agentCenter.device.edit")} onClick={() => { setAliasTarget(device); setAlias(entry?.alias || device.alias || ""); }} size="icon" variant="ghost"><Pencil className="size-4" /></Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      <Dialog onOpenChange={(open) => !aliasMutation.isPending && !open && setAliasTarget(null)} open={Boolean(aliasTarget)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{t("agentCenter.addressBookManagement.addressBookName")}</DialogTitle><DialogDescription>{aliasTarget?.macAddress}</DialogDescription></DialogHeader><div className="space-y-2 px-6 py-4"><Label htmlFor="address-alias">{t("agentCenter.addressBookManagement.addressBookName")}</Label><Input id="address-alias" maxLength={64} onChange={(event) => setAlias(event.target.value)} value={alias} /></div><DialogFooter><Button onClick={() => setAliasTarget(null)} variant="outline">{t("common.cancel")}</Button><Button disabled={!alias.trim() || aliasMutation.isPending} onClick={async () => { try { await aliasMutation.mutateAsync(); } catch (error) { toast.error(getErrorMessage(error, t("agentCenter.addressBookManagement.saveFailed"))); } }}>{t("common.save")}</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog onOpenChange={setDeviceAliasOpen} open={deviceAliasOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{t("agentCenter.device.alias")}</DialogTitle><DialogDescription>{selectedDevice?.macAddress}</DialogDescription></DialogHeader><div className="space-y-2 px-6 py-4"><Label htmlFor="own-device-alias">{t("agentCenter.device.alias")}</Label><Input id="own-device-alias" maxLength={64} onChange={(event) => setDeviceAlias(event.target.value)} value={deviceAlias} /></div><DialogFooter><Button onClick={() => setDeviceAliasOpen(false)} variant="outline">{t("common.cancel")}</Button><Button disabled={!deviceAlias.trim() || deviceAliasMutation.isPending} onClick={async () => { try { await deviceAliasMutation.mutateAsync(); } catch (error) { toast.error(getErrorMessage(error, t("agentCenter.addressBookManagement.saveFailed"))); } }}>{t("common.save")}</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
