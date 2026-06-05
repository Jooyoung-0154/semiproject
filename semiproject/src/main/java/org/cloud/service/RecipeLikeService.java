package org.cloud.service;

import org.cloud.mapper.RecipeLikeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.cloud.dto.Recipe_Info;

import java.util.List;
import java.util.Map;

@Service
public class RecipeLikeService {

	@Autowired
	private RecipeLikeMapper recipeLikeMapper;

	/** 좋아요 토글 - liked(현재 상태), likeCount 반환 */
	public Map<String, Object> toggleLike(String userId, String recipeCode) {
		boolean isLiked;
		if (recipeLikeMapper.checkLikeExist(userId, recipeCode) > 0) {
			recipeLikeMapper.deleteLike(userId, recipeCode);
			recipeLikeMapper.decrementLikeCount(recipeCode);
			isLiked = false;
		} else {
			recipeLikeMapper.insertLike(userId, recipeCode);
			recipeLikeMapper.incrementLikeCount(recipeCode);
			isLiked = true;
		}
		int likeCount = recipeLikeMapper.getLikeCount(recipeCode);
		return Map.of("liked", isLiked, "likeCount", likeCount);
	}

	/** 유저가 좋아요한 레시피 ID 목록 */
	public List<String> getLikedRecipeIds(String userId) {
	    return recipeLikeMapper.getLikedRecipeIdsByUser(userId);
	}
	
	public List<Recipe_Info> getLikedRecipes(String userId) {
		return recipeLikeMapper.getLikedRecipesByUser(userId);
	}
}
