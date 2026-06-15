package org.cloud.control;

import java.util.List;
import org.cloud.dto.Tag;
import org.cloud.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/tags")
public class TagController {

    @Autowired
    private TagService tagService;

    // 2. 새로운 태그 생성 (관리자용)
    @PostMapping("")
    public boolean create(@RequestBody Tag tag) {
        return tagService.createTag(tag);
    }

    // 3. 태그 수정
    @PutMapping("/{tagId}")
    public boolean modify(@PathVariable int tagId, @RequestBody Tag tag) {
        tag.setTagId(tagId);
        return tagService.modifyTag(tag);
    }

    // 4. 태그 삭제
    @DeleteMapping("/{tagId}")
    public boolean remove(@PathVariable int tagId) {
        return tagService.removeTag(tagId);
    }

    // --- 레시피-태그 연결 기능 ---

    // 5. 특정 레시피에 태그 할당 (수정 포함)
    @PostMapping("/recipe/{recipeId}")
    public String assignTags(@PathVariable String recipeId, @RequestBody List<Integer> tagIds) {
        tagService.addTagsToRecipe(recipeId, tagIds);
        return "SUCCESS";
    }

    // 6. 특정 레시피에 달린 태그 목록 조회
    @GetMapping("/recipe/{recipeId}")
    public List<Tag> getRecipeTags(@PathVariable String recipeId) {
        return tagService.getRecipeTags(recipeId);
    }
}