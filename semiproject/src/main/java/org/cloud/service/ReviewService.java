package org.cloud.service;

import java.util.List;

import org.cloud.dto.Review;
import org.cloud.mapper.ReviewMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReviewService {

    @Autowired
    private ReviewMapper reviewMapper;

    public int writeReview(Review review) {
        reviewMapper.insertReview(review);
        return review.getReviewId();
    }

    public boolean modifyReview(Review review) {
        return reviewMapper.updateReview(review) > 0;
    }

    public boolean removeReview(int reviewId, String requesterId) {
        return reviewMapper.deleteReview(reviewId, requesterId) > 0;
    }

    public List<Review> getRecipeReviews(String recipeCode) {
        return reviewMapper.getReviewsByRecipeCode(recipeCode);
    }

    public List<Review> getMyReviews(String userId) {
        return reviewMapper.getReviewsById(userId);
    }
}