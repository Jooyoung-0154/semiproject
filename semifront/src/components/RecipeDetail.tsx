import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Heart, ThumbsUp, ThumbsDown, Clock, ChefHat, Users,
  Flame, User, ArrowLeft, ChevronLeft, ChevronRight
} from "lucide-react";
import RecipeService from "../service/recipeService";
import { reviewService } from "../service/reviewService";
import { memberService } from "../service/memberService";
import likeService from "../service/likeService";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Recipe, Irdnt_Info, Review, Member, RECIPE_IMAGE } from "../types/type";

const BASE_URL = "http://localhost:8080";

export default function RecipeDetail() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [writer, setWriter] = useState<Member | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [images, setImages] = useState<RECIPE_IMAGE[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [reviewContent, setReviewContent] = useState("");
  const [reviewThumbsUp, setReviewThumbsUp] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const REVIEWS_PER_PAGE = 5;
  const [reviewerProfiles, setReviewerProfiles] = useState<Map<string, Member>>(new Map());
  const [reviewPage, setReviewPage] = useState(1);

  const loadReviewerProfiles = async (reviewList: Review[]) => {
    const uniqueIds = [...new Set(reviewList.map((r) => r.id))];
    const results = await Promise.allSettled(
      uniqueIds.map((id) => memberService.getMemberById(id))
    );
    const profileMap = new Map<string, Member>();
    results.forEach((result, i) => {
      if (result.status === "fulfilled") profileMap.set(uniqueIds[i], result.value.data);
    });
    setReviewerProfiles(profileMap);
  };

  useEffect(() => {
    if (!recipeId) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const [recipeData, reviewRes, imagesRes] = await Promise.all([
          RecipeService.getById(recipeId),
          reviewService.getRecipeReviews(recipeId),
          api.get(`/recipe-images/${recipeId}`),
        ]);
        setRecipe(recipeData);
        setLikeCount(recipeData.recipeInfo?.likeCount ?? 0);
        setReviews(reviewRes.data);
        setImages(imagesRes.data ?? []);
        setCurrentImageIndex(0);
        setReviewPage(1);
        loadReviewerProfiles(reviewRes.data);

        if (recipeData.recipeInfo?.writerId) {
          memberService
            .getMemberById(recipeData.recipeInfo.writerId)
            .then((res) => setWriter(res.data))
            .catch(() => {});
        }

        if (user?.id) {
          const likedIds = await likeService.getMyLikes(user.id);
          setLiked(new Set(likedIds).has(recipeId));
        }
      } catch {
        /* ignore */
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [recipeId, user?.id]);

  const handleLike = async () => {
    if (!user?.id || !recipeId) return;
    const result = await likeService.toggle(user.id, recipeId);
    setLiked(result.liked);
    setLikeCount(result.likeCount);
  };

  const handleReviewSubmit = async () => {
    if (!user?.id || !recipeId || !reviewContent.trim()) return;
    setIsSubmitting(true);
    try {
      await reviewService.write({
        reviewId: 0,
        recipeCode: recipeId,
        id: user.id,
        reviewContent: reviewContent.trim(),
        reviewHit: 0,
        thumbsUp: reviewThumbsUp,
        regDate: "",
      });
      setReviewContent("");
      const updated = await reviewService.getRecipeReviews(recipeId);
      setReviews(updated.data);
      setReviewPage(1);
      loadReviewerProfiles(updated.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // irdntTyNm 기준으로 재료 그룹 분리
  const ingredientGroups = useMemo(() => {
    if (!recipe?.irdntInfo?.length) return new Map<string, Irdnt_Info[]>();
    const map = new Map<string, Irdnt_Info[]>();
    for (const item of recipe.irdntInfo) {
      const key = item.irdntTyNm?.trim() || "재료";
      const arr = map.get(key) ?? [];
      arr.push(item);
      map.set(key, arr);
    }
    return map;
  }, [recipe?.irdntInfo]);

  const totalReviewPages = Math.max(1, Math.ceil(reviews.length / REVIEWS_PER_PAGE));
  const pagedReviews = reviews.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE);

  const thumbsUpCount = reviews.filter((r) => r.thumbsUp).length;
  const thumbsUpRatio = reviews.length > 0 ? Math.round((thumbsUpCount / reviews.length) * 100) : null;
  const sentimentLabel = thumbsUpRatio === null ? null
    : thumbsUpRatio >= 90 ? { text: "😍 매우 긍정적", color: "text-blue-600", bar: "bg-blue-500" }
    : thumbsUpRatio >= 80 ? { text: "😄 긍정적",     color: "text-blue-400", bar: "bg-blue-400" }
    : thumbsUpRatio >= 60 ? { text: "😐 복합적",        color: "text-gray-500", bar: "bg-gray-400" }
    : thumbsUpRatio >= 40 ? { text: "😞 부정적",      color: "text-orange-500", bar: "bg-orange-400" }
    :                        { text: "😨 매우 부정적", color: "text-red-500",  bar: "bg-red-500" };

  /* ── 로딩 ── */
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse py-6">
        <div className="h-72 bg-gray-200 rounded-2xl" />
        <div className="h-8 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  /* ── 레시피 없음 ── */
  if (!recipe) {
    return (
      <div className="text-center py-24 text-gray-400">
        <p className="text-xl mb-4">레시피를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  const info = recipe.recipeInfo;
  const heroImg = info?.thumbImgUrl ? `${BASE_URL}${info.thumbImgUrl}` : null;
  const hasGallery = images.length > 0;

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8">

      {/* 뒤로가기 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-gray-500 hover:text-orange-500 transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />뒤로 가기
      </button>

      {/* 대표 이미지 / 갤러리 */}
      {hasGallery ? (
        <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg bg-gray-100">
          <img
            src={`${BASE_URL}${images[currentImageIndex].imgUrl}`}
            alt={`${info.recipeNmKo} ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentImageIndex === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white rounded-full w-9 h-9 flex items-center justify-center disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentImageIndex((prev) => Math.min(images.length - 1, prev + 1))}
                disabled={currentImageIndex === images.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white rounded-full w-9 h-9 flex items-center justify-center disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentImageIndex ? "bg-white w-4" : "bg-white bg-opacity-60 w-2"
                    }`}
                  />
                ))}
              </div>
              <span className="absolute top-3 right-3 bg-black bg-opacity-40 text-white text-xs px-2 py-1 rounded-full">
                {currentImageIndex + 1} / {images.length}
              </span>
            </>
          )}
        </div>
      ) : heroImg ? (
        <div className="w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg">
          <img
            src={heroImg}
            alt={info.recipeNmKo}
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      ) : null}

      {/* 제목 + 요약 + 태그 + 좋아요 */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{info.recipeNmKo}</h1>
            {info.sumry && (
              <p className="mt-2 text-gray-500 text-base leading-relaxed">{info.sumry}</p>
            )}
            {recipe.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag.tagId}
                    className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-sm font-medium"
                  >
                    #{tag.tagName}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleLike}
            className="flex flex-col items-center gap-1 shrink-0 hover:scale-110 transition-transform pt-1"
          >
            <Heart
              style={{
                width: 28, height: 28,
                fill: liked ? "#ec4899" : "none",
                stroke: liked ? "#ec4899" : "#9ca3af",
                strokeWidth: 2,
              }}
            />
            <span className={`text-sm font-semibold ${liked ? "text-pink-500" : "text-gray-400"}`}>
              {likeCount}
            </span>
          </button>
        </div>
      </div>

      {/* 정보 바 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {info.levelNm && (
          <InfoCard icon={<ChefHat className="w-6 h-6 text-orange-400" />} label="난이도" value={info.levelNm} />
        )}
        {info.cookingTime && (
          <InfoCard icon={<Clock className="w-6 h-6 text-orange-400" />} label="조리시간" value={info.cookingTime} />
        )}
        {info.qnt && (
          <InfoCard icon={<Users className="w-6 h-6 text-orange-400" />} label="분량" value={info.qnt} />
        )}
        {info.calorie && (
          <InfoCard icon={<Flame className="w-6 h-6 text-orange-400" />} label="칼로리" value={info.calorie} />
        )}
      </div>

      {/* 작성자 */}
      {info.writerId && (
        <div
          onClick={() => navigate(`/profile/${info.writerId}`)}
          className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:border-orange-300 transition-colors"
        >
          {writer?.profileImg ? (
            <img
              src={`${BASE_URL}${writer.profileImg}`}
              alt={writer.nickname}
              className="w-11 h-11 rounded-full object-cover shrink-0 border border-gray-200"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-orange-400" />
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400">레시피 작성자</p>
            <p className="font-semibold text-gray-800 hover:text-orange-500 transition-colors">
              {writer?.nickname ?? info.writerId}
            </p>
          </div>
        </div>
      )}

      {/* 재료 */}
      {ingredientGroups.size > 0 && (
        <section>
          <SectionTitle>재료</SectionTitle>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {Array.from(ingredientGroups.entries()).map(([groupName, items]) => (
              <div key={groupName}>
                <div className="px-5 py-2.5 bg-orange-50 border-b border-gray-100">
                  <span className="text-sm font-semibold text-orange-600">{groupName}</span>
                </div>
                <table className="w-full">
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="px-5 py-2.5 text-gray-700 font-medium">{item.irdntNm}</td>
                        <td className="px-5 py-2.5 text-gray-400 text-right text-sm">
                          {item.irdntCpcty || ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 조리 순서 */}
      {recipe.cookingInfo?.length > 0 && (
        <section>
          <SectionTitle>조리 순서</SectionTitle>
          <div className="space-y-4">
            {recipe.cookingInfo.map((step) => {
              const isDefault =
                !step.stepImgUrl ||
                step.stepImgUrl.includes("base.png") ||
                step.stepImgUrl === "/resources/static/image/base.png";
              const stepImg = isDefault ? null : `${BASE_URL}${step.stepImgUrl}`;
              return (
                <div
                  key={step.cookingNo}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="flex gap-4 p-5">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                      {step.cookingNo}
                    </div>
                    <div className="flex-1">
                      {stepImg && (
                        <img
                          src={stepImg}
                          alt={`step-${step.cookingNo}`}
                          className="w-full max-w-sm rounded-xl mb-3 object-cover h-44"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <p className="text-gray-700 leading-relaxed">{step.cookingDc}</p>
                      {step.stepTip && step.stepTip.trim() && (
                        <p className="mt-2 text-sm text-orange-500 italic">
                          ({step.stepTip})
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 요리 후기 */}
      <section>
        <SectionTitle>
          요리 후기
          <span className="text-base font-normal text-gray-400 ml-2">({reviews.length})</span>
        </SectionTitle>

        {/* 통계 */}
        {sentimentLabel && thumbsUpRatio !== null && (
          <div className="mb-5 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${sentimentLabel.color}`}>{sentimentLabel.text}</span>
              </div>
              <span className={`text-2xl font-extrabold ${sentimentLabel.color}`}>{thumbsUpRatio}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${sentimentLabel.bar}`}
                style={{ width: `${thumbsUpRatio}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">전체 {reviews.length}개 후기 중 추천 {thumbsUpCount}개</p>
          </div>
        )}

        {/* 후기 목록 */}
        <div className="space-y-3 mb-4">
          {reviews.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              아직 후기가 없어요. 첫 번째로 후기를 남겨보세요!
            </p>
          ) : (
            pagedReviews.map((review) => {
              const profile = reviewerProfiles.get(review.id);
              return (
                <div
                  key={review.reviewId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* 프로필 이미지 */}
                      <button
                        onClick={() => navigate(`/profile/${review.id}`)}
                        className="shrink-0"
                      >
                        {profile?.profileImg ? (
                          <img
                            src={`${BASE_URL}${profile.profileImg}`}
                            alt={profile.nickname}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200 hover:ring-2 hover:ring-orange-300 transition-all"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center hover:ring-2 hover:ring-orange-300 transition-all">
                            <User className="w-4 h-4 text-orange-400" />
                          </div>
                        )}
                      </button>
                      {/* 닉네임 + 추천 아이콘 */}
                      <div>
                        <button
                          onClick={() => navigate(`/profile/${review.id}`)}
                          className="font-semibold text-gray-800 text-sm hover:text-orange-500 transition-colors"
                        >
                          {profile?.nickname ?? review.id}
                        </button>
                        <div className="flex items-center gap-1 mt-0.5">
                          {review.thumbsUp ? (
                            <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
                          )}
                          <span className={`text-xs font-medium ${review.thumbsUp ? "text-blue-500" : "text-red-400"}`}>
                            {review.thumbsUp ? "추천" : "비추천"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 mt-1">
                      {review.regDate ? review.regDate.slice(0, 10) : ""}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm mt-3 pl-12">
                    {review.reviewContent}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* 페이지네이션 */}
        {reviews.length > REVIEWS_PER_PAGE && (
          <div className="flex items-center justify-center gap-1 mb-6">
            <button
              onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
              disabled={reviewPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalReviewPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalReviewPages || Math.abs(p - reviewPage) <= 1)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setReviewPage(item as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                      reviewPage === item
                        ? "bg-orange-500 text-white"
                        : "border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              onClick={() => setReviewPage((p) => Math.min(totalReviewPages, p + 1))}
              disabled={reviewPage === totalReviewPages}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 후기 작성 */}
        {user ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="font-semibold text-gray-700 mb-3">후기 작성</p>
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setReviewThumbsUp(true)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full border-2 font-medium transition-all text-sm ${
                  reviewThumbsUp
                    ? "bg-blue-500 text-white border-blue-500 shadow"
                    : "bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-500"
                }`}
              >
                <ThumbsUp className="w-4 h-4" />추천
              </button>
              <button
                onClick={() => setReviewThumbsUp(false)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full border-2 font-medium transition-all text-sm ${
                  !reviewThumbsUp
                    ? "bg-red-400 text-white border-red-400 shadow"
                    : "bg-white text-gray-500 border-gray-200 hover:border-red-300 hover:text-red-400"
                }`}
              >
                <ThumbsDown className="w-4 h-4" />비추천
              </button>
            </div>
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="요리 후기를 남겨주세요..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 h-24"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleReviewSubmit}
                disabled={isSubmitting || !reviewContent.trim()}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isSubmitting ? "등록 중..." : "등록"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
            후기를 작성하려면{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-orange-500 font-semibold hover:underline"
            >
              로그인
            </button>
            이 필요합니다.
          </div>
        )}
      </section>
    </div>
  );
}

function InfoCard({
  icon, label, value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center bg-white rounded-2xl shadow-sm border border-gray-100 p-4 gap-1">
      {icon}
      <span className="text-xs text-gray-400">{label}</span>
      <span className="font-bold text-gray-700 text-sm text-center">{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
      <span className="w-1 h-6 bg-orange-500 rounded-full inline-block shrink-0" />
      {children}
    </h2>
  );
}