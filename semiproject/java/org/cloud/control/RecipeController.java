package org.cloud.control;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpSession;
import org.cloud.dto.Recipe;
import org.cloud.dto.RecipeSearchParams;
import org.cloud.dto.Recipe_Info;
import org.cloud.dto.Tag;
import org.cloud.mapper.TagMapper;
import org.cloud.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recipe")
public class RecipeController {

    @Autowired
    private RecipeService recipeService;
    @Autowired
    private TagMapper tagMapper;

    // 조회: /api/recipe/list?name=김치찌개&tagId=1
    @GetMapping("/list")
    public List<Recipe_Info> getList(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer tagId) {
        return recipeService.searchRecipes(name, tagId);
    }

    // 작성자 ID로 레시피 목록 조회: /api/recipe/by-writer/{writerId}
    @GetMapping("/by-writer/{writerId}")
    public List<Recipe_Info> getByWriter(@PathVariable String writerId) {
        return recipeService.getRecipesByWriterId(writerId);
    }

    // 둘러보기: /api/recipe/browse?name=&tagIds=1,2,3&level=&ingredients=고기,양파&page=1&size=12
    @GetMapping("/browse")
    public Map<String, Object> browse(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String tagIds,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String ingredients,
            @RequestParam(required = false, defaultValue = "all") String sortType,
            @RequestParam(required = false, defaultValue = "all") String cookingTimeFilter,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size) {

        RecipeSearchParams params = new RecipeSearchParams();
        params.setRecipeNmKo(name);
        params.setLevelNm(level);
        params.setSortType(sortType);
        params.setCookingTimeFilter(cookingTimeFilter);
        params.setPage(page);
        params.setSize(size);

        if (tagIds != null && !tagIds.isBlank()) {
            List<Integer> tagIdList = Arrays.stream(tagIds.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Integer::parseInt)
                .toList();
            params.setTagIds(tagIdList);
        }

        if (ingredients != null && !ingredients.isBlank()) {
            List<String> irdntList = Arrays.stream(ingredients.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
            params.setIrdntNms(irdntList);
        }

        return recipeService.searchRecipesPaged(params);
    }

    // 단건 상세 조회: /api/recipe/{recipeId}
    @GetMapping("/{recipeId}")
    public Recipe getById(@PathVariable String recipeId) {
        return recipeService.getRecipeById(recipeId);
    }

    // 태그 전체 목록: /api/recipe/tags
    @GetMapping("/tags")
    public List<Tag> getAllTags() {
        return tagMapper.getAllTags();
    }

    // 등록: /api/recipe/register → 생성된 RECIPE_ID(String) 반환
    @PostMapping("/register")
    public String register(@RequestBody Recipe recipe) {
        return recipeService.registerRecipe(recipe);
    }

    // 수정: PUT /api/recipe/{recipeId}
    @PutMapping("/{recipeId}")
    public ResponseEntity<Void> update(
            @PathVariable String recipeId,
            @RequestBody Recipe recipe,
            HttpSession session) {
        String sessionUserId = (String) session.getAttribute("userId");
        if (sessionUserId == null) return ResponseEntity.status(401).build();

        Recipe existing = recipeService.getRecipeById(recipeId);
        if (existing == null) return ResponseEntity.status(404).build();
        if (!sessionUserId.equals(existing.getWriterId()) && !"Admin".equals(sessionUserId)) {
            return ResponseEntity.status(403).build();
        }

        recipe.setRecipeCode(recipeId);
        recipeService.updateRecipe(recipe);
        return ResponseEntity.ok().build();
    }

    // 삭제: DELETE /api/recipe/{recipeId}
    @DeleteMapping("/{recipeId}")
    public ResponseEntity<Boolean> delete(@PathVariable("recipeId") String recipeId, HttpSession session) {
        String sessionUserId = (String) session.getAttribute("userId");
        if (sessionUserId == null) return ResponseEntity.status(401).build();

        Recipe existing = recipeService.getRecipeById(recipeId);
        if (existing == null) return ResponseEntity.status(404).build();
        if (!sessionUserId.equals(existing.getWriterId()) && !"Admin".equals(sessionUserId)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(recipeService.removeRecipe(recipeId));
    }

    // 조회수 증가: PUT /api/recipe/{recipeId}/hit
    @PutMapping("/{recipeId}/hit")
    public void incrementHit(@PathVariable String recipeId) {
        recipeService.incrementHit(recipeId);
    }

}
