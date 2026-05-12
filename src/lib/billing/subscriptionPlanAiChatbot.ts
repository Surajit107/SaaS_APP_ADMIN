/**
 * Mirrors `backend/src/billing/utils/subscription-plan-ai-chatbot.util.ts`.
 * Catalog AI-assistant controls apply only to Pro / Enterprise marketing tiers.
 */
const AI_ELIGIBLE_TIERS = ['pro', 'enterprise'] as const;

function matchesTierPrefix(planName: string, tier: (typeof AI_ELIGIBLE_TIERS)[number]): boolean {
  const n = planName.trim().toLowerCase();
  return n === tier || n.startsWith(`${tier} `) || n.startsWith(`${tier}-`);
}

export function isPlanNameAiChatbotTier(planName: string): boolean {
  if (planName.trim().length === 0) {
    return false;
  }
  return AI_ELIGIBLE_TIERS.some((tier) => matchesTierPrefix(planName, tier));
}
