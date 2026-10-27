import type { Access } from 'payload'

export const anyone: Access = () => true

export const signedIn: Access = ({ req }) => Boolean(req.user)

// Visitors see published content only; staff see drafts too.
export const publishedOrSignedIn: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}
