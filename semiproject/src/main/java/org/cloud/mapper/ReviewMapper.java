package org.cloud.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.cloud.dto.Review;
import java.util.List;

@Mapper
public interface ReviewMapper {

    int insertReview(Review review);

    int updateReview(Review review);

    int deleteReview(String reviewId);

    Review getReviewById(String reviewId);

    List<Review> getReviewsByRecipeCode(String RECIPE_CODE);

    List<Review> getReviewsById(String ID);

    String getRecipeWriterId(String recipeCode);
}
