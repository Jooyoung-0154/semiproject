package org.cloud.service;

import java.util.List;

import org.cloud.dto.RECIPE_IMAGE;
import org.cloud.mapper.RecipeImageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecipeImageService {

    @Autowired
    private RecipeImageMapper recipeImageMapper;

    @Transactional
    public void addRecipeImages(List<RECIPE_IMAGE> imageList) {
        for (RECIPE_IMAGE img : imageList) {
            recipeImageMapper.insertRecipeImage(img);
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
                recipeImageMapper.insertRecipeImage(img);
            }
        }
    }
}