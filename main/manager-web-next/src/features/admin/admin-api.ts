import { apiClient, requestData, unwrapEnvelope } from "@/api/client";
import type {
  AdminUser,
  CorrectWordFile,
  CorrectWordInput,
  DictData,
  DictDataInput,
  DictType,
  DictTypeInput,
  FeatureMenu,
  PageData,
  Param,
  ParamInput,
  ServerActionInput,
} from "@/features/admin/types";

interface RawPage<T> {
  list?: readonly T[];
  total?: number;
}

function page<T>(value?: RawPage<T>): PageData<T> {
  return { list: [...(value?.list || [])], total: Number(value?.total) || 0 };
}

function objectValue(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function featureMenuPayload(storedValue: string | undefined, menu: FeatureMenu) {
  let stored: Record<string, unknown> = {};
  try {
    stored = objectValue(JSON.parse(storedValue || "{}") as unknown);
  } catch {
    // A malformed stored value is replaced by the validated editor state.
  }
  const storedFeatures = objectValue(stored.features);
  const features: Record<string, unknown> = { ...storedFeatures };
  for (const [id, feature] of Object.entries(menu.features)) {
    features[id] = { ...objectValue(storedFeatures[id]), ...feature };
  }
  return {
    ...stored,
    features,
    groups: { ...objectValue(stored.groups), ...menu.groups },
  };
}

export async function getUsers(params: {
  limit: number;
  mobile: string;
  page: number;
}): Promise<PageData<AdminUser>> {
  return page(
    await requestData<RawPage<AdminUser>>({
      method: "GET",
      params,
      url: "/admin/users",
    }),
  );
}

export function resetUserPassword(userId: string): Promise<string> {
  return requestData({
    method: "PUT",
    url: `/admin/users/${encodeURIComponent(userId)}`,
  });
}

export function deleteUser(userId: string): Promise<void> {
  return requestData({
    method: "DELETE",
    url: `/admin/users/${encodeURIComponent(userId)}`,
  });
}

export function changeUserStatus(
  status: 0 | 1,
  userIds: readonly string[],
): Promise<void> {
  return requestData({
    data: userIds,
    method: "PUT",
    url: `/admin/users/changeStatus/${status}`,
  });
}

export async function getParams(params: {
  limit: number;
  page: number;
  paramCode: string;
}): Promise<PageData<Param>> {
  return page(
    await requestData<RawPage<Param>>({
      method: "GET",
      params,
      url: "/admin/params/page",
    }),
  );
}

export function createParam(input: ParamInput): Promise<void> {
  const data = {
    paramCode: input.paramCode,
    paramValue: input.paramValue,
    remark: input.remark,
    valueType: input.valueType,
  };
  return requestData({ data, method: "POST", url: "/admin/params" });
}

export function updateParam(input: ParamInput): Promise<void> {
  return requestData({ data: input, method: "PUT", url: "/admin/params" });
}

export function deleteParams(ids: readonly string[]): Promise<void> {
  return requestData({
    data: ids,
    method: "POST",
    url: "/admin/params/delete",
  });
}

export async function updateFeatureMenu(menu: FeatureMenu): Promise<void> {
  const result = await getParams({
    limit: 100,
    page: 1,
    paramCode: "system-web.menu",
  });
  const parameter = result.list.find(
    (item) => item.paramCode === "system-web.menu",
  );
  if (parameter?.id === undefined) throw new Error("systemWebMenuNotFound");
  return updateParam({
    id: parameter.id,
    paramCode: "system-web.menu",
    paramValue: JSON.stringify(featureMenuPayload(parameter.paramValue, menu)),
    remark: parameter.remark || "系统功能菜单配置",
    valueType: "json",
  });
}

export async function getDictTypes(params: {
  dictName?: string;
  limit?: number;
  page?: number;
} = {}): Promise<PageData<DictType>> {
  return page(
    await requestData<RawPage<DictType>>({
      method: "GET",
      params: {
        dictName: params.dictName || "",
        dictType: "",
        limit: params.limit || 100,
        page: params.page || 1,
      },
      url: "/admin/dict/type/page",
    }),
  );
}

export function createDictType(input: DictTypeInput): Promise<void> {
  return requestData({ data: input, method: "POST", url: "/admin/dict/type/save" });
}

export function updateDictType(input: DictTypeInput): Promise<void> {
  return requestData({ data: input, method: "PUT", url: "/admin/dict/type/update" });
}

export function deleteDictTypes(ids: readonly number[]): Promise<void> {
  return requestData({ data: ids, method: "POST", url: "/admin/dict/type/delete" });
}

export async function getDictData(params: {
  dictLabel: string;
  dictTypeId: number;
  limit: number;
  page: number;
}): Promise<PageData<DictData>> {
  return page(
    await requestData<RawPage<DictData>>({
      method: "GET",
      params: { ...params, dictValue: "" },
      url: "/admin/dict/data/page",
    }),
  );
}

export function createDictData(input: DictDataInput): Promise<void> {
  return requestData({ data: input, method: "POST", url: "/admin/dict/data/save" });
}

export function updateDictData(input: DictDataInput): Promise<void> {
  return requestData({ data: input, method: "PUT", url: "/admin/dict/data/update" });
}

export function deleteDictData(ids: readonly number[]): Promise<void> {
  return requestData({ data: ids, method: "POST", url: "/admin/dict/data/delete" });
}

export async function getReplacementFiles(params: {
  limit: number;
  page: number;
}): Promise<PageData<CorrectWordFile>> {
  return page(
    await requestData<RawPage<CorrectWordFile>>({
      method: "GET",
      params,
      url: "/correct-word/file/list",
    }),
  );
}

export function createReplacementFile(input: CorrectWordInput): Promise<CorrectWordFile> {
  return requestData({ data: input, method: "POST", url: "/correct-word/file" });
}

export function updateReplacementFile(
  fileId: string,
  input: CorrectWordInput,
): Promise<void> {
  return requestData({
    data: input,
    method: "PUT",
    url: `/correct-word/file/${encodeURIComponent(fileId)}`,
  });
}

export function deleteReplacementFile(fileId: string): Promise<void> {
  return requestData({
    method: "DELETE",
    url: `/correct-word/file/${encodeURIComponent(fileId)}`,
  });
}

export function deleteReplacementFiles(fileIds: readonly string[]): Promise<void> {
  return requestData({
    data: fileIds,
    method: "POST",
    url: "/correct-word/file/batch-delete",
  });
}

export async function downloadReplacementFile(fileId: string): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `/correct-word/file/download/${encodeURIComponent(fileId)}`,
    { responseType: "blob" },
  );
  if (response.data.type.includes("json")) {
    const envelope = JSON.parse(await response.data.text()) as {
      code?: number | string;
      data?: unknown;
      msg?: string;
    };
    unwrapEnvelope(envelope, response.status);
  }
  return response.data;
}

export function getServers(): Promise<readonly string[]> {
  return requestData({ method: "GET", url: "/admin/server/server-list" });
}

export function emitServerAction(input: ServerActionInput): Promise<boolean> {
  return requestData({
    data: input,
    method: "POST",
    timeout: 130_000,
    url: "/admin/server/emit-action",
  });
}
