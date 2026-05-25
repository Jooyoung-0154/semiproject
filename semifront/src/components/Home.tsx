import { useState, useEffect, KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { Search, Clock, ChefHat } from "lucide-react";
import RecipeService from "../service/recipeService";
import { tagService } from "../service/tagService";
import { Recipe_Info, Tag } from "../types/type";

const BG_URL = "http://localhost:8080/image/home-bg.jpg";

const LEVEL_COLOR: Record<string, string> = {
  상: "bg-red-100 text-red-700",
  중: "bg-yellow-100 text-yellow-700",
  하: "bg-green-100 text-green-700",
};

export default function Home() {
  const navigate = useNavigate();

  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [nameSearch, setNameSearch] = useState("");
  const [recipes, setRecipes] = useState<Recipe_Info[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 태그 목록 로드
  useEffect(() => {
    tagService
      .getAllTags()
      .then((res) => setTags(res.data))
      .catch(() => setTags([]));
  }, []);

  // 레시피 로드 (태그 변경 시 자동 재조회)
  useEffect(() => {
    fetchRecipes();
  }, [selectedTagId]);

  const fetchRecipes = async (name?: string) => {
    setIsLoading(true);
    try {
      const result = await RecipeService.browse({
        name: name || undefined,
        tagId: selectedTagId ?? undefined,
        page: 1,
        size: 9,
      });
      setRecipes(result.recipes);
    } catch {
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => fetchRecipes(nameSearch);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleTagClick = (tagId: number | null) => {
    setSelectedTagId(tagId);
    setNameSearch("");
  };

  return (
    <div className="space-y-10">
      {/* ── 히어로 섹션 ── */}
      <section
        className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg"
        style={{
          backgroundImage: `url('${BG_URL}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* 어두운 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

        {/* 텍스트 */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 drop-shadow-lg">
            오늘 뭐 먹을까?
          </h1>
          <p className="text-lg md:text-xl text-white/90 drop-shadow mb-6">
            다양한 레시피를 검색하고 나만의 요리를 공유해보세요
          </p>
          <button
            onClick={() => navigate("/browse")}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full shadow-lg transition-all active:scale-95 text-base"
          >
            레시피 둘러보기 →
          </button>
        </div>
      </section>

      {/* ── 카테고리 + 검색 헤더 ── */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-5">
          카테고리별 추천 레시피
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* 카테고리 탭 */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleTagClick(null)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                selectedTagId === null
                  ? "bg-orange-500 text-white border-orange-500 shadow"
                  : "bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-500"
              }`}
            >
              전체
            </button>
            {tags.map((tag) => (
              <button
                key={tag.tagId}
                onClick={() => handleTagClick(tag.tagId)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                  selectedTagId === tag.tagId
                    ? "bg-orange-500 text-white border-orange-500 shadow"
                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-500"
                }`}
              >
                {tag.tagName}
              </button>
            ))}
          </div>

          {/* 검색바 */}
          <div className="flex items-center gap-2 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="레시피 검색..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white shadow-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── 레시피 카드 그리드 ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow animate-pulse overflow-hidden">
                <div className="h-52 bg-gray-200" />
                <div className="p-5 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-6xl mb-4">🍽️</span>
            <p className="text-lg font-medium">등록된 레시피가 없어요.</p>
            <p className="text-sm mt-1">첫 번째 레시피를 작성해보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <HomeRecipeCard
                key={recipe.recipeId}
                recipe={recipe}
                onClick={() => navigate(`/recipe/${recipe.recipeId}`)}
              />
            ))}
          </div>
        )}

        {/* 더 보기 버튼 */}
        {recipes.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigate("/browse")}
              className="px-8 py-3 border-2 border-orange-500 text-orange-500 font-bold rounded-full hover:bg-orange-500 hover:text-white transition-all active:scale-95"
            >
              더 많은 레시피 보기
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

// ── 레시피 카드 ──
function HomeRecipeCard({
  recipe,
  onClick,
}: {
  recipe: Recipe_Info;
  onClick: () => void;
}) {
  const thumbSrc = recipe.thumbImgUrl
    ? `http://localhost:8080${recipe.thumbImgUrl}`
    : null;
  const levelColor = LEVEL_COLOR[recipe.levelNm] ?? "bg-gray-100 text-gray-600";

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer group"
    >
      {/* 썸네일 */}
      <div className="relative h-52 bg-orange-50 overflow-hidden">
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={recipe.recipeNmKo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl select-none">🍽️</span>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-5">
        {/* 제목 + 가격 */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-800 text-lg line-clamp-1 flex-1">
            {recipe.recipeNmKo}
          </h3>
          {recipe.price != null && (
            recipe.price > 0 ? (
              <span className="flex-shrink-0 text-sm font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                {recipe.price.toLocaleString()}원
              </span>
            ) : (
              <span className="flex-shrink-0 text-sm font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                Free
              </span>
            )
          )}
        </div>

        {recipe.sumry && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">
            {recipe.sumry}
          </p>
        )}

        {/* 하단 뱃지 */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {recipe.levelNm && (
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium ${levelColor}`}>
              <ChefHat className="w-3 h-3" />
              {recipe.levelNm}
            </span>
          )}
          {recipe.cookingTime && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
              <Clock className="w-3 h-3" />
              {recipe.cookingTime}분
            </span>
          )}
          {recipe.qnt && (
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
              {recipe.qnt}
            </span>
          )}
        </div>

        {/* 태그 목록 (왼쪽 하단) */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
            {recipe.tags.map((tag) => (
              <span
                key={tag.tagId}
                className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-xs font-medium"
              >
                # {tag.tagName}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
