#!/usr/bin/env node
"use strict";

// src/main.ts
var import_node_fs5 = require("node:fs");
var import_node_os4 = require("node:os");
var import_node_path7 = require("node:path");

// src/lib/client.ts
var import_node_fs = require("node:fs");
var import_node_os = require("node:os");
var import_node_path = require("node:path");

// node_modules/crosmos/internal/tslib.mjs
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m")
    throw new TypeError("Private method is not writable");
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

// node_modules/crosmos/internal/utils/uuid.mjs
var uuid4 = function() {
  const { crypto } = globalThis;
  if (crypto?.randomUUID) {
    uuid4 = crypto.randomUUID.bind(crypto);
    return crypto.randomUUID();
  }
  const u8 = new Uint8Array(1);
  const randomByte = crypto ? () => crypto.getRandomValues(u8)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (+c ^ randomByte() & 15 >> +c / 4).toString(16));
};

// node_modules/crosmos/internal/errors.mjs
function isAbortError(err) {
  return typeof err === "object" && err !== null && // Spec-compliant fetch implementations
  ("name" in err && err.name === "AbortError" || // Expo fetch
  "message" in err && String(err.message).includes("FetchRequestCanceledException"));
}
var castToError = (err) => {
  if (err instanceof Error)
    return err;
  if (typeof err === "object" && err !== null) {
    try {
      if (Object.prototype.toString.call(err) === "[object Error]") {
        const error = new Error(err.message, err.cause ? { cause: err.cause } : {});
        if (err.stack)
          error.stack = err.stack;
        if (err.cause && !error.cause)
          error.cause = err.cause;
        if (err.name)
          error.name = err.name;
        return error;
      }
    } catch {
    }
    try {
      return new Error(JSON.stringify(err));
    } catch {
    }
  }
  return new Error(err);
};

