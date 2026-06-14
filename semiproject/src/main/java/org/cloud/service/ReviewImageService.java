package org.cloud.service;

import java.util.List;
import org.cloud.dto.ReviewImage;
import org.cloud.mapper.ReviewImageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReviewImageService {

    @Autowired
    private ReviewImageMapper reviewImageMapper;

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
