package org.cloud.control;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.cloud.dto.ReviewImage;
import org.cloud.service.ReviewImageService;
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

    @PostMapping("/{reviewId}/upload")
    public ResponseEntity<?> uploadImages(@PathVariable int reviewId,
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
    public List<ReviewImage> getByReviewId(@PathVariable int reviewId) {
        return reviewImageService.getImagesByReviewId(reviewId);
    }

    private String saveFile(MultipartFile file) throws Exception {
        String projectPath = System.getProperty("user.dir");
        String uploadDir = projectPath + "/src/main/resources/static/uploads/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
        String savedName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        file.transferTo(new File(uploadDir + savedName));
        return "/uploads/" + savedName;
    }
}
