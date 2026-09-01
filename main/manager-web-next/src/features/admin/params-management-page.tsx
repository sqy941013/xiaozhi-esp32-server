import {
  ChevronRight,
  Eye,
  EyeOff,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeading } from "@/components/page-heading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  createParam,
  deleteParams,
  getAllParams,
  updateParam,
} from "@/features/admin/admin-api";
import {
  buildParamSections,
  filterParams,
  getParamSubGroup,
  getParamTopGroup,
  isSensitiveParamCode,
  maskSensitiveValue,
  normalizeParamValueType,
  orderParamSubgroups,
  PARAM_TOP_GROUP_ORDER,
  type ParamSection,
  type ParamTopGroup,
} from "@/features/admin/admin-utils";
import { ParamDialog } from "@/features/admin/param-dialog";
import type { Param, ParamInput } from "@/features/admin/types";

type ParamCategory = ParamTopGroup | "all";

const NAMED_SUBGROUPS = new Set([
  "auth",
  "connection",
  "metrics",
  "registry",
  "resilience",
  "tracing",
]);

export function ParamsManagementPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ParamCategory>("all");
  const [activeSubcategory, setActiveSubcategory] = useState("all");
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Param | null | undefined>();
  const [deleteTargets, setDeleteTargets] = useState<Param[]>([]);

  const paramsQuery = useQuery({
    queryFn: () => getAllParams(),
    queryKey: ["admin-params", "all"],
  });
  const parameters = useMemo(() => paramsQuery.data?.list || [], [paramsQuery.data]);
  const searchMatches = useMemo(
    () => filterParams(parameters, { search: appliedSearch }),
    [appliedSearch, parameters],
  );
  const categoryCounts = useMemo(() => {
    const counts = new Map<ParamTopGroup, number>();
    for (const parameter of searchMatches) {
      const group = getParamTopGroup(parameter.paramCode || "");
      counts.set(group, (counts.get(group) || 0) + 1);
    }
    return counts;
  }, [searchMatches]);
  const categoryTabs: ParamCategory[] = [
    "all",
    ...PARAM_TOP_GROUP_ORDER.filter((group) => (categoryCounts.get(group) || 0) > 0),
  ];
  const effectiveCategory = activeCategory !== "all" &&
      !categoryTabs.includes(activeCategory)
    ? "all"
    : activeCategory;
  const categoryMatches = useMemo(
    () => filterParams(parameters, { category: effectiveCategory, search: appliedSearch }),
    [appliedSearch, effectiveCategory, parameters],
  );
  const subcategories = useMemo(() => {
    if (effectiveCategory === "all") return [];
    return orderParamSubgroups(
      categoryMatches.map((parameter) => getParamSubGroup(parameter.paramCode || "")),
      effectiveCategory,
    );
  }, [categoryMatches, effectiveCategory]);
  const effectiveSubcategory = activeSubcategory !== "all" &&
      !subcategories.includes(activeSubcategory)
    ? "all"
    : activeSubcategory;
  const visibleParameters = useMemo(
    () => filterParams(parameters, {
      category: effectiveCategory,
      search: appliedSearch,
      subcategory: effectiveSubcategory,
    }),
    [appliedSearch, effectiveCategory, effectiveSubcategory, parameters],
  );
  const sections = useMemo(
    () => buildParamSections(visibleParameters),
    [visibleParameters],
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-params"] });
  const saveMutation = useMutation({
    mutationFn: (input: ParamInput) => input.id !== undefined
      ? updateParam(input)
      : createParam(input),
  });
  const deleteMutation = useMutation({ mutationFn: deleteParams });

  async function save(input: ParamInput) {
    const updating = input.id !== undefined;
    try {
      await saveMutation.mutateAsync(input);
      setEditing(undefined);
      setSelected(new Set());
      await invalidate();
      toast.success(t(updating
        ? "adminCenter.paramManagement.updateSuccess"
        : "adminCenter.paramManagement.addSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t(updating
        ? "adminCenter.paramManagement.updateFailed"
        : "adminCenter.paramManagement.addFailed")));
    }
  }

  async function remove() {
    const ids = deleteTargets.flatMap((parameter) =>
      parameter.id !== undefined ? [String(parameter.id)] : []);
    if (!ids.length) return;
    try {
      await deleteMutation.mutateAsync(ids);
      setDeleteTargets([]);
      setSelected(new Set());
      await invalidate();
      toast.success(t("adminCenter.paramManagement.batchDeleteSuccess", {
        paramCount: ids.length,
      }));
    } catch (error) {
      toast.error(getErrorMessage(
        error,
        t("adminCenter.paramManagement.deleteFailed"),
      ));
    }
  }

  function resetSelection() {
    setSelected(new Set());
  }

  function categoryLabel(category: ParamCategory): string {
    const key = category === "session_state" ? "session" : category;
    return t(`adminCenter.ui.paramGroups.${key}`);
  }

  function subgroupLabel(topGroup: ParamTopGroup, subgroup: string): string {
    if (subgroup === "_all") return categoryLabel(topGroup);
    if (subgroup === "_root") return t("adminCenter.ui.paramGroups.root");
    if (topGroup === "plugins") {
      return t("adminCenter.ui.paramGroups.plugin", { name: subgroup });
    }
    return NAMED_SUBGROUPS.has(subgroup)
      ? t(`adminCenter.ui.paramGroups.${subgroup}`)
      : subgroup.replaceAll("_", " ");
  }

  function sectionLabel(section: ParamSection): string {
    const top = categoryLabel(section.topGroup);
    if (section.subGroup === "_all") return top;
    return `${top} · ${subgroupLabel(section.topGroup, section.subGroup)}`;
  }

  function toggleParameter(parameter: Param, checked: boolean) {
    if (parameter.id === undefined) return;
    setSelected((current) => {
      const next = new Set(current);
      const key = String(parameter.id);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function parameterRow(parameter: Param) {
    const id = parameter.id === undefined
      ? parameter.paramCode || ""
      : String(parameter.id);
    const sensitive = isSensitiveParamCode(parameter.paramCode || "");
    const visible = revealed.has(id);
    return (
      <tr className="hover:bg-muted/20" key={id}>
        <td className="px-4 py-3">
          <Checkbox
            aria-label={parameter.paramCode}
            checked={Boolean(parameter.id !== undefined && selected.has(String(parameter.id)))}
            disabled={parameter.id === undefined}
            onChange={(event) => toggleParameter(parameter, event.target.checked)}
          />
        </td>
        <td className="px-4 py-3 font-mono text-xs font-medium">
          {parameter.paramCode || "—"}
        </td>
        <td className="max-w-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <code
              className="max-w-md truncate rounded bg-muted px-2 py-1 text-xs"
              title={visible || !sensitive ? parameter.paramValue : undefined}
            >
              {sensitive && !visible
                ? maskSensitiveValue(parameter.paramValue || "")
                : parameter.paramValue || "—"}
            </code>
            {sensitive ? (
              <Button
                aria-label={t(visible
                  ? "adminCenter.paramManagement.hide"
                  : "adminCenter.paramManagement.view")}
                onClick={() => setRevealed((current) => {
                  const next = new Set(current);
                  if (visible) next.delete(id);
                  else next.add(id);
                  return next;
                })}
                size="icon"
                variant="ghost"
              >
                {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            ) : null}
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge variant="secondary">
            {normalizeParamValueType(parameter.valueType)}
          </Badge>
        </td>
        <td
          className="max-w-xs truncate px-4 py-3 text-muted-foreground"
          title={parameter.remark}
        >
          {parameter.remark || "—"}
        </td>
        <td className="px-4 py-3">
          <div className="flex justify-end gap-1">
            <Button
              aria-label={t("adminCenter.paramManagement.edit")}
              onClick={() => setEditing(parameter)}
              size="icon"
              variant="ghost"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              aria-label={t("adminCenter.paramManagement.delete")}
              disabled={parameter.id === undefined}
              onClick={() => setDeleteTargets([parameter])}
              size="icon"
              variant="ghost"
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  const identifiable = visibleParameters.filter(
    (parameter): parameter is Param & { id: number } => parameter.id !== undefined,
  );
  const allSelected = identifiable.length > 0 &&
    identifiable.every((parameter) => selected.has(String(parameter.id)));
  const selectedParameters = parameters.filter(
    (parameter) => parameter.id !== undefined && selected.has(String(parameter.id)),
  );

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        actions={(
          <div className="flex gap-2">
            <Button
              disabled={paramsQuery.isFetching}
              onClick={() => void paramsQuery.refetch()}
              variant="outline"
            >
              <RefreshCw className={`size-4 ${paramsQuery.isFetching ? "animate-spin" : ""}`} />
              {t("adminCenter.ui.refresh")}
            </Button>
            <Button onClick={() => setEditing(null)}>
              <Plus className="size-4" />
              {t("adminCenter.paramManagement.add")}
            </Button>
          </div>
        )}
        description={t("adminCenter.ui.descriptions.parameters")}
        eyebrow={t("nav.groups.admin")}
        title={t("adminCenter.paramManagement.pageTitle")}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            aria-label={t("adminCenter.paramManagement.selectAll")}
            checked={allSelected}
            onChange={(event) => setSelected(event.target.checked
              ? new Set(identifiable.map((parameter) => String(parameter.id)))
              : new Set())}
          />
          <span className="text-sm text-muted-foreground">
            {t("adminCenter.ui.selected", { count: selectedParameters.length })}
          </span>
          <Button
            disabled={!selectedParameters.length}
            onClick={() => setDeleteTargets(selectedParameters)}
            size="sm"
            variant="outline"
          >
            <Trash2 className="size-4 text-destructive" />
            {t("adminCenter.paramManagement.delete")}
          </Button>
        </div>
        <form
          className="flex w-full max-w-md gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedSearch(search.trim());
            setActiveCategory("all");
            setActiveSubcategory("all");
            resetSelection();
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label={t("adminCenter.paramManagement.searchPlaceholder")}
              className="pl-9"
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("adminCenter.paramManagement.searchPlaceholder")}
              value={search}
            />
          </div>
          <Button type="submit" variant="outline">
            {t("adminCenter.paramManagement.search")}
          </Button>
        </form>
      </div>

      {paramsQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>{t("adminCenter.paramManagement.getParamsListFailed")}</AlertTitle>
          <AlertDescription>
            {getErrorMessage(
              paramsQuery.error,
              t("adminCenter.paramManagement.getParamsListFailed"),
            )}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="space-y-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="tablist">
            {categoryTabs.map((category) => (
              <Button
                aria-pressed={effectiveCategory === category}
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setActiveSubcategory("all");
                  resetSelection();
                }}
                size="sm"
                variant={effectiveCategory === category ? "default" : "outline"}
              >
                {categoryLabel(category)}
                <Badge className="ml-1" variant="secondary">
                  {category === "all"
                    ? searchMatches.length
                    : categoryCounts.get(category) || 0}
                </Badge>
              </Button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {t("adminCenter.ui.paramGroups.hint")}
          </span>
        </div>

        {effectiveCategory !== "all" && subcategories.length ? (
          <div className="flex flex-wrap gap-2 border-t pt-4" role="tablist">
            {["all", ...subcategories].map((subcategory) => {
              const count = subcategory === "all"
                ? categoryMatches.length
                : categoryMatches.filter((parameter) =>
                  getParamSubGroup(parameter.paramCode || "") === subcategory).length;
              return (
                <Button
                  aria-pressed={effectiveSubcategory === subcategory}
                  key={subcategory}
                  onClick={() => {
                    setActiveSubcategory(subcategory);
                    resetSelection();
                  }}
                  size="sm"
                  variant={effectiveSubcategory === subcategory ? "secondary" : "ghost"}
                >
                  {subcategory === "all"
                    ? t("adminCenter.ui.paramGroups.all")
                    : subgroupLabel(effectiveCategory, subcategory)}
                  <span className="text-xs text-muted-foreground">{count}</span>
                </Button>
              );
            })}
          </div>
        ) : null}
      </Card>

      <Card className="overflow-hidden">
        {paramsQuery.isPending ? (
          <div className="flex h-56 items-center justify-center">
            <LoaderCircle className="size-5 animate-spin" />
          </div>
        ) : sections.length ? (
          <div className="divide-y">
            {sections.map((section, index) => (
              <details
                className="group"
                key={`${section.key}:${appliedSearch}:${effectiveCategory}:${effectiveSubcategory}`}
                onToggle={(event) => {
                  const open = event.currentTarget.open;
                  setSectionOpen((current) => current[section.key] === open
                    ? current
                    : { ...current, [section.key]: open });
                }}
                open={sectionOpen[section.key] ?? (sections.length <= 5 || index < 3)}
              >
                <summary className="flex cursor-pointer list-none items-center gap-2 bg-muted/20 px-4 py-3 font-medium hover:bg-muted/40 [&::-webkit-details-marker]:hidden">
                  <ChevronRight className="size-4 transition-transform group-open:rotate-90" />
                  <span>{sectionLabel(section)}</span>
                  <Badge variant="secondary">{section.items.length}</Badge>
                </summary>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[920px] text-left text-sm">
                    <thead className="border-y bg-muted/10 text-xs text-muted-foreground">
                      <tr>
                        <th className="w-12 px-4 py-3" />
                        <th className="px-4 py-3">{t("adminCenter.paramManagement.paramCode")}</th>
                        <th className="px-4 py-3">{t("adminCenter.paramManagement.paramValue")}</th>
                        <th className="px-4 py-3">{t("adminCenter.paramDialog.valueType")}</th>
                        <th className="px-4 py-3">{t("adminCenter.paramManagement.remark")}</th>
                        <th className="px-4 py-3 text-right">{t("adminCenter.paramManagement.operation")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {section.items.map(parameterRow)}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            {t("adminCenter.ui.paramGroups.empty")}
          </div>
        )}
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          {t("adminCenter.paramManagement.totalRecords", {
            total: visibleParameters.length,
          })}
        </div>
      </Card>

      <ParamDialog
        onOpenChange={(open) => !open && setEditing(undefined)}
        onSubmit={save}
        open={editing !== undefined}
        parameter={editing || null}
        pending={saveMutation.isPending}
      />
      <ConfirmDialog
        cancelLabel={t("common.cancel")}
        confirmLabel={t("adminCenter.paramManagement.delete")}
        description={t("adminCenter.paramManagement.confirmBatchDelete", {
          paramCount: deleteTargets.length,
        })}
        onConfirm={remove}
        onOpenChange={(open) => !open && setDeleteTargets([])}
        open={deleteTargets.length > 0}
        pending={deleteMutation.isPending}
        title={t("adminCenter.common.warning")}
        variant="destructive"
      />
    </div>
  );
}
