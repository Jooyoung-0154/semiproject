package org.cloud.service;

import org.cloud.dto.*;
import org.cloud.mapper.RecipeMapper;
import org.cloud.mapper.TagMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    @Autowired
    private RecipeMapper recipeMapper;

    @Autowired
    private TagMapper tagMapper;

    // 1. 간단 조회
    public List<Recipe_Info> searchRecipes(String name, Integer tagId) {
        return recipeMapper.selectRecipeList(name, tagId);
    }

   
    public Map<String, Object> searchRecipesPaged(RecipeSearchParams params) {
        List<Recipe_Info> recipeInfos = recipeMapper.selectRecipeListPaged(params);

        applyTagsBatch(recipeInfos);

        int total = recipeMapper.countRecipeList(params);
        int totalPages = (int) Math.ceil((double) total / params.getSize());

        Map<String, Object> result = new HashMap<>();
        result.put("recipes", recipeInfos);
        result.put("total", total);
        result.put("page", params.getPage());
        result.put("size", params.getSize());
        result.put("totalPages", totalPages);
        return result;
    }

    private void applyTagsBatch(List<Recipe_Info> recipeInfos) {
        if (recipeInfos.isEmpty()) return;
        List<String> recipeIds = recipeInfos.stream()
            .map(Recipe_Info::getRecipeId).toList();
        List<RecipeTagRow> tagRows = tagMapper.selectTagsByRecipeIds(recipeIds);
        Map<String, List<Tag>> tagsByRecipeId = tagRows.stream()
            .collect(Collectors.groupingBy(
                RecipeTagRow::getRecipeId,
                Collectors.mapping(
                    row -> new Tag(row.getTagId(), row.getTagName()),
                    Collectors.toList()
                )
            ));
        recipeInfos.forEach(info ->
            info.setTags(tagsByRecipeId.getOrDefault(info.getRecipeId(), List.of())));
    }

    // 2. 등록 — UUID 생성 후 RECIPE 테이블에 한 번에 INSERT
    @Transactional
    public String registerRecipe(Recipe recipe) {
        String newId = UUID.randomUUID().toString().replace("-", "").substring(0, 20).toUpperCase();
        recipe.setRecipeCode(newId);

        recipeMapper.insertFullRecipe(recipe);
        saveIngredients(newId, recipe.getIrdntInfo());
        saveCookingSteps(newId, recipe.getCookingInfo());
        assignTags(newId, recipe.getTags());

        return newId;
    }

    private void assignTags(String recipeId, List<Tag> tags) {
        if (tags == null || tags.isEmpty()) return;
        for (Tag tag : tags) {
            tagMapper.insertRecipeTag(recipeId, tag.getTagId());
        }
    }

    private void saveIngredients(String recipeId, List<Irdnt_Info> items) {
        if (items == null || items.isEmpty()) return;
        int sn = 1;
        for (Irdnt_Info item : items) {
            item.setRecipeId(recipeId);
            item.setIrdntSn(sn++);
        }
        recipeMapper.insertIrdntInfo(items);
    }

    private void saveCookingSteps(String recipeId, List<Cooking_Info> steps) {
        if (steps == null || steps.isEmpty()) return;
        for (Cooking_Info item : steps) {
            item.setRecipeId(recipeId);
        }
        recipeMapper.insertCookingInfo(steps);
    }

    // 2-1. 작성자 ID로 레시피 목록 조회
    public List<Recipe_Info> getRecipesByWriterId(String writerId) {
        List<Recipe_Info> recipes = recipeMapper.selectRecipesByWriterId(writerId);
        applyTagsBatch(recipes);
        return recipes;
    }
    public int getRecipesCountByWriterId(String writerId) {
    	int count = recipeMapper.countRecipeById(writerId);
    			
    	return count;
    }

    // 3. 단건 상세 조회
    public Recipe getRecipeById(String recipeId) {
        Recipe_Info info = recipeMapper.selectRecipeInfoById(recipeId);
        if (info == null) return null;

        Recipe recipe = new Recipe();
        recipe.setRecipeCode(recipeId);
        recipe.setRecipeInfo(info);
        recipe.setCookingInfo(recipeMapper.selectCookingInfoByRecipeId(recipeId));
        recipe.setIrdntInfo(recipeMapper.selectIrdntInfoByRecipeId(recipeId));
        recipe.setTags(tagMapper.getTagsByRecipeId(recipeId));
        recipe.setLikeCount(info.getLikeCount());
        recipe.setHit(info.getHit());
        recipe.setPrice(info.getPrice());
        recipe.setWriterId(info.getWriterId());
        return recipe;
    }

    // 4. 수정 (delete-insert 방식)
    @Transactional
    public void updateRecipe(Recipe recipe) {
        String recipeId = recipe.getRecipeCode();

        recipeMapper.updateFullRecipe(recipe);

        recipeMapper.deleteIrdntInfo(recipeId);
        saveIngredients(recipeId, recipe.getIrdntInfo());

        recipeMapper.deleteCookingInfo(recipeId);
        saveCookingSteps(recipeId, recipe.getCookingInfo());

        tagMapper.deleteRecipeTags(recipeId);
        assignTags(recipeId, recipe.getTags());
    }

    // 5. 삭제
    @Transactional
    public boolean removeRecipe(String recipeId) {
        return recipeMapper.deleteRecipe(recipeId) > 0;
    }

    // 6. 조회수 증가
    public void incrementHit(String recipeId) {
        recipeMapper.incrementHit(recipeId);
    }
}
