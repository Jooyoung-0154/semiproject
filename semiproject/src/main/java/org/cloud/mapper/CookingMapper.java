package org.cloud.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.cloud.dto.Cooking_Info;
import org.cloud.dto.Irdnt_Info;
import org.cloud.dto.Recipe;

@Mapper
public interface CookingMapper {
    // 부모 데이터(기본 정보) 저장
    void insertRecipeList(@Param("list") List<Recipe> recipeList);
    
    // 자식 데이터(요리 과정) 저장
    void insertCookingInfoList(@Param("list") List<Cooking_Info> cookingList);
    
    void insertIrdntList(@Param("list") List<Irdnt_Info> list);
}