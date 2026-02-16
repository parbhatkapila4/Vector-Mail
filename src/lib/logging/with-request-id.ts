
import type { NextRequest } from "next/server";
import {
  getOrCreateRequestId,
  runWithRequestIdAsync,
  REQUEST_ID_HEADER,
} from "@/lib/correlation";

export type ApiRouteHandler = (
  req: NextRequest | Request,
  context?: { params?: Promise<Record<string, string>> },
) => Promise<Response>;


export function withRequestId(handler: ApiRouteHandler): ApiRouteHandler {
  return async (req, context) => {
    const requestId = getOrCreateRequestId(req.headers);
    const response = await runWithRequestIdAsync(requestId, () =>
      handler(req, context),
    );
    if (response && !response.headers.has(REQUEST_ID_HEADER)) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set(REQUEST_ID_HEADER, requestId);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }
    return response;
  };
}
