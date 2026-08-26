package org.cloud.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.cloud.dto.Post;
import org.cloud.dto.PostComment;
import org.cloud.exception.ResourceNotFoundException;
import org.cloud.mapper.PostCommentMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostCommentService {

    private final PostCommentMapper postMapper;

    private final NotificationService notificationService;

    public boolean writePost(Post post) {
        validateContent(post.getContent(), "게시글 내용을 입력해주세요.");
        post.setPostId(UUID.randomUUID().toString());
        if (postMapper.insertPost(post) == 0) {
            throw new IllegalStateException("게시글 등록에 실패했습니다.");
        }
        return true;
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
        if (post == null) {
            throw new ResourceNotFoundException("게시글을 찾을 수 없습니다.");
        }
        post.setComments(postMapper.getCommentsByPostId(postId));
        post.setLiked(postMapper.checkPostLikeExist(postId, viewerId) > 0);
        return post;
    }

    public boolean modifyPost(Post post, String requesterId) {
        validateContent(post.getContent(), "게시글 내용을 입력해주세요.");
        validatePostOwner(post.getPostId(), requesterId);
        if (postMapper.updatePost(post) == 0) {
            throw new ResourceNotFoundException("게시글을 찾을 수 없습니다.");
        }
        return true;
    }

    @Transactional
    public boolean removePost(String postId, String requesterId, boolean isAdmin) {
        Post post = getPostOrThrow(postId);
        boolean isWriter = requesterId.equals(post.getWriterId());
        if (!isWriter && !isAdmin) {
            throw new AccessDeniedException("게시글을 삭제할 권한이 없습니다.");
        }

        // FK 제약 방지: 좋아요 -> 댓글 -> 게시글 순서로 삭제
        postMapper.deletePostLikesByPostId(postId);
        postMapper.deleteCommentsByPostId(postId);
        if (postMapper.deletePost(postId) == 0) {
            throw new ResourceNotFoundException("게시글을 찾을 수 없습니다.");
        }
        return true;
    }

    public boolean writeComment(PostComment comment) {
        validateContent(comment.getContent(), "댓글 내용을 입력해주세요.");
        Post post = getPostOrThrow(comment.getPostId());
        if (postMapper.insertComment(comment) == 0) {
            throw new IllegalStateException("댓글 등록에 실패했습니다.");
        }
        try {
            if (!post.getWriterId().equals(comment.getWriterId())) {
                notificationService.createNotification(
                        post.getWriterId(),
                        comment.getWriterId(),
                        "POST_COMMENT",
                        comment.getPostId(),
                        comment.getWriterId() + "님이 회원님의 게시글에 댓글을 남겼습니다."
                );
            }
        } catch (Exception exception) {
            log.warn("게시글 댓글 알림 저장에 실패했습니다. postId={}", comment.getPostId(), exception);
        }
        return true;
    }

    public boolean modifyComment(PostComment comment, String requesterId) {
        validateContent(comment.getContent(), "댓글 내용을 입력해주세요.");
        PostComment existing = getCommentOrThrow(comment.getCommentId());
        if (!requesterId.equals(existing.getWriterId())) {
            throw new AccessDeniedException("댓글을 수정할 권한이 없습니다.");
        }
        if (postMapper.updateComment(comment) == 0) {
            throw new ResourceNotFoundException("댓글을 찾을 수 없습니다.");
        }
        return true;
    }

    public boolean removeComment(int commentId, String requesterId, boolean isAdmin) {
        PostComment comment = getCommentOrThrow(commentId);
        if (!requesterId.equals(comment.getWriterId()) && !isAdmin) {
            throw new AccessDeniedException("댓글을 삭제할 권한이 없습니다.");
        }
        if (postMapper.deleteComment(commentId) == 0) {
            throw new ResourceNotFoundException("댓글을 찾을 수 없습니다.");
        }
        return true;
    }

    @Transactional
    public Map<String, Object> toggleLike(String postId, String userId) {
        Post post = postMapper.getPostDetail(postId);
        if (post == null) {
            throw new ResourceNotFoundException("게시글을 찾을 수 없습니다.");
        }

        boolean liked;
        if (postMapper.checkPostLikeExist(postId, userId) > 0) {
            if (postMapper.deletePostLike(postId, userId) == 0) {
                throw new IllegalStateException("게시글 좋아요 취소에 실패했습니다.");
            }
            if (postMapper.decrementPostLikeCount(postId) == 0) {
                throw new ResourceNotFoundException("게시글을 찾을 수 없습니다.");
            }
            liked = false;
        } else {
            if (postMapper.insertPostLike(postId, userId) == 0) {
                throw new IllegalStateException("게시글 좋아요 등록에 실패했습니다.");
            }
            if (postMapper.incrementPostLikeCount(postId) == 0) {
                throw new ResourceNotFoundException("게시글을 찾을 수 없습니다.");
            }
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
            } catch (Exception exception) {
                log.warn("게시글 좋아요 알림 저장에 실패했습니다. postId={}", postId, exception);
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

    public void validatePostOwner(String postId, String requesterId) {
        Post post = getPostOrThrow(postId);
        if (!requesterId.equals(post.getWriterId())) {
            throw new AccessDeniedException("게시글을 수정할 권한이 없습니다.");
        }
    }

    private Post getPostOrThrow(String postId) {
        Post post = postMapper.getPostDetail(postId);
        if (post == null) {
            throw new ResourceNotFoundException("게시글을 찾을 수 없습니다.");
        }
        return post;
    }

    private PostComment getCommentOrThrow(int commentId) {
        PostComment comment = postMapper.getCommentById(commentId);
        if (comment == null) {
            throw new ResourceNotFoundException("댓글을 찾을 수 없습니다.");
        }
        return comment;
    }

    private void validateContent(String content, String message) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }
}
