import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it } from "vitest";

import { AppShell } from "@/app/shell";
import i18n from "@/i18n";
import { FoundationPage } from "@/features/foundation/foundation-page";

function renderFoundation() {
  return render(
    <I18nextProvider i18n={i18n}>
      <AppShell />
      <FoundationPage />
    </I18nextProvider>,
  );
}

describe("React manager foundation", () => {
  afterEach(async () => {
    await i18n.changeLanguage("zh-CN");
    window.localStorage.clear();
  });

  it("renders the OpenAPI contract baseline", () => {
    renderFoundation();

    expect(
      screen.getByRole("heading", {
        name: "现代、可靠、可渐进迁移的小智控制台",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("127")).toBeInTheDocument();
  });

  it("offers every locale carried by the legacy frontend", async () => {
    const user = userEvent.setup();
    renderFoundation();

    const languageSelect = screen.getByRole("combobox", {
      name: "界面语言",
    });
    expect(languageSelect).toHaveLength(6);

    await user.selectOptions(languageSelect, "en");
    expect(
      screen.getByRole("heading", {
        name: "A modern, reliable Xiaozhi console built for incremental migration",
      }),
    ).toBeInTheDocument();
  });
});
