import likeService from '../service/likeService';
import { Recipe_Info } from '../types/type';

export async function applyLikedStatus(
  recipes: Recipe_Info[],
  userId: string | undefined,
): Promise<Recipe_Info[]> {
  if (!userId || recipes.length === 0) return recipes;
  try {
    const likedIds = await likeService.getMyLikes(userId);
    const likedSet = new Set(likedIds);
    return recipes.map((r) => ({ ...r, liked: likedSet.has(r.recipeId) }));
  } catch {
    return recipes;
  }
}
