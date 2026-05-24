function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function avatarColor(id: string): { fill: string; ink: string } {
  const h = hashString(id)
  const hue = h % 360
  return {
    fill: `oklch(0.78 0.09 ${hue})`,
    ink: `oklch(0.22 0.04 ${hue})`,
  }
}
