package org.cloud.service;

import java.util.List;

import org.cloud.dto.Tag;
import org.cloud.mapper.TagMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TagService {

    @Autowired
    private TagMapper tagMapper;

    public boolean createTag(Tag tag) { return tagMapper.insertTag(tag) > 0; }
    public boolean modifyTag(Tag tag) { return tagMapper.updateTag(tag) > 0; }
    public boolean removeTag(int tagId) { return tagMapper.deleteTag(tagId) > 0; }
    public List<Tag> findAllTags() { return tagMapper.getAllTags(); }

    @Transactional
    public void addTagsToRecipe(String recipeId, List<Integer> tagIds) {
        tagMapper.deleteRecipeTags(recipeId);

        if (tagIds != null && !tagIds.isEmpty()) {
            for (int tagId : tagIds) {
                tagMapper.insertRecipeTag(recipeId, tagId);
            }
        }
    }

    public List<Tag> getRecipeTags(String recipeId) {
        return tagMapper.getTagsByRecipeId(recipeId);
    }
}