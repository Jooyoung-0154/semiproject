package org.cloud.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.cloud.dto.RecipeTagRow;
import org.cloud.dto.Tag;

@Mapper
public interface TagMapper {
    int insertTag(Tag tag);           // 생성
    int updateTag(Tag tag);           // 수정
    int deleteTag(int TAG_ID);        // 삭제
    List<Tag> getAllTags();           // 전체 목록 조회

    int insertRecipeTag(@Param("RECIPE_ID") String recipeId, @Param("TAG_ID") int tagId);

    int deleteRecipeTags(@Param("RECIPE_ID") String recipeId);

    List<Tag> getTagsByRecipeId(@Param("RECIPE_ID") String recipeId);

    List<RecipeTagRow> selectTagsByRecipeIds(@Param("recipeIds") List<String> recipeIds);
}