package org.cloud.control;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.cloud.dto.Recipe;
import org.cloud.dto.RECIPE_IMAGE;
import org.cloud.service.RecipeImageService;
import org.cloud.service.RecipeService;
import org.cloud.storage.FileStorageService;
import org.cloud.storage.ImageType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

@RestController
@RequestMapping("/api/recipe-images")
@lombok.RequiredArgsConstructor
public class RecipeImageController {

    private final RecipeImageService recipeImageService;

    private final RecipeService recipeService;

    private final FileStorageService fileStorageService;

    // 레시피 대표 이미지 업로드
    @PostMapping("/{recipeCode}/upload")
    public ResponseEntity<?> uploadImages(
            @PathVariable String recipeCode,
            MultipartHttpServletRequest request,
            Authentication authentication) throws IOException {
        validateOwnerOrAdmin(recipeCode, authentication);

        List<MultipartFile> files = resolveFiles(request);
        List<RECIPE_IMAGE> imageList = saveRecipeImages(recipeCode, files);
        if (imageList.isEmpty()) {
            throw new IllegalArgumentException("업로드할 이미지 파일이 없습니다.");
        }

        recipeImageService.addRecipeImages(imageList);
        return ResponseEntity.ok("성공");
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
            MultipartHttpServletRequest request,
            Authentication authentication) throws IOException {
        validateOwnerOrAdmin(recipeCode, authentication);

        List<RECIPE_IMAGE> newImageList = saveRecipeImages(recipeCode, resolveFiles(request));
        recipeImageService.updateRecipeImages(recipeCode, newImageList);
        return ResponseEntity.ok("업데이트 성공");
    }

    // 조리 단계 이미지 단건 업로드
    @PostMapping("/step-image")
    public ResponseEntity<?> uploadStepImage(MultipartHttpServletRequest request) throws IOException {
        MultipartFile file = request.getFile("file");
        if (file == null) file = request.getFile("image");

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 조리 단계 이미지가 없습니다.");
        }

        String savedUrl = fileStorageService.save(file, ImageType.COOKING_STEP);
        return ResponseEntity.ok(savedUrl);
    }

    private List<MultipartFile> resolveFiles(MultipartHttpServletRequest request) {
        List<MultipartFile> files = request.getFiles("files");
        if (!files.isEmpty()) {
            return files;
        }

        MultipartFile single = request.getFile("file");
        if (single == null) single = request.getFile("image");
        return single == null ? List.of() : List.of(single);
    }

    private List<RECIPE_IMAGE> saveRecipeImages(
            String recipeCode,
            List<MultipartFile> files) throws IOException {
        List<RECIPE_IMAGE> imageList = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;

            String savedUrl = fileStorageService.save(file, ImageType.RECIPE);
            RECIPE_IMAGE image = new RECIPE_IMAGE();
            image.setRecipeCode(recipeCode);
            image.setImgUrl(savedUrl);
            image.setSortOrder(imageList.size() + 1);
            imageList.add(image);
        }
        return imageList;
    }

    private void validateOwnerOrAdmin(String recipeCode, Authentication authentication) {
        Recipe recipe = recipeService.getRecipeById(recipeCode);
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (!authentication.getName().equals(recipe.getWriterId()) && !isAdmin) {
            throw new AccessDeniedException("레시피 이미지를 변경할 권한이 없습니다.");
        }
    }
}
