<<<<<<< HEAD
package org.cloud.control;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;

import org.cloud.dto.Post;
import org.cloud.dto.PostComment;
import org.cloud.service.PostCommentService;
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
@CrossOrigin(origins = "http://localhost:5173")
public class PostController {

    @Autowired
    private PostCommentService postService;

    private final String uploadPath = "C:/upload/";

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
            @PathVariable int postId,
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
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        if (image != null && !image.isEmpty()) {
            String savedFileName = saveImage(image);
            post.setPostImg(savedFileName);
        }
        return postService.writePost(post);
    }

    @PutMapping("/{postId}")
    public boolean modify(@PathVariable int postId, @RequestBody Post post) {
        post.setPostId(postId);
        return postService.modifyPost(post);
    }

    @PutMapping(value = "/{postId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public boolean modifyWithImage(
            @PathVariable int postId,
            @ModelAttribute Post post,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        post.setPostId(postId);
        if (image != null && !image.isEmpty()) {
            String savedFileName = saveImage(image);
            post.setPostImg(savedFileName);
        }
        return postService.modifyPost(post);
    }

    @DeleteMapping("/{postId}")
    public boolean deletePost(
            @PathVariable int postId,
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
            @PathVariable int postId,
            @RequestParam String userId
    ) {
        return postService.toggleLike(postId, userId);
    }

    private String saveImage(MultipartFile image) throws IOException {
        File folder = new File(uploadPath);
        if (!folder.exists()) folder.mkdirs();

        String originalName = image.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }

        String savedFileName = UUID.randomUUID().toString() + ext;
        File saveFile = new File(uploadPath + savedFileName);
        image.transferTo(saveFile);
        return savedFileName;
    }
}
=======
package org.cloud.control;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import jakarta.servlet.http.HttpSession;
import org.cloud.dto.Post;
import org.cloud.dto.PostComment;
import org.cloud.service.PostCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
public class PostController {

	@Autowired
	private PostCommentService postService;

	// WebMvcConfig의 /uploads/** 매핑과 같은 폴더를 사용함
	private final String uploadPath = System.getProperty("user.dir") + "/src/main/resources/static/uploads/";

	@GetMapping
	public Object getList(@RequestParam(required = false) String writerId) {
		if (writerId != null && !writerId.isBlank()) {
			return postService.getPostsByWriter(writerId);
		}
		return postService.getAllPosts();
	}

	@GetMapping("/{postId}")
	public Post getDetail(@PathVariable int postId) {
		return postService.getPost(postId);
	}

	@PostMapping("/json")
	public boolean writeJson(@RequestBody Post post) {
		return postService.writePost(post);
	}

	
	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public boolean write(
	        @ModelAttribute Post post,
	        @RequestParam(value = "image", required = false) MultipartFile image
	) throws IOException {

		if (image != null && !image.isEmpty()) {
			String savedFileName = saveImage(image);
			post.setPostImg(savedFileName);
		}
		return postService.writePost(post);
	}
	
    @PutMapping("/{postId}")
    public boolean modify(
            @PathVariable int postId,
            @RequestBody Post post
    ) {
        post.setPostId(postId);
        return postService.modifyPost(post);
    }

    @PutMapping(value = "/{postId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public boolean modifyWithImage(
            @PathVariable int postId,
            @ModelAttribute Post post,
            @RequestParam(value = "image", required = false) MultipartFile image
            
    ) throws IOException {
        post.setPostId(postId);

        if (image != null && !image.isEmpty()) {
            String savedFileName = saveImage(image);
            post.setPostImg(savedFileName);
        }

        return postService.modifyPost(post);
    }
    @DeleteMapping("/{postId}")
    public ResponseEntity<Boolean> deletePost(@PathVariable int postId, HttpSession session) {
        String sessionUserId = (String) session.getAttribute("userId");
        if (sessionUserId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(postService.removePost(postId, sessionUserId));
    }
   

	@PostMapping("/comment")
	public boolean addComment(@RequestBody PostComment comment) {
		return postService.writeComment(comment);
	}

	@DeleteMapping("/comment/{commentId}")
	public ResponseEntity<Boolean> deleteComment(@PathVariable int commentId, HttpSession session) {
		String sessionUserId = (String) session.getAttribute("userId");
		if (sessionUserId == null) return ResponseEntity.status(401).build();
		return ResponseEntity.ok(postService.removeComment(commentId, sessionUserId));
	}
	@PutMapping("/comment/{commentId}")
	public boolean updateComment(
	        @PathVariable int commentId,
	        @RequestBody PostComment comment
	) {
	    comment.setCommentId(commentId);
	    return postService.modifyComment(comment);
	}
	
	private String saveImage(MultipartFile image) throws IOException {
        File folder = new File(uploadPath);

        if (!folder.exists()) {
            folder.mkdirs();
        }
        
        String originalName = image.getOriginalFilename();
        String ext = "";

        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }

        String savedFileName = UUID.randomUUID().toString() + ext;
        File saveFile = new File(uploadPath + savedFileName);
        image.transferTo(saveFile);

        return savedFileName;
	}
}
>>>>>>> 5ee042261809b2e907799f6894e7460b59020a81
