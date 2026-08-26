package org.cloud.control;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.cloud.dto.Post;
import org.cloud.dto.PostComment;
import org.cloud.service.PostCommentService;
import org.cloud.storage.FileStorageService;
import org.cloud.storage.ImageType;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:5173")
@lombok.RequiredArgsConstructor
public class PostController {

    private final PostCommentService postService;

    private final FileStorageService fileStorageService;

    @GetMapping
    public Object getList(
            @RequestParam(required = false) String writerId,
            Authentication authentication
    ) {
        if (writerId != null && !writerId.isBlank()) {
            return postService.getPostsByWriter(writerId, authentication.getName());
        }
        return postService.getAllPosts(authentication.getName());
    }

    @GetMapping("/{postId}")
    public Post getDetail(
            @PathVariable String postId,
            Authentication authentication
    ) {
        return postService.getPost(postId, authentication.getName());
    }

    @PostMapping("/json")
    public boolean writeJson(@RequestBody Post post, Authentication authentication) {
        post.setWriterId(authentication.getName());
        return postService.writePost(post);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public boolean write(
            @ModelAttribute Post post,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication authentication
    ) throws IOException {
        post.setWriterId(authentication.getName());
        List<MultipartFile> uploadImages = normalizeUploadImages(images, image);

        if (uploadImages.size() > 5) {
            throw new IllegalArgumentException("게시판 사진은 최대 5장까지 등록 가능합니다.");
        }

        if (!uploadImages.isEmpty()) {
            post.setPostImg(saveImages(uploadImages));
        }

        return postService.writePost(post);
    }

    @PutMapping("/{postId}")
    public boolean modify(
            @PathVariable String postId,
            @RequestBody Post post,
            Authentication authentication) {
        post.setPostId(postId);
        return postService.modifyPost(post, authentication.getName());
    }

    @PutMapping(value = "/{postId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public boolean modifyWithImage(
            @PathVariable String postId,
            @ModelAttribute Post post,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication authentication
    ) throws IOException {
        post.setPostId(postId);
        postService.validatePostOwner(postId, authentication.getName());
        List<MultipartFile> uploadImages = normalizeUploadImages(images, image);

        if (uploadImages.size() > 5) {
            throw new IllegalArgumentException("게시판 사진은 최대 5장까지 등록 가능합니다.");
        }

        if (!uploadImages.isEmpty()) {
            post.setPostImg(saveImages(uploadImages));
        }

        return postService.modifyPost(post, authentication.getName());
    }

    @DeleteMapping("/{postId}")
    public boolean deletePost(
            @PathVariable String postId,
            Authentication authentication
    ) {
        return postService.removePost(postId, authentication.getName(), isAdmin(authentication));
    }

    @PostMapping("/comment")
    public boolean addComment(@RequestBody PostComment comment, Authentication authentication) {
        comment.setWriterId(authentication.getName());
        return postService.writeComment(comment);
    }

    @PutMapping("/comment/{commentId}")
    public boolean updateComment(
            @PathVariable int commentId,
            @RequestBody PostComment comment,
            Authentication authentication) {
        comment.setCommentId(commentId);
        return postService.modifyComment(comment, authentication.getName());
    }

    @DeleteMapping("/comment/{commentId}")
    public boolean deleteComment(
            @PathVariable int commentId,
            Authentication authentication
    ) {
        return postService.removeComment(
                commentId, authentication.getName(), isAdmin(authentication));
    }

    @PostMapping("/{postId}/like")
    public Map<String, Object> togglePostLike(
            @PathVariable String postId,
            Authentication authentication
    ) {
        return postService.toggleLike(postId, authentication.getName());
    }

    private List<MultipartFile> normalizeUploadImages(List<MultipartFile> images, MultipartFile image) {
        List<MultipartFile> uploadImages = new ArrayList<>();

        if (images != null) {
            for (MultipartFile file : images) {
                if (file != null && !file.isEmpty()) {
                    uploadImages.add(file);
                }
            }
        }

        if (uploadImages.isEmpty() && image != null && !image.isEmpty()) {
            uploadImages.add(image);
        }

        return uploadImages;
    }

    private String saveImages(List<MultipartFile> images) throws IOException {
        List<String> savedNames = new ArrayList<>();

        for (MultipartFile image : images) {
            savedNames.add(fileStorageService.save(image, ImageType.POST));
        }

        return String.join(",", savedNames);
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

}
