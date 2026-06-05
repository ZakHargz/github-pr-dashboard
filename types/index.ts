export interface RepoError {
  repo: string
  message: string
  isSAML: boolean
  samlOrg?: string
}

export type AppView = 'loading' | 'settings' | 'dashboard'
