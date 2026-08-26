package org.cloud.control;

import java.util.List;

import org.cloud.dto.Review;
import org.cloud.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@lombok.RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("")
    public String write(@RequestBody Review review, Authentication authentication) {
        review.setId(authentication.getName());
        return reviewService.writeReview(review);
    }

    @PutMapping("/{reviewId}")
    public boolean modify(
            @PathVariable String reviewId,
            @RequestBody Review review,
            Authentication authentication) {
        validateOwnerOrAdmin(reviewId, authentication);
        review.setReviewId(reviewId);
        review.setId(authentication.getName());
        return reviewService.modifyReview(review);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Boolean> remove(
            @PathVariable String reviewId,
            Authentication authentication) {
        validateOwnerOrAdmin(reviewId, authentication);
        return ResponseEntity.ok(reviewService.removeReview(reviewId));
    }

    @GetMapping("/recipe/{recipeCode}")
    public List<Review> getRecipeReviews(@PathVariable String recipeCode) {
        return reviewService.getRecipeReviews(recipeCode);
    }

    @GetMapping("/me")
    public List<Review> getMyReviews(Authentication authentication) {
        return reviewService.getMyReviews(authentication.getName());
    }

    private void validateOwnerOrAdmin(String reviewId, Authentication authentication) {
        Review review = reviewService.getReviewById(reviewId);
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (!authentication.getName().equals(review.getId()) && !isAdmin) {
            throw new AccessDeniedException("리뷰를 변경할 권한이 없습니다.");
        }
    }
}