// node_modules/crosmos/core/error.mjs
var CrosmosError = class extends Error {
};
var APIError = class _APIError extends CrosmosError {
  constructor(status2, error, message, headers) {
    super(`${_APIError.makeMessage(status2, error, message)}`);
    this.status = status2;
    this.headers = headers;
    this.error = error;
  }
  static makeMessage(status2, error, message) {
    const msg = error?.message ? typeof error.message === "string" ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message;
    if (status2 && msg) {
      return `${status2} ${msg}`;
    }
    if (status2) {
      return `${status2} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return "(no status code or body)";
  }
  static generate(status2, errorResponse, message, headers) {
    if (!status2 || !headers) {
      return new APIConnectionError({ message, cause: castToError(errorResponse) });
    }
    const error = errorResponse;
    if (status2 === 400) {
      return new BadRequestError(status2, error, message, headers);
    }
    if (status2 === 401) {
      return new AuthenticationError(status2, error, message, headers);
    }
    if (status2 === 403) {
      return new PermissionDeniedError(status2, error, message, headers);
    }
    if (status2 === 404) {
      return new NotFoundError(status2, error, message, headers);
    }
    if (status2 === 409) {
      return new ConflictError(status2, error, message, headers);
    }
    if (status2 === 422) {
      return new UnprocessableEntityError(status2, error, message, headers);
    }
    if (status2 === 429) {
      return new RateLimitError(status2, error, message, headers);
    }
    if (status2 >= 500) {
      return new InternalServerError(status2, error, message, headers);
    }
    return new _APIError(status2, error, message, headers);
  }
};
var APIUserAbortError = class extends APIError {
  constructor({ message } = {}) {
    super(void 0, void 0, message || "Request was aborted.", void 0);
  }
};
var APIConnectionError = class extends APIError {
  constructor({ message, cause }) {
    super(void 0, void 0, message || "Connection error.", void 0);
    if (cause)
      this.cause = cause;
  }
};
var APIConnectionTimeoutError = class extends APIConnectionError {
  constructor({ message } = {}) {
    super({ message: message ?? "Request timed out." });
  }
};
var BadRequestError = class extends APIError {
};
var AuthenticationError = class extends APIError {
};
var PermissionDeniedError = class extends APIError {
};
var NotFoundError = class extends APIError {
};
var ConflictError = class extends APIError {
};
var UnprocessableEntityError = class extends APIError {
};
var RateLimitError = class extends APIError {
};
var InternalServerError = class extends APIError {
};

// node_modules/crosmos/internal/utils/values.mjs
var startsWithSchemeRegexp = /^[a-z][a-z0-9+.-]*:/i;
var isAbsoluteURL = (url) => {
  return startsWithSchemeRegexp.test(url);
};
var isArray = (val) => (isArray = Array.isArray, isArray(val));
var isReadonlyArray = isArray;
function isEmptyObj(obj) {
  if (!obj)
    return true;
  for (const _k in obj)
    return false;
  return true;
}
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
var validatePositiveInteger = (name, n) => {
  if (typeof n !== "number" || !Number.isInteger(n)) {
    throw new CrosmosError(`${name} must be an integer`);
  }
  if (n < 0) {
    throw new CrosmosError(`${name} must be a positive integer`);
  }
  return n;
};
var safeJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return void 0;
  }
};

// node_modules/crosmos/internal/utils/sleep.mjs
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// node_modules/crosmos/version.mjs
var VERSION = "0.1.0";

// node_modules/crosmos/internal/detect-platform.mjs
function getDetectedPlatform() {
  if (typeof Deno !== "undefined" && Deno.build != null) {
    return "deno";
  }
  if (typeof EdgeRuntime !== "undefined") {
    return "edge";
  }
  if (Object.prototype.toString.call(typeof globalThis.process !== "undefined" ? globalThis.process : 0) === "[object process]") {
    return "node";
  }
  return "unknown";
}
var getPlatformProperties = () => {
  const detectedPlatform = getDetectedPlatform();
  if (detectedPlatform === "deno") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(Deno.build.os),
      "X-Stainless-Arch": normalizeArch(Deno.build.arch),
      "X-Stainless-Runtime": "deno",
      "X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : Deno.version?.deno ?? "unknown"
    };
  }
  if (typeof EdgeRuntime !== "undefined") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": `other:${EdgeRuntime}`,
      "X-Stainless-Runtime": "edge",
      "X-Stainless-Runtime-Version": globalThis.process.version
    };
  }
  if (detectedPlatform === "node") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(globalThis.process.platform ?? "unknown"),
      "X-Stainless-Arch": normalizeArch(globalThis.process.arch ?? "unknown"),
      "X-Stainless-Runtime": "node",
      "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
    };
  }
  const browserInfo = getBrowserInfo();
  if (browserInfo) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": "unknown",
      "X-Stainless-Runtime": `browser:${browserInfo.browser}`,
      "X-Stainless-Runtime-Version": browserInfo.version
    };
  }
  return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": VERSION,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function getBrowserInfo() {
  if (typeof navigator === "undefined" || !navigator) {
    return null;
  }
  const browserPatterns = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key, pattern } of browserPatterns) {
    const match = pattern.exec(navigator.userAgent);
    if (match) {
      const major = match[1] || 0;
      const minor = match[2] || 0;
      const patch = match[3] || 0;
      return { browser: key, version: `${major}.${minor}.${patch}` };
    }
  }
  return null;
}
var normalizeArch = (arch) => {
  if (arch === "x32")
    return "x32";
  if (arch === "x86_64" || arch === "x64")
    return "x64";
  if (arch === "arm")
    return "arm";
  if (arch === "aarch64" || arch === "arm64")
    return "arm64";
  if (arch)
    return `other:${arch}`;
  return "unknown";
};
var normalizePlatform = (platform) => {
  platform = platform.toLowerCase();
  if (platform.includes("ios"))
    return "iOS";
  if (platform === "android")
    return "Android";
  if (platform === "darwin")
    return "MacOS";
  if (platform === "win32")
    return "Windows";
  if (platform === "freebsd")
    return "FreeBSD";
  if (platform === "openbsd")
    return "OpenBSD";
  if (platform === "linux")
    return "Linux";
  if (platform)
    return `Other:${platform}`;
  return "Unknown";
};
var _platformHeaders;
var getPlatformHeaders = () => {
  return _platformHeaders ?? (_platformHeaders = getPlatformProperties());
};

// node_modules/crosmos/internal/shims.mjs
function getDefaultFetch() {
  if (typeof fetch !== "undefined") {
    return fetch;
  }
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Crosmos({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function makeReadableStream(...args) {
  const ReadableStream = globalThis.ReadableStream;
  if (typeof ReadableStream === "undefined") {
    throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  }
  return new ReadableStream(...args);
}
function ReadableStreamFrom(iterable) {
  let iter = Symbol.asyncIterator in iterable ? iterable[Symbol.asyncIterator]() : iterable[Symbol.iterator]();
  return makeReadableStream({
    start() {
    },
    async pull(controller) {
      const { done, value } = await iter.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
    async cancel() {
      await iter.return?.();
    }
  });
}
async function CancelReadableStream(stream) {
  if (stream === null || typeof stream !== "object")
    return;
  if (stream[Symbol.asyncIterator]) {
    await stream[Symbol.asyncIterator]().return?.();
    return;
  }
  const reader = stream.getReader();
  const cancelPromise = reader.cancel();
  reader.releaseLock();
  await cancelPromise;
}

// node_modules/crosmos/internal/request-options.mjs
var FallbackEncoder = ({ headers, body }) => {
  return {
    bodyHeaders: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  };
};

// node_modules/crosmos/internal/utils/query.mjs
function stringifyQuery(query) {
  return Object.entries(query).filter(([_, value]) => typeof value !== "undefined").map(([key, value]) => {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
    if (value === null) {
      return `${encodeURIComponent(key)}=`;
    }
    throw new CrosmosError(`Cannot stringify type ${typeof value}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}

// node_modules/crosmos/internal/uploads.mjs
var checkFileSupport = () => {
  if (typeof File === "undefined") {
    const { process: process2 } = globalThis;
    const isOldNode = typeof process2?.versions?.node === "string" && parseInt(process2.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (isOldNode ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function makeFile(fileBits, fileName, options) {
  checkFileSupport();
  return new File(fileBits, fileName ?? "unknown_file", options);
}
function getName(value) {
  return (typeof value === "object" && value !== null && ("name" in value && value.name && String(value.name) || "url" in value && value.url && String(value.url) || "filename" in value && value.filename && String(value.filename) || "path" in value && value.path && String(value.path)) || "").split(/[\\/]/).pop() || void 0;
}
var isAsyncIterable = (value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function";

// node_modules/crosmos/internal/to-file.mjs
var isBlobLike = (value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function";
var isFileLike = (value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike(value);
var isResponseLike = (value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function";
async function toFile(value, name, options) {
  checkFileSupport();
  value = await value;
  if (isFileLike(value)) {
    if (value instanceof File) {
      return value;
    }
    return makeFile([await value.arrayBuffer()], value.name);
  }
  if (isResponseLike(value)) {
    const blob = await value.blob();
    name || (name = new URL(value.url).pathname.split(/[\\/]/).pop());
    return makeFile(await getBytes(blob), name, options);
  }
  const parts = await getBytes(value);
  name || (name = getName(value));
  if (!options?.type) {
    const type = parts.find((part) => typeof part === "object" && "type" in part && part.type);
    if (typeof type === "string") {
      options = { ...options, type };
    }
  }
  return makeFile(parts, name, options);
}
async function getBytes(value) {
  let parts = [];
  if (typeof value === "string" || ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
  value instanceof ArrayBuffer) {
    parts.push(value);
  } else if (isBlobLike(value)) {
    parts.push(value instanceof Blob ? value : await value.arrayBuffer());
  } else if (isAsyncIterable(value)) {
    for await (const chunk of value) {
      parts.push(...await getBytes(chunk));
    }
  } else {
    const constructor = value?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof value}${constructor ? `; constructor: ${constructor}` : ""}${propsForError(value)}`);
  }
  return parts;
}
function propsForError(value) {
  if (typeof value !== "object" || value === null)
    return "";
  const props = Object.getOwnPropertyNames(value);
  return `; props: [${props.map((p) => `"${p}"`).join(", ")}]`;
}

// node_modules/crosmos/core/resource.mjs
var APIResource = class {
  constructor(client) {
    this._client = client;
  }
};

// node_modules/crosmos/resources/conversations.mjs
var Conversations = class extends APIResource {
  /**
   * Ingest a multi-turn conversation into the knowledge graph.
   *
   * - Each turn is converted into a source with provenance metadata.
   */
  ingest(body, options) {
    return this._client.post("/api/v1/conversations", { body, ...options });
  }
};

// node_modules/crosmos/internal/utils/path.mjs
function encodeURIPath(str) {
  return str.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var EMPTY = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null));
var createPathTagFunction = (pathEncoder = encodeURIPath) => function path2(statics, ...params) {
  if (statics.length === 1)
    return statics[0];
  let postPath = false;
  const invalidSegments = [];
  const path3 = statics.reduce((previousValue, currentValue, index) => {
    if (/[?#]/.test(currentValue)) {
      postPath = true;
    }
    const value = params[index];
    let encoded = (postPath ? encodeURIComponent : pathEncoder)("" + value);
    if (index !== params.length && (value == null || typeof value === "object" && // handle values from other realms
    value.toString === Object.getPrototypeOf(Object.getPrototypeOf(value.hasOwnProperty ?? EMPTY) ?? EMPTY)?.toString)) {
      encoded = value + "";
      invalidSegments.push({
        start: previousValue.length + currentValue.length,
        length: encoded.length,
        error: `Value of type ${Object.prototype.toString.call(value).slice(8, -1)} is not a valid path parameter`
      });
    }
    return previousValue + currentValue + (index === params.length ? "" : encoded);
  }, "");
  const pathOnly = path3.split(/[?#]/, 1)[0];
  const invalidSegmentPattern = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let match;
  while ((match = invalidSegmentPattern.exec(pathOnly)) !== null) {
    invalidSegments.push({
      start: match.index,
      length: match[0].length,
      error: `Value "${match[0]}" can't be safely passed as a path parameter`
    });
  }
  invalidSegments.sort((a, b) => a.start - b.start);
  if (invalidSegments.length > 0) {
    let lastEnd = 0;
    const underline = invalidSegments.reduce((acc, segment) => {
      const spaces = " ".repeat(segment.start - lastEnd);
      const arrows = "^".repeat(segment.length);
      lastEnd = segment.start + segment.length;
      return acc + spaces + arrows;
    }, "");
    throw new CrosmosError(`Path parameters result in path with invalid segments:
${invalidSegments.map((e) => e.error).join("\n")}
${path3}
${underline}`);
  }
  return path3;
};
var path = /* @__PURE__ */ createPathTagFunction(encodeURIPath);

// node_modules/crosmos/resources/entities.mjs
var Entities = class extends APIResource {
  /**
   * List Entities
   */
  list(query, options) {
    return this._client.get("/api/v1/entities", { query, ...options });
  }
  /**
   * Get Entity
   */
  get(entityUuid, query, options) {
    return this._client.get(path`/api/v1/entities/${entityUuid}`, { query, ...options });
  }
};

// node_modules/crosmos/resources/health.mjs
var Health = class extends APIResource {
  /**
   * Health Check
   */
  check(options) {
    return this._client.get("/health", options);
  }
};

// node_modules/crosmos/resources/jobs.mjs
var Jobs = class extends APIResource {
  /**
   * Poll for ingestion job status.
   */
  getStatus(jobID, options) {
    return this._client.get(path`/api/v1/jobs/${jobID}`, options);
  }
};

// node_modules/crosmos/internal/headers.mjs
var brand_privateNullableHeaders = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* iterateHeaders(headers) {
  if (!headers)
    return;
  if (brand_privateNullableHeaders in headers) {
    const { values, nulls } = headers;
    yield* values.entries();
    for (const name of nulls) {
      yield [name, null];
    }
    return;
  }
  let shouldClear = false;
  let iter;
  if (headers instanceof Headers) {
    iter = headers.entries();
  } else if (isReadonlyArray(headers)) {
    iter = headers;
  } else {
    shouldClear = true;
    iter = Object.entries(headers ?? {});
  }
  for (let row of iter) {
    const name = row[0];
    if (typeof name !== "string")
      throw new TypeError("expected header name to be a string");
    const values = isReadonlyArray(row[1]) ? row[1] : [row[1]];
    let didClear = false;
    for (const value of values) {
      if (value === void 0)
        continue;
      if (shouldClear && !didClear) {
        didClear = true;
        yield [name, null];
      }
      yield [name, value];
    }
  }
}
var buildHeaders = (newHeaders) => {
  const targetHeaders = new Headers();
  const nullHeaders = /* @__PURE__ */ new Set();
  for (const headers of newHeaders) {
    const seenHeaders = /* @__PURE__ */ new Set();
    for (const [name, value] of iterateHeaders(headers)) {
      const lowerName = name.toLowerCase();
      if (!seenHeaders.has(lowerName)) {
        targetHeaders.delete(name);
        seenHeaders.add(lowerName);
      }
      if (value === null) {
        targetHeaders.delete(name);
        nullHeaders.add(lowerName);
      } else {
        targetHeaders.append(name, value);
        nullHeaders.delete(lowerName);
      }
    }
  }
  return { [brand_privateNullableHeaders]: true, values: targetHeaders, nulls: nullHeaders };
};

// node_modules/crosmos/resources/memories.mjs
var Memories = class extends APIResource {
  /**
   * List memories in a memory space.
   */
  list(query, options) {
    return this._client.get("/api/v1/memories", { query, ...options });
  }
  /**
   * Soft-delete a memory and cascade to all edges whose provenance is this memory.
   */
  delete(memoryUuid, params, options) {
    const { space_uuid } = params;
    return this._client.delete(path`/api/v1/memories/${memoryUuid}`, {
      query: { space_uuid },
      ...options,
      headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
    });
  }
  /**
   * Get a memory by UUID.
   */
  get(memoryUuid, query, options) {
    return this._client.get(path`/api/v1/memories/${memoryUuid}`, { query, ...options });
  }
};

// node_modules/crosmos/resources/search.mjs
var SearchResource = class extends APIResource {
  /**
   * Perform a search for relevant memories within a specified memory space.
   */
  hybrid(body, options) {
    return this._client.post("/api/v1/search", { body, ...options });
  }
};

// node_modules/crosmos/resources/sources.mjs
var Sources = class extends APIResource {
  /**
   * List sources in the caller's org, sorted by created_at desc.
   *
   * If space_id is provided, returns only sources in that space. Otherwise, returns
   * sources across all spaces in the org.
   */
  list(query = {}, options) {
    return this._client.get("/api/v1/sources", { query, ...options });
  }
  /**
   * Delete a source document by UUID.
   */
  delete(sourceUuid, params, options) {
    const { space_uuid } = params;
    return this._client.delete(path`/api/v1/sources/${sourceUuid}`, {
      query: { space_uuid },
      ...options,
      headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
    });
  }
  /**
   * Get a source by UUID.
   */
  get(sourceUuid, query, options) {
    return this._client.get(path`/api/v1/sources/${sourceUuid}`, { query, ...options });
  }
  /**
   * Upload raw content sources for ingestion into the knowledge graph. Each source
   * is a discrete content payload (text, markdown.) that will be processed by the
   * extraction pipeline.
   */
  ingest(body, options) {
    return this._client.post("/api/v1/sources", { body, ...options });
  }
};

// node_modules/crosmos/resources/spaces.mjs
var Spaces = class extends APIResource {
  /**
   * Create a new memory space within the caller's active organization.
   */
  create(body, options) {
    return this._client.post("/api/v1/spaces", { body, ...options });
  }
  /**
   * List memory spaces in the user's active organization.
   *
   * Pass `?name=` to resolve a space by its human-readable name (useful for
   * LLM/plugin flows that have a name but not the UUID).
   */
  list(query = {}, options) {
    return this._client.get("/api/v1/spaces", { query, ...options });
  }
  /**
   * Delete a memory space and all its contents (cascading).
   */
  delete(spaceUuid, options) {
    return this._client.delete(path`/api/v1/spaces/${spaceUuid}`, {
      ...options,
      headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
    });
  }
  /**
   * Get a memory space by UUID.
   */
  get(spaceUuid, options) {
    return this._client.get(path`/api/v1/spaces/${spaceUuid}`, options);
  }
};

// node_modules/crosmos/resources/usage.mjs
var UsageResource = class extends APIResource {
  /**
   * Return org-level usage for the active billing period and plan limits.
   */
  get(query = {}, options) {
    return this._client.get("/api/v1/usage", { query, ...options });
  }
};

// node_modules/crosmos/internal/utils/log.mjs
var levelNumbers = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
};
var parseLogLevel = (maybeLevel, sourceName, client) => {
  if (!maybeLevel) {
    return void 0;
  }
  if (hasOwn(levelNumbers, maybeLevel)) {
    return maybeLevel;
  }
  loggerFor(client).warn(`${sourceName} was set to ${JSON.stringify(maybeLevel)}, expected one of ${JSON.stringify(Object.keys(levelNumbers))}`);
  return void 0;
};
function noop() {
}
function makeLogFn(fnLevel, logger, logLevel) {
  if (!logger || levelNumbers[fnLevel] > levelNumbers[logLevel]) {
    return noop;
  } else {
    return logger[fnLevel].bind(logger);
  }
}
var noopLogger = {
  error: noop,
  warn: noop,
  info: noop,
  debug: noop
};
var cachedLoggers = /* @__PURE__ */ new WeakMap();
function loggerFor(client) {
  const logger = client.logger;
  const logLevel = client.logLevel ?? "off";
  if (!logger) {
    return noopLogger;
  }
  const cachedLogger = cachedLoggers.get(logger);
  if (cachedLogger && cachedLogger[0] === logLevel) {
    return cachedLogger[1];
  }
  const levelLogger = {
    error: makeLogFn("error", logger, logLevel),
    warn: makeLogFn("warn", logger, logLevel),
    info: makeLogFn("info", logger, logLevel),
    debug: makeLogFn("debug", logger, logLevel)
  };
  cachedLoggers.set(logger, [logLevel, levelLogger]);
  return levelLogger;
}
var formatRequestDetails = (details) => {
  if (details.options) {
    details.options = { ...details.options };
    delete details.options["headers"];
  }
  if (details.headers) {
    details.headers = Object.fromEntries((details.headers instanceof Headers ? [...details.headers] : Object.entries(details.headers)).map(([name, value]) => [
      name,
      name.toLowerCase() === "authorization" || name.toLowerCase() === "cookie" || name.toLowerCase() === "set-cookie" ? "***" : value
    ]));
  }
  if ("retryOfRequestLogID" in details) {
    if (details.retryOfRequestLogID) {
      details.retryOf = details.retryOfRequestLogID;
    }
    delete details.retryOfRequestLogID;
  }
  return details;
};

// node_modules/crosmos/internal/parse.mjs
async function defaultParseResponse(client, props) {
  const { response, requestLogID, retryOfRequestLogID, startTime } = props;
  const body = await (async () => {
    if (response.status === 204) {
      return null;
    }
    if (props.options.__binaryResponse) {
      return response;
    }
    const contentType = response.headers.get("content-type");
    const mediaType = contentType?.split(";")[0]?.trim();
    const isJSON = mediaType?.includes("application/json") || mediaType?.endsWith("+json");
    if (isJSON) {
      const contentLength = response.headers.get("content-length");
      if (contentLength === "0") {
        return void 0;
      }
      const json = await response.json();
      return json;
    }
    const text = await response.text();
    return text;
  })();
  loggerFor(client).debug(`[${requestLogID}] response parsed`, formatRequestDetails({
    retryOfRequestLogID,
    url: response.url,
    status: response.status,
    body,
    durationMs: Date.now() - startTime
  }));
  return body;
}

// node_modules/crosmos/core/api-promise.mjs
var _APIPromise_client;
var APIPromise = class _APIPromise extends Promise {
  constructor(client, responsePromise, parseResponse = defaultParseResponse) {
    super((resolve) => {
      resolve(null);
    });
    this.responsePromise = responsePromise;
    this.parseResponse = parseResponse;
    _APIPromise_client.set(this, void 0);
    __classPrivateFieldSet(this, _APIPromise_client, client, "f");
  }
  _thenUnwrap(transform) {
    return new _APIPromise(__classPrivateFieldGet(this, _APIPromise_client, "f"), this.responsePromise, async (client, props) => transform(await this.parseResponse(client, props), props));
  }
  /**
   * Gets the raw `Response` instance instead of parsing the response
   * data.
   *
   * If you want to parse the response body but still get the `Response`
   * instance, you can use {@link withResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
   * to your `tsconfig.json`.
   */
  asResponse() {
    return this.responsePromise.then((p) => p.response);
  }
  /**
   * Gets the parsed response data and the raw `Response` instance.
   *
   * If you just want to get the raw `Response` instance without parsing it,
   * you can use {@link asResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
   * to your `tsconfig.json`.
   */
  async withResponse() {
    const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
    return { data, response };
  }
  parse() {
    if (!this.parsedPromise) {
      this.parsedPromise = this.responsePromise.then((data) => this.parseResponse(__classPrivateFieldGet(this, _APIPromise_client, "f"), data));
    }
    return this.parsedPromise;
  }
  then(onfulfilled, onrejected) {
    return this.parse().then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return this.parse().catch(onrejected);
  }
  finally(onfinally) {
    return this.parse().finally(onfinally);
  }
};
_APIPromise_client = /* @__PURE__ */ new WeakMap();

// node_modules/crosmos/internal/utils/env.mjs
var readEnv = (env) => {
  if (typeof globalThis.process !== "undefined") {
    return globalThis.process.env?.[env]?.trim() || void 0;
  }
  if (typeof globalThis.Deno !== "undefined") {
    return globalThis.Deno.env?.get?.(env)?.trim() || void 0;
  }
  return void 0;
};

// node_modules/crosmos/client.mjs
var _Crosmos_instances;
var _a;
var _Crosmos_encoder;
var _Crosmos_baseURLOverridden;
var Crosmos = class {
  /**
   * API Client for interfacing with the Crosmos API.
   *
   * @param {string | undefined} [opts.apiKey=process.env['CROSMOS_API_KEY'] ?? undefined]
   * @param {string} [opts.baseURL=process.env['CROSMOS_BASE_URL'] ?? https://api.crosmos.dev] - Override the default base URL for the API.
   * @param {number} [opts.timeout=1 minute] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
   * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
   */
  constructor({ baseURL = readEnv("CROSMOS_BASE_URL"), apiKey = readEnv("CROSMOS_API_KEY"), ...opts } = {}) {
    _Crosmos_instances.add(this);
    _Crosmos_encoder.set(this, void 0);
    this.spaces = new Spaces(this);
    this.search = new SearchResource(this);
    this.sources = new Sources(this);
    this.memories = new Memories(this);
    this.entities = new Entities(this);
    this.conversations = new Conversations(this);
    this.jobs = new Jobs(this);
    this.usage = new UsageResource(this);
    this.health = new Health(this);
    if (apiKey === void 0) {
      throw new CrosmosError("The CROSMOS_API_KEY environment variable is missing or empty; either provide it, or instantiate the Crosmos client with an apiKey option, like new Crosmos({ apiKey: 'My API Key' }).");
    }
    const options = {
      apiKey,
      ...opts,
      baseURL: baseURL || `https://api.crosmos.dev`
    };
    this.baseURL = options.baseURL;
    this.timeout = options.timeout ?? _a.DEFAULT_TIMEOUT;
    this.logger = options.logger ?? console;
    const defaultLogLevel = "warn";
    this.logLevel = defaultLogLevel;
    this.logLevel = parseLogLevel(options.logLevel, "ClientOptions.logLevel", this) ?? parseLogLevel(readEnv("CROSMOS_LOG"), "process.env['CROSMOS_LOG']", this) ?? defaultLogLevel;
    this.fetchOptions = options.fetchOptions;
    this.maxRetries = options.maxRetries ?? 2;
    this.fetch = options.fetch ?? getDefaultFetch();
    __classPrivateFieldSet(this, _Crosmos_encoder, FallbackEncoder, "f");
    const customHeadersEnv = readEnv("CROSMOS_CUSTOM_HEADERS");
    if (customHeadersEnv) {
      const parsed = {};
      for (const line of customHeadersEnv.split("\n")) {
        const colon = line.indexOf(":");
        if (colon >= 0) {
          parsed[line.substring(0, colon).trim()] = line.substring(colon + 1).trim();
        }
      }
      options.defaultHeaders = { ...parsed, ...options.defaultHeaders };
    }
    this._options = options;
    this.apiKey = apiKey;
  }
  /**
   * Create a new client instance re-using the same options given to the current client with optional overriding.
   */
  withOptions(options) {
    const client = new this.constructor({
      ...this._options,
      baseURL: this.baseURL,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      logger: this.logger,
      logLevel: this.logLevel,
      fetch: this.fetch,
      fetchOptions: this.fetchOptions,
      apiKey: this.apiKey,
      ...options
    });
    return client;
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  validateHeaders({ values, nulls }) {
    return;
  }
  async authHeaders(opts) {
    return buildHeaders([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  /**
   * Basic re-implementation of `qs.stringify` for primitive types.
   */
  stringifyQuery(query) {
    return stringifyQuery(query);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${VERSION}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${uuid4()}`;
  }
  makeStatusError(status2, error, message, headers) {
    return APIError.generate(status2, error, message, headers);
  }
  buildURL(path2, query, defaultBaseURL) {
    const baseURL = !__classPrivateFieldGet(this, _Crosmos_instances, "m", _Crosmos_baseURLOverridden).call(this) && defaultBaseURL || this.baseURL;
    const url = isAbsoluteURL(path2) ? new URL(path2) : new URL(baseURL + (baseURL.endsWith("/") && path2.startsWith("/") ? path2.slice(1) : path2));
    const defaultQuery = this.defaultQuery();
    const pathQuery = Object.fromEntries(url.searchParams);
    if (!isEmptyObj(defaultQuery) || !isEmptyObj(pathQuery)) {
      query = { ...pathQuery, ...defaultQuery, ...query };
    }
    if (typeof query === "object" && query && !Array.isArray(query)) {
      url.search = this.stringifyQuery(query);
    }
    return url.toString();
  }
  /**
   * Used as a callback for mutating the given `FinalRequestOptions` object.
   */
  async prepareOptions(options) {
  }
  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  async prepareRequest(request, { url, options }) {
  }
  get(path2, opts) {
    return this.methodRequest("get", path2, opts);
  }
  post(path2, opts) {
    return this.methodRequest("post", path2, opts);
  }
  patch(path2, opts) {
    return this.methodRequest("patch", path2, opts);
  }
  put(path2, opts) {
    return this.methodRequest("put", path2, opts);
  }
  delete(path2, opts) {
    return this.methodRequest("delete", path2, opts);
  }
  methodRequest(method, path2, opts) {
    return this.request(Promise.resolve(opts).then((opts2) => {
      return { method, path: path2, ...opts2 };
    }));
  }
  request(options, remainingRetries = null) {
    return new APIPromise(this, this.makeRequest(options, remainingRetries, void 0));
  }
  async makeRequest(optionsInput, retriesRemaining, retryOfRequestLogID) {
    const options = await optionsInput;
    const maxRetries = options.maxRetries ?? this.maxRetries;
    if (retriesRemaining == null) {
      retriesRemaining = maxRetries;
    }
    await this.prepareOptions(options);
    const { req, url, timeout } = await this.buildRequest(options, {
      retryCount: maxRetries - retriesRemaining
    });
    await this.prepareRequest(req, { url, options });
    const requestLogID = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0");
    const retryLogStr = retryOfRequestLogID === void 0 ? "" : `, retryOf: ${retryOfRequestLogID}`;
    const startTime = Date.now();
    loggerFor(this).debug(`[${requestLogID}] sending request`, formatRequestDetails({
      retryOfRequestLogID,
      method: options.method,
      url,
      options,
      headers: req.headers
    }));
    if (options.signal?.aborted) {
      throw new APIUserAbortError();
    }
    const controller = new AbortController();
    const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
    const headersTime = Date.now();
    if (response instanceof globalThis.Error) {
      const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
      if (options.signal?.aborted) {
        throw new APIUserAbortError();
      }
      const isTimeout = isAbortError(response) || /timed? ?out/i.test(String(response) + ("cause" in response ? String(response.cause) : ""));
      if (retriesRemaining) {
        loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - ${retryMessage}`);
        loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (${retryMessage})`, formatRequestDetails({
          retryOfRequestLogID,
          url,
          durationMs: headersTime - startTime,
          message: response.message
        }));
        return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
      }
      loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - error; no more retries left`);
      loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (error; no more retries left)`, formatRequestDetails({
        retryOfRequestLogID,
        url,
        durationMs: headersTime - startTime,
        message: response.message
      }));
      if (isTimeout) {
        throw new APIConnectionTimeoutError();
      }
      throw new APIConnectionError({ cause: response });
    }
    const responseInfo = `[${requestLogID}${retryLogStr}] ${req.method} ${url} ${response.ok ? "succeeded" : "failed"} with status ${response.status} in ${headersTime - startTime}ms`;
    if (!response.ok) {
      const shouldRetry = await this.shouldRetry(response);
      if (retriesRemaining && shouldRetry) {
        const retryMessage2 = `retrying, ${retriesRemaining} attempts remaining`;
        await CancelReadableStream(response.body);
        loggerFor(this).info(`${responseInfo} - ${retryMessage2}`);
        loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage2})`, formatRequestDetails({
          retryOfRequestLogID,
          url: response.url,
          status: response.status,
          headers: response.headers,
          durationMs: headersTime - startTime
        }));
        return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID, response.headers);
      }
      const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;
      loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
      const errText = await response.text().catch((err2) => castToError(err2).message);
      const errJSON = safeJSON(errText);
      const errMessage = errJSON ? void 0 : errText;
      loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
        retryOfRequestLogID,
        url: response.url,
        status: response.status,
        headers: response.headers,
        message: errMessage,
        durationMs: Date.now() - startTime
      }));
      const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
      throw err;
    }
    loggerFor(this).info(responseInfo);
    loggerFor(this).debug(`[${requestLogID}] response start`, formatRequestDetails({
      retryOfRequestLogID,
      url: response.url,
      status: response.status,
      headers: response.headers,
      durationMs: headersTime - startTime
    }));
    return { response, options, controller, requestLogID, retryOfRequestLogID, startTime };
  }
  async fetchWithTimeout(url, init, ms, controller) {
    const { signal, method, ...options } = init || {};
    const abort = this._makeAbort(controller);
    if (signal)
      signal.addEventListener("abort", abort, { once: true });
    const timeout = setTimeout(abort, ms);
    const isReadableBody = globalThis.ReadableStream && options.body instanceof globalThis.ReadableStream || typeof options.body === "object" && options.body !== null && Symbol.asyncIterator in options.body;
    const fetchOptions = {
      signal: controller.signal,
      ...isReadableBody ? { duplex: "half" } : {},
      method: "GET",
      ...options
    };
    if (method) {
      fetchOptions.method = method.toUpperCase();
    }
    try {
      return await this.fetch.call(void 0, url, fetchOptions);
    } finally {
      clearTimeout(timeout);
    }
  }
  async shouldRetry(response) {
    const shouldRetryHeader = response.headers.get("x-should-retry");
    if (shouldRetryHeader === "true")
      return true;
    if (shouldRetryHeader === "false")
      return false;
    if (response.status === 408)
      return true;
    if (response.status === 409)
      return true;
    if (response.status === 429)
      return true;
    if (response.status >= 500)
      return true;
    return false;
  }
  async retryRequest(options, retriesRemaining, requestLogID, responseHeaders) {
    let timeoutMillis;
    const retryAfterMillisHeader = responseHeaders?.get("retry-after-ms");
    if (retryAfterMillisHeader) {
      const timeoutMs = parseFloat(retryAfterMillisHeader);
      if (!Number.isNaN(timeoutMs)) {
        timeoutMillis = timeoutMs;
      }
    }
    const retryAfterHeader = responseHeaders?.get("retry-after");
    if (retryAfterHeader && !timeoutMillis) {
      const timeoutSeconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1e3;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }
    if (timeoutMillis === void 0) {
      const maxRetries = options.maxRetries ?? this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
    }
    await sleep(timeoutMillis);
    return this.makeRequest(options, retriesRemaining - 1, requestLogID);
  }
  calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8;
    const numRetries = maxRetries - retriesRemaining;
    const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
    const jitter = 1 - Math.random() * 0.25;
    return sleepSeconds * jitter * 1e3;
  }
  async buildRequest(inputOptions, { retryCount = 0 } = {}) {
    const options = { ...inputOptions };
    const { method, path: path2, query, defaultBaseURL } = options;
    const url = this.buildURL(path2, query, defaultBaseURL);
    if ("timeout" in options)
      validatePositiveInteger("timeout", options.timeout);
    options.timeout = options.timeout ?? this.timeout;
    const { bodyHeaders, body } = this.buildBody({ options });
    const reqHeaders = await this.buildHeaders({ options: inputOptions, method, bodyHeaders, retryCount });
    const req = {
      method,
      headers: reqHeaders,
      ...options.signal && { signal: options.signal },
      ...globalThis.ReadableStream && body instanceof globalThis.ReadableStream && { duplex: "half" },
      ...body && { body },
      ...this.fetchOptions ?? {},
      ...options.fetchOptions ?? {}
    };
    return { req, url, timeout: options.timeout };
  }
  async buildHeaders({ options, method, bodyHeaders, retryCount }) {
    let idempotencyHeaders = {};
    if (this.idempotencyHeader && method !== "get") {
      if (!options.idempotencyKey)
        options.idempotencyKey = this.defaultIdempotencyKey();
      idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
    }
    const headers = buildHeaders([
      idempotencyHeaders,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(retryCount),
        ...options.timeout ? { "X-Stainless-Timeout": String(Math.trunc(options.timeout / 1e3)) } : {},
        ...getPlatformHeaders()
      },
      await this.authHeaders(options),
      this._options.defaultHeaders,
      bodyHeaders,
      options.headers
    ]);
    this.validateHeaders(headers);
    return headers.values;
  }
  _makeAbort(controller) {
    return () => controller.abort();
  }
  buildBody({ options: { body, headers: rawHeaders } }) {
    if (!body) {
      return { bodyHeaders: void 0, body: void 0 };
    }
    const headers = buildHeaders([rawHeaders]);
    if (
      // Pass raw type verbatim
      ArrayBuffer.isView(body) || body instanceof ArrayBuffer || body instanceof DataView || typeof body === "string" && // Preserve legacy string encoding behavior for now
      headers.values.has("content-type") || // `Blob` is superset of `File`
      globalThis.Blob && body instanceof globalThis.Blob || // `FormData` -> `multipart/form-data`
      body instanceof FormData || // `URLSearchParams` -> `application/x-www-form-urlencoded`
      body instanceof URLSearchParams || // Send chunked stream (each chunk has own `length`)
      globalThis.ReadableStream && body instanceof globalThis.ReadableStream
    ) {
      return { bodyHeaders: void 0, body };
    } else if (typeof body === "object" && (Symbol.asyncIterator in body || Symbol.iterator in body && "next" in body && typeof body.next === "function")) {
      return { bodyHeaders: void 0, body: ReadableStreamFrom(body) };
    } else if (typeof body === "object" && headers.values.get("content-type") === "application/x-www-form-urlencoded") {
      return {
        bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
        body: this.stringifyQuery(body)
      };
    } else {
      return __classPrivateFieldGet(this, _Crosmos_encoder, "f").call(this, { body, headers });
    }
  }
};
_a = Crosmos, _Crosmos_encoder = /* @__PURE__ */ new WeakMap(), _Crosmos_instances = /* @__PURE__ */ new WeakSet(), _Crosmos_baseURLOverridden = function _Crosmos_baseURLOverridden2() {
  return this.baseURL !== "https://api.crosmos.dev";
};
Crosmos.Crosmos = _a;
Crosmos.DEFAULT_TIMEOUT = 6e4;
Crosmos.CrosmosError = CrosmosError;
Crosmos.APIError = APIError;
Crosmos.APIConnectionError = APIConnectionError;
Crosmos.APIConnectionTimeoutError = APIConnectionTimeoutError;
Crosmos.APIUserAbortError = APIUserAbortError;
Crosmos.NotFoundError = NotFoundError;
Crosmos.ConflictError = ConflictError;
Crosmos.RateLimitError = RateLimitError;
Crosmos.BadRequestError = BadRequestError;
Crosmos.AuthenticationError = AuthenticationError;
Crosmos.InternalServerError = InternalServerError;
Crosmos.PermissionDeniedError = PermissionDeniedError;
Crosmos.UnprocessableEntityError = UnprocessableEntityError;
Crosmos.toFile = toFile;
Crosmos.Spaces = Spaces;
Crosmos.SearchResource = SearchResource;
Crosmos.Sources = Sources;
Crosmos.Memories = Memories;
Crosmos.Entities = Entities;
Crosmos.Conversations = Conversations;
Crosmos.Jobs = Jobs;
Crosmos.UsageResource = UsageResource;
Crosmos.Health = Health;

