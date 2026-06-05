import { useState, useEffect } from "react";
import {
  User,
  Users,
  MessageSquare,
  Wallet,
  DollarSign,
  Clock,
  ChefHat,
  Heart,
} from "lucide-react";
import RecipeCard from "./RecipeCard";
import "./MyPage.css";
import { Recipe_Info, Post, Member, Guestbook } from "../types/type.ts";
import { memberService } from "../service/memberService.ts";
import RecipeService from "../service/recipeService";
import { guestbookService } from "../service/guestbookService.ts";
import { postService } from "../service/postService.ts";
import { socialService } from "../service/socialService.ts";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth, normalizeMember } from "../context/AuthContext.tsx";
import { authService } from "../service/authService.ts";
import likeService from "../service/likeService";

export default function MyPage() {
  // user랑 로그인 정보 setting 과정
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<Member | null>(authUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [myRecipes, setMyRecipes] = useState<Recipe_Info[]>([]);
  const [myRecipesLoading, setMyRecipesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"recipes" | "liked" | "posts">(
    "recipes",
  );
  const [newGuestbook, setNewGuestbook] = useState("");
  const [guestbookMessages, setGuestbookMessages] = useState<Guestbook[]>([]);
  const [editingGuestbookId, setEditingGuestbookId] = useState<number | null>(
    null,
  );
  const [editedGuestbookText, setEditedGuestbookText] = useState("");
  const [subscriptions, setSubscriptions] = useState<Member[]>([]);
  const [visibleSubCount, setVisibleSubCount] = useState(5);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [postList, setPostList] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostImagePreview, setNewPostImagePreview] = useState<string>("");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingPostImg, setEditingPostImg] = useState<string>("");
  const [isPostCreateMode, setIsPostCreateMode] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>(
    {},
  );

  const [showCommentFormByPostId, setShowCommentFormByPostId] = useState<
    Record<number, boolean>
  >({});

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");

  const [likedPostIds, setLikedPostIds] = useState<Record<number, boolean>>({});
  const [localLikeCounts, setLocalLikeCounts] = useState<
    Record<number, number>
  >({});

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [likedRecipes, setLikedRecipes] = useState<Recipe_Info[]>([]);
  const [likedRecipesLoading, setLikedRecipesLoading] = useState(false);
  const [likedPage, setLikedPage] = useState(1);
  const LIKED_PAGE_SIZE = 6;
  const { userId } = useParams<{ userId: string }>();
  const currentUserId = authUser?.id ?? "";
  const displayUser = user ?? authUser;
  const isOwnPage = Boolean(
    authUser?.id && displayUser?.id && authUser.id === displayUser.id,
  );

  useEffect(() => {
    const fetchMemberData = async () => {
      // 다른 유저 프로필 조회
      if (userId && userId !== authUser?.id) {
        setIsLoading(true);
        try {
          const response = await memberService.getMemberById(userId);
          const normalized = normalizeMember(response.data);
          setUser(normalized ?? null);
        } catch (error) {
          console.error("유저 정보를 불러오는데 실패했습니다.", error);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // 내 페이지
      if (!authUser) {
        setIsLoading(false);
        setUser(null);
        return;
      }

      setUser(authUser);
      if (!authUser.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await memberService.getMemberById(authUser.id);
        const normalized = normalizeMember(response.data) ?? authUser;
        setUser(normalized);
      } catch (error) {
        console.error("유저 정보를 불러오는데 실패했습니다.", error);
        setUser(authUser);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberData();
  }, [authUser, userId]);

  const fetchPosts = async () => {
    if (!displayUser?.id) return;
    try {
      const response = await postService.getByWriter(displayUser.id);
      setPostList(response.data);
    } catch (error) {
      console.error("게시글 불러오기 실패:", error);
    }
  };

  const fetchGuestbookMessages = async () => {
    if (!displayUser?.id) return;

    try {
      const response = await guestbookService.getList(displayUser.id);
      const messages = response.data?.list ?? response.data ?? [];
      setGuestbookMessages(Array.isArray(messages) ? messages : []);
    } catch (error) {
      console.error("방명록 불러오기 실패:", error);
    }
  };

  const formatGuestbookDate = (dateString: string | undefined): string => {
    if (!dateString) return "";
    const normalized = dateString
      .trim()
      .replace(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/, "$1T$2");
    let parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
      parsed = new Date(`${normalized}Z`);
    }
    if (Number.isNaN(parsed.getTime())) return dateString;
    return parsed.toLocaleString();
  };

  // 스크랩(좋아요) 레시피
  const fetchLikedRecipes = async () => {
    if (!currentUserId) return;

    try {
      setLikedRecipesLoading(true);
      const recipes = await likeService.getMyLikedRecipes(currentUserId);
      setLikedRecipes(recipes.map((r) => ({ ...r, liked: true })));
    } catch (error) {
      console.error("스크랩 레시피 불러오기 실패:", error);
      setLikedRecipes([]);
    } finally {
      setLikedRecipesLoading(false);
    }
  };

  // 내 레시피 불러오기
  const fetchMyRecipes = async () => {
    if (!displayUser?.id) return;
    setMyRecipesLoading(true);
    try {
      const recipes = await RecipeService.getByWriter(displayUser.id);
      setMyRecipes(recipes);
    } catch (error) {
      console.error("내 레시피 불러오기 실패:", error);
      setMyRecipes([]);
    } finally {
      setMyRecipesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "recipes") {
      fetchMyRecipes();
    }
    if (activeTab === "posts") {
      fetchPosts();
    }
    if (activeTab === "liked") {
      fetchLikedRecipes();
    }
  }, [activeTab, displayUser?.id]);

  useEffect(() => {
    fetchGuestbookMessages();
  }, [displayUser?.id]);

  const fetchSubscriptions = async () => {
    if (!displayUser?.id) return;
    try {
      setIsLoadingSubscriptions(true);
      const response = await socialService.getFollowingUsers(displayUser.id);
      setSubscriptions(Array.isArray(response.data) ? response.data : []);
      setVisibleSubCount(5);
    } catch (error) {
      console.error("구독 목록 불러오기 실패:", error);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [displayUser?.id]);

  // 로그인 유저가 프로필 유저를 팔로우 중인지 확인
  useEffect(() => {
    if (!currentUserId || !displayUser?.id || isOwnPage) return;
    socialService
      .checkFollow(currentUserId, displayUser.id)
      .then((res) => setIsFollowing(res.data))
      .catch(() => setIsFollowing(false));
  }, [currentUserId, displayUser?.id, isOwnPage]);

  const handleFollowToggle = async () => {
    if (!currentUserId || !displayUser?.id) return;
    setIsFollowLoading(true);
    try {
      const followPayload = {
        followerId: currentUserId,
        followingId: displayUser.id,
      };
      if (isFollowing) {
        await socialService.unfollow(followPayload);
        setIsFollowing(false);
      } else {
        await socialService.follow(followPayload);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("팔로우 처리 실패:", error);
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  //예외처리
  if (isLoading)
    return <div className="text-center py-8">로딩 중입니다...</div>;
  if (!authUser)
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-lg font-semibold">로그인이 필요합니다.</p>
        <button
          onClick={() => navigate("/login")}
          className="inline-flex items-center justify-center rounded-full bg-orange-600 px-6 py-3 text-white font-semibold hover:bg-orange-700 transition"
        >
          로그인하러 가기
        </button>
      </div>
    );
  if (!displayUser)
    return <div className="text-center py-8">유저 정보가 없습니다.</div>;

  const handleSubscriptionClick = (subscriberId: string) => {
    navigate(`/mypage/${subscriberId}`);
  };

  const handleGuestbookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newGuestbook.trim();
    const hostId = displayUser?.id ?? "";
    const writerId = currentUserId;

    if (!content || !writerId || !hostId) return;

    try {
      const payload: Guestbook = {
        guestbookId: 0,
        hostId,
        writerId,
        writerNickname: authUser?.nickname,
        content,
        regDate: new Date().toISOString(),
      };

      const response = await guestbookService.write(payload);
      console.debug("guestbook.write response:", response?.data);
      const created = response.data?.data ?? response.data ?? null;
      if (created && typeof created === "object") {
        // If server returned the created object, refresh list to keep server ordering
        // prefer refetch to ensure consistent shape
        await fetchGuestbookMessages();
      } else {
        // Fallback: optimistic insert
        setGuestbookMessages((prev) => [payload, ...prev]);
      }
      setNewGuestbook("");
    } catch (error) {
      console.error("방명록 작성 실패:", error);
      alert("방명록 작성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleGuestbookEditInit = (msg: Guestbook) => {
    setEditingGuestbookId(msg.guestbookId);
    setEditedGuestbookText(msg.content ?? "");
  };

  const handleGuestbookCancelEdit = () => {
    setEditingGuestbookId(null);
    setEditedGuestbookText("");
  };

  const handleGuestbookSave = async (msg: Guestbook) => {
    const content = editedGuestbookText.trim();
    if (!content) return;

    try {
      const payload: Guestbook = { ...msg, content };
      await guestbookService.modify(payload);
      // Refresh from server to ensure canonical data
      await fetchGuestbookMessages();
      setEditingGuestbookId(null);
      setEditedGuestbookText("");
    } catch (error) {
      console.error("방명록 수정 실패:", error);
      alert("방명록 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleGuestbookDelete = async (msg: Guestbook) => {
    if (!currentUserId || !displayUser?.id) return;
    const confirmed = window.confirm("정말 이 방명록을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await guestbookService.remove(
        msg.guestbookId,
        currentUserId,
        msg.writerId,
        displayUser.id,
      );
      // Re-fetch to reflect server state
      await fetchGuestbookMessages();
    } catch (error) {
      console.error("방명록 삭제 실패:", error);
      alert("방명록 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handlePasswordConfirm = async () => {
    if (!authUser) return;

    try {
      await authService.login({
        id: authUser.id,
        password: confirmPassword,
      });

      setShowPasswordModal(false);
      setConfirmPassword("");
      navigate("/mypage/info");
    } catch (error) {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    const isConfirmed = window.confirm(
      "정말 이 레시피를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.",
    );
    if (!isConfirmed) return;

    try {
      const isSuccess = await RecipeService.deleteRecipe(recipeId);
      if (isSuccess === true) {
        alert("레시피가 성공적으로 삭제되었습니다.");
        setMyRecipes((prev) => prev.filter((r) => r.recipeId !== recipeId));
      } else {
        alert("삭제 처리에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch (error) {
      console.error("삭제 실패 오류:", error);
      alert("서버 오류로 인해 레시피를 삭제하지 못했습니다.");
    }
  };

  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setNewPostImage(file);
    if (file) {
      setNewPostImagePreview(URL.createObjectURL(file));
    } else {
      setNewPostImagePreview("");
    }
  };

  const clearPostForm = () => {
    setNewPostContent("");
    setNewPostImage(null);
    setNewPostImagePreview("");
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newPostContent.trim();
    if (!content) {
      alert("게시글 내용을 입력해주세요.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("writerId", currentUserId);
      formData.append("content", content);

      if (newPostImage) {
        formData.append("image", newPostImage);
      }

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
    const isConfirmed = window.confirm("정말 이 게시글을 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      await postService.deletePost(postId, currentUserId);
      setPostList((prev) => prev.filter((post) => post.postId !== postId));
      await fetchPosts();
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert("게시글 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const getPostLikeCount = (post: Post) => {
    return localLikeCounts[post.postId] ?? post.likeCount ?? 0;
  };

  const handleToggleLike = (post: Post) => {
    if (!currentUserId) {
      alert("로그인 후 좋아요를 누를 수 있습니다.");
      return;
    }

    const isLiked = likedPostIds[post.postId] === true;

    setLikedPostIds((prev) => ({
      ...prev,
      [post.postId]: !isLiked,
    }));

    setLocalLikeCounts((prev) => ({
      ...prev,
      [post.postId]: Math.max(
        0,
        (prev[post.postId] ?? post.likeCount ?? 0) + (isLiked ? -1 : 1),
      ),
    }));
  };

  const handleToggleCommentForm = (postId: number) => {
    setShowCommentFormByPostId((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleCommentInputChange = (postId: number, value: string) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
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

      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));

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
      await fetchPosts();
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      alert("댓글 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const confirmed = window.confirm("댓글을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      const response = await postService.deleteComment(commentId);

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
  const pagedLikedRecipes = likedRecipes.slice(
    (likedPage - 1) * LIKED_PAGE_SIZE,
    likedPage * LIKED_PAGE_SIZE,
  );

  return (
    <div className="mypage-container">
      <div className="profile-card">
        <div className="profile-flex">
          <div className="profile-info-section">
            <div className="profile-avatar">
              {displayUser.profileImg ? (
                <img
                  src={`http://localhost:8080${displayUser.profileImg}`}
                  alt="프로필"
                  className="profile-avatar-img"
                />
              ) : (
                <User className="avatar-icon" />
              )}
            </div>
            <div>
              <h1 className="profile-name">{displayUser.nickname}</h1>
              <p className="profile-bio">
                {displayUser.intro || "아직 등록된 소개글이 없습니다."}
              </p>

              <div className="profile-stats">
                <span>레시피 {displayUser.recipeCount || 0}개</span>
                <span>팔로워 {displayUser.followerCount}명</span>
                <span>팔로잉 {displayUser.followingCount}명</span>
              </div>
            </div>
          </div>
          {/* 내 페이지: 잔액 표시 / 타인 페이지: 구독 버튼 */}
          {isOwnPage ? (
            <div className="wallet-section">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="btn-charge"
              >
                <User className="btn-icon" />내 정보
              </button>
            </div>
          ) : (
            <div className="wallet-section">
              <button
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className={isFollowing ? "btn-following" : "btn-follow"}
              >
                {isFollowLoading
                  ? "처리중..."
                  : isFollowing
                    ? "구독중"
                    : "구독하기"}
              </button>
            </div>
          )}
        </div>
      </div>
      {/* 메인 콘텐츠 레이아웃 Grid */}
      <div className="main-layout">
        {/* 왼쪽 섹션: 탭 메뉴 + 방명록 */}
        <div className="left-content">
          <div className="tabs-container">
            {/* 탭 버튼 */}
            <div className="tabs-header">
              <button
                onClick={() => setActiveTab("posts")}
                className={`tab-btn ${activeTab === "posts" ? "active" : ""}`}
              >
                게시판
              </button>
              <button
                onClick={() => setActiveTab("recipes")}
                className={`tab-btn ${activeTab === "recipes" ? "active" : ""}`}
              >
                작성 레시피
              </button>
              <button
                onClick={() => {
                  setActiveTab("liked");
                  setLikedPage(1);
                }}
                className={`tab-btn ${activeTab === "liked" ? "active" : ""}`}
              >
                스크랩 레시피
              </button>
            </div>
            {/* 게시판 탭 내용 */}
            {activeTab === "posts" && (
              <div className="posts-tab-content">
                <div className="section-title-wrap justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="title-icon" />
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
                {isPostCreateMode ? (
                  <div className="posts-create-panel">
                    <div className="posts-create-header">
                      <h4 className="posts-create-title">게시글 작성</h4>
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
                    <form
                      onSubmit={handleSubmitPost}
                      className="posts-create-form"
                    >
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
                ) : null}
                {postList.length > 0 ? (
                  <div className="recipe-list flex flex-col gap-4">
                    {postList.map((post) => (
                      <div
                        key={post.postId}
                        className="recipe-item bg-white rounded-xl p-4 shadow-sm"
                      >
                        <div className="post-row flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="recipe-title text-lg font-bold">
                              {post.content}
                            </p>

                            {post.postImg && (
                              <div className="post-image-wrap">
                                <img
                                  src={`http://localhost:8080/uploads/${post.postImg}`}
                                  alt="게시글 이미지"
                                  className="post-image"
                                />
                              </div>
                            )}

                            <div className="post-meta-like-row">
                              <p className="recipe-meta text-xs text-gray-400 mt-2">
                                작성일 {post.regDate}
                              </p>

                              <button
                                type="button"
                                onClick={() => handleToggleLike(post)}
                                className={`btn-post-like ${
                                  likedPostIds[post.postId] ? "liked" : ""
                                }`}
                              >
                                <Heart
                                  className="post-like-icon"
                                  fill={
                                    likedPostIds[post.postId]
                                      ? "#ec4899"
                                      : "none"
                                  }
                                />
                                <span>{getPostLikeCount(post)}</span>
                              </button>
                            </div>
                          </div>

                          {(post.writerId === currentUserId ||
                            currentUserId === "admin") && (
                            <div className="post-item-actions flex items-start justify-end gap-2 min-w-[120px]">
                              {post.writerId === currentUserId && (
                                <button
                                  type="button"
                                  onClick={() => handleEditPost(post)}
                                  className="btn-post-edit"
                                >
                                  수정
                                </button>
                              )}

                              {(post.writerId === currentUserId ||
                                currentUserId === "admin") && (
                                <button
                                  type="button"
                                  onClick={() => handleDeletePost(post.postId)}
                                  className="btn-post-delete"
                                >
                                  삭제
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="post-comments-wrap">
                          <div className="post-comments-header">
                            <span className="post-comments-title">
                              댓글 {post.comments?.length ?? 0}개
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleCommentForm(post.postId)
                              }
                              className="btn-open-comment"
                            >
                              댓글 작성
                            </button>
                          </div>

                          <div className="post-comments-list">
                            {post.comments && post.comments.length > 0 ? (
                              post.comments.map((comment) => (
                                <div
                                  key={comment.commentId}
                                  className="post-comment-item"
                                >
                                  {editingCommentId === comment.commentId ? (
                                    <div className="post-comment-edit-row">
                                      <input
                                        value={editingCommentContent}
                                        onChange={(e) =>
                                          setEditingCommentContent(
                                            e.target.value,
                                          )
                                        }
                                        className="post-comment-input"
                                      />

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateComment(comment)
                                        }
                                        className="btn-comment-submit"
                                      >
                                        저장
                                      </button>

                                      <button
                                        type="button"
                                        onClick={handleCancelEditComment}
                                        className="btn-comment-cancel"
                                      >
                                        취소
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="post-comment-content">
                                        <span className="post-comment-writer">
                                          {comment.writerId}
                                        </span>
                                        <span className="post-comment-text">
                                          {comment.content}
                                        </span>
                                      </div>

                                      {comment.writerId === currentUserId && (
                                        <div className="post-comment-actions">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleEditComment(comment)
                                            }
                                            className="btn-comment-edit"
                                          >
                                            수정
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDeleteComment(
                                                comment.commentId,
                                              )
                                            }
                                            className="btn-comment-delete"
                                          >
                                            삭제
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="post-comment-empty">
                                아직 댓글이 없습니다.
                              </p>
                            )}
                          </div>

                          {showCommentFormByPostId[post.postId] && (
                            <form
                              className="post-comment-form"
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmitComment(post.postId);
                              }}
                            >
                              <input
                                value={commentInputs[post.postId] ?? ""}
                                onChange={(e) =>
                                  handleCommentInputChange(
                                    post.postId,
                                    e.target.value,
                                  )
                                }
                                placeholder="댓글을 입력하세요."
                                className="post-comment-input"
                              />

                              <button
                                type="submit"
                                className="btn-comment-submit"
                              >
                                등록
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    게시글이 없습니다.
                  </div>
                )}
              </div>
            )}
            {/* 내 레시피 탭 내용 */}
            {activeTab === "recipes" && (
              <div>
                {myRecipesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl shadow animate-pulse overflow-hidden"
                      >
                        <div className="h-40 bg-gray-200" />
                        <div className="p-4 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-100 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : myRecipes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <span className="text-5xl mb-3">🍽️</span>
                    <p className="font-medium">작성한 레시피가 없습니다.</p>
                    <button
                      onClick={() => navigate("/write")}
                      className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 transition"
                    >
                      레시피 작성하기
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.recipeId}
                        recipe={recipe}
                        onDelete={isOwnPage ? handleDeleteRecipe : undefined}
                        onEdit={
                          isOwnPage
                            ? (id) => navigate(`/write?edit=${id}`)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* 스크랩 레시피 탭 내용 */}
            {activeTab === "liked" && (
              <div>
                {likedRecipesLoading ? (
                  <div className="text-center py-12 text-gray-400">
                    스크랩 레시피를 불러오는 중입니다...
                  </div>
                ) : likedRecipes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <span className="text-5xl mb-3">🤍</span>
                    <p className="font-medium">스크랩한 레시피가 없습니다.</p>
                    <button
                      onClick={() => navigate("/browse")}
                      className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 transition"
                    >
                      레시피 둘러보기
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pagedLikedRecipes.map((recipe) => {
                      const isMyRecipe = recipe.writerId === currentUserId;
                      return (
                        <RecipeCard
                          key={recipe.recipeId}
                          recipe={recipe}
                          userId={currentUserId || undefined}
                          onLikeChange={(recipeId, liked, likeCount) =>
                            setLikedRecipes((prev) =>
                              prev.map((r) =>
                                r.recipeId === recipeId
                                  ? { ...r, liked, likeCount }
                                  : r,
                              ),
                            )
                          }
                          onDelete={isMyRecipe ? handleDeleteRecipe : undefined}
                          onEdit={
                            isMyRecipe
                              ? (id) => navigate(`/write?edit=${id}`)
                              : undefined
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="guestbook-container">
            <div className="section-title-wrap">
              <MessageSquare className="title-icon" />
              <h3 className="section-title">방명록</h3>
            </div>

            <form onSubmit={handleGuestbookSubmit} className="guestbook-form">
              <textarea
                value={newGuestbook}
                onChange={(e) => setNewGuestbook(e.target.value)}
                placeholder="방명록을 남겨주세요..."
                className="guestbook-textarea"
                rows={3}
              />
              <button type="submit" className="btn-submit">
                작성하기
              </button>
            </form>

            <div className="guestbook-list">
              {guestbookMessages.length > 0 ? (
                guestbookMessages.map((msg) => (
                  <div key={msg.guestbookId} className="guestbook-item">
                    <div className="guestbook-item-header">
                      <div>
                        <span className="guestbook-author">
                          {msg.writerNickname?.trim() || msg.writerId}
                        </span>
                        <span className="guestbook-date">
                          {formatGuestbookDate(msg.regDate)}
                        </span>
                      </div>
                      {msg.writerId === currentUserId && (
                        <div className="guestbook-actions">
                          <button
                            type="button"
                            onClick={() => handleGuestbookEditInit(msg)}
                            className="guestbook-action-btn guestbook-action-edit"
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGuestbookDelete(msg)}
                            className="guestbook-action-btn guestbook-action-delete"
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                    {editingGuestbookId === msg.guestbookId ? (
                      <div className="guestbook-edit-panel">
                        <textarea
                          value={editedGuestbookText}
                          onChange={(e) =>
                            setEditedGuestbookText(e.target.value)
                          }
                          className="guestbook-edit-textarea"
                          rows={3}
                        />
                        <div className="guestbook-edit-actions">
                          <button
                            type="button"
                            onClick={() => handleGuestbookSave(msg)}
                            className="guestbook-action-btn guestbook-action-save"
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={handleGuestbookCancelEdit}
                            className="guestbook-action-btn guestbook-action-cancel"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="guestbook-message">{msg.content}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  작성된 방명록이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 섹션: 구독 목록 (Sticky 화면 고정) */}
        <div className="right-content">
          <div className="subscription-container">
            <div className="section-title-wrap">
              <Users className="title-icon" />
              <h3 className="section-title">구독 목록</h3>
            </div>
            <div className="subscription-list">
              {isLoadingSubscriptions ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  불러오는 중...
                </p>
              ) : subscriptions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  구독 중인 유저가 없습니다.
                </p>
              ) : (
                <>
                  {subscriptions.slice(0, visibleSubCount).map((sub) => (
                    <div key={sub.id} className="subscription-item">
                      <div className="sub-profile-flex">
                        {sub.profileImg ? (
                          <img
                            src={sub.profileImg}
                            alt={sub.nickname}
                            className="sub-avatar-img"
                            onError={(e) => {
                              (
                                e.currentTarget as HTMLImageElement
                              ).style.display = "none";
                              (
                                e.currentTarget
                                  .nextElementSibling as HTMLElement
                              ).style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="sub-avatar"
                          style={{ display: sub.profileImg ? "none" : "flex" }}
                        >
                          <User className="sub-avatar-icon" />
                        </div>
                        <div className="sub-info">
                          <p className="sub-name">{sub.nickname}</p>
                          <p className="sub-recipe-count">
                            레시피 {sub.recipeCount ?? 0}개
                          </p>
                        </div>
                      </div>
                      <p className="sub-followers">
                        팔로워 {sub.followerCount}명
                      </p>
                      <button
                        className="btn-sub-profile"
                        onClick={() => handleSubscriptionClick(sub.id)}
                      >
                        프로필 보기
                      </button>
                    </div>
                  ))}
                  {visibleSubCount < subscriptions.length && (
                    <button
                      className="btn-load-more"
                      onClick={() => setVisibleSubCount((prev) => prev + 5)}
                    >
                      더 보기 ({subscriptions.length - visibleSubCount}명 남음)
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {showPasswordModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">비밀번호 확인</h2>

              <input
                type="password"
                placeholder="비밀번호 입력"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="modal-input"
              />

              <div className="modal-actions">
                <button
                  onClick={handlePasswordConfirm}
                  className="btn-modal-charge"
                >
                  확인
                </button>

                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setConfirmPassword("");
                  }}
                  className="btn-modal-cancel"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
