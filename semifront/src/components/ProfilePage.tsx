import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { memberService } from "../service/memberService.ts";
import { Member } from "../types/type.ts";
import { User } from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";
import { socialService } from "../service/socialService.ts";

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchMember = async () => {
      try {
        setIsLoading(true);
        const response = await memberService.getMemberById(id);
        setMember(response.data);
      } catch (error) {
        console.error("프로필을 불러오는데 실패했습니다.", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  // 팔로우 여부 확인
  useEffect(() => {
    if (!authUser?.id || !id || authUser.id === id) return;
    socialService
      .checkFollow(authUser.id, id)
      .then((res) => setIsFollowing(res.data))
      .catch(() => setIsFollowing(false));
  }, [authUser?.id, id]);

  const handleFollowToggle = async () => {
    if (!authUser?.id || !id) return;
    setIsFollowLoading(true);
    try {
      const followPayload = { followerId: authUser.id, followingId: id };
      if (isFollowing) {
        await socialService.unfollow(followPayload);
        setIsFollowing(false);
        setMember((prev) =>
          prev ? { ...prev, followerCount: (prev.followerCount ?? 1) - 1 } : prev
        );
      } else {
        await socialService.follow(followPayload);
        setIsFollowing(true);
        setMember((prev) =>
          prev ? { ...prev, followerCount: (prev.followerCount ?? 0) + 1 } : prev
        );
      }
    } catch (error) {
      console.error("팔로우 처리 실패:", error);
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">로딩 중입니다...</div>;
  }

  if (!member) {
    return <div className="text-center py-8">프로필 정보를 찾을 수 없습니다.</div>;
  }

  const isOwnPage = authUser?.id === id;

  return (
    <div className="mypage-container">
      <button
        onClick={() => navigate(-1)}
        className="btn-text-delete"
        style={{ marginBottom: "1rem" }}
      >
        뒤로가기
      </button>
      <div className="profile-card">
        <div className="profile-flex">
          <div className="profile-info-section">
            {member.profileImg ? (
              <img
                src={`http://localhost:8080${member.profileImg}`}
                alt={member.nickname}
                className="sub-avatar-img"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="profile-avatar">
                <User className="avatar-icon" />
              </div>
            )}
            <div>
              <h1 className="profile-name">{member.nickname}</h1>
              <p className="profile-bio">
                {member.intro || "아직 등록된 소개글이 없습니다."}
              </p>
              <div className="profile-stats">
                <span>게시글 {member.myPosts?.length || 0}개</span>
                <span>팔로워 {member.followerCount}명</span>
                <span>팔로잉 {member.followingCount}명</span>
              </div>
            </div>
          </div>

          {/* 본인 페이지가 아닐 때만 팔로우 버튼 표시 */}
          {!isOwnPage && authUser && (
            <div className="wallet-section">
              <button
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className={isFollowing ? "btn-following" : "btn-follow"}
              >
                {isFollowLoading ? "처리중..." : isFollowing ? "구독중" : "구독하기"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
