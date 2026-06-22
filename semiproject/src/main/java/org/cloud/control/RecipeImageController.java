package org.cloud.control;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.cloud.dto.RECIPE_IMAGE;
import org.cloud.service.RecipeImageService;
import org.cloud.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

@RestController
@RequestMapping("/api/recipe-images")
public class RecipeImageController {

    @Autowired
    private RecipeImageService recipeImageService;

    @Autowired
    private S3Service s3Service;

    // 레시피 대표 이미지 업로드
    @PostMapping("/{recipeCode}/upload")
    public ResponseEntity<?> uploadImages(
            @PathVariable String recipeCode,
            MultipartHttpServletRequest request) {
        try {
            List<MultipartFile> files = request.getFiles("files");
            if (files == null || files.isEmpty()) {
                MultipartFile single = request.getFile("file");
                if (single == null) single = request.getFile("image");
                if (single != null) files = List.of(single);
            }

            if (files == null || files.isEmpty()) {
                return ResponseEntity.badRequest().body("업로드할 이미지 파일이 없습니다.");
            }

            List<RECIPE_IMAGE> imageList = new ArrayList<>();
            for (int i = 0; i < files.size(); i++) {
                MultipartFile file = files.get(i);
                if (file == null || file.isEmpty()) continue;

                String savedUrl = saveFile(file, "recipe/image");

                RECIPE_IMAGE img = new RECIPE_IMAGE();
                img.setRecipeCode(recipeCode);
                img.setImgUrl(savedUrl);
                img.setSortOrder(i + 1);
                imageList.add(img);
            }

            if (!imageList.isEmpty()) {
                recipeImageService.addRecipeImages(imageList);
            }

            return ResponseEntity.ok("성공");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("업로드 에러: " + e.getMessage());
        }
    }

    // 레시피별 이미지 목록 조회
    @GetMapping("/{recipeCode}")
    public List<RECIPE_IMAGE> getImages(@PathVariable String recipeCode) {
        return recipeImageService.getRecipeImages(recipeCode);
    }

    // 레시피 대표 이미지 전체 수정
    @PutMapping("/{recipeCode}")
    public ResponseEntity<?> updateImages(
            @PathVariable String recipeCode,
            MultipartHttpServletRequest request) {
        try {
            List<MultipartFile> files = request.getFiles("files");
            if (files == null || files.isEmpty()) {
                MultipartFile single = request.getFile("file");
                if (single == null) single = request.getFile("image");
                if (single != null) files = List.of(single);
            }

            List<RECIPE_IMAGE> newImageList = new ArrayList<>();
            if (files != null) {
                for (int i = 0; i < files.size(); i++) {
                    MultipartFile file = files.get(i);
                    if (file == null || file.isEmpty()) continue;

                    String savedUrl = saveFile(file, "recipe/image");

                    RECIPE_IMAGE img = new RECIPE_IMAGE();
                    img.setRecipeCode(recipeCode);
                    img.setImgUrl(savedUrl);
                    img.setSortOrder(i + 1);
                    newImageList.add(img);
                }
            }

            recipeImageService.updateRecipeImages(recipeCode, newImageList);
            return ResponseEntity.ok("업데이트 성공");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("업데이트 에러: " + e.getMessage());
        }
    }

    // 조리 단계 이미지 단건 업로드
    @PostMapping("/step-image")
    public ResponseEntity<?> uploadStepImage(MultipartHttpServletRequest request) {
        try {
            MultipartFile file = request.getFile("file");
            if (file == null) file = request.getFile("image");

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("업로드할 조리 단계 이미지가 없습니다.");
            }

            String savedUrl = saveFile(file, "recipe/cookingdc");
            return ResponseEntity.ok(savedUrl);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("업로드 에러: " + e.getMessage());
        }
    }

    private String saveFile(MultipartFile file, String subDir) throws IOException {
        return s3Service.upload(file, subDir);
    }
}
