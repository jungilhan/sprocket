export interface Step {
  name: string;
  duration: number;
  description: string;
}

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined' || !navigator.userAgent) return false;
  const userAgent = navigator.userAgent;
  return /Mobi|Android|iPhone|iPad/.test(userAgent);
}
