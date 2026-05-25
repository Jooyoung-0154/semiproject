package org.cloud.control;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.cloud.dto.RECIPE_IMAGE;
import org.cloud.service.RecipeImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/recipe-images")
public class RecipeImageController {

    @Autowired
    private RecipeImageService recipeImageService;

    // 1. 레시피 이미지들 업로드 (등록)
    @PostMapping("/{recipeCode}/upload")
    public ResponseEntity<?> uploadImages(@PathVariable String recipeCode,
                                          @RequestParam("files") List<MultipartFile> files) {
        try {
            List<RECIPE_IMAGE> imageList = new ArrayList<>();
            for (int i = 0; i < files.size(); i++) {
                String savedUrl = saveFile(files.get(i));
                
                RECIPE_IMAGE img = new RECIPE_IMAGE();
                img.setRecipeCode(recipeCode);
                img.setImgUrl(savedUrl);
                img.setSortOrder(i + 1);
                imageList.add(img);
            }
            recipeImageService.addRecipeImages(imageList);
            return ResponseEntity.ok("성공");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("업로드 에러: " + e.getMessage());
        }
    }

    // 2. 레시피별 이미지 목록 조회 
    @GetMapping("/{recipeCode}")
    public List<RECIPE_IMAGE> getImages(@PathVariable String recipeCode) {
        return recipeImageService.getRecipeImages(recipeCode);
    }

    // 3. 레시피 이미지 정보 전체 업데이트
    @PutMapping("/{recipeCode}")
    public ResponseEntity<?> updateImages(@PathVariable String recipeCode,
                                          @RequestParam("files") List<MultipartFile> files) {
        try {
            List<RECIPE_IMAGE> newImageList = new ArrayList<>();
            for (int i = 0; i < files.size(); i++) {
                String savedUrl = saveFile(files.get(i));
                
                RECIPE_IMAGE img = new RECIPE_IMAGE();
                img.setRecipeCode(recipeCode);
                img.setImgUrl(savedUrl);
                img.setSortOrder(i + 1);
                newImageList.add(img);
            }
            // 서비스의 updateRecipeImages 호출 (기존 삭제 후 새 등록)
            recipeImageService.updateRecipeImages(recipeCode, newImageList);
            return ResponseEntity.ok("업데이트 성공");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("업데이트 에러: " + e.getMessage());
        }
    }

    // 4. 조리 단계 이미지 단건 업로드
    @PostMapping("/step-image")
    public ResponseEntity<?> uploadStepImage(@RequestParam("file") MultipartFile file) {
        try {
            String savedUrl = saveFile(file);
            return ResponseEntity.ok(savedUrl);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("업로드 에러: " + e.getMessage());
        }
    }

    // 파일 저장 로직 (공통 사용)
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