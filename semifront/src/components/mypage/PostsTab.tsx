import { useState, useEffect, useMemo } from "react";
import {
  Heart,
  MessageCircle,
  Clock,
  Pencil,
  Trash2,
  Send,
  X,
} from "lucide-react";
import { Post, Member } from "../../types/type";
import { postService } from "../../service/postService";
import { API_BASE_URL } from "../../config/api";

interface PostsTabProps {
  displayUser: Member;
  currentUserId: string;
  isOwnPage: boolean;
}

type PostSortType = "latest" | "like";

const normalizeImageUrl = (path?: string | null) => {
  if (!path) return null;
  const cleanPath = String(path).trim();
  if (!cleanPath) return null;
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }
  if (cleanPath.startsWith("/")) return `${API_BASE_URL}${cleanPath}`;
  return `${API_BASE_URL}/uploads/${cleanPath}`;
};

const formatPostDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.length >= 16 ? value.slice(0, 16).replace("T", " ") : value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}`;
};

export default function PostsTab({
  displayUser,
  currentUserId,
  isOwnPage,
}: PostsTabProps) {
  const [postList, setPostList] = useState<Post[]>([]);
  const [postSortType, setPostSortType] = useState<PostSortType>("latest");
  const [isPostCreateMode, setIsPostCreateMode] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostImagePreview, setNewPostImagePreview] = useState("");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [, setEditingPostImg] = useState("");
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [popupImageUrl, setPopupImageUrl] = useState<string | null>(null);
  const [commentModalPost, setCommentModalPost] = useState<Post | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [displayUser.id, currentUserId]);

  const sortedPostList = useMemo(() => {
    const copied = [...postList];

    if (postSortType === "like") {
      return copied.sort((a, b) => {
        const likeDiff = (b.likeCount ?? 0) - (a.likeCount ?? 0);
        if (likeDiff !== 0) return likeDiff;

        return (
          new Date(b.regDate ?? 0).getTime() -
          new Date(a.regDate ?? 0).getTime()
        );
      });
    }

    return copied.sort(
      (a, b) =>
        new Date(b.regDate ?? 0).getTime() -
        new Date(a.regDate ?? 0).getTime(),
    );
  }, [postList, postSortType]);

  const fetchPosts = async () => {
    try {
      setIsLoadingPosts(true);
      const response = await postService.getByWriter(
        displayUser.id,
        currentUserId,
      );
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
      const { liked, likeCount } = response.data as {
        liked: boolean;
        likeCount: number;
      };

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

  const handleCommentInputChange = (postId: number, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const syncModalPost = (updatedPosts: Post[]) => {
    if (!commentModalPost) return;

    const updatedModalPost = updatedPosts.find(
      (post) => post.postId === commentModalPost.postId,
    );

    if (updatedModalPost) setCommentModalPost(updatedModalPost);
  };

  const reloadPosts = async () => {
    try {
      const response = await postService.getByWriter(
        displayUser.id,
        currentUserId,
      );
      const nextPosts = Array.isArray(response.data) ? response.data : [];
      setPostList(nextPosts);
      syncModalPost(nextPosts);
    } catch (error) {
      console.error("게시글 새로고침 실패:", error);
    }
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
      await reloadPosts();
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
      const response = await postService.updateComment(comment.commentId, {
        ...comment,
        content,
      });

      if (response.data === false) {
        alert("댓글 수정에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      setEditingCommentId(null);
      setEditingCommentContent("");
      await reloadPosts();
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

      await reloadPosts();
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const renderCommentForm = (postId: number) => (
    <form
      className="post-comment-write-form-final"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmitComment(postId);
      }}
    >
      <input
        value={commentInputs[postId] ?? ""}
        onChange={(e) => handleCommentInputChange(postId, e.target.value)}
        placeholder="댓글을 작성해주세요..."
        className="post-comment-input-final"
      />
      <button type="submit" className="btn-comment-submit-final">
        등록
      </button>
    </form>
  );

  const renderComments = (post: Post) => {
    const comments = post.comments ?? [];

    return (
      <div className="post-comment-modal-list">
        {comments.length > 0 ? (
          comments.map((comment: any) => (
            <div key={comment.commentId} className="post-comment-modal-item">
              {editingCommentId === comment.commentId ? (
                <div className="post-comment-modal-edit">
                  <input
                    value={editingCommentContent}
                    onChange={(e) => setEditingCommentContent(e.target.value)}
                    className="post-comment-input-final"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateComment(comment)}
                    className="btn-comment-mini-save"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEditComment}
                    className="btn-comment-mini-cancel"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <>
                  <div className="post-comment-modal-text">
                    <strong>{comment.writerId}</strong>
                    <span>{comment.content}</span>
                  </div>

                  {(comment.writerId === currentUserId ||
                    currentUserId === "Admin" ||
                    currentUserId === "admin") && (
                    <div className="post-comment-modal-actions">
                      {comment.writerId === currentUserId && (
                        <button
                          type="button"
                          onClick={() => handleEditComment(comment)}
                          title="댓글 수정"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.commentId)}
                        title="댓글 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <p className="post-comment-modal-empty">아직 댓글이 없습니다.</p>
        )}
      </div>
    );
  };

  return (
    <div className="posts-tab-content">
      <div className="post-board-toolbar">
        <div>
          <h3 className="section-title">게시판</h3>
          <p className="post-board-subtitle">사진과 글로 일상을 공유해보세요.</p>
        </div>

        <div className="post-board-toolbar-actions">
          <select
            value={postSortType}
            onChange={(e) => setPostSortType(e.target.value as PostSortType)}
            className="post-sort-select"
            aria-label="게시판 정렬"
          >
            <option value="latest">최신순</option>
            <option value="like">좋아요순</option>
          </select>

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
      </div>

      {isPostCreateMode && (
        <div className="posts-create-panel">
          <div className="posts-create-header">
            <h4 className="posts-create-title">
              {editingPostId ? "게시글 수정" : "게시글 작성"}
            </h4>
            <button
              type="button"
              onClick={() => {
                clearPostForm();
                setIsPostCreateMode(false);
              }}
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
              <input
                type="file"
                accept="image/*"
                onChange={handlePostImageChange}
                className="file-input"
              />
            </label>

            {newPostImagePreview && (
              <div className="image-preview">
                <img src={newPostImagePreview} alt="미리보기" />
              </div>
            )}

            <div className="posts-create-actions">
              <button type="submit" className="btn-create-post">
                등록
              </button>
              <button
                type="button"
                className="btn-create-cancel"
                onClick={() => {
                  clearPostForm();
                  setIsPostCreateMode(false);
                }}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoadingPosts ? (
        <div className="text-center py-12 text-gray-400">
          게시글을 불러오는 중입니다...
        </div>
      ) : sortedPostList.length > 0 ? (
        <div className="post-board-list post-board-list-final">
          {sortedPostList.map((post) => {
            const imageSrc = normalizeImageUrl(post.postImg);
            const comments = post.comments ?? [];
            const canEditPost = post.writerId === currentUserId;
            const canDeletePost =
              post.writerId === currentUserId ||
              currentUserId === "Admin" ||
              currentUserId === "admin";

            return (
              <article
                key={post.postId}
                className={`post-card-final ${imageSrc ? "has-image" : "no-image"}`}
              >
                <div className="post-meta-final post-meta-final-top">
                  <div className="post-date-final">
                    <Clock className="w-4 h-4" />
                    <span>{formatPostDate(post.regDate)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleLike(post)}
                    className={`post-like-final ${post.liked ? "liked" : ""}`}
                    title="좋아요"
                  >
                    <Heart
                      className="w-5 h-5"
                      fill={post.liked ? "#ec4899" : "none"}
                    />
                    <span>{post.likeCount ?? 0}</span>
                  </button>
                </div>

                {imageSrc && (
                  <button
                    type="button"
                    className="post-photo-final"
                    onClick={() => setPopupImageUrl(imageSrc)}
                    title="사진 크게 보기"
                  >
                    <img
                      src={imageSrc}
                      alt="게시글 이미지"
                      className="post-photo-img-final"
                    />
                  </button>
                )}

                <section className="post-content-final">
                  <h4 className="post-content-title-final">게시글</h4>
                  <div className="post-content-text-final">{post.content}</div>
                </section>

                <div className="post-comment-summary-final">
                  <div className="post-comment-count-final">
                    <MessageCircle className="w-4 h-4" />
                    <span>댓글 {comments.length}개</span>
                  </div>

                  <button
                    type="button"
                    className="btn-comment-open-final"
                    onClick={() => setCommentModalPost(post)}
                  >
                    댓글 모두 보기
                    <span>›</span>
                  </button>
                </div>

                {renderCommentForm(post.postId)}

                {canDeletePost && (
                  <div className="post-actions-final">
                    {canEditPost && (
                      <button
                        type="button"
                        onClick={() => handleEditPost(post)}
                        className="post-action-btn-final edit"
                        title="게시글 수정"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>수정</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.postId)}
                      className="post-action-btn-final delete"
                      title="게시글 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>삭제</span>
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">게시글이 없습니다.</div>
      )}

      {commentModalPost && (
        <div
          className="post-comment-modal-overlay"
          onClick={() => setCommentModalPost(null)}
          role="button"
          tabIndex={0}
        >
          <div
            className="post-comment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="post-comment-modal-header">
              <div>
                <p className="post-comment-modal-title">댓글</p>
                <span>{commentModalPost.comments?.length ?? 0}개</span>
              </div>

              <button
                type="button"
                onClick={() => setCommentModalPost(null)}
                className="post-comment-modal-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderComments(commentModalPost)}

          </div>
        </div>
      )}

      {popupImageUrl && (
        <div
          className="post-image-popup"
          onClick={() => setPopupImageUrl(null)}
          role="button"
          tabIndex={0}
        >
          <div
            className="post-image-popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="post-image-popup-close"
              onClick={() => setPopupImageUrl(null)}
            >
              닫기
            </button>
            <img src={popupImageUrl} alt="게시글 확대 이미지" />
          </div>
        </div>
      )}
    </div>
  );
}
