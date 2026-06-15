package org.cloud.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.cloud.dto.RECIPE_IMAGE;
import java.util.List;

@Mapper
public interface RecipeImageMapper {
    // 1. 레시피 이미지 등록
    int insertRecipeImage(RECIPE_IMAGE recipeImage);

    // 2. 특정 레시피의 모든 이미지 조회 (순서대로)
    List<RECIPE_IMAGE> getImagesByRecipeCode(String recipeCode);

    // 3. 특정 레시피의 이미지 전체 삭제 (수정 시 유용)
    int deleteImagesByRecipeCode(String recipeCode);
}