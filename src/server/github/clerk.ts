import { clerkClient } from "@clerk/nextjs/server";
import type { ExternalAccount, User } from "@clerk/nextjs/server";

export function getGitHubExternalAccount(user: User | null): ExternalAccount | null {
  if (!user) return null;

  return (
    user.externalAccounts.find((account) => account.provider.toLowerCase().includes("github")) ??
    null
  );
}

export function getGitHubUsername(user: User | null) {
  const github = getGitHubExternalAccount(user);
  return github?.username ?? null;
}

export async function getGitHubOauthAccessToken(userId: string) {
  const client = await clerkClient();
  const response = await client.users.getUserOauthAccessToken(userId, "github");

  return response.data[0]?.token ?? null;
}
