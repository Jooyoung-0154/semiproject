import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { User } from "lucide-react";
import { memberService } from "../service/memberService";
import RecipeService from "../service/recipeService";
import RecipeCard from "./RecipeCard";
import type { Member, Recipe_Info } from "../types/type";
import { IMG_BASE_URL } from "../config/api";
import { CHEF_TABS } from "../exam/topChefData";
import { useAuth } from "../context/AuthContext";
import { applyLikedStatus } from "../utils/likeUtils";

export default function TopChef() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const stateChefId = (location.state as { chefId?: string } | null)?.chefId;

  const RECIPES_PER_PAGE = 6;

  const [chefMember, setChefMember] = useState<Member | null>(null);
  const [chefRecipes, setChefRecipes] = useState<Recipe_Info[]>([]);
  const [selectedChefId, setSelectedChefId] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string[]>([]);
  const [loadingMember, setLoadingMember] = useState(false);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState("latest");

  useEffect(() => {
    setCurrentPage(1);
  }, [sortType]);

  const bgImages = chefRecipes
    .filter((r) => r.thumbImgUrl)
    .map((r) => `${IMG_BASE_URL}/${r.thumbImgUrl}`);

  useEffect(() => {
    if (bgImages.length === 0) return;
    setBgIndex(0);
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [chefRecipes]);

  // 드롭다운에서 chefId 전달받으면 즉시 로드
  useEffect(() => {
    if (!stateChefId || stateChefId === selectedChefId) return;

    setSelectedChefId(stateChefId);

    // specialty 찾기
    for (const tab of CHEF_TABS) {
      const found = tab.chefs.find((c) => c.id === stateChefId);
      if (found) {
        setSelectedSpecialty(found.specialty);
        break;
      }

    }

    const load = async () => {
      setLoadingMember(true);
      setLoadingRecipes(true);
      setChefMember(null);
      setChefRecipes([]);
      setCurrentPage(1);
      setSortType("latest");

      try {
        const res = await memberService.getMemberById(stateChefId);
        setChefMember(res.data);
      } catch {
        setChefMember(null);
      } finally {
        setLoadingMember(false);
      }

      try {
        let recipes = await RecipeService.getByWriter(stateChefId);
        recipes = await applyLikedStatus(recipes, user?.id);
        setChefRecipes(recipes);
      } catch {
        setChefRecipes([]);
      } finally {
        setLoadingRecipes(false);
      }
    };

    load();
  }, [stateChefId]);

  // 아무도 선택 안 된 초기 상태
  if (!selectedChefId) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        위 드롭다운에서 쉐프를 선택해 주세요.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 히어로 배너 */}
      {loadingMember ? (
        <div className="h-40 bg-orange-100 rounded-2xl animate-pulse" />
      ) : chefMember ? (
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500" />
          {bgImages.map((src, i) => (
            <img
              key={src}
              src={src}
              className="absolute right-0 top-0 h-full w-2/5 object-cover transition-opacity duration-1000"
              style={{
                opacity: i === bgIndex ? 0.6 : 0,
                maskImage: "linear-gradient(to right, transparent 0%, black 30%)",
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 30%)",
              }}
              alt=""
            />
          ))}
          <div className="relative px-8 py-7 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/50 shrink-0 bg-orange-300">
              {chefMember.profileImg ? (
                <img
                  src={`${IMG_BASE_URL}/${chefMember.profileImg}`}
                  alt={chefMember.nickname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => navigate(`/mypage/${selectedChefId}`)}
                  className="text-2xl font-bold hover:underline cursor-pointer"
                >
                  {chefMember.nickname}
                </button>
                {selectedSpecialty.length > 0 && selectedSpecialty.map((s, i) => (
                  <span key={i} className="text-xs px-2.5 py-0.5 bg-white/25 rounded-full font-medium">
                    {s}
                  </span>
                ))}
              </div>
              {chefMember.intro && (
                <p className="text-sm text-white/80 mb-3 line-clamp-2 max-w-lg">
                  {chefMember.intro}
                </p>
              )}
              <div className="flex items-center gap-5 text-sm text-white/75">
                <span>🍳 레시피 {chefMember.recipeCount ?? chefRecipes.length}개</span>
                <span>❤️ 팔로워 {chefMember.followerCount ?? 0}</span>
              </div>
              {(chefMember.snsYoutube || chefMember.snsInstagram || chefMember.snsFacebook) && (
                <div className="flex items-center gap-3 mt-2">
                  {chefMember.snsYoutube && (
                    <a href={chefMember.snsYoutube} target="_blank" rel="noopener noreferrer"
                      className="hover:opacity-80 transition">
                      <img src="/youtube.svg" width={20} height={20} alt="YouTube" />
                    </a>
                  )}
                  {chefMember.snsInstagram && (
                    <a href={chefMember.snsInstagram} target="_blank" rel="noopener noreferrer"
                      className="hover:opacity-80 transition">
                      <img src="/instagram.svg" width={20} height={20} alt="Instagram" />
                    </a>
                  )}
                  {chefMember.snsFacebook && (
                    <a href={chefMember.snsFacebook} target="_blank" rel="noopener noreferrer"
                      className="hover:opacity-80 transition">
                      <img src="/facebook.svg" width={20} height={20} alt="Facebook" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-40 bg-gray-100 rounded-2xl flex items-center justify-center">
          <p className="text-gray-400 text-sm">쉐프 정보를 불러올 수 없습니다.</p>
        </div>
      )}

      {/* 레시피 그리드 */}
      {chefMember && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              {chefMember.nickname}의 레시피
              <span className="text-orange-500 ml-2">({chefRecipes.length})</span>
            </h2>
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white"
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
              <option value="view">조회수순</option>
            </select>
          </div>
          {loadingRecipes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : chefRecipes.length > 0 ? (() => {
            const sorted = [...chefRecipes].sort((a, b) => {
              if (sortType === "popular") return (b.likeCount ?? 0) - (a.likeCount ?? 0);
              if (sortType === "view") return (b.hit ?? 0) - (a.hit ?? 0);
              return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
            });
            const totalPages = Math.ceil(sorted.length / RECIPES_PER_PAGE);
            const paginatedRecipes = sorted.slice(
              (currentPage - 1) * RECIPES_PER_PAGE,
              currentPage * RECIPES_PER_PAGE
            );
            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.recipeId}
                      recipe={recipe}
                      userId={user?.id}
                      onLikeChange={(recipeId, liked, likeCount) =>
                        setChefRecipes((prev) =>
                          prev.map((r) =>
                            r.recipeId === recipeId ? { ...r, liked, likeCount } : r
                          )
                        )
                      }
                      onDelete={
                        user?.id === recipe.writerId || user?.id === "Admin"
                          ? async (recipeId) => {
                              if (!window.confirm("정말 이 레시피를 삭제하시겠습니까?")) return;
                              const ok = await RecipeService.deleteRecipe(recipeId);
                              if (ok) setChefRecipes((prev) => prev.filter((r) => r.recipeId !== recipeId));
                              else alert("삭제에 실패했습니다.");
                            }
                          : undefined
                      }
                      onEdit={
                        user?.id === recipe.writerId || user?.id === "Admin"
                          ? (recipeId) => navigate(`/write?edit=${recipeId}`)
                          : undefined
                      }
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-orange-50 transition"
                    >
                      이전
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                          page === currentPage
                            ? "bg-orange-500 text-white"
                            : "border hover:bg-orange-50 text-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-orange-50 transition"
                    >
                      다음
                    </button>
                  </div>
                )}
              </>
            );
          })() : (
            <p className="text-gray-400 text-sm text-center py-16">
              등록된 레시피가 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
