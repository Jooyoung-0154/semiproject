package org.cloud.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
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

    int deleteComment(int commentId);

    int deleteCommentsByPostId(int postId);

    List<PostComment> getCommentsByPostId(int postId);
}
