import TurndownService from "turndown";

export const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  strongDelimiter: "**",
  bulletListMarker: "-",
  linkStyle: "inlined",
});

turndown.addRule("linkRemover", {
  filter: "a",
  replacement: (content) => content,
});

turndown.addRule("styleRemover", {
  filter: "style",
  replacement: () => "",
});

turndown.addRule("scriptRemover", {
  filter: "script",
  replacement: () => "",
});

turndown.addRule("imageRemover", {
  filter: "img",
  replacement: (content) => content,
});
