package org.cloud.control;

import java.util.ArrayList;
import java.util.List;

import org.cloud.dto.ReviewImage;
import org.cloud.service.ReviewImageService;
import org.cloud.storage.FileStorageService;
import org.cloud.storage.ImageType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/review-images")
@lombok.RequiredArgsConstructor
public class ReviewImageController {

    private final ReviewImageService reviewImageService;

    private final FileStorageService fileStorageService;

    @PostMapping("/{reviewId}/upload")
    public ResponseEntity<?> uploadImages(@PathVariable String reviewId,
                                          @RequestParam("files") List<MultipartFile> files) {
        try {
            List<ReviewImage> imageList = new ArrayList<>();
            for (MultipartFile file : files) {
                String savedUrl = fileStorageService.save(file, ImageType.REVIEW);
                ReviewImage img = new ReviewImage();
                img.setReviewId(reviewId);
                img.setImageUrl(savedUrl);
                imageList.add(img);
            }
            reviewImageService.addReviewImages(imageList);
            return ResponseEntity.ok("성공");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("업로드 에러: " + e.getMessage());
        }
    }

    @GetMapping("/recipe/{recipeCode}")
    public List<ReviewImage> getByRecipeCode(@PathVariable String recipeCode) {
        return reviewImageService.getImagesByRecipeCode(recipeCode);
    }

    @GetMapping("/{reviewId}")
    public List<ReviewImage> getByReviewId(@PathVariable String reviewId) {
        return reviewImageService.getImagesByReviewId(reviewId);
    }

}
