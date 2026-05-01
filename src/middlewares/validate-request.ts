import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

function hasRequestEnvelope(value: unknown): value is {
  body?: unknown;
  params?: unknown;
  query?: unknown;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "body" in value || "params" in value || "query" in value;
}

export function validateRequest(schema: ZodTypeAny) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const contextualInput = {
      body: request.body,
      params: request.params,
      query: request.query,
    };

    const wrappedResult = schema.safeParse(contextualInput);
    const rawBodyResult = schema.safeParse(request.body);
    const result = wrappedResult.success ? wrappedResult : rawBodyResult;

    if (!result.success) {
      next(result.error);
      return;
    }

    if (hasRequestEnvelope(result.data)) {
      if ("body" in result.data) {
        request.body = result.data.body;
      }

      if ("params" in result.data && result.data.params) {
        request.params = result.data.params as Request["params"];
      }

      if ("query" in result.data && result.data.query) {
        request.query = result.data.query as Request["query"];
      }
    } else {
      request.body = result.data;
    }

    next();
  };
}
