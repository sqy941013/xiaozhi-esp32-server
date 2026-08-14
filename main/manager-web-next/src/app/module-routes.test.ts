import { describe, expect, it } from "vitest";

import {
  moduleRoutes,
  visibleModuleRoutes,
} from "@/app/module-routes";
import type { PublicConfig, UserInfo } from "@/features/auth/types";

const user: UserInfo = { id: 7, username: "member", superAdmin: 0 };
const admin: UserInfo = { id: 1, username: "admin", superAdmin: 1 };

function config(enabled: boolean): PublicConfig {
  return {
    allowUserRegister: false,
    beianGaNum: null,
    beianIcpNum: null,
    enableMobileRegister: false,
    mobileAreaList: [],
    name: "test",
    sm2PublicKey: "key",
    systemWebMenu: {
      features: {
        addressBook: { enabled },
        knowledgeBase: { enabled },
        voiceClone: { enabled },
        voiceprintRecognition: { enabled },
      },
      groups: {},
    },
    version: "test",
    year: "©2026",
  };
}

describe("module route access", () => {
  it("keeps every legacy business path in the protected route catalog", () => {
    const paths = new Set(moduleRoutes.map((route) => route.path));
    expect(paths.size).toBe(moduleRoutes.length);
    expect([...paths]).toEqual(
      expect.arrayContaining([
        "/home",
        "/role-config",
        "/device-management",
        "/model-config",
        "/knowledge-base-management",
        "/server-side-management",
      ]),
    );
  });

  it("hides administrator modules from regular users", () => {
    const paths = visibleModuleRoutes(user, config(true)).map((route) => route.path);
    expect(paths).toContain("/voice-clone-management");
    expect(paths).not.toContain("/model-config");
    expect(paths).not.toContain("/user-management");
  });

  it("applies server feature flags even for administrators", () => {
    const paths = visibleModuleRoutes(admin, config(false)).map((route) => route.path);
    expect(paths).toContain("/model-config");
    expect(paths).not.toContain("/voice-clone-management");
    expect(paths).not.toContain("/knowledge-base-management");
  });
});
