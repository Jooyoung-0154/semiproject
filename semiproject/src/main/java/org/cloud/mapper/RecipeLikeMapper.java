package org.cloud.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.cloud.dto.Recipe_Info;

import java.util.List;

@Mapper
public interface RecipeLikeMapper {
    int insertLike(@Param("userId") String userId, @Param("recipeCode") String recipeCode);
    int incrementLikeCount(@Param("recipeCode") String recipeCode);
    int deleteLike(@Param("userId") String userId, @Param("recipeCode") String recipeCode);
    int decrementLikeCount(@Param("recipeCode") String recipeCode);
    int checkLikeExist(@Param("userId") String userId, @Param("recipeCode") String recipeCode);
    int getLikeCount(@Param("recipeCode") String recipeCode);
    List<String> getLikedRecipeIdsByUser(@Param("userId") String userId);
    List<Recipe_Info> getLikedRecipesByUser(@Param("userId") String userId);
    String getRecipeWriterId(@Param("recipeCode") String recipeCode);
}
