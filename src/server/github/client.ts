export type GitHubRepository = {
  id: number;
  name: string;
  language: string | null;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  pushed_at: string | null;
};

function parseLastPageFromLinkHeader(linkHeader: string | null) {
  if (!linkHeader) return null;
  const match = linkHeader.match(/[?&]page=(\d+)>;\s*rel="last"/);
  return match ? Number(match[1]) : null;
}

async function getGitHubErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ? `: ${body.message}` : "";
  } catch {
    return "";
  }
}

export async function fetchPublicRepositories(
  username: string,
  token?: string,
  options: { fresh?: boolean } = {},
) {
  const response = await fetch(`https://api.github.com/users/${username}/repos?type=owner&sort=updated`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(options.fresh ? { cache: "no-store" as const } : { next: { revalidate: 300 } }),
  });

  if (!response.ok) {
    const detail = await getGitHubErrorMessage(response);
    throw new Error(`GitHub repository fetch failed with ${response.status}${detail}.`);
  }

  return (await response.json()) as GitHubRepository[];
}

export async function fetchRepositoryCommitCount(
  username: string,
  repoName: string,
  token?: string,
) {
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/commits?per_page=1`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    },
  );

  if (!response.ok) return 0;

  const lastPage = parseLastPageFromLinkHeader(response.headers.get("link"));
  if (lastPage) return lastPage;

  const commits = (await response.json()) as unknown[];
  return commits.length;
}

export async function fetchRepositoryCommitCounts(
  username: string,
  repositories: GitHubRepository[],
  token?: string,
) {
  const entries = await Promise.all(
    repositories.map(async (repo) => [
      repo.id,
      await fetchRepositoryCommitCount(username, repo.name, token).catch(() => 0),
    ] as const),
  );

  return new Map(entries);
}
