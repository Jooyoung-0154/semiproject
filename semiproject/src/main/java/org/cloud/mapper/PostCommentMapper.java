package org.cloud.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.cloud.dto.Post;
import org.cloud.dto.PostComment;

@Mapper
public interface PostCommentMapper {
    int insertPost(Post post);
    int updatePost(Post post);
    int deletePost(String postId);
    List<Post> getPostList();
    Post getPostDetail(String postId);
    List<Post> getPostsByWriter(String writerId);

    int insertComment(PostComment comment);
    int updateComment(PostComment comment);
    int deleteComment(@Param("commentId") int commentId, @Param("requesterId") String requesterId);
    int deleteCommentsByPostId(String postId);
    int deletePostLikesByPostId(String postId);
    List<PostComment> getCommentsByPostId(String postId);

    int checkPostLikeExist(@Param("postId") String postId, @Param("userId") String userId);
    int insertPostLike(@Param("postId") String postId, @Param("userId") String userId);
    int deletePostLike(@Param("postId") String postId, @Param("userId") String userId);
    int incrementPostLikeCount(@Param("postId") String postId);
    int decrementPostLikeCount(@Param("postId") String postId);
    int getPostLikeCount(@Param("postId") String postId);
}
