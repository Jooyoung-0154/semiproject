package org.cloud.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.cloud.dto.Post;
import org.cloud.dto.PostComment;
import org.cloud.mapper.PostCommentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostCommentService {

    @Autowired
    private PostCommentMapper postMapper;

    @Autowired
    private NotificationService notificationService;

    public boolean writePost(Post post) {
        post.setPostId(UUID.randomUUID().toString());
        return postMapper.insertPost(post) > 0;
    }

    public boolean modifyComment(PostComment comment) {
        return postMapper.updateComment(comment) > 0;
    }

    public List<Post> getAllPosts(String viewerId) {
        List<Post> posts = postMapper.getPostList();
        fillCommentsAndLikes(posts, viewerId);
        return posts;
    }

    public List<Post> getPostsByWriter(String writerId, String viewerId) {
        List<Post> posts = postMapper.getPostsByWriter(writerId);
        fillCommentsAndLikes(posts, viewerId);
        return posts;
    }

    public Post getPost(String postId, String viewerId) {
        Post post = postMapper.getPostDetail(postId);
        if (post != null) {
            post.setComments(postMapper.getCommentsByPostId(postId));
            post.setLiked(viewerId != null && !viewerId.isBlank()
                    && postMapper.checkPostLikeExist(postId, viewerId) > 0);
        }
        return post;
    }

    public boolean modifyPost(Post post) {
        return postMapper.updatePost(post) > 0;
    }

    @Transactional
    public boolean removePost(String postId, String requesterId) {
        Post post = postMapper.getPostDetail(postId);
        if (post == null) return false;

        boolean isWriter = requesterId != null && requesterId.equals(post.getWriterId());
        boolean isAdmin = requesterId != null && "admin".equalsIgnoreCase(requesterId);
        if (!isWriter && !isAdmin) return false;

        // FK 제약 방지: 좋아요 -> 댓글 -> 게시글 순서로 삭제
        postMapper.deletePostLikesByPostId(postId);
        postMapper.deleteCommentsByPostId(postId);
        return postMapper.deletePost(postId) > 0;
    }

    public boolean writeComment(PostComment comment) {
        boolean result = postMapper.insertComment(comment) > 0;
        if (result) {
            try {
                Post post = postMapper.getPostDetail(comment.getPostId());
                if (post != null && !post.getWriterId().equals(comment.getWriterId())) {
                    notificationService.createNotification(
                            post.getWriterId(),
                            comment.getWriterId(),
                            "POST_COMMENT",
                            comment.getPostId(),
                            comment.getWriterId() + "님이 회원님의 게시글에 댓글을 남겼습니다."
                    );
                }
            } catch (Exception e) {
                System.out.println("게시판 댓글 알림 저장 실패: " + e.getMessage());
            }
        }
        return result;
    }

    public boolean removeComment(int commentId, String requesterId) {
        return postMapper.deleteComment(commentId, requesterId) > 0;
    }

    @Transactional
    public Map<String, Object> toggleLike(String postId, String userId) {
        Post post = postMapper.getPostDetail(postId);
        if (post == null || userId == null || userId.isBlank()) {
            return Map.of("liked", false, "likeCount", 0);
        }

        boolean liked;
        if (postMapper.checkPostLikeExist(postId, userId) > 0) {
            postMapper.deletePostLike(postId, userId);
            postMapper.decrementPostLikeCount(postId);
            liked = false;
        } else {
            postMapper.insertPostLike(postId, userId);
            postMapper.incrementPostLikeCount(postId);
            liked = true;

            // 게시판 좋아요 알림: 다른 사람이 내 게시글에 좋아요를 눌렀을 때만 알림 생성
            try {
                if (post.getWriterId() != null && !post.getWriterId().equals(userId)) {
                    notificationService.createNotification(
                            post.getWriterId(),
                            userId,
                            "POST_LIKE",
                            postId,
                            userId + "님이 회원님의 게시글을 좋아합니다."
                    );
                }
            } catch (Exception e) {
                System.out.println("게시판 좋아요 알림 저장 실패: " + e.getMessage());
            }
        }

        int likeCount = postMapper.getPostLikeCount(postId);
        return Map.of("liked", liked, "likeCount", likeCount);
    }

    private void fillCommentsAndLikes(List<Post> posts, String viewerId) {
        if (posts == null) return;
        for (Post post : posts) {
            post.setComments(postMapper.getCommentsByPostId(post.getPostId()));
            post.setLiked(viewerId != null && !viewerId.isBlank()
                    && postMapper.checkPostLikeExist(post.getPostId(), viewerId) > 0);
        }
    }
}
