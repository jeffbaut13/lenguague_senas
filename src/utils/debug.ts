const DEBUG_PREFIX = "[avatar-debug]";

export function debugLog(message: string, ...details: unknown[]): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.debug(DEBUG_PREFIX, message, ...details);
}

export function debugWarn(message: string, ...details: unknown[]): void {
  console.warn(DEBUG_PREFIX, message, ...details);
}
