import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Post, Member } from "../../types/type";
import { postService } from "../../service/postService";
import { API_BASE_URL } from "../../config/api";

interface PostsTabProps {
  displayUser: Member;
  currentUserId: string;
  isOwnPage: boolean;
}

const normalizeImageUrl = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/uploads/${path}`;
};

export default function PostsTab({ displayUser, currentUserId, isOwnPage }: PostsTabProps) {
  const [postList, setPostList] = useState<Post[]>([]);
  const [isPostCreateMode, setIsPostCreateMode] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostImagePreview, setNewPostImagePreview] = useState<string>("");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [, setEditingPostImg] = useState<string>("");
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [showCommentFormByPostId, setShowCommentFormByPostId] = useState<Record<number, boolean>>({});
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [displayUser.id, currentUserId]);

  const fetchPosts = async () => {
    try {
      setIsLoadingPosts(true);
      const response = await postService.getList(currentUserId);
      setPostList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("게시글 불러오기 실패:", error);
      setPostList([]);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setNewPostImage(file);
    setNewPostImagePreview(file ? URL.createObjectURL(file) : "");
  };

  const clearPostForm = () => {
    setNewPostContent("");
    setNewPostImage(null);
    setNewPostImagePreview("");
    setEditingPostId(null);
    setEditingPostImg("");
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newPostContent.trim();
    if (!content) {
      alert("게시글 내용을 입력해주세요.");
      return;
    }
    if (!currentUserId) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("writerId", currentUserId);
      formData.append("content", content);
      if (newPostImage) formData.append("image", newPostImage);

      if (editingPostId !== null) {
        await postService.modifyWithImage(editingPostId, formData);
        alert("게시글이 수정되었습니다.");
      } else {
        await postService.writeWithImage(formData);
        alert("게시글이 작성되었습니다.");
      }

      clearPostForm();
      setIsPostCreateMode(false);
      await fetchPosts();
    } catch (error) {
      console.error("게시글 작성 실패:", error);
      alert("게시글 작성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(post.postId);
    setNewPostContent(post.content ?? "");
    setEditingPostImg(post.postImg ?? "");
    setNewPostImage(null);
    setNewPostImagePreview("");
    setIsPostCreateMode(true);
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;
    try {
      await postService.deletePost(postId, currentUserId);
      await fetchPosts();
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert("게시글 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleToggleLike = async (post: Post) => {
    if (!currentUserId) {
      alert("로그인 후 좋아요를 누를 수 있습니다.");
      return;
    }
    try {
      const response = await postService.toggleLike(post.postId, currentUserId);
      const { liked, likeCount } = response.data as { liked: boolean; likeCount: number };
      setPostList((prev) =>
        prev.map((item) =>
          item.postId === post.postId ? { ...item, liked, likeCount } : item,
        ),
      );
    } catch (error) {
      console.error("게시글 좋아요 실패:", error);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  const handleToggleCommentForm = (postId: number) => {
    setShowCommentFormByPostId((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentInputChange = (postId: number, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleSubmitComment = async (postId: number) => {
    const content = (commentInputs[postId] ?? "").trim();
    if (!content) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    if (!currentUserId) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }
    try {
      const response = await postService.addComment({
        commentId: 0,
        postId,
        writerId: currentUserId,
        content,
        regDate: new Date().toISOString(),
      });
      if (response.data === false) {
        alert("댓글 작성에 실패했습니다.");
        return;
      }
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      await fetchPosts();
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.commentId);
    setEditingCommentContent(comment.content ?? "");
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  };

  const handleUpdateComment = async (comment: any) => {
    const content = editingCommentContent.trim();
    if (!content) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    try {
      const response = await postService.updateComment(comment.commentId, { ...comment, content });
      if (response.data === false) {
        alert("댓글 수정에 실패했습니다. 다시 시도해주세요.");
        return;
      }
      setEditingCommentId(null);
      setEditingCommentContent("");
      await fetchPosts();
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      alert("댓글 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      const response = await postService.deleteComment(commentId, currentUserId);
      if (response.data === false) {
        alert("댓글 삭제에 실패했습니다. 다시 시도해주세요.");
        return;
      }
      await fetchPosts();
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="posts-tab-content">
      <div className="section-title-wrap justify-between">
        <div className="flex items-center gap-2">
          <h3 className="section-title">게시판</h3>
        </div>
        {isOwnPage && (
          <button
            type="button"
            onClick={() => setIsPostCreateMode(true)}
            className="btn-create-post btn-create-post-small"
          >
            게시글 작성
          </button>
        )}
      </div>

      {isPostCreateMode && (
        <div className="posts-create-panel">
          <div className="posts-create-header">
            <h4 className="posts-create-title">{editingPostId ? "게시글 수정" : "게시글 작성"}</h4>
            <button
              type="button"
              onClick={() => { clearPostForm(); setIsPostCreateMode(false); }}
              className="btn-create-cancel"
            >
              목록 보기
            </button>
          </div>
          <form onSubmit={handleSubmitPost} className="posts-create-form">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="게시글 내용을 입력하세요."
              className="posts-create-textarea"
              rows={6}
            />
            <label className="file-input-label">
              사진 첨부
              <input type="file" accept="image/*" onChange={handlePostImageChange} className="file-input" />
            </label>
            {newPostImagePreview && (
              <div className="image-preview">
                <img src={newPostImagePreview} alt="미리보기" />
              </div>
            )}
            <div className="posts-create-actions">
              <button type="submit" className="btn-create-post">등록</button>
              <button
                type="button"
                className="btn-create-cancel"
                onClick={() => { clearPostForm(); setIsPostCreateMode(false); }}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoadingPosts ? (
        <div className="text-center py-12 text-gray-400">게시글을 불러오는 중입니다...</div>
      ) : postList.length > 0 ? (
        <div className="recipe-list flex flex-col gap-4">
          {postList.map((post) => {
            const imageSrc = normalizeImageUrl(post.postImg);
            return (
              <div key={post.postId} className="recipe-item bg-white rounded-xl p-4 shadow-sm">
                <div className="post-row flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="recipe-title text-lg font-bold">{post.content}</p>
                    {imageSrc && (
                      <div className="post-image-wrap">
                        <img src={imageSrc} alt="게시글 이미지" className="post-image" />
                      </div>
                    )}
                    <div className="post-meta-like-row">
                      <p className="recipe-meta text-xs text-gray-400 mt-2">작성일 {post.regDate}</p>
                      <button
                        type="button"
                        onClick={() => handleToggleLike(post)}
                        className={`btn-post-like ${post.liked ? "liked" : ""}`}
                      >
                        <Heart className="post-like-icon" fill={post.liked ? "#ec4899" : "none"} />
                        <span>{post.likeCount ?? 0}</span>
                      </button>
                    </div>
                  </div>

                  {(post.writerId === currentUserId || currentUserId === "Admin" || currentUserId === "admin") && (
                    <div className="post-item-actions flex items-start justify-end gap-2 min-w-[120px]">
                      {post.writerId === currentUserId && (
                        <button type="button" onClick={() => handleEditPost(post)} className="btn-post-edit">
                          수정
                        </button>
                      )}
                      <button type="button" onClick={() => handleDeletePost(post.postId)} className="btn-post-delete">
                        삭제
                      </button>
                    </div>
                  )}
                </div>

                <div className="post-comments-wrap">
                  <div className="post-comments-header">
                    <span className="post-comments-title">댓글 {post.comments?.length ?? 0}개</span>
                    <button type="button" onClick={() => handleToggleCommentForm(post.postId)} className="btn-open-comment">
                      댓글 작성
                    </button>
                  </div>

                  <div className="post-comments-list">
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment: any) => (
                        <div key={comment.commentId} className="post-comment-item">
                          {editingCommentId === comment.commentId ? (
                            <div className="post-comment-edit-row">
                              <input
                                value={editingCommentContent}
                                onChange={(e) => setEditingCommentContent(e.target.value)}
                                className="post-comment-input"
                              />
                              <button type="button" onClick={() => handleUpdateComment(comment)} className="btn-comment-submit">저장</button>
                              <button type="button" onClick={handleCancelEditComment} className="btn-comment-cancel">취소</button>
                            </div>
                          ) : (
                            <>
                              <div className="post-comment-content">
                                <span className="post-comment-writer">{comment.writerId}</span>
                                <span className="post-comment-text">{comment.content}</span>
                              </div>
                              {(comment.writerId === currentUserId || currentUserId === "Admin" || currentUserId === "admin") && (
                                <div className="post-comment-actions">
                                  {comment.writerId === currentUserId && (
                                    <button type="button" onClick={() => handleEditComment(comment)} className="btn-comment-edit">수정</button>
                                  )}
                                  <button type="button" onClick={() => handleDeleteComment(comment.commentId)} className="btn-comment-delete">삭제</button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="post-comment-empty">아직 댓글이 없습니다.</p>
                    )}
                  </div>

                  {showCommentFormByPostId[post.postId] && (
                    <form
                      className="post-comment-form"
                      onSubmit={(e) => { e.preventDefault(); handleSubmitComment(post.postId); }}
                    >
                      <input
                        value={commentInputs[post.postId] ?? ""}
                        onChange={(e) => handleCommentInputChange(post.postId, e.target.value)}
                        placeholder="댓글을 입력하세요."
                        className="post-comment-input"
                      />
                      <button type="submit" className="btn-comment-submit">등록</button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">게시글이 없습니다.</div>
      )}
    </div>
  );
}
