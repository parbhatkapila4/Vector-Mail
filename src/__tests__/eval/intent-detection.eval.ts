import { detectIntent } from "../../lib/intent-detection";

describe("intent detection: SEARCH bucket", () => {
  const queries = [
    "find emails about hiring",
    "search for invoices from acme",
    "show me threads from sequoia",
    "any messages about the Q3 board deck",
  ];
  queries.forEach((q) => {
    it(`classifies "${q}" as SEARCH`, () => {
      const r = detectIntent(q, false);
      expect(r.intent).toBe("SEARCH");
    });
  });
});

describe("intent detection: SUMMARIZE bucket", () => {
  const queries = [
    "summarize the first email",
    "tell me about that thread",
    "what does this conversation say in two lines",
  ];
  queries.forEach((q) => {
    it(`classifies "${q}" as SUMMARIZE when session has results`, () => {
      const r = detectIntent(q, true);
      expect(r.intent).toBe("SUMMARIZE");
    });
  });
});

describe("intent detection: SELECT bucket", () => {
  it("treats 'open the third one' as SELECT and extracts position=2", () => {
    const r = detectIntent("open the third one", true);
    expect(r.intent).toBe("SELECT");
    expect(r.extractedData?.position).toBe(2);
  });

  it("treats 'the second result' as SELECT and extracts position=1", () => {
    const r = detectIntent("the second result", true);
    expect(r.intent).toBe("SELECT");
    expect(r.extractedData?.position).toBe(1);
  });

  it("treats bare ordinal 'first' as SELECT and extracts position=0", () => {
    const r = detectIntent("first", true);
    expect(r.intent).toBe("SELECT");
    expect(r.extractedData?.position).toBe(0);
  });
});

describe("intent detection: date extraction", () => {
  it("captures 'on march 17' as a date pattern", () => {
    const r = detectIntent("tell me about that failed one on march 17", true);
    expect(r.intent).toBe("SUMMARIZE");
    expect(r.extractedData?.datePattern).toBeDefined();
  });

  it("captures '17/3' numeric date format", () => {
    const r = detectIntent("the one on 17/3", true);
    expect(r.extractedData?.datePattern).toBeDefined();
  });

});

describe("intent detection: session-context disambiguation", () => {
  it("'tell me more' with no session results falls back to SEARCH", () => {
    const r = detectIntent("tell me more", false);
    expect(r.intent).toBe("SEARCH");
  });

  it("'tell me more' with session results becomes SUMMARIZE", () => {
    const r = detectIntent("tell me more", true);
    expect(r.intent).toBe("SUMMARIZE");
  });
});
