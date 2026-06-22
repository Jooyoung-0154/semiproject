package org.cloud.control;

import java.io.IOException;
import java.util.List;

import org.cloud.dto.MemberBgImage;
import org.cloud.service.MemberBgImageService;
import org.cloud.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

@RestController
@RequestMapping("/api/member-bg-images")
public class MemberBgImageController {

    @Autowired
    private MemberBgImageService memberBgImageService;

    @Autowired
    private S3Service s3Service;

    // 배경 이미지 업로드
    @PostMapping("/{memberId}/upload")
    public ResponseEntity<?> uploadBgImage(
            @PathVariable String memberId,
            @RequestParam int sortOrder,
            MultipartHttpServletRequest request) {
        try {
            MultipartFile file = request.getFile("file");
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("업로드할 이미지 파일이 없습니다.");
            }

            String savedUrl = saveFile(file);

            MemberBgImage bgImage = new MemberBgImage();
            bgImage.setMemberId(memberId);
            bgImage.setImgUrl(savedUrl);
            bgImage.setSortOrder(sortOrder);

            memberBgImageService.addBgImage(bgImage);
            return ResponseEntity.ok("업로드 성공");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("업로드 에러: " + e.getMessage());
        }
    }

    // 멤버별 배경 이미지 목록 조회 (sort_order 순)
    @GetMapping("/{memberId}")
    public List<MemberBgImage> getBgImages(@PathVariable String memberId) {
        return memberBgImageService.getBgImages(memberId);
    }

    // 배경 이미지 단건 삭제
    @DeleteMapping("/{bgImgId}")
    public ResponseEntity<?> deleteBgImage(@PathVariable int bgImgId) {
        memberBgImageService.deleteBgImage(bgImgId);
        return ResponseEntity.ok("삭제 성공");
    }

    // 배경 이미지 순서 일괄 변경
    @PutMapping("/sort-order")
    public ResponseEntity<?> updateSortOrder(@RequestBody List<MemberBgImage> bgImages) {
        memberBgImageService.updateSortOrders(bgImages);
        return ResponseEntity.ok("순서 변경 성공");
    }

    private String saveFile(MultipartFile file) throws IOException {
        return s3Service.upload(file, "profilebackground");
    }
}
