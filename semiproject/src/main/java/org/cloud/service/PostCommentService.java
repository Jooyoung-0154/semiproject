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

	public boolean removePost(int postId) {
		// FK 제약 방지를 위해 댓글 먼저 삭제 후 게시글 삭제
		postMapper.deleteCommentsByPostId(postId);
		return postMapper.deletePost(postId) > 0;
	}

	// --- 댓글 관련 서비스 ---
	public boolean writeComment(PostComment comment) {
		return postMapper.insertComment(comment) > 0;
	}

	public boolean removeComment(int commentId) {
		return postMapper.deleteComment(commentId) > 0;
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