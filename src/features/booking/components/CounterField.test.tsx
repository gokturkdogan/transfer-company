import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import { CounterField } from "@/features/booking/components/CounterField";

const messages = {
  booking: {
    search: {
      passengers: "Passengers",
    },
  },
};

describe("CounterField", () => {
  it("renders passenger counter", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CounterField label="Passengers" value={2} onChange={() => undefined} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText("Passengers")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});

describe("RTL smoke", () => {
  it("renders with rtl document direction", () => {
    document.documentElement.dir = "rtl";

    render(
      <NextIntlClientProvider locale="ar" messages={messages}>
        <CounterField label="الركاب" value={1} onChange={() => undefined} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText("الركاب")).toBeInTheDocument();
    document.documentElement.dir = "ltr";
  });
});
