package org.cloud.control;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.cloud.dto.Post;
import org.cloud.dto.PostComment;
import org.cloud.service.PostCommentService;
import org.cloud.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
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
public class PostController {

    @Autowired
    private PostCommentService postService;

    @Autowired
    private S3Service s3Service;

    @GetMapping
    public Object getList(
            @RequestParam(required = false) String writerId,
            @RequestParam(required = false) String viewerId
    ) {
        if (writerId != null && !writerId.isBlank()) {
            return postService.getPostsByWriter(writerId, viewerId);
        }
        return postService.getAllPosts(viewerId);
    }

    @GetMapping("/{postId}")
    public Post getDetail(
            @PathVariable String postId,
            @RequestParam(required = false) String viewerId
    ) {
        return postService.getPost(postId, viewerId);
    }

    @PostMapping("/json")
    public boolean writeJson(@RequestBody Post post) {
        return postService.writePost(post);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public boolean write(
            @ModelAttribute Post post,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
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
    public boolean modify(@PathVariable String postId, @RequestBody Post post) {
        post.setPostId(postId);
        return postService.modifyPost(post);
    }

    @PutMapping(value = "/{postId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public boolean modifyWithImage(
            @PathVariable String postId,
            @ModelAttribute Post post,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        post.setPostId(postId);
        List<MultipartFile> uploadImages = normalizeUploadImages(images, image);

        if (uploadImages.size() > 5) {
            throw new IllegalArgumentException("게시판 사진은 최대 5장까지 등록 가능합니다.");
        }

        if (!uploadImages.isEmpty()) {
            post.setPostImg(saveImages(uploadImages));
        }

        return postService.modifyPost(post);
    }

    @DeleteMapping("/{postId}")
    public boolean deletePost(
            @PathVariable String postId,
            @RequestParam String requesterId
    ) {
        return postService.removePost(postId, requesterId);
    }

    @PostMapping("/comment")
    public boolean addComment(@RequestBody PostComment comment) {
        return postService.writeComment(comment);
    }

    @PutMapping("/comment/{commentId}")
    public boolean updateComment(@PathVariable int commentId, @RequestBody PostComment comment) {
        comment.setCommentId(commentId);
        return postService.modifyComment(comment);
    }

    @DeleteMapping("/comment/{commentId}")
    public boolean deleteComment(
            @PathVariable int commentId,
            @RequestParam String requesterId
    ) {
        return postService.removeComment(commentId, requesterId);
    }

    @PostMapping("/{postId}/like")
    public Map<String, Object> togglePostLike(
            @PathVariable String postId,
            @RequestParam String userId
    ) {
        return postService.toggleLike(postId, userId);
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
            savedNames.add(saveImage(image));
        }

        return String.join(",", savedNames);
    }

    private String saveImage(MultipartFile image) throws IOException {
        return s3Service.upload(image, "posts");
    }
}
