export type Intent = "SEARCH" | "SUMMARIZE" | "SELECT";

interface IntentResult {
  intent: Intent;
  confidence: number;
  extractedData?: {
    position?: number;
    subjectKeyword?: string;
    senderKeyword?: string;
    datePattern?: string;
  };
}

const SUMMARIZE_PATTERNS = [
  /what (was|is) (the|this|that|one) (email|mail|message) (about|saying)/i,
  /(summarize|summarise|summary|tell me about|what did|what does)/i,
  /what (was|did) (the|this|that|one) (.*?) (email|mail|message) (say|about)/i,
  /explain (the|this|that|one) (email|mail|message)/i,
  /what's (in|the content of) (the|this|that|one) (email|mail|message)/i,
  /what (was|is) (the|this|that|one) (on|from|dated?|about)/i,
  /(what|tell me|show me) (about|regarding) (the|this|that|one)/i,
  /(the|this|that|one) (on|from|dated?)/i,
];

const SELECT_PATTERNS = [
  /^(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th|one|two|three|four|five)/i,
  /^(show|open|get|select|choose) (the|a|an)? ?(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th)/i,
  /^(the|a|an)? ?(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th) (one|email|mail|message|result)/i,
];

const DATE_PATTERNS = [
  /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/i,
  /(\d{1,2})[-\/](\d{1,2})/i,
  /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i,
  /on\s+(\d{1,2})[-\/](\d{1,2})(?:[-\/](\d{2,4}))?/i,
  /(?:on|from|dated?|the)\s+(\d{1,2})[-\/](\d{1,2})(?:[-\/](\d{2,4}))?/i,
];

const POSITION_MAP: Record<string, number> = {
  first: 0,
  second: 1,
  third: 2,
  fourth: 3,
  fifth: 4,
  "1st": 0,
  "2nd": 1,
  "3rd": 2,
  "4th": 3,
  "5th": 4,
  one: 0,
  two: 1,
  three: 2,
  four: 3,
  five: 4,
};

export function detectIntent(
  query: string,
  hasStoredResults: boolean,
): IntentResult {
  const normalizedQuery = query.trim().toLowerCase();

  if (!hasStoredResults) {
    return {
      intent: "SEARCH",
      confidence: 1.0,
    };
  }

  for (const pattern of SUMMARIZE_PATTERNS) {
    if (pattern.test(query)) {
      const extractedData: IntentResult["extractedData"] = {};

      for (const datePattern of DATE_PATTERNS) {
        const dateMatch = query.match(datePattern);
        if (dateMatch) {
          extractedData.datePattern = dateMatch[0];
          break;
        }
      }

      let subjectMatch = query.match(
        /(?:about|from|regarding|titled?|subject:?)\s+["']?([^"']+?)(?:\s+(?:email|mail|message))?["']?/i,
      );
      if (subjectMatch && subjectMatch[1]) {
        extractedData.subjectKeyword = subjectMatch[1].trim();
      } else {
        subjectMatch = query.match(
          /(?:the\s+)?([^"]+?)\s+(?:email|mail|message)/i,
        );
        if (subjectMatch && subjectMatch[1]) {
          extractedData.subjectKeyword = subjectMatch[1].trim();
        }
      }

      const senderMatch = query.match(
        /(?:from|by|sent\s+by)\s+([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[a-zA-Z\s]+)/i,
      );
      if (senderMatch && senderMatch[1]) {
        extractedData.senderKeyword = senderMatch[1].trim();
      }

      return {
        intent: "SUMMARIZE",
        confidence: 0.95,
        extractedData,
      };
    }
  }

  for (const pattern of SELECT_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      const positionWord = match[1] || match[2] || match[3];
      if (positionWord) {
        const position = POSITION_MAP[positionWord.toLowerCase()] ?? 0;

        return {
          intent: "SELECT",
          confidence: 0.85,
          extractedData: {
            position,
          },
        };
      }
    }
  }

  const subjectMatch = query.match(
    /(?:the|a|an)\s+([^"]+?)\s+(?:email|mail|message)/i,
  );
  if (subjectMatch && subjectMatch[1] && hasStoredResults) {
    return {
      intent: "SELECT",
      confidence: 0.8,
      extractedData: {
        subjectKeyword: subjectMatch[1].trim(),
      },
    };
  }

  const dateMatch =
    query.match(
      /(?:on|from|dated?|the)\s+(\d{1,2}[-\/]\d{1,2}(?:[-\/]\d{2,4})?)/i,
    ) || query.match(/(\d{1,2}[-\/]\d{1,2}(?:[-\/]\d{2,4})?)/);
  if (dateMatch && dateMatch[1] && hasStoredResults) {
    return {
      intent: "SUMMARIZE",
      confidence: 0.9,
      extractedData: {
        datePattern: dateMatch[1],
      },
    };
  }

  if (
    hasStoredResults &&
    /(the|this|that|one)\s+(on|from|dated?|about|regarding)/i.test(query)
  ) {
    const extractedData: IntentResult["extractedData"] = {};

    const convDateMatch = query.match(
      /(?:on|from|dated?)\s+(\d{1,2}[-\/]\d{1,2}(?:[-\/]\d{2,4})?)/i,
    );
    if (convDateMatch && convDateMatch[1]) {
      extractedData.datePattern = convDateMatch[1];
    }

    return {
      intent: "SUMMARIZE",
      confidence: 0.85,
      extractedData,
    };
  }

  if (hasStoredResults) {
    const isNewSearch =
      normalizedQuery.length > 15 ||
      /^(find|search|show me|get me|list|look for|any|all)/i.test(
        normalizedQuery,
      );

    if (!isNewSearch) {
      const extractedData: IntentResult["extractedData"] = {};

      const dateMatch = query.match(/(\d{1,2}[-\/]\d{1,2}(?:[-\/]\d{2,4})?)/);
      if (dateMatch && dateMatch[1]) {
        extractedData.datePattern = dateMatch[1];
      }

      return {
        intent: "SUMMARIZE",
        confidence: 0.7,
        extractedData,
      };
    }
  }

  const isNewSearch =
    normalizedQuery.length > 10 ||
    /^(find|search|show|get|list|look|any|all)/i.test(normalizedQuery);

  if (isNewSearch) {
    return {
      intent: "SEARCH",
      confidence: 0.7,
    };
  }

  return {
    intent: "SUMMARIZE",
    confidence: 0.6,
  };
}