// src/lib/client.ts
function readCredentials() {
  try {
    return JSON.parse((0, import_node_fs.readFileSync)((0, import_node_path.join)((0, import_node_os.homedir)(), ".crosmos", "credentials.json"), "utf8"));
  } catch {
    return {};
  }
}
function getApiKey() {
  return process.env.CROSMOS_API_KEY || readCredentials().api_key;
}
function getClient() {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  const baseURL = process.env.CROSMOS_API_BASE_URL || readCredentials().base_url;
  return new Crosmos(baseURL ? { apiKey, baseURL } : { apiKey });
}

// src/lib/debug.ts
var import_node_fs2 = require("node:fs");
var import_node_os2 = require("node:os");
var import_node_path2 = require("node:path");
var enabled = !!process.env.CROSMOS_DEBUG && process.env.CROSMOS_DEBUG !== "0";
function debug(...parts) {
  if (!enabled) return;
  try {
    const line = `${(/* @__PURE__ */ new Date()).toISOString()} ${parts.map(String).join(" ")}
`;
    (0, import_node_fs2.appendFileSync)((0, import_node_path2.join)((0, import_node_os2.tmpdir)(), "crosmos-claude.log"), line);
  } catch {
  }
}

// src/memory/ingest.ts
var import_node_path4 = require("node:path");

