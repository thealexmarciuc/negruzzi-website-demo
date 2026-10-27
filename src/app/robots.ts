import type { MetadataRoute } from 'next'

// The demo must never be indexed: it mirrors a real school's content.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', disallow: '/' } }
}
