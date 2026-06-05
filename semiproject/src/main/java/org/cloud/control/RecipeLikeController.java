package org.cloud.control;

import java.util.List;
import java.util.Map;

import org.cloud.dto.Recipe_Info;
import org.cloud.service.RecipeLikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/like")
public class RecipeLikeController {

    @Autowired
    private RecipeLikeService recipeLikeService;

    /**
     * 좋아요 토글
     * POST /api/like/toggle
     * body: { "userId": "...", "recipeCode": "..." }
     * return: { "liked": true/false, "likeCount": 5 }
     */
    @PostMapping("/toggle")
    public Map<String, Object> toggle(@RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        String recipeCode = body.get("recipeCode");
        return recipeLikeService.toggleLike(userId, recipeCode);
    }

    /**
     * 유저가 좋아요한 레시피 ID 목록
     * GET /api/like/my/{userId}
     * return: ["recipeId1", "recipeId2", ...]
     */
    @GetMapping("/my/{userId}")
    public List<String> getMyLikes(@PathVariable String userId) {
        return recipeLikeService.getLikedRecipeIds(userId);
    }
    
    @GetMapping("/my-recipes/{userId}")
    public List<Recipe_Info> getMyLikedRecipes(@PathVariable String userId) {
        return recipeLikeService.getLikedRecipes(userId);
    }
}
