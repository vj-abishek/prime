export function compressCode(code: string): string {
  return btoa(encodeURIComponent(code));
}

export function decompressCode(compressedCode: string): string {
  return decodeURIComponent(atob(compressedCode));
} 