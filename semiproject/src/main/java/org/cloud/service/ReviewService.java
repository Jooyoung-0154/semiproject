package org.cloud.service;

import java.util.List;
import java.util.UUID;

import org.cloud.dto.Review;
import org.cloud.mapper.ReviewMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReviewService {

    @Autowired
    private ReviewMapper reviewMapper;

    @Autowired
    private NotificationService notificationService;

    public String writeReview(Review review) {
        review.setReviewId(UUID.randomUUID().toString());
        reviewMapper.insertReview(review);
        try {
            String writerId = reviewMapper.getRecipeWriterId(review.getRecipeCode());
            notificationService.createNotification(
                    writerId,
                    review.getId(),
                    "RECIPE_COMMENT",
                    review.getRecipeCode(),
                    review.getId() + "님이 회원님의 레시피에 후기를 남겼습니다."
            );
        } catch (Exception e) {
            System.out.println("레시피 댓글 알림 저장 실패: " + e.getMessage());
        }
        return review.getReviewId();
    }

    public boolean modifyReview(Review review) {
        return reviewMapper.updateReview(review) > 0;
    }

    public boolean removeReview(String reviewId, String requesterId) {
        return reviewMapper.deleteReview(reviewId, requesterId) > 0;
    }

    public List<Review> getRecipeReviews(String recipeCode) {
        return reviewMapper.getReviewsByRecipeCode(recipeCode);
    }

    public List<Review> getMyReviews(String userId) {
        return reviewMapper.getReviewsById(userId);
    }
}
