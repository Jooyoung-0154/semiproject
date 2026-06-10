<<<<<<< HEAD
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
    int deletePost(int postId);
    List<Post> getPostList();
    Post getPostDetail(int postId);
    List<Post> getPostsByWriter(String writerId);

    int insertComment(PostComment comment);
    int updateComment(PostComment comment);
    int deleteComment(@Param("commentId") int commentId, @Param("requesterId") String requesterId);
    int deleteCommentsByPostId(int postId);
    List<PostComment> getCommentsByPostId(int postId);

    int checkPostLikeExist(@Param("postId") int postId, @Param("userId") String userId);
    int insertPostLike(@Param("postId") int postId, @Param("userId") String userId);
    int deletePostLike(@Param("postId") int postId, @Param("userId") String userId);
    int incrementPostLikeCount(@Param("postId") int postId);
    int decrementPostLikeCount(@Param("postId") int postId);
    int getPostLikeCount(@Param("postId") int postId);
}
=======
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

	int deletePost(int postId);

	List<Post> getPostList();

	Post getPostDetail(int postId);

	List<Post> getPostsByWriter(String writerId);

	int insertComment(PostComment comment);

    int deleteComment(@Param("commentId") int commentId, @Param("requesterId") String requesterId);

    int deleteCommentsByPostId(int postId);

    List<PostComment> getCommentsByPostId(int postId);
}
>>>>>>> 5ee042261809b2e907799f6894e7460b59020a81
