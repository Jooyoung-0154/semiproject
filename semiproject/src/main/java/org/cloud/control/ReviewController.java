package org.cloud.control;

import java.util.List;

import org.cloud.dto.Review;
import org.cloud.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // 1. 리뷰 작성
    @PostMapping("")
    public boolean write(@RequestBody Review review) {
        return reviewService.writeReview(review);
    }

    // 2. 리뷰 수정
    @PutMapping("/{reviewId}")
    public boolean modify(@PathVariable int reviewId, @RequestBody Review review) {
        // 주소의 ID를 객체에 세팅하여 안전하게 업데이트
        review.setReviewId(reviewId);
        return reviewService.modifyReview(review);
    }

    // 3. 리뷰 삭제
    @DeleteMapping("/{reviewId}")
    public boolean remove(@PathVariable int reviewId) {
        return reviewService.removeReview(reviewId);
    }

    // 예: /api/reviews/recipe/R001
    @GetMapping("/recipe/{recipeCode}")
    public List<Review> getRecipeReviews(@PathVariable String recipeCode) {
        return reviewService.getRecipeReviews(recipeCode);
    }

    @GetMapping("/my/{userId}")
    public List<Review> getMyReviews(@PathVariable String userId) {
        return reviewService.getMyReviews(userId);
    }
}