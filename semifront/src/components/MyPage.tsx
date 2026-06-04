import { useState, useEffect } from "react";
import {
  User,
  Trash2,
  ShoppingCart,
  Users,
  MessageSquare,
  Wallet,
  DollarSign,
  Clock,
  ChefHat,
} from "lucide-react";
import "./MyPage.css";
import {
  Recipe_Info,
  Post,
  Member,
  Purchase,
  Guestbook,
} from "../types/type.ts";
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
  const [activeTab, setActiveTab] = useState<
    "recipes" | "liked" | "basket" | "posts" | "purchases"
  >("recipes");
  const [newGuestbook, setNewGuestbook] = useState("");
  const [balance, setBalance] = useState(0);
  const [chargeAmount, setChargeAmount] = useState(0);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<
    {
      recipe_code: number;
      name: string;
      author: string;
      price: number;
      isPurchased: boolean;
    }[]
  >([]);
  const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);
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
  const [isPostCreateMode, setIsPostCreateMode] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>(
    {},
  );
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [likedRecipes, setLikedRecipes] = useState<Recipe_Info[]>([]);
  const [likedRecipesLoading, setLikedRecipesLoading] = useState(false);
  const [likedPage, setLikedPage] = useState(1);
  const LIKED_PAGE_SIZE = 6;
  const currentUserId = authUser?.id ?? "";
  const displayUser = user ?? authUser;
  const isOwnPage = Boolean(
    authUser?.id && displayUser?.id && authUser.id === displayUser.id,
  );

  useEffect(() => {
    const fetchMemberData = async () => {
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
  }, [authUser]);

  useEffect(() => {
    if (user) {
      setBalance(user.balance);
    }
  }, [user]);

  const fetchPosts = async () => {
    if (!displayUser?.id) return;
    try {
      setIsLoadingPosts(true);
      const response = await postService.getByWriter(displayUser.id);
      setPostList(response.data);
    } catch (error) {
      console.error("게시글 불러오기 실패:", error);
    } finally {
      setIsLoadingPosts(false);
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
      setLikedRecipes(recipes);
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

  useEffect(() => {
    setSavedRecipes([
      {
        recipe_code: 201,
        name: "매콤 두부 찌개",
        author: "jooyoung123",
        price: 8000,
        isPurchased: false,
      },
      {
        recipe_code: 202,
        name: "버터 갈릭 새우 파스타",
        author: "jooyoung123",
        price: 12000,
        isPurchased: true,
      },
    ]);

    setPurchaseHistory([
      {
        purchaseId: 1,
        userId: currentUserId,
        recipeCode: "301",
        purchasePrice: 15000,
        purchaseDate: "2026-05-18",
      },
      {
        purchaseId: 2,
        userId: currentUserId,
        recipeCode: "302",
        purchasePrice: 9000,
        purchaseDate: "2026-05-12",
      },
    ]);
  }, [currentUserId]);

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
    navigate(`/profile/${subscriberId}`);
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

  const handlePurchaseRecipe = (recipeCode: string | number, price: number) => {
    if (balance >= price) {
      setBalance(balance - price);
      setSavedRecipes((prev) =>
        prev.map((item) =>
          item.recipe_code === Number(recipeCode)
            ? { ...item, isPurchased: true }
            : item,
        ),
      );
      console.log("Purchased recipe:", recipeCode);
    } else {
      alert("잔액이 부족합니다. 충전해주세요.");
    }
  };

  const handleCharge = () => {
    setBalance(balance + chargeAmount);
    setShowChargeModal(false);
    console.log("Charged:", chargeAmount);
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

  const LEVEL_COLOR: Record<string, string> = {
    상: "bg-red-100 text-red-700",
    중: "bg-yellow-100 text-yellow-700",
    하: "bg-green-100 text-green-700",
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
      let response;
      if (newPostImage) {
        const formData = new FormData();
        formData.append("writerId", currentUserId);
        formData.append("content", content);
        formData.append("regDate", new Date().toISOString().slice(0, 10));
        formData.append("likeCount", "0");
        formData.append("postImg", newPostImage);
        response = await postService.writeWithImage(formData);
      } else {
        const payload: Post = {
          postId: 0,
          writerId: currentUserId,
          content,
          postImg: "",
          regDate: new Date().toISOString().slice(0, 10),
          likeCount: 0,
          comments: [],
        };
        response = await postService.write(payload);
      }

      const createdPost = response.data as Post;
      if (createdPost) {
        setPostList((prev) => [createdPost, ...prev]);
        if (user && user.id === currentUserId) {
          setUser({
            ...user,
            myPosts: [createdPost, ...(user.myPosts ?? [])],
          });
        }
      }
      clearPostForm();
      setIsPostCreateMode(false);
      await fetchPosts();
    } catch (error) {
      console.error("게시글 작성 실패:", error);
      alert("게시글 작성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleEditPost = (postId: number) => {
    alert(`게시글 ${postId} 수정 기능을 연결해주세요.`);
  };

  const handleDeletePost = async (postId: number) => {
    const isConfirmed = window.confirm("정말 이 게시글을 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      await postService.deletePost(postId);
      setPostList((prev) => prev.filter((post) => post.postId !== postId));
      if (user && user.id === currentUserId) {
        setUser({
          ...user,
          myPosts: (user.myPosts ?? []).filter(
            (post) => post.postId !== postId,
          ),
        });
      }
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert("게시글 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const likedTotalPages = Math.ceil(likedRecipes.length / LIKED_PAGE_SIZE);

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
              {/* <button
                onClick={() => setActiveTab("basket")}
                className={`tab-btn ${activeTab === "basket" ? "active" : ""}`}
              >
                장바구니
              </button>

              <button
                onClick={() => setActiveTab("purchases")}
                className={`tab-btn ${activeTab === "purchases" ? "active" : ""}`}
              >
                구매 내역
              </button> */}
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
                            <p className="recipe-meta text-xs text-gray-400 mt-2">
                              작성일 {post.regDate} · 좋아요 {post.likeCount}개
                            </p>
                          </div>
                          <div className="post-item-actions flex items-start justify-end gap-2 min-w-[120px]">
                            <button
                              type="button"
                              onClick={() => handleEditPost(post.postId)}
                              className="btn-post-edit"
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePost(post.postId)}
                              className="btn-post-delete"
                            >
                              삭제
                            </button>
                          </div>
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
                    {myRecipes.map((recipe) => {
                      const thumbSrc = recipe.thumbImgUrl
                        ? `http://localhost:8080${recipe.thumbImgUrl}`
                        : null;
                      const levelColor =
                        LEVEL_COLOR[recipe.levelNm] ??
                        "bg-gray-100 text-gray-600";
                      return (
                        <div
                          key={recipe.recipeId}
                          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
                        >
                          {/* 썸네일 */}
                          <div
                            className="relative h-40 bg-orange-50 overflow-hidden cursor-pointer"
                            onClick={() =>
                              navigate(`/recipe/${recipe.recipeId}`)
                            }
                          >
                            {thumbSrc ? (
                              <img
                                src={thumbSrc}
                                alt={recipe.recipeNmKo}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-5xl select-none">🍽️</span>
                              </div>
                            )}
                          </div>

                          {/* 정보 */}
                          <div className="p-4">
                            {/* 제목 + 가격 */}
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3
                                className="font-bold text-gray-800 text-base line-clamp-1 flex-1 cursor-pointer hover:text-orange-500 transition"
                                onClick={() =>
                                  navigate(`/recipe/${recipe.recipeId}`)
                                }
                              >
                                {recipe.recipeNmKo}
                              </h3>
                              {recipe.price != null &&
                                (recipe.price > 0 ? (
                                  <span className="flex-shrink-0 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                                    {recipe.price.toLocaleString()}원
                                  </span>
                                ) : (
                                  <span className="flex-shrink-0 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                    Free
                                  </span>
                                ))}
                            </div>

                            {recipe.sumry && (
                              <p className="text-gray-400 text-xs mb-2 line-clamp-1">
                                {recipe.sumry}
                              </p>
                            )}

                            {/* 뱃지 */}
                            <div className="flex items-center gap-1.5 text-xs flex-wrap mb-2">
                              {recipe.levelNm && (
                                <span
                                  className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full font-medium ${levelColor}`}
                                >
                                  <ChefHat className="w-3 h-3" />
                                  {recipe.levelNm}
                                </span>
                              )}
                              {recipe.cookingTime && (
                                <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                  <Clock className="w-3 h-3" />
                                  {recipe.cookingTime}
                                </span>
                              )}
                            </div>

                            {/* 태그 */}
                            {recipe.tags && recipe.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {recipe.tags.map((tag) => (
                                  <span
                                    key={tag.tagId}
                                    className="px-1.5 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-xs font-medium"
                                  >
                                    {tag.tagName}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* 삭제 버튼 (본인일때) */}
                            {isOwnPage && (
                              <div className="flex gap-2 pt-1 border-t border-gray-100">
                                <button
                                  onClick={() =>
                                    handleDeleteRecipe(recipe.recipeId)
                                  }
                                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition font-medium"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> 삭제
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                      const thumbSrc = recipe.thumbImgUrl
                        ? `http://localhost:8080${recipe.thumbImgUrl}`
                        : null;

                      const levelColor =
                        LEVEL_COLOR[recipe.levelNm] ??
                        "bg-gray-100 text-gray-600";

                      return (
                        <div
                          key={recipe.recipeId}
                          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
                        >
                          <div
                            className="relative h-40 bg-orange-50 overflow-hidden cursor-pointer"
                            onClick={() =>
                              navigate(`/recipe/${recipe.recipeId}`)
                            }
                          >
                            {thumbSrc ? (
                              <img
                                src={thumbSrc}
                                alt={recipe.recipeNmKo}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-5xl select-none">🍽️</span>
                              </div>
                            )}
                          </div>

                          <div className="p-4">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3
                                className="font-bold text-gray-800 text-base line-clamp-1 flex-1 cursor-pointer hover:text-orange-500 transition"
                                onClick={() =>
                                  navigate(`/recipe/${recipe.recipeId}`)
                                }
                              >
                                {recipe.recipeNmKo}
                              </h3>

                              <span className="text-xs font-bold text-pink-500">
                                ♥ {recipe.likeCount ?? 0}
                              </span>
                            </div>

                            {recipe.sumry && (
                              <p className="text-gray-400 text-xs mb-2 line-clamp-1">
                                {recipe.sumry}
                              </p>
                            )}

                            <div className="flex items-center gap-1.5 text-xs flex-wrap mb-2">
                              {recipe.levelNm && (
                                <span
                                  className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full font-medium ${levelColor}`}
                                >
                                  <ChefHat className="w-3 h-3" />
                                  {recipe.levelNm}
                                </span>
                              )}

                              {recipe.cookingTime && (
                                <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                  <Clock className="w-3 h-3" />
                                  {recipe.cookingTime}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "basket" && (
              <div>
                {/* 타이틀 영역: 아이콘과 주황색 포인트 폰트 */}
                <div className="section-title-wrap flex items-center gap-2 mb-4">
                  <ShoppingCart className="title-icon w-5 h-5 text-orange-500" />
                  <h3 className="section-title text-xl font-bold flex items-center gap-1">
                    장바구니
                    <span className="text-orange-500">
                      ({savedRecipes.length})
                    </span>
                  </h3>
                </div>

                {/* 리스트 본문 영역 */}
                <div className="recipe-list flex flex-col gap-4">
                  {savedRecipes.map((recipe) => (
                    <div
                      key={recipe.recipe_code}
                      className="recipe-item flex border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition items-center justify-between"
                    >
                      {/* 왼쪽: 이미지 + 정보 묶음 */}
                      <div className="flex gap-4 items-center">
                        <div className="w-24 h-24 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-3xl">🍽️</span>
                        </div>

                        {/* 텍스트 정보 */}
                        <div className="recipe-info">
                          <h3 className="recipe-title text-lg font-bold text-gray-900">
                            {recipe.name}
                          </h3>
                          <p className="recipe-meta text-sm text-gray-400 mt-0.5">
                            by {recipe.author}
                          </p>
                          {recipe.price > 0 && (
                            <p className="price-text text-base font-bold text-orange-500 mt-1">
                              {recipe.price
                                ? recipe.price.toLocaleString()
                                : "0"}
                              원
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 오른쪽: 상하 수직 정렬 버튼 영역 */}
                      <div className="action-buttons-vertical flex flex-col items-center justify-center gap-2 min-w-[100px]">
                        {recipe.isPurchased ? (
                          <button className="btn-status-success w-full bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl text-sm cursor-default">
                            구매완료
                          </button>
                        ) : recipe.price > 0 ? (
                          <button
                            onClick={() =>
                              handlePurchaseRecipe(
                                recipe.recipe_code,
                                recipe.price,
                              )
                            }
                            className="btn-status-action w-full bg-orange-600 text-white font-bold py-2 px-4 rounded-xl text-sm hover:bg-orange-700 transition"
                          >
                            구매하기
                          </button>
                        ) : (
                          <button className="btn-status-view w-full bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-xl text-sm hover:bg-gray-200 transition">
                            보기
                          </button>
                        )}

                        {/* 삭제 텍스트 버튼 */}
                        <button className="btn-text-delete text-xs text-red-400 hover:text-red-600 hover:underline transition mt-1">
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* 구매 내역 탭 내용 */}
            {activeTab === "purchases" && (
              <div>
                <div className="section-title-wrap">
                  <DollarSign className="title-icon" />
                  <h3 className="section-title">구매 내역</h3>
                </div>
                <div className="history-list">
                  {purchaseHistory.map((purchase) => (
                    <div key={purchase.purchaseId} className="history-item">
                      <div>
                        <p className="history-name">
                          레시피 코드 {purchase.recipeCode}
                        </p>
                        <p className="history-date">{purchase.purchaseDate}</p>
                      </div>
                      <div className="history-right">
                        <p className="price-text">
                          {purchase.purchasePrice
                            ? purchase.purchasePrice.toLocaleString()
                            : "0"}
                          원
                        </p>
                        <button className="btn-link">레시피 보기</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="total-price-section">
                  <div className="total-price-flex">
                    <span className="total-label">총 구매 금액</span>
                    <span className="total-amount">
                      {purchaseHistory
                        .reduce((sum, p) => sum + (p.purchasePrice || 0), 0)
                        .toLocaleString()}
                      원
                    </span>
                  </div>
                </div>
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

        {/* 충전 모달창 */}
        {/* {showChargeModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">잔액 충전</h2>
              <div className="modal-balance-section">
                <p className="modal-label">현재 잔액</p>
                <p className="modal-balance">
                  {Number.isFinite(balance) ? balance.toLocaleString() : "0"}원
                </p>
              </div>
              <div className="modal-input-section">
                <label className="modal-input-label">충전 금액</label>
                <input
                  type="number"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(Number(e.target.value))}
                  min="1000"
                  step="1000"
                  className="modal-input"
                />
                <div className="modal-preset-buttons">
                  {[10000, 30000, 50000, 100000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setChargeAmount(amount)}
                      className="btn-preset"
                    >
                      {(amount / 10000).toLocaleString()}만원
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button onClick={handleCharge} className="btn-modal-charge">
                  충전하기
                </button>
                <button
                  onClick={() => setShowChargeModal(false)}
                  className="btn-modal-cancel"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
