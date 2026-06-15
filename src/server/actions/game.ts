"use server";

import { simulateBattle } from "@/domain/battle";
import { redeemInvite } from "@/domain/beta";
import { betaInvites, mockProfiles } from "@/mocks/battle-git";

export async function startTrainingBattle() {
  return simulateBattle(mockProfiles[0], mockProfiles[1], { seed: 847, mode: "training" });
}

export async function startArenaBattle() {
  return simulateBattle(mockProfiles[0], mockProfiles[1], { seed: 1201, mode: "arena" });
}

export async function redeemBetaInvite(input: string | FormData) {
  const rawCode =
    typeof input === "string" ? input : input.get("code")?.toString() ?? "";
  const normalized = rawCode.trim().toUpperCase();
  const invite = betaInvites.find((item) => item.code === normalized);
  return redeemInvite(invite, "current-user");
}

export async function redeemBetaInviteForm(formData: FormData) {
  await redeemBetaInvite(formData);
}

export async function syncGitHubProfile() {
  return {
    ok: true,
    status: "mocked",
    message: "Mock sync complete. Real GitHub sync is wired in a later phase.",
  };
}

export async function excludeRepository(repoId: string) {
  return {
    ok: true,
    repoId,
    status: "mocked",
    message: "Repository exclusion will persist once DB-backed profiles are enabled.",
  };
}
