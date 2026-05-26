import { describe, expect, it } from "vitest";
import { detectBrand, priceTierFor, toiletRatingFor } from "@/lib/poi/quality";

describe("detectBrand", () => {
  it("finds Buc-ee's even with extra words", () => {
    expect(detectBrand("Buc-ee's #34 Travel Center")).toBe("buc-ee's");
  });
  it("finds Love's case-insensitively", () => {
    expect(detectBrand("LOVE'S Travel Stop")).toBe("love's");
  });
  it("returns null for unknown brands", () => {
    expect(detectBrand("Joe's Roadside Stop")).toBeNull();
  });
});

describe("toiletRatingFor", () => {
  it("rates Buc-ee's at 5", () => {
    expect(toiletRatingFor("Buc-ee's #44")).toBe(5);
  });
  it("rates a no-name station as unknown", () => {
    expect(toiletRatingFor("Mom's Gas")).toBeUndefined();
  });
});

describe("priceTierFor", () => {
  it("marks Costco as cheap", () => {
    expect(priceTierFor("Costco Gasoline")).toBe("cheap");
  });
  it("marks Shell as premium", () => {
    expect(priceTierFor("Shell Station #123")).toBe("premium");
  });
});
