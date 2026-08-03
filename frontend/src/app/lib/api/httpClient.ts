/**
 * Thin fetch wrapper for the Fee Catalog backend. Parses the JSON:API-style
 * error envelope ({ errors: [{ detail, code, ... }] }) into a single
 * human-readable ApiError so callers can keep doing
 * `catch (err) { toast.error(err instanceof Error ? err.message : ...) }`.
 */

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:3000";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type ErrorBody = { errors?: Array<{ status: string; code: string; title: string; detail: string }> };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError("Could not reach the Fee Catalog service. Is the backend running?", 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const body = text ? (JSON.parse(text) as unknown) : undefined;

  if (!response.ok) {
    const detail = (body as ErrorBody | undefined)?.errors?.[0];
    throw new ApiError(detail?.detail ?? `Request failed with status ${response.status}`, response.status, detail?.code);
  }

  return body as T;
}

export const http = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
  delete: <T = void>(path: string): Promise<T> => request<T>(path, { method: "DELETE" }),
};
