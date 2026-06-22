package org.cloud.control;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.cloud.dto.ReviewImage;
import org.cloud.service.ReviewImageService;
import org.cloud.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

@RestController
@RequestMapping("/api/review-images")
public class ReviewImageController {

    @Autowired
    private ReviewImageService reviewImageService;

    @Autowired
    private S3Service s3Service;

    @PostMapping("/{reviewId}/upload")
    public ResponseEntity<?> uploadImages(@PathVariable String reviewId,
                                          @RequestParam("files") List<MultipartFile> files) {
        try {
            List<ReviewImage> imageList = new ArrayList<>();
            for (MultipartFile file : files) {
                String savedUrl = saveFile(file);
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

    private String saveFile(MultipartFile file) throws IOException {
        return s3Service.upload(file, "reviews");
    }
}
