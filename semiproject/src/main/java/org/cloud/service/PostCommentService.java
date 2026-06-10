<<<<<<< HEAD
package org.cloud.service;

import java.util.List;
import java.util.Map;

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

    public Post getPost(int postId, String viewerId) {
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
    public boolean removePost(int postId, String requesterId) {
        Post post = postMapper.getPostDetail(postId);
        if (post == null) return false;

        boolean isWriter = requesterId != null && requesterId.equals(post.getWriterId());
        boolean isAdmin = "Admin".equals(requesterId) || "admin".equals(requesterId);
        if (!isWriter && !isAdmin) return false;

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
                            String.valueOf(comment.getPostId()),
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
    public Map<String, Object> toggleLike(int postId, String userId) {
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
                            String.valueOf(postId),
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
=======
package org.cloud.service;

import java.util.List;

import org.cloud.dto.Post;
import org.cloud.dto.PostComment;
import org.cloud.mapper.PostCommentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PostCommentService {

	@Autowired
	private PostCommentMapper postMapper;

	// 게시글 작성
	public boolean writePost(Post post) {
		return postMapper.insertPost(post) > 0;
	}

	public boolean modifyComment(PostComment comment) {
	    return postMapper.updateComment(comment) > 0;
	}
	// 게시글 목록 조회 (최신순)
	public List<Post> getAllPosts() {
		List<Post> posts = postMapper.getPostList();
		fillComments(posts);
		return posts;
	}

	public List<Post> getPostsByWriter(String writerId) {
		List<Post> posts = postMapper.getPostsByWriter(writerId);
		fillComments(posts);
		return posts;
	}

	// 게시글 상세 조회 (댓글 리스트를 여기서 채워줌!)
	public Post getPost(int postId) {
		// 1. 게시글 본문 가져오기
		Post post = postMapper.getPostDetail(postId);

		if (post != null) {
			// 2. 해당 게시글에 달린 댓글 리스트를 가져와서 DTO에 세팅
			List<PostComment> comments = postMapper.getCommentsByPostId(postId);
			post.setComments(comments);
		}
		return post;
	}

	// 게시글 수정/삭제
	public boolean modifyPost(Post post) {
		return postMapper.updatePost(post) > 0;
	}

	public boolean removePost(int postId, String requesterId) {
		// FK 제약 방지를 위해 댓글 먼저 삭제 후 게시글 삭제
	    Post post = postMapper.getPostDetail(postId);

	    if (post == null) {
	        return false;
	    }

	    boolean isWriter = requesterId != null && requesterId.equals(post.getWriterId());
	    boolean isAdmin = "Admin".equals(requesterId);

	    if (!isWriter && !isAdmin) {
	        return false;
	    }

	    postMapper.deleteCommentsByPostId(postId);
	    return postMapper.deletePost(postId) > 0;
	}
	// --- 댓글 관련 서비스 ---
	public boolean writeComment(PostComment comment) {
		return postMapper.insertComment(comment) > 0;
	}

	public boolean removeComment(int commentId, String requesterId) {
		return postMapper.deleteComment(commentId, requesterId) > 0;
	}

	private void fillComments(List<Post> posts) {
		if (posts == null)
			return;

		for (Post post : posts) {
			List<PostComment> comments = postMapper.getCommentsByPostId(post.getPostId());
			post.setComments(comments);
		}

		
	}
}
>>>>>>> 5ee042261809b2e907799f6894e7460b59020a81
