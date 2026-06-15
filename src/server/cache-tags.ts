export const CACHE_REVALIDATE_SECONDS = 300;
export const ARENA_USERS_CACHE_TAG = "arena:users";

export function armyCacheTag(userId: string) {
  return `army:${userId}`;
}

export function profileCacheTag(userId: string) {
  return `profile:${userId}`;
}
