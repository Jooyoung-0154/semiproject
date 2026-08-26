package org.cloud.service;

import java.util.List;
import org.cloud.dto.ReviewImage;
import org.cloud.mapper.ReviewImageMapper;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewImageService {

    private final ReviewImageMapper reviewImageMapper;

    public void addReviewImages(List<ReviewImage> images) {
        for (ReviewImage img : images) {
            reviewImageMapper.insertReviewImage(img);
        }
    }

    public List<ReviewImage> getImagesByReviewId(String reviewId) {
        return reviewImageMapper.getImagesByReviewId(reviewId);
    }

    public List<ReviewImage> getImagesByRecipeCode(String recipeCode) {
        return reviewImageMapper.getImagesByRecipeCode(recipeCode);
    }
}
