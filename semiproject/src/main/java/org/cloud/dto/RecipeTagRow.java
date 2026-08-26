package org.cloud.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecipeTagRow {
    private String recipeId;
    private int tagId;
    private String tagName;
}
