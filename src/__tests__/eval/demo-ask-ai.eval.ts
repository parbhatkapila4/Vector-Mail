import {
  ASK_AI_GUIDED_STEPS,
  buildAskAiDemoMessages,
  getDemoAskAiResponse,
} from "../../lib/demo/ask-ai-demo";

const matchTitle = (response: string, expected: string) =>
  response.toLowerCase().includes(expected.toLowerCase());

describe("demo ask-ai: response routing", () => {
  describe("priority / today bucket", () => {
    const queries = [
      "What needs my attention today?",
      "what should I prioritize",
      "rank what matters in my inbox today: founder view, 5 bullets max.",
      "where should I focus this morning",
    ];
    queries.forEach((q) => {
      it(`routes "${q}" to the priority list`, () => {
        const r = getDemoAskAiResponse(q);
        expect(matchTitle(r, "must-act-today")).toBe(true);
      });
    });
  });

  describe("waiting / reply queue bucket", () => {
    const queries = [
      "Who am I waiting on for a reply?",
      "what threads are waiting on me",
      "what's in my reply queue",
    ];
    queries.forEach((q) => {
      it(`routes "${q}" to the waiting-on response`, () => {
        const r = getDemoAskAiResponse(q);
        expect(matchTitle(r, "external threads")).toBe(true);
      });
    });
  });

  describe("partnership bucket", () => {
    const queries = [
      "Summarize the partnership thread",
      "tell me about the Notion conversation",
      "how is the co-marketing slot looking",
    ];
    queries.forEach((q) => {
      it(`routes "${q}" to the partnership response`, () => {
        const r = getDemoAskAiResponse(q);
        expect(matchTitle(r, "Maya")).toBe(true);
      });
    });
  });

  describe("contracts / legal bucket", () => {
    const queries = [
      "what's in my contracts thread",
      "any legal stuff this week",
      "MSA redline status",
      "Linear renewal - what's the deadline?",
    ];
    queries.forEach((q) => {
      it(`routes "${q}" to the contracts response`, () => {
        const r = getDemoAskAiResponse(q);
        expect(matchTitle(r, "Acme MSA")).toBe(true);
      });
    });
  });

  describe("summary bucket", () => {
    const queries = [
      "Summarize my email from the last 7 days",
      "give me a recap of last 30",
      "month in review",
    ];
    queries.forEach((q) => {
      it(`routes "${q}" to the summary response`, () => {
        const r = getDemoAskAiResponse(q);
        expect(matchTitle(r, "themes")).toBe(true);
      });
    });
  });

  describe("fallback bucket", () => {
    const queries = [
      "what's the meaning of life",
      "tell me about my pets",
      "completely unrelated query foobar",
    ];
    queries.forEach((q) => {
      it(`routes "${q}" to the fallback`, () => {
        const r = getDemoAskAiResponse(q);
        expect(matchTitle(r, "sample inbox")).toBe(true);
        expect(matchTitle(r, "must-act-today")).toBe(false);
      });
    });
  });
});

describe("demo ask-ai: seeded conversation shape", () => {
  it("alternates user/assistant turns starting with user", () => {
    const msgs = buildAskAiDemoMessages(Date.now());
    expect(msgs.length).toBeGreaterThan(0);
    msgs.forEach((m, i) => {
      expect(m.role).toBe(i % 2 === 0 ? "user" : "assistant");
    });
  });

  it("guided steps include the today and waiting prompts", () => {
    expect(ASK_AI_GUIDED_STEPS).toContain("What needs my attention today?");
    expect(ASK_AI_GUIDED_STEPS).toContain("Who am I waiting on for a reply?");
  });

  it("every assistant response embeds a structured JSON block", () => {
    const msgs = buildAskAiDemoMessages(Date.now());
    msgs
      .filter((m) => m.role === "assistant")
      .forEach((m) => {
        expect(m.content).toMatch(/```json[\s\S]+?```/);
      });
  });
});
