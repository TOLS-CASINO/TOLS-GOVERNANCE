export interface Segment {
  id: string; name: string; description?: string; rules: string; playerCount: number; isDynamic: boolean; color: string; players?: unknown[]; promotions?: unknown[]
}
