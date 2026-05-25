package org.cloud.mapper;

import java.util.List;

import org.cloud.dto.Post;
import org.cloud.dto.PostComment;

public interface PostCommentMapper {
	// --- 게시글 관련 ---
    int insertPost(Post post);
    int updatePost(Post post);
    int deletePost(int POST_ID);
    List<Post> getPostList(); // 최신순 전체 조회
    Post getPostDetail(int POST_ID); // 특정 게시글 상세 조회

    // --- 댓글 관련 ---
    int insertComment(PostComment comment);
    int updateComment(PostComment comment);
    int deleteComment(int COMMENT_ID);
    List<PostComment> getCommentsByPostId(int POST_ID); // 특정 게시글의 댓글들 조회
}
