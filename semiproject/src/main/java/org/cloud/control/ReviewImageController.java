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
<<<<<<< HEAD
import org.springframework.web.multipart.MultipartHttpServletRequest;
=======
>>>>>>> 5ee042261809b2e907799f6894e7460b59020a81

@RestController
@RequestMapping("/api/review-images")
public class ReviewImageController {

    @Autowired
    private ReviewImageService reviewImageService;

    @PostMapping("/{reviewId}/upload")
<<<<<<< HEAD
    public ResponseEntity<?> uploadImages(
            @PathVariable int reviewId,
            MultipartHttpServletRequest request) {
        try {
            List<MultipartFile> files = request.getFiles("files");
            if (files == null || files.isEmpty()) {
                MultipartFile single = request.getFile("file");
                if (single == null) single = request.getFile("image");
                if (single != null) files = List.of(single);
            }

            if (files == null || files.isEmpty()) {
                return ResponseEntity.badRequest().body("업로드할 후기 이미지 파일이 없습니다.");
            }

            List<ReviewImage> imageList = new ArrayList<>();
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;

=======
    public ResponseEntity<?> uploadImages(@PathVariable int reviewId,
                                          @RequestParam("files") List<MultipartFile> files) {
        try {
            List<ReviewImage> imageList = new ArrayList<>();
            for (MultipartFile file : files) {
>>>>>>> 5ee042261809b2e907799f6894e7460b59020a81
                String savedUrl = saveFile(file);
                ReviewImage img = new ReviewImage();
                img.setReviewId(reviewId);
                img.setImageUrl(savedUrl);
                imageList.add(img);
            }
<<<<<<< HEAD

            if (!imageList.isEmpty()) {
                reviewImageService.addReviewImages(imageList);
            }

            return ResponseEntity.ok("성공");
        } catch (Exception e) {
            e.printStackTrace();
=======
            reviewImageService.addReviewImages(imageList);
            return ResponseEntity.ok("성공");
        } catch (Exception e) {
>>>>>>> 5ee042261809b2e907799f6894e7460b59020a81
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
<<<<<<< HEAD
        String uploadDir = "C:/upload/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }

        String savedName = UUID.randomUUID().toString() + ext;
        File saveTarget = new File(uploadDir + savedName);
        file.transferTo(saveTarget);

=======
        String projectPath = System.getProperty("user.dir");
        String uploadDir = projectPath + "/src/main/resources/static/uploads/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
        String savedName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        file.transferTo(new File(uploadDir + savedName));
>>>>>>> 5ee042261809b2e907799f6894e7460b59020a81
        return "/uploads/" + savedName;
    }
}
