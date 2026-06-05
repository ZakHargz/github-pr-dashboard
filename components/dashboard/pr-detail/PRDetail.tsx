'use client'

import type { GitHubPRDetail, GitHubReview, GitHubComment } from '@/lib/github'
import { LoadingSpinner } from '@/components/icons'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PRHeader } from './PRHeader'
import { Section } from './Section'
import { MarkdownBody } from './MarkdownBody'
import { ReviewItem } from './ReviewItem'
import { ReviewThread } from './ReviewThread'
import { CommentItem } from './CommentItem'

interface PRDetailProps {
  pr: GitHubPRDetail | null
  loading: boolean
  error: string | null
}

export default function PRDetail({ pr, loading, error }: PRDetailProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground">
        <LoadingSpinner />
        <span className="ml-2.5 text-sm">Loading…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="max-w-sm text-center px-6">
          <p className="text-sm font-medium text-destructive">Failed to load</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!pr) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <p className="text-sm text-muted-foreground">Select a pull request</p>
      </div>
    )
  }

  const latestReviews = dedupeReviews(pr.reviews)
  const threads = buildThreads(pr.reviewComments)

  return (
    <ScrollArea className="flex-1">
      <div className="max-w-3xl mx-auto px-6 py-8 w-full">
        <PRHeader pr={pr} />

        {pr.body && (
          <Section title="Description">
            <div className="rounded-lg bg-muted/40 border border-border px-4 py-3">
              <MarkdownBody content={pr.body} />
            </div>
          </Section>
        )}

        {latestReviews.length > 0 && (
          <Section title="Reviews">
            <div className="space-y-2">
              {latestReviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>
          </Section>
        )}

        {threads.length > 0 && (
          <Section title={`Review Threads · ${threads.length}`}>
            <div className="space-y-3">
              {threads.map((thread, i) => (
                <ReviewThread key={i} thread={thread} />
              ))}
            </div>
          </Section>
        )}

        {pr.issueComments.length > 0 && (
          <Section title={`Comments · ${pr.issueComments.length}`}>
            <div className="space-y-2">
              {pr.issueComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          </Section>
        )}

        {pr.issueComments.length === 0 && pr.reviews.length === 0 && pr.reviewComments.length === 0 && (
          <p className="text-sm text-muted-foreground mt-4">No reviews or comments yet.</p>
        )}
      </div>
    </ScrollArea>
  )
}

/* ── Helpers ────────────────────────────────────────────────── */

/** Deduplicate reviews to the latest submission per reviewer, excluding PENDING. */
function dedupeReviews(reviews: GitHubReview[]): GitHubReview[] {
  const map = new Map<string, GitHubReview>()
  for (const review of reviews) {
    if (review.state === 'PENDING') continue
    const existing = map.get(review.user.login)
    if (!existing || new Date(review.submitted_at) > new Date(existing.submitted_at)) {
      map.set(review.user.login, review)
    }
  }
  return Array.from(map.values())
}

/** Group review comments into threads: [rootComment, ...replies]. */
function buildThreads(comments: GitHubComment[]): GitHubComment[][] {
  const roots: GitHubComment[] = []
  const replyMap = new Map<number, GitHubComment[]>()
  for (const comment of comments) {
    if (comment.in_reply_to_id) {
      const list = replyMap.get(comment.in_reply_to_id) ?? []
      list.push(comment)
      replyMap.set(comment.in_reply_to_id, list)
    } else {
      roots.push(comment)
    }
  }
  return roots.map((root) => [root, ...(replyMap.get(root.id) ?? [])])
}
