package org.cloud.service;

import org.cloud.mapper.RecipeLikeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.cloud.dto.Recipe_Info;

import java.util.List;
import java.util.Map;

@Service
public class RecipeLikeService {

    @Autowired
    private RecipeLikeMapper recipeLikeMapper;

    @Autowired
    private NotificationService notificationService;

    @Transactional
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

            try {
                String writerId = recipeLikeMapper.getRecipeWriterId(recipeCode);
                notificationService.createNotification(
                        writerId,
                        userId,
                        "RECIPE_LIKE",
                        recipeCode,
                        userId + "님이 회원님의 레시피를 좋아합니다."
                );
            } catch (Exception e) {
                System.out.println("레시피 좋아요 알림 저장 실패: " + e.getMessage());
            }
        }
        int likeCount = recipeLikeMapper.getLikeCount(recipeCode);
        return Map.of("liked", isLiked, "likeCount", likeCount);
    }

    public List<String> getLikedRecipeIds(String userId) {
        return recipeLikeMapper.getLikedRecipeIdsByUser(userId);
    }

    public List<Recipe_Info> getLikedRecipes(String userId) {
        return recipeLikeMapper.getLikedRecipesByUser(userId);
    }
}