// src/lib/config.ts
var import_node_fs3 = require("node:fs");
var import_node_os3 = require("node:os");
var import_node_path3 = require("node:path");
function dataDir() {
  return process.env.CLAUDE_PLUGIN_DATA || (0, import_node_path3.join)((0, import_node_os3.homedir)(), ".crosmos");
}
function storePath() {
  return (0, import_node_path3.join)(dataDir(), "store.json");
}
function readStore() {
  try {
    return JSON.parse((0, import_node_fs3.readFileSync)(storePath(), "utf8"));
  } catch {
    return {};
  }
}
function writeStore(store) {
  (0, import_node_fs3.mkdirSync)(dataDir(), { recursive: true });
  (0, import_node_fs3.writeFileSync)(storePath(), JSON.stringify(store, null, 2));
}

// src/lib/transcript.ts
var import_node_fs4 = require("node:fs");
var MAX_CHARS = 1500;
var MAX_TURNS = 30;
function readTurns(path2, sinceLine = 0) {
  let text;
  try {
    text = (0, import_node_fs4.readFileSync)(path2, "utf8");
  } catch {
    return { turns: [], lastLine: sinceLine };
  }
  const lines = text.split("\n");
  const lastLine = text.endsWith("\n") ? lines.length - 1 : lines.length;
  const turns = [];
  for (let i = sinceLine; i < lines.length; i++) {
    const raw = lines[i]?.trim();
    if (!raw) continue;
    let entry;
    try {
      entry = JSON.parse(raw);
    } catch {
      continue;
    }
    if (entry?.type !== "user" && entry?.type !== "assistant") continue;
    const content = extractText(entry.message?.content);
    if (content) turns.push({ role: entry.type, content: content.slice(0, MAX_CHARS) });
  }
  return { turns: turns.slice(-MAX_TURNS), lastLine };
}
function extractText(content) {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content.filter((b) => b?.type === "text" && typeof b.text === "string").map((b) => b.text).join("\n").trim();
  }
  return "";
}

