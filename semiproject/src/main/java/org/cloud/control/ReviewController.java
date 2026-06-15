package org.cloud.control;

import java.util.List;

import jakarta.servlet.http.HttpSession;
import org.cloud.dto.Review;
import org.cloud.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping("")
    public String write(@RequestBody Review review) {
        return reviewService.writeReview(review);
    }

    @PutMapping("/{reviewId}")
    public boolean modify(@PathVariable String reviewId, @RequestBody Review review) {
        review.setReviewId(reviewId);
        return reviewService.modifyReview(review);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Boolean> remove(@PathVariable String reviewId, HttpSession session) {
        String sessionUserId = (String) session.getAttribute("userId");
        if (sessionUserId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(reviewService.removeReview(reviewId, sessionUserId));
    }

    @GetMapping("/recipe/{recipeCode}")
    public List<Review> getRecipeReviews(@PathVariable String recipeCode) {
        return reviewService.getRecipeReviews(recipeCode);
    }

    @GetMapping("/my/{userId}")
    public List<Review> getMyReviews(@PathVariable String userId) {
        return reviewService.getMyReviews(userId);
    }
}
