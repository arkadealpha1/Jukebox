const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 6

export function generateRoomCode(): string {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * CHARSET.length)
    code += CHARSET[randomIndex]
  }
  return code
}

export function isValidRoomCode(code: string): boolean {
  if (code.length !== CODE_LENGTH) return false
  return [...code].every((char) => CHARSET.includes(char))
}