// src/memory/space.ts
async function resolveSpaceId(client) {
  if (process.env.CROSMOS_SPACE_ID) return process.env.CROSMOS_SPACE_ID;
  const name = process.env.CROSMOS_SPACE_NAME;
  if (name) {
    const { spaces: spaces2 } = await client.spaces.list({ name });
    return spaces2[0]?.id ?? null;
  }
  const store = readStore();
  if (store.spaceId) return store.spaceId;
  const { spaces } = await client.spaces.list();
  const id = spaces[0]?.id;
  if (!id) return null;
  writeStore({ ...store, spaceId: id });
  return id;
}

// src/memory/ingest.ts
async function ingest(client, opts) {
  const store = readStore();
  const sinceLine = store.lastLine?.[opts.sessionId] ?? 0;
  const { turns, lastLine } = readTurns(opts.transcriptPath, sinceLine);
  const advance = () => writeStore({ ...store, lastLine: { ...store.lastLine, [opts.sessionId]: lastLine } });
  const substantial = turns.some((t) => t.content.split(/\s+/).length >= 4);
  if (!substantial) {
    debug("ingest: nothing substantial since line", sinceLine);
    advance();
    return;
  }
  const spaceId = await resolveSpaceId(client);
  if (!spaceId) {
    debug("ingest: no space");
    return;
  }
  const res = await client.conversations.ingest({
    space_id: spaceId,
    session_id: opts.sessionId,
    session_date: (/* @__PURE__ */ new Date()).toISOString(),
    messages: turns.map((t) => ({ role: t.role, content: t.content })),
    meta: { source: "claude-code", project: (0, import_node_path4.basename)(opts.cwd) }
  });
  debug("ingest:", `turns=${turns.length}`, JSON.stringify(res));
  advance();
}

