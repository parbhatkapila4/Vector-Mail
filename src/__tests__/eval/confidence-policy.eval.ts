import {
  CONFIDENCE_THRESHOLDS,
  bandForConfidence,
  decisionForModeAndConfidence,
  isHighConfidence,
  isMediumConfidence,
} from "../../lib/automation/policy";

describe("confidence policy: thresholds", () => {
  it("HIGH threshold is 0.85", () => {
    expect(CONFIDENCE_THRESHOLDS.HIGH).toBe(0.85);
  });

  it("MEDIUM threshold is 0.6", () => {
    expect(CONFIDENCE_THRESHOLDS.MEDIUM).toBe(0.6);
  });
});

describe("confidence policy: bandForConfidence", () => {
  const cases: Array<{ confidence: number | null | undefined; band: "HIGH" | "MEDIUM" | "LOW" }> = [
    { confidence: 1.0, band: "HIGH" },
    { confidence: 0.95, band: "HIGH" },
    { confidence: 0.86, band: "HIGH" },
    { confidence: 0.85, band: "HIGH" },
    { confidence: 0.8499, band: "MEDIUM" },
    { confidence: 0.7, band: "MEDIUM" },
    { confidence: 0.6, band: "MEDIUM" },
    { confidence: 0.5999, band: "LOW" },
    { confidence: 0.3, band: "LOW" },
    { confidence: 0, band: "LOW" },
    { confidence: null, band: "LOW" },
    { confidence: undefined, band: "LOW" },
    { confidence: NaN, band: "LOW" },
  ];

  cases.forEach(({ confidence, band }) => {
    it(`returns ${band} for ${String(confidence)}`, () => {
      expect(bandForConfidence(confidence)).toBe(band);
    });
  });

  it("isHighConfidence is the same predicate as band === HIGH", () => {
    expect(isHighConfidence(0.85)).toBe(true);
    expect(isHighConfidence(0.84)).toBe(false);
  });

  it("isMediumConfidence is the same predicate as band === MEDIUM", () => {
    expect(isMediumConfidence(0.7)).toBe(true);
    expect(isMediumConfidence(0.85)).toBe(false);
    expect(isMediumConfidence(0.5)).toBe(false);
  });
});

describe("confidence policy: decisionForModeAndConfidence", () => {
  it("Manual cancels every candidate regardless of confidence", () => {
    expect(decisionForModeAndConfidence("manual", 0.99).status).toBe("cancelled");
    expect(decisionForModeAndConfidence("manual", 0.5).status).toBe("cancelled");
    expect(decisionForModeAndConfidence("manual", null).status).toBe("cancelled");
  });

  it("Assist queues every candidate for approval regardless of confidence", () => {
    expect(decisionForModeAndConfidence("assist", 0.99).status).toBe("awaiting_approval");
    expect(decisionForModeAndConfidence("assist", 0.5).status).toBe("awaiting_approval");
  });

  it("Auto + HIGH runs immediately", () => {
    expect(decisionForModeAndConfidence("auto", 0.95).status).toBe("pending");
    expect(decisionForModeAndConfidence("auto", 0.85).status).toBe("pending");
  });

  it("Auto + MEDIUM still asks for approval", () => {
    expect(decisionForModeAndConfidence("auto", 0.7).status).toBe("awaiting_approval");
    expect(decisionForModeAndConfidence("auto", 0.6).status).toBe("awaiting_approval");
  });

  it("Auto + LOW cancels", () => {
    expect(decisionForModeAndConfidence("auto", 0.5).status).toBe("cancelled");
    expect(decisionForModeAndConfidence("auto", 0).status).toBe("cancelled");
  });
});
