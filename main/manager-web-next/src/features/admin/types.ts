import type { components } from "@/api/generated/schema";
import type { FeatureConfig, PublicConfig } from "@/features/auth/types";

export type AdminUser = components["schemas"]["AdminPageUserVO"];
export type CorrectWordFile = components["schemas"]["CorrectWordFileVO"];
export type CorrectWordInput = components["schemas"]["CorrectWordFileCreateDTO"];
export type DictData = components["schemas"]["SysDictDataVO"];
export type DictDataInput = components["schemas"]["SysDictDataDTO"];
export type DictType = components["schemas"]["SysDictTypeVO"];
export type DictTypeInput = components["schemas"]["SysDictTypeDTO"];
export type Param = components["schemas"]["SysParamsDTO"];
export type ServerActionInput = components["schemas"]["EmitSeverActionDTO"];

export interface PageData<T> {
  list: T[];
  total: number;
}

export type ParamValueType = "array" | "boolean" | "json" | "number" | "string";

export interface ParamInput {
  id?: number;
  paramCode: string;
  paramValue: string;
  remark?: string;
  valueType: ParamValueType;
}

export interface FeatureItem extends FeatureConfig {
  id: string;
}

export type FeatureMenu = PublicConfig["systemWebMenu"];

export interface ReplacementValidationError {
  key: string;
  values?: Record<string, number>;
}