// src/memory/recall.ts
var import_node_path5 = require("node:path");

// src/lib/git.ts
var import_node_child_process = require("node:child_process");
function gitBranch(cwd) {
  try {
    return (0, import_node_child_process.execFileSync)("git", ["branch", "--show-current"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 1e3
    }).trim();
  } catch {
    return "";
  }
}

// src/memory/recall.ts
var LIMIT = 6;
var RECENCY_BIAS = 0.6;
async function recall(client, cwd) {
  const spaceId = await resolveSpaceId(client);
  if (!spaceId) {
    debug("recall: no space");
    return "";
  }
  const query = buildQuery(cwd);
  const { candidates } = await client.search.hybrid({
    space_id: spaceId,
    query,
    limit: LIMIT,
    recency_bias: RECENCY_BIAS,
    diversify: true,
    include_source: false
  });
  debug("recall:", `query="${query}"`, `hits=${candidates?.length ?? 0}`);
  if (!candidates?.length) return "";
  const lines = candidates.map((c) => `- ${c.content.trim()}`).join("\n");
  return [
    "<crosmos-memory>",
    "Recalled context from past sessions. Reference it only when relevant \u2014 including indirect connections \u2014 but don't force it into your response or assume beyond what's stated.",
    "",
    lines,
    "</crosmos-memory>"
  ].join("\n");
}
function buildQuery(cwd) {
  const project = (0, import_node_path5.basename)(cwd);
  const topic = branchTopic(cwd);
  const focus = topic ? ` ${topic}` : "";
  return `recent work, decisions, and preferences for the ${project} project${focus}`;
}
function branchTopic(cwd) {
  const branch = gitBranch(cwd);
  if (!branch || branch === "main" || branch === "master") return "";
  const words = branch.replace(/^[^/]+\//, "").replace(/[-_/]+/g, " ").trim();
  return /[a-z]{3,}/i.test(words) ? words : "";
}

// src/memory/save.ts
var import_node_path6 = require("node:path");
async function save(client, text, cwd) {
  const spaceId = await resolveSpaceId(client);
  if (!spaceId) return "No memory space configured.";
  await client.sources.ingest({
    space_id: spaceId,
    sources: [
      {
        content: text,
        content_type: "text",
        meta: { source: "claude-code", project: (0, import_node_path6.basename)(cwd) }
      }
    ]
  });
  return "Saved to Crosmos memory.";
}

// src/memory/search.ts
async function search(client, query) {
  const spaceId = await resolveSpaceId(client);
  if (!spaceId) return "No memory space configured.";
  const { candidates } = await client.search.hybrid({
    space_id: spaceId,
    query,
    limit: 10,
    include_source: true
  });
  if (!candidates?.length) return "No relevant memories found.";
  return candidates.map((c, i) => `${i + 1}. ${c.content.trim()}`).join("\n\n");
}

// src/main.ts
async function readPayload() {
  try {
    const chunks = [];
    for await (const c of process.stdin) chunks.push(c);
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    return {};
  }
}
function setup(key) {
  const dir = (0, import_node_path7.join)((0, import_node_os4.homedir)(), ".crosmos");
  (0, import_node_fs5.mkdirSync)(dir, { recursive: true, mode: 448 });
  const file = (0, import_node_path7.join)(dir, "credentials.json");
  let creds = {};
  try {
    creds = JSON.parse((0, import_node_fs5.readFileSync)(file, "utf8"));
  } catch {
  }
  creds.api_key = key;
  (0, import_node_fs5.writeFileSync)(file, JSON.stringify(creds, null, 2), { mode: 384 });
  process.stdout.write("api key saved to ~/.crosmos/credentials.json\n");
}
async function status() {
  const client = getClient();
  if (!client) {
    process.stdout.write("no api key \u2014 set CROSMOS_API_KEY or run /crosmos:setup <key>\n");
    return;
  }
  try {
    const spaceId = await resolveSpaceId(client);
    process.stdout.write(
      spaceId ? `connected \u2014 space ${spaceId}
` : "api key ok, no space found\n"
    );
  } catch (e) {
    debug("status error", e);
    process.stdout.write("api key set, but the api is unreachable\n");
  }
}
async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === "setup") {
    if (rest[0]) setup(rest[0]);
    else process.stderr.write("usage: crosmos setup <api-key>\n");
    return;
  }
  if (cmd === "status") return status();
  const client = getClient();
  if (!client) {
    debug(cmd, "skipped: no api key");
    return;
  }
  if (cmd === "recall") {
    const p = await readPayload();
    const out = await recall(client, p.cwd || process.cwd());
    if (out) process.stdout.write(out);
    return;
  }
  if (cmd === "ingest") {
    const p = await readPayload();
    if (p.transcript_path && p.session_id) {
      await ingest(client, {
        transcriptPath: p.transcript_path,
        sessionId: p.session_id,
        cwd: p.cwd || process.cwd()
      });
    }
    return;
  }
  if (cmd === "search") return void process.stdout.write(await search(client, rest.join(" ")));
  if (cmd === "save")
    return void process.stdout.write(await save(client, rest.join(" "), process.cwd()));
}
main().catch((e) => {
  debug("fatal", e);
  process.exit(0);
});
