export const CACHE_REVALIDATE_SECONDS = 300;
export const LANDING_ARMY_REVALIDATE_SECONDS = 60 * 60 * 24 * 3;
export const ARENA_USERS_CACHE_TAG = "arena:users";
export const LANDING_TOP_ARMY_CACHE_TAG = "landing:top-army";

export function armyCacheTag(userId: string) {
  return `army:${userId}`;
}

export function profileCacheTag(userId: string) {
  return `profile:${userId}`;
}
