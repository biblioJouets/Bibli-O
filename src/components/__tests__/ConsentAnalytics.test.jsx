import React from "react";
import { render, screen, act } from "@testing-library/react";
import ConsentAnalytics from "../ConsentAnalytics";

jest.mock("@next/third-parties/google", () => ({
  GoogleAnalytics: ({ gaId }) => <div data-testid="ga" data-ga-id={gaId} />,
}));

const CONSENT_COOKIE = "biblio-jouets-consent";

function clearConsentCookie() {
  document.cookie = `${CONSENT_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

describe("ConsentAnalytics", () => {
  const previousId = process.env.NEXT_PUBLIC_GA_ID;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_GA_ID = "G-TEST";
    clearConsentCookie();
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_GA_ID = previousId;
    clearConsentCookie();
  });

  it("does not load analytics without consent", () => {
    render(<ConsentAnalytics />);
    expect(screen.queryByTestId("ga")).not.toBeInTheDocument();
  });

  it("does not load analytics when consent is declined", () => {
    document.cookie = `${CONSENT_COOKIE}=false`;
    render(<ConsentAnalytics />);
    expect(screen.queryByTestId("ga")).not.toBeInTheDocument();
  });

  it("loads analytics when the consent cookie is true", async () => {
    document.cookie = `${CONSENT_COOKIE}=true`;
    render(<ConsentAnalytics />);
    expect(await screen.findByTestId("ga")).toHaveAttribute("data-ga-id", "G-TEST");
  });

  it("loads analytics after the visitor accepts", async () => {
    render(<ConsentAnalytics />);
    expect(screen.queryByTestId("ga")).not.toBeInTheDocument();

    act(() => {
      document.cookie = `${CONSENT_COOKIE}=true`;
      window.dispatchEvent(new Event("biblio-consent-accepted"));
    });

    expect(await screen.findByTestId("ga")).toHaveAttribute("data-ga-id", "G-TEST");
  });

  it("does not load analytics when the measurement id is missing", () => {
    delete process.env.NEXT_PUBLIC_GA_ID;
    document.cookie = `${CONSENT_COOKIE}=true`;
    render(<ConsentAnalytics />);
    expect(screen.queryByTestId("ga")).not.toBeInTheDocument();
  });
});
