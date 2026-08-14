import { requestData } from "@/api/client";
import {
  normalizeConfigJson,
  normalizeModelConfig,
  parseProviderFields,
} from "@/features/models/model-utils";
import type {
  ModelConfig,
  ModelMutationInput,
  ModelPage,
  ModelProvider,
  ModelType,
  ProviderModelType,
  ProviderMutationInput,
  ProviderPage,
  Timbre,
  TimbreMutationInput,
  TimbrePage,
} from "@/features/models/types";

interface RawPage<T> {
  list?: readonly T[];
  total?: number;
}

interface RawProvider extends Omit<ModelProvider, "fields"> {
  fields: string | unknown;
}

function normalizeProvider(provider: RawProvider): ModelProvider {
  return {
    ...provider,
    fields: parseProviderFields(provider.fields),
  };
}

function normalizeTimbre(timbre: Partial<Timbre>): Timbre {
  return {
    ...timbre,
    id: timbre.id || "",
    languages: timbre.languages || "",
    name: timbre.name || "",
    sort: Number(timbre.sort) || 0,
    ttsModelId: timbre.ttsModelId || "",
    ttsVoice: timbre.ttsVoice || "",
  };
}

export async function getModelPage(params: {
  limit: number;
  modelName: string;
  modelType: ModelType;
  page: number;
}): Promise<ModelPage> {
  const data = await requestData<RawPage<Partial<ModelConfig>>>(
    {
      method: "GET",
      params,
      url: "/models/list",
    },
  );
  return {
    list: (data?.list || []).map((item) => normalizeModelConfig(item)),
    total: Number(data?.total) || 0,
  };
}

export async function getModel(id: string): Promise<ModelConfig> {
  const model = await requestData<Partial<ModelConfig>>({
    method: "GET",
    url: `/models/${encodeURIComponent(id)}`,
  });
  return normalizeModelConfig(model);
}

export async function getProvidersForType(
  modelType: ModelType,
): Promise<ModelProvider[]> {
  const providers = await requestData<readonly RawProvider[]>({
    method: "GET",
    url: `/models/${encodeURIComponent(modelType)}/provideTypes`,
  });
  return (providers || []).map(normalizeProvider);
}

export function createModel(
  modelType: ModelType,
  providerCode: string,
  input: ModelMutationInput,
): Promise<ModelConfig> {
  return requestData({
    data: input,
    method: "POST",
    url: `/models/${encodeURIComponent(modelType)}/${encodeURIComponent(providerCode)}`,
  }).then((model) => normalizeModelConfig(model as Partial<ModelConfig>));
}

export function updateModel(
  modelType: ModelType,
  providerCode: string,
  id: string,
  input: ModelMutationInput,
): Promise<ModelConfig> {
  return requestData({
    data: input,
    method: "PUT",
    url: `/models/${encodeURIComponent(modelType)}/${encodeURIComponent(providerCode)}/${encodeURIComponent(id)}`,
  }).then((model) => normalizeModelConfig(model as Partial<ModelConfig>));
}

export function deleteModel(id: string): Promise<void> {
  return requestData({
    method: "DELETE",
    url: `/models/${encodeURIComponent(id)}`,
  });
}

export function setModelEnabled(id: string, enabled: boolean): Promise<void> {
  return requestData({
    method: "PUT",
    url: `/models/enable/${encodeURIComponent(id)}/${enabled ? 1 : 0}`,
  });
}

export function setDefaultModel(id: string): Promise<void> {
  return requestData({
    method: "PUT",
    url: `/models/default/${encodeURIComponent(id)}`,
  });
}

export async function getProviderPage(params: {
  limit: number;
  modelType: "" | ProviderModelType;
  name: string;
  page: number;
}): Promise<ProviderPage> {
  const data = await requestData<RawPage<RawProvider>>({
    method: "GET",
    params,
    url: "/models/provider",
  });
  return {
    list: (data?.list || []).map(normalizeProvider),
    total: Number(data?.total) || 0,
  };
}

function providerPayload(input: ProviderMutationInput) {
  return {
    ...input,
    fields: JSON.stringify(input.fields),
    id: input.id || "",
  };
}

export async function createProvider(
  input: ProviderMutationInput,
): Promise<ModelProvider> {
  const provider = await requestData<RawProvider>({
    data: providerPayload(input),
    method: "POST",
    url: "/models/provider",
  });
  return normalizeProvider(provider);
}

export async function updateProvider(
  input: ProviderMutationInput & { id: string },
): Promise<ModelProvider> {
  const provider = await requestData<RawProvider>({
    data: providerPayload(input),
    method: "PUT",
    url: "/models/provider",
  });
  return normalizeProvider(provider);
}

export function deleteProviders(ids: string[]): Promise<void> {
  return requestData({
    data: ids,
    method: "POST",
    url: "/models/provider/delete",
  });
}

export async function getTimbrePage(params: {
  limit: number;
  name: string;
  page: number;
  ttsModelId: string;
}): Promise<TimbrePage> {
  const data = await requestData<RawPage<Partial<Timbre>>>({
    method: "GET",
    params,
    url: "/ttsVoice",
  });
  return {
    list: (data?.list || []).map(normalizeTimbre),
    total: Number(data?.total) || 0,
  };
}

export function createTimbre(input: TimbreMutationInput): Promise<void> {
  return requestData({ data: input, method: "POST", url: "/ttsVoice" });
}

export function updateTimbre(
  id: string,
  input: TimbreMutationInput,
): Promise<void> {
  return requestData({
    data: input,
    method: "PUT",
    url: `/ttsVoice/${encodeURIComponent(id)}`,
  });
}

export function deleteTimbres(ids: string[]): Promise<void> {
  return requestData({
    data: ids,
    method: "POST",
    url: "/ttsVoice/delete",
  });
}

export { normalizeConfigJson };
