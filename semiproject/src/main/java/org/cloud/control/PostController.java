package org.cloud.control;

import java.util.List;

import org.cloud.dto.Post;
import org.cloud.dto.PostComment;
import org.cloud.service.PostCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostCommentService postService;

    @GetMapping
    public List<Post> getList() {
        return postService.getAllPosts();
    }

    @GetMapping("/{postId}")
    public Post getDetail(@PathVariable int postId) {
        return postService.getPost(postId);
    }

    @PostMapping
    public boolean write(@RequestBody Post post) {
        return postService.writePost(post);
    }

    @PostMapping("/comment")
    public boolean addComment(@RequestBody PostComment comment) {
        return postService.writeComment(comment);
    }

    @DeleteMapping("/comment/{commentId}")
    public boolean deleteComment(@PathVariable int commentId) {
        return postService.removeComment(commentId);
    }

    @PutMapping("/{postId}")
    public boolean modify(@PathVariable int postId, @RequestBody Post post) {
        post.setPostId(postId); 
        return postService.modifyPost(post);
    }


    @DeleteMapping("/{postId}")
    public boolean deletePost(@PathVariable("postId") int postId) {
        return postService.removePost(postId);
    }
    
}