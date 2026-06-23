import { useState, useEffect } from "react";
import { User } from "lucide-react";
import "./MyPage.css";
import { Member } from "../types/type.ts";
import { memberService } from "../service/memberService.ts";
import { socialService } from "../service/socialService.ts";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth, normalizeMember } from "../context/AuthContext.tsx";
import { authService } from "../service/authService.ts";
import { IMG_BASE_URL } from "../config/api";
import PostsTab from "./mypage/PostsTab";
import RecipesTab from "./mypage/RecipesTab";
import LikedTab from "./mypage/LikedTab";
import GuestbookSection from "./mypage/GuestbookSection";
import SubscriptionsSection from "./mypage/SubscriptionsSection";
import ProfileBgSlideshow from "./ProfileBgSlideshow";

export default function MyPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { userId } = useParams<{ userId: string }>();

  const [user, setUser] = useState<Member | null>(authUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"recipes" | "liked" | "posts">(
    "recipes",
  );
  const [scrapPublic, setScrapPublic] = useState<boolean>(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const currentUserId = authUser?.id ?? "";
  const displayUser = user;
  const isOwnPage = Boolean(
    authUser?.id && displayUser?.id && authUser.id === displayUser.id,
  );

  useEffect(() => {
    const fetchMemberData = async () => {
      if (userId && userId !== authUser?.id) {
        setIsLoading(true);
        try {
          const response = await memberService.getMemberById(userId);
          setUser(normalizeMember(response.data) ?? null);
        } catch (error) {
          console.error("유저 정보를 불러오는데 실패했습니다.", error);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
        return;
      }

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
        setUser(normalizeMember(response.data) ?? authUser);
      } catch {
        setUser(authUser);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberData();
  }, [authUser, userId]);

  useEffect(() => {
    setScrapPublic(displayUser?.scrapPublic ?? true);
  }, [displayUser?.id, displayUser?.scrapPublic]);

  useEffect(() => {
    if (!isOwnPage && !scrapPublic && activeTab === "liked") {
      setActiveTab("recipes");
    }
  }, [isOwnPage, scrapPublic, activeTab]);

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
      const payload = {
        followerId: currentUserId,
        followingId: displayUser.id,
      };
      if (isFollowing) {
        await socialService.unfollow(payload);
        setIsFollowing(false);
      } else {
        await socialService.follow(payload);
        setIsFollowing(true);
      }
    } catch {
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleToggleScrapPublic = async () => {
    if (!authUser?.id) return;
    const next = !scrapPublic;
    setScrapPublic(next);
    try {
      await memberService.updateScrapPublic(authUser.id, next);
    } catch {
      setScrapPublic(!next);
      alert("설정 변경에 실패했습니다.");
    }
  };

  const handlePasswordConfirm = async () => {
    if (!authUser) return;
    try {
      await authService.login({ id: authUser.id, password: confirmPassword });
      setShowPasswordModal(false);
      setConfirmPassword("");
      navigate("/mypage/info");
    } catch {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  if (isLoading)
    return <div className="text-center py-8">로딩 중입니다...</div>;
  if (!authUser) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-lg font-semibold">로그인이 필요합니다.</p>
        <button
          onClick={() => navigate("/login")}
          className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-white font-semibold hover:bg-orange-700 transition"
        >
          로그인하러 가기
        </button>
      </div>
    );
  }
  if (!displayUser) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-lg font-semibold">
          탈퇴했거나 존재하지 않는 회원입니다.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-white font-semibold hover:bg-orange-700 transition"
        >
          메인으로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <ProfileBgSlideshow memberId={displayUser.id} />

      {/* 프로필 카드 */}
      <div className="profile-card">
        <div className="profile-flex">
          <div className="profile-info-section">
            <div className="profile-avatar">
              {displayUser.profileImg ? (
                <img
                  src={`${IMG_BASE_URL}/${displayUser.profileImg}`}
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
                <span>🍳 레시피 {displayUser.recipeCount || 0}개</span>
                <span>팔로워 {displayUser.followerCount}명</span>
                <span>팔로잉 {displayUser.followingCount}명</span>
              </div>
              {(displayUser.snsYoutube || displayUser.snsInstagram || displayUser.snsFacebook) && (
                <div className="profile-sns">
                  {displayUser.snsYoutube && (
                    <a href={displayUser.snsYoutube} target="_blank" rel="noopener noreferrer" className="profile-sns-link">
                      <img src="/youtube.svg" width={18} height={18} alt="YouTube" />
                    </a>
                  )}
                  {displayUser.snsInstagram && (
                    <a href={displayUser.snsInstagram} target="_blank" rel="noopener noreferrer" className="profile-sns-link">
                      <img src="/instagram.svg" width={18} height={18} alt="Instagram" />
                    </a>
                  )}
                  {displayUser.snsFacebook && (
                    <a href={displayUser.snsFacebook} target="_blank" rel="noopener noreferrer" className="profile-sns-link">
                      <img src="/facebook.svg" width={18} height={18} alt="Facebook" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="wallet-section">
            {isOwnPage ? (
              <button
                onClick={() => setShowPasswordModal(true)}
                className="btn-charge"
              >
                <User className="btn-icon" />내 정보
              </button>
            ) : (
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
            )}
          </div>
        </div>
      </div>

      {/* 메인 레이아웃 */}
      <div className="main-layout">
        <div className="left-content">
          {/* 탭 헤더 */}
          <div className="tabs-container">
            <div className="tabs-header">
              <div className="tabs-header-left">
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
                {(isOwnPage || scrapPublic) && (
                  <button
                    onClick={() => setActiveTab("liked")}
                    className={`tab-btn ${activeTab === "liked" ? "active" : ""}`}
                  >
                    스크랩 레시피
                  </button>
                )}
              </div>
              {isOwnPage && activeTab === "liked" && (
                <button
                  onClick={handleToggleScrapPublic}
                  className={`scrap-public-toggle ${scrapPublic ? "on" : "off"}`}
                >
                  {scrapPublic ? "스크랩 공개" : "스크랩 비공개"}
                </button>
              )}
            </div>

            {activeTab === "posts" && (
              <PostsTab
                displayUser={displayUser}
                currentUserId={currentUserId}
                isOwnPage={isOwnPage}
              />
            )}
            {activeTab === "recipes" && (
              <RecipesTab
                displayUser={displayUser}
                currentUserId={currentUserId}
                isOwnPage={isOwnPage}
              />
            )}
            {activeTab === "liked" && (
              <LikedTab
                displayUser={displayUser}
                currentUserId={currentUserId}
                isOwnPage={isOwnPage}
              />
            )}
          </div>

          <GuestbookSection
            displayUser={displayUser}
            currentUserId={currentUserId}
            authUser={authUser}
          />
        </div>

        {/* 오른쪽: 구독 목록 */}
        <div className="right-content">
          <SubscriptionsSection displayUser={displayUser} />
        </div>
      </div>

      {/* 비밀번호 확인 모달 */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">내 정보</h2>
            <p className="modal-label">정보 수정을 위해 비밀번호를 입력하세요.</p>
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePasswordConfirm();
              }}
              className="modal-input"
              style={{ marginTop: "0.5rem" }}
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
  );
}
