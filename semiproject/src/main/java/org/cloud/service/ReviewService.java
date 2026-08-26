package org.cloud.service;

import java.util.List;
import java.util.UUID;

import org.cloud.dto.Review;
import org.cloud.exception.ResourceNotFoundException;
import org.cloud.mapper.ReviewMapper;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewMapper reviewMapper;

    private final NotificationService notificationService;

    public String writeReview(Review review) {
        review.setReviewId(UUID.randomUUID().toString());
        if (reviewMapper.insertReview(review) == 0) {
            throw new IllegalStateException("리뷰 등록에 실패했습니다.");
        }
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
            log.warn("리뷰 알림 저장에 실패했습니다. reviewId={}", review.getReviewId(), e);
        }
        return review.getReviewId();
    }

    public boolean modifyReview(Review review) {
        if (reviewMapper.updateReview(review) == 0) {
            throw new ResourceNotFoundException("리뷰를 찾을 수 없습니다.");
        }
        return true;
    }

    public boolean removeReview(String reviewId) {
        if (reviewMapper.deleteReview(reviewId) == 0) {
            throw new ResourceNotFoundException("리뷰를 찾을 수 없습니다.");
        }
        return true;
    }

    public Review getReviewById(String reviewId) {
        Review review = reviewMapper.getReviewById(reviewId);
        if (review == null) {
            throw new ResourceNotFoundException("리뷰를 찾을 수 없습니다.");
        }
        return review;
    }

    public List<Review> getRecipeReviews(String recipeCode) {
        return reviewMapper.getReviewsByRecipeCode(recipeCode);
    }

    public List<Review> getMyReviews(String userId) {
        return reviewMapper.getReviewsById(userId);
    }
}
