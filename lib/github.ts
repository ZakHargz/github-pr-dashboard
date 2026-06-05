export interface GitHubUser {
  login: string
  avatar_url: string
  html_url: string
}

export interface GitHubLabel {
  id: number
  name: string
  color: string
}

export interface GitHubPR {
  id: number
  number: number
  title: string
  body: string | null
  state: string
  html_url: string
  created_at: string
  updated_at: string
  draft: boolean
  user: GitHubUser
  requested_reviewers: GitHubUser[]
  labels: GitHubLabel[]
  head: { ref: string; sha: string }
  base: { ref: string }
  mergeable_state?: string
  additions?: number
  deletions?: number
  changed_files?: number
  repo: string // injected - "owner/repo"
}

export interface GitHubReview {
  id: number
  user: GitHubUser
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING'
  submitted_at: string
  body: string
  html_url: string
}

export interface GitHubComment {
  id: number
  user: GitHubUser
  body: string
  created_at: string
  html_url: string
  // Review comments have these additional fields
  path?: string
  line?: number
  diff_hunk?: string
  in_reply_to_id?: number
}

export interface GitHubPRDetail extends GitHubPR {
  issueComments: GitHubComment[]
  reviews: GitHubReview[]
  reviewComments: GitHubComment[]
}

/** Thrown when the org requires SAML SSO authorization for the token. */
export class GitHubSAMLError extends Error {
  constructor(public readonly org: string) {
    super(`SAML SSO authorization required for "${org}"`)
    this.name = 'GitHubSAMLError'
  }
}

interface GitHubErrorBody {
  message?: string
  status?: string | number
}

async function githubFetch(token: string, path: string): Promise<Response> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!res.ok) {
    const body: GitHubErrorBody = await res.json().catch(() => ({}))
    if (
      res.status === 403 &&
      typeof body.message === 'string' &&
      body.message.includes('SAML enforcement')
    ) {
      // Extract org from the path: /repos/{owner}/{name}/...
      const orgMatch = path.match(/^\/repos\/([^/]+)\//)
      const org = orgMatch ? orgMatch[1] : 'this organization'
      throw new GitHubSAMLError(org)
    }
    throw new Error(body.message ?? `GitHub API error ${res.status}`)
  }
  return res
}

export async function fetchOpenPRs(token: string, repo: string): Promise<GitHubPR[]> {
  const [owner, name] = repo.split('/')
  if (!owner || !name) throw new Error(`Invalid repo format: "${repo}" — expected "owner/repo"`)

  const res = await githubFetch(token, `/repos/${owner}/${name}/pulls?state=open&per_page=100`)
  const prs: GitHubPR[] = await res.json()
  return prs.map((pr) => ({ ...pr, repo }))
}

export async function fetchPRDetail(token: string, repo: string, prNumber: number): Promise<GitHubPRDetail> {
  const [owner, name] = repo.split('/')

  const [prRes, commentsRes, reviewsRes, reviewCommentsRes] = await Promise.all([
    githubFetch(token, `/repos/${owner}/${name}/pulls/${prNumber}`),
    githubFetch(token, `/repos/${owner}/${name}/issues/${prNumber}/comments?per_page=100`),
    githubFetch(token, `/repos/${owner}/${name}/pulls/${prNumber}/reviews?per_page=100`),
    githubFetch(token, `/repos/${owner}/${name}/pulls/${prNumber}/comments?per_page=100`),
  ])

  const [pr, issueComments, reviews, reviewComments] = await Promise.all([
    prRes.json() as Promise<GitHubPR>,
    commentsRes.json() as Promise<GitHubComment[]>,
    reviewsRes.json() as Promise<GitHubReview[]>,
    reviewCommentsRes.json() as Promise<GitHubComment[]>,
  ])

  return { ...pr, repo, issueComments, reviews, reviewComments }
}

export async function validateToken(token: string): Promise<GitHubUser> {
  const res = await githubFetch(token, '/user')
  return res.json()
}

/* ── CI / check-run status ────────────────────────────────── */

export type CIStatus = 'success' | 'failure' | 'pending' | 'neutral'

export async function fetchCIStatus(
  token: string, repo: string, sha: string,
): Promise<CIStatus | null> {
  const [owner, name] = repo.split('/')
  try {
    const res = await githubFetch(token, `/repos/${owner}/${name}/commits/${sha}/check-runs?per_page=100`)
    const data = await res.json() as { check_runs: Array<{ status: string; conclusion: string | null }> }
    const runs = data.check_runs
    if (runs.length === 0) return null
    if (runs.some(r => r.status === 'in_progress' || r.status === 'queued')) return 'pending'
    if (runs.some(r => ['failure', 'action_required', 'timed_out'].includes(r.conclusion ?? ''))) return 'failure'
    if (runs.some(r => r.conclusion === 'success')) return 'success'
    return 'neutral'
  } catch {
    return null
  }
}

/* ── Review summary ───────────────────────────────────────── */

export interface ReviewSummary {
  approved: number
  changesRequested: number
}

export async function fetchReviewSummary(
  token: string, repo: string, prNumber: number,
): Promise<ReviewSummary> {
  const [owner, name] = repo.split('/')
  const res = await githubFetch(token, `/repos/${owner}/${name}/pulls/${prNumber}/reviews?per_page=100`)
  const reviews = await res.json() as GitHubReview[]

  // Latest non-trivial state per reviewer (COMMENTED / PENDING don't change review state)
  const latestByUser = new Map<string, { state: string; at: number }>()
  for (const r of reviews) {
    if (r.state === 'PENDING' || r.state === 'COMMENTED') continue
    const at = new Date(r.submitted_at).getTime()
    const existing = latestByUser.get(r.user.login)
    if (!existing || at > existing.at) {
      latestByUser.set(r.user.login, { state: r.state, at })
    }
  }

  let approved = 0, changesRequested = 0
  for (const { state } of latestByUser.values()) {
    if (state === 'APPROVED') approved++
    else if (state === 'CHANGES_REQUESTED') changesRequested++
  }
  return { approved, changesRequested }
}
