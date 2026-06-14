package org.cloud.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.cloud.dto.ReviewImage;

@Mapper
public interface ReviewImageMapper {
    int insertReviewImage(ReviewImage image);
    List<ReviewImage> getImagesByReviewId(String reviewId);
    List<ReviewImage> getImagesByRecipeCode(String recipeCode);
}
