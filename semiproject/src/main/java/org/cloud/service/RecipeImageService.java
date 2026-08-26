package org.cloud.service;

import java.util.List;

import org.cloud.dto.RECIPE_IMAGE;
import org.cloud.mapper.RecipeImageMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecipeImageService {

    private final RecipeImageMapper recipeImageMapper;

    @Transactional
    public void addRecipeImages(List<RECIPE_IMAGE> imageList) {
        for (RECIPE_IMAGE img : imageList) {
            if (recipeImageMapper.insertRecipeImage(img) == 0) {
                throw new IllegalStateException("레시피 이미지 등록에 실패했습니다.");
            }
        }
    }

    public List<RECIPE_IMAGE> getRecipeImages(String recipeCode) {
        return recipeImageMapper.getImagesByRecipeCode(recipeCode);
    }

    @Transactional
    public void updateRecipeImages(String recipeCode, List<RECIPE_IMAGE> newImageList) {
        // 1. 기존 이미지 정보 삭제
        recipeImageMapper.deleteImagesByRecipeCode(recipeCode);
        
        // 2. 새 이미지 정보 등록
        if (newImageList != null && !newImageList.isEmpty()) {
            for (RECIPE_IMAGE img : newImageList) {
                if (recipeImageMapper.insertRecipeImage(img) == 0) {
                    throw new IllegalStateException("레시피 이미지 변경에 실패했습니다.");
                }
            }
        }
    }
}
