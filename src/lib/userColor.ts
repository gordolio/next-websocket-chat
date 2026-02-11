function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getUserColor(username: string): string {
  const hue = hashString(username) % 360;
  return `hsl(${hue}, 70%, 72%)`;
}
