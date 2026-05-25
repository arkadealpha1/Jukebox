export function formatResponse(data: unknown, message?: string) {
  return {
    success: true,
    data,
    ...(message ? { message } : {}),
  }
}

export function formatError(message: string, code?: string, details?: unknown) {
  return {
    success: false,
    error: {
      message,
      ...(code ? { code } : {}),
      ...(details ? { details } : {}),
    },
  }
}

export function sanitizeInput(str: string): string {
  return str
    .replace(/[<>&"']/g, (char) => {
      switch (char) {
        case '<': return '&lt;'
        case '>': return '&gt;'
        case '&': return '&amp;'
        case '"': return '&quot;'
        case "'": return '&#x27;'
        default: return char
      }
    })
    .trim()
}

export function isDev(): boolean {
  return (process.env.NODE_ENV || 'development') === 'development'
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
