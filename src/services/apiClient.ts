import type {
  ApiErrorBody,
  ApiErrorResponse,
  ApiSuccessResponse,
} from "./types";

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const TOKEN_STORAGE_KEY = "giapha.access-token";
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api/v1").replace(
  /\/+$/,
  "",
);

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export interface RequestOptions {
  query?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
  /** Send the stored bearer token. Defaults to true. */
  auth?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Auth token                                                                 */
/* -------------------------------------------------------------------------- */

export function getAccessToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    /* storage can be blocked; the in-memory request still works this session */
  }
}

export function clearAccessToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

export interface ApiErrorInit {
  code: string;
  message: string;
  status: number;
  details?: unknown;
  requestId?: string | null;
  path?: string;
  method?: string;
  timestamp?: string;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;
  readonly requestId: string | null;
  readonly path?: string;
  readonly method?: string;
  readonly timestamp?: string;

  constructor(init: ApiErrorInit) {
    super(init.message);
    this.name = "ApiError";
    this.code = init.code;
    this.status = init.status;
    this.details = init.details;
    this.requestId = init.requestId ?? null;
    this.path = init.path;
    this.method = init.method;
    this.timestamp = init.timestamp;
    if (init.cause !== undefined) this.cause = init.cause;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Human-readable message for any thrown value, safe to render in the UI. */
export function toErrorMessage(
  error: unknown,
  fallback = "Không gọi được máy chủ. Vui lòng thử lại.",
): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function notifyUnauthorized(): void {
  clearAccessToken();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("giapha:unauthorized"));
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function createRequestId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toSearch(query?: QueryParams): string {
  if (!query) return "";

  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

function buildUrl(path: string, query?: QueryParams): string {
  const url = /^https?:\/\//i.test(path)
    ? path
    : `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  return `${url}${toSearch(query)}`;
}

function parseJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSuccessEnvelope<T>(value: unknown): value is ApiSuccessResponse<T> {
  return isRecord(value) && value.success === true && "data" in value;
}

function isErrorEnvelope(value: unknown): value is ApiErrorResponse {
  return (
    isRecord(value) &&
    value.success === false &&
    isRecord(value.error) &&
    typeof value.error.code === "string" &&
    typeof value.error.message === "string"
  );
}

function asErrorBody(value: unknown): ApiErrorBody {
  if (isRecord(value) && typeof value.code === "string") {
    return {
      code: value.code,
      message:
        typeof value.message === "string"
          ? value.message
          : "Đã xảy ra lỗi không xác định.",
      details: value.details,
    };
  }

  return {
    code: "INVALID_RESPONSE",
    message: "Máy chủ trả về dữ liệu không đúng định dạng.",
  };
}

function fallbackMessage(status: number): string {
  if (status === 401) return "Phiên đăng nhập đã hết hạn.";
  if (status === 403) return "Bạn không có quyền thực hiện thao tác này.";
  if (status === 404) return "Không tìm thấy dữ liệu yêu cầu.";
  if (status === 429) return "Bạn thao tác quá nhanh, vui lòng thử lại sau.";
  if (status >= 500) return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  return "Yêu cầu không hợp lệ.";
}

function makeError(
  status: number,
  body: ApiErrorBody,
  request: { method: string; path: string },
  response?: Response,
  payload?: unknown,
): ApiError {
  const envelope = isRecord(payload) ? payload : undefined;

  return new ApiError({
    code: body.code,
    message: body.message,
    details: body.details,
    status,
    requestId:
      (typeof envelope?.requestId === "string" && envelope.requestId) ||
      response?.headers.get("x-request-id") ||
      null,
    path:
      (typeof envelope?.path === "string" && envelope.path) || request.path,
    method:
      (typeof envelope?.method === "string" && envelope.method) ||
      request.method,
    timestamp:
      typeof envelope?.timestamp === "string" ? envelope.timestamp : undefined,
  });
}

/* -------------------------------------------------------------------------- */
/* Core request                                                               */
/* -------------------------------------------------------------------------- */

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "x-request-id": createRequestId(),
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.auth !== false) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError({
      code: "NETWORK_ERROR",
      message:
        "Không kết nối được tới máy chủ. Kiểm tra kết nối mạng hoặc địa chỉ API.",
      status: 0,
      cause: error,
      method,
      path,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const payload = parseJson(text);

  if (response.ok && isSuccessEnvelope<T>(payload)) {
    return payload.data;
  }

  if (isErrorEnvelope(payload)) {
    if (response.status === 401) notifyUnauthorized();
    throw makeError(
      response.status,
      payload.error,
      { method, path },
      response,
      payload,
    );
  }

  // The server answered with a non-envelope body (proxy error, HTML page...).
  const body = asErrorBody(payload);
  if (response.status === 401) notifyUnauthorized();

  throw makeError(
    response.status,
    {
      ...body,
      message:
        body.code === "INVALID_RESPONSE"
          ? fallbackMessage(response.status)
          : body.message,
    },
    { method, path },
    response,
    payload,
  );
}

/* -------------------------------------------------------------------------- */
/* Public helpers                                                             */
/* -------------------------------------------------------------------------- */

export function apiGet<T>(
  path: string,
  query?: QueryParams,
  options: Omit<RequestOptions, "query" | "body"> = {},
): Promise<T> {
  return request<T>("GET", path, { ...options, query });
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  options: Omit<RequestOptions, "body"> = {},
): Promise<T> {
  return request<T>("POST", path, { ...options, body });
}

export function apiPatch<T>(
  path: string,
  body?: unknown,
  options: Omit<RequestOptions, "body"> = {},
): Promise<T> {
  return request<T>("PATCH", path, { ...options, body });
}

export function apiPut<T>(
  path: string,
  body?: unknown,
  options: Omit<RequestOptions, "body"> = {},
): Promise<T> {
  return request<T>("PUT", path, { ...options, body });
}

export function apiDelete<T = void>(
  path: string,
  options: Omit<RequestOptions, "body"> = {},
): Promise<T> {
  return request<T>("DELETE", path, options);
}
