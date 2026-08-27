package org.cloud.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.cloud.dto.RECIPE_IMAGE;
import org.cloud.mapper.RecipeImageMapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

class RecipeImageServiceTest {

    @Test
    void addRecipeImagesStartsAfterExistingMaximumSortOrder() {
        RecipeImageMapper mapper = Mockito.mock(RecipeImageMapper.class);
        RecipeImageService service = new RecipeImageService(mapper);

        when(mapper.getImagesByRecipeCode("recipe-1"))
                .thenReturn(List.of(image("recipe-1", 1), image("recipe-1", 2)));
        when(mapper.insertRecipeImage(any(RECIPE_IMAGE.class))).thenReturn(1);

        service.addRecipeImages(List.of(image("recipe-1", 1), image("recipe-1", 2)));

        ArgumentCaptor<RECIPE_IMAGE> captor = ArgumentCaptor.forClass(RECIPE_IMAGE.class);
        verify(mapper, Mockito.times(2)).insertRecipeImage(captor.capture());
        assertThat(captor.getAllValues())
                .extracting(RECIPE_IMAGE::getSortOrder)
                .containsExactly(3, 4);
    }

    private RECIPE_IMAGE image(String recipeCode, int sortOrder) {
        RECIPE_IMAGE image = new RECIPE_IMAGE();
        image.setRecipeCode(recipeCode);
        image.setSortOrder(sortOrder);
        image.setImgUrl("uploads/recipe/image/test.jpg");
        return image;
    }
}
