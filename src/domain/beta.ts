export type BetaInvite = {
  code: string;
  maxUses: number;
  usedBy: string[];
};

export function redeemInvite(invite: BetaInvite | undefined, userId: string) {
  if (!invite) return { ok: false, message: "Codigo beta inexistente." };
  if (invite.usedBy.includes(userId)) return { ok: true, message: "Acceso beta ya estaba activo." };
  if (invite.usedBy.length >= invite.maxUses) return { ok: false, message: "Codigo beta agotado." };

  return { ok: true, message: "Acceso beta activado." };
}
