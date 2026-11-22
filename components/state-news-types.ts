export type StateNewsItem = {
  title: string
  link: string
  source: string
  publishedAt: string
  summary: string
}

export type StateNewsPayload = {
  items: StateNewsItem[]
  updatedAt: string
}
