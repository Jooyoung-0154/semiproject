import { useState, useEffect } from "react";
import { Users, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Member } from "../../types/type";
import { socialService } from "../../service/socialService";
import { IMG_BASE_URL } from "../../config/api";

interface SubscriptionsSectionProps {
  displayUser: Member;
}

export default function SubscriptionsSection({ displayUser }: SubscriptionsSectionProps) {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Member[]>([]);
  const [visibleSubCount, setVisibleSubCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, [displayUser.id]);

  const fetchSubscriptions = async () => {
    if (!displayUser.id) return;
    setIsLoading(true);
    try {
      const response = await socialService.getFollowingUsers(displayUser.id);
      setSubscriptions(Array.isArray(response.data) ? response.data : []);
      setVisibleSubCount(5);
    } catch (error) {
      console.error("구독 목록 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="subscription-container">
      <div className="section-title-wrap">
        <Users className="title-icon" />
        <h3 className="section-title">구독 목록</h3>
      </div>
      <div className="subscription-list">
        {isLoading ? (
          <p className="text-sm text-gray-400 text-center py-4">불러오는 중...</p>
        ) : subscriptions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">구독 중인 유저가 없습니다.</p>
        ) : (
          <>
            {subscriptions.slice(0, visibleSubCount).map((sub) => (
              <div key={sub.id} className="subscription-item">
                <div className="sub-profile-flex">
                  {sub.profileImg ? (
                    <img
                      src={`${IMG_BASE_URL}/${sub.profileImg}`}
                      alt={sub.nickname}
                      className="sub-avatar-img"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div className="sub-avatar" style={{ display: sub.profileImg ? "none" : "flex" }}>
                    <User className="sub-avatar-icon" />
                  </div>
                  <div className="sub-info">
                    <p className="sub-name">{sub.nickname}</p>
                    <p className="sub-recipe-count">레시피 {sub.recipeCount ?? 0}개</p>
                  </div>
                </div>
                <p className="sub-followers">팔로워 {sub.followerCount}명</p>
                <button className="btn-sub-profile" onClick={() => navigate(`/mypage/${sub.id}`)}>
                  프로필 보기
                </button>
              </div>
            ))}
            {visibleSubCount < subscriptions.length && (
              <button
                className="btn-load-more"
                onClick={() => setVisibleSubCount(prev => prev + 5)}
              >
                더 보기 ({subscriptions.length - visibleSubCount}명 남음)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
