import { useState, useEffect, useCallback, KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { Search, X, Plus, Clock, ChefHat, Tag as TagIcon } from "lucide-react";
import RecipeService, { BrowseParams } from "../service/recipeService";
import { tagService } from "../service/tagService";
import { Recipe_Info, Tag } from "../types/type";

const LEVEL_OPTIONS = ["", "상", "중", "하"] as const;
const LEVEL_LABELS: Record<string, string> = { "": "전체", 상: "상 (어려움)", 중: "중 (보통)", 하: "하 (쉬움)" };
const LEVEL_COLOR: Record<string, string> = {
  상: "bg-red-100 text-red-700",
  중: "bg-yellow-100 text-yellow-700",
  하: "bg-green-100 text-green-700",
};

export default function RecipeBrowse() {
  const navigate = useNavigate();

  // ── 검색 조건 state ──
  const [nameInput, setNameInput] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<number | undefined>();
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);

  // ── 결과/태그/페이징 state ──
  const [recipes, setRecipes] = useState<Recipe_Info[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const PAGE_SIZE = 12;

  // 태그 목록 로드
  useEffect(() => {
    tagService
      .getAllTags()
      .then((res) => setTags(res.data))
      .catch(() => setTags([]));
  }, []);

  // 검색 실행
  const doSearch = useCallback(
    async (targetPage: number) => {
      setIsLoading(true);
      try {
        const params: BrowseParams = {
          name: nameInput || undefined,
          tagId: selectedTagId,
          level: selectedLevel || undefined,
          ingredients: ingredients.length ? ingredients : undefined,
          page: targetPage,
          size: PAGE_SIZE,
        };
        const result = await RecipeService.browse(params);
        setRecipes(result.recipes);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(targetPage);
      } catch (e) {
        console.error("검색 오류:", e);
      } finally {
        setIsLoading(false);
      }
    },
    [nameInput, selectedLevel, selectedTagId, ingredients]
  );

  // 최초 로드
  useEffect(() => {
    doSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 검색 버튼
  const handleSearch = () => doSearch(1);

  // 재료 추가
  const addIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
    }
    setIngredientInput("");
  };

  const handleIngredientKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  const removeIngredient = (item: string) =>
    setIngredients(ingredients.filter((i) => i !== item));

  // 필터 초기화
  const resetFilters = () => {
    setNameInput("");
    setSelectedLevel("");
    setSelectedTagId(undefined);
    setIngredients([]);
    setIngredientInput("");
    setTimeout(() => doSearch(1), 0);
  };

  // 페이지 버튼 목록 생성 (최대 5개)
  const getPageRange = () => {
    const range: number[] = [];
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  };

  const hasActiveFilter =
    nameInput || selectedLevel || selectedTagId || ingredients.length > 0;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">레시피 둘러보기</h1>

      {/* ── 검색 + 필터 패널 ── */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8 space-y-4">
        {/* 이름 검색 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="레시피 이름으로 검색..."
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-base"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            검색
          </button>
        </div>

        {/* 필터 행 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 난이도 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              <ChefHat className="w-4 h-4 inline mr-1" />
              난이도
            </label>
            <div className="flex gap-2 flex-wrap">
              {LEVEL_OPTIONS.map((lv) => (
                <button
                  key={lv}
                  onClick={() => setSelectedLevel(lv)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selectedLevel === lv
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"
                  }`}
                >
                  {LEVEL_LABELS[lv]}
                </button>
              ))}
            </div>
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              <TagIcon className="w-4 h-4 inline mr-1" />
              태그
            </label>
            <select
              value={selectedTagId ?? ""}
              onChange={(e) =>
                setSelectedTagId(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-sm"
            >
              <option value="">전체 태그</option>
              {tags.map((tag) => (
                <option key={tag.tagId} value={tag.tagId}>
                  #{tag.tagName}
                </option>
              ))}
            </select>
          </div>

          {/* 재료 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              재료로 찾기
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={handleIngredientKeyDown}
                placeholder="재료 입력 후 Enter"
                className="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              />
              <button
                type="button"
                onClick={addIngredient}
                className="px-3 py-2 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {/* 재료 태그 목록 */}
            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {ingredients.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-full border border-orange-200"
                  >
                    {item}
                    <button
                      onClick={() => removeIngredient(item)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 초기화 버튼 */}
        {hasActiveFilter && (
          <div className="flex justify-end">
            <button
              onClick={resetFilters}
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <X className="w-4 h-4" /> 필터 초기화
            </button>
          </div>
        )}
      </div>

      {/* ── 결과 헤더 ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600 text-sm">
          {isLoading ? (
            "검색 중..."
          ) : (
            <>
              총 <span className="font-bold text-orange-600">{total}</span>개의
              레시피
            </>
          )}
        </p>
      </div>

      {/* ── 레시피 카드 그리드 ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow animate-pulse">
              <div className="h-40 bg-gray-200 rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Search className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">조건에 맞는 레시피가 없어요.</p>
          <p className="text-sm mt-1">다른 검색어나 필터를 시도해보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.recipeId} recipe={recipe} />
          ))}
        </div>
      )}

      {/* ── 페이지네이션 ── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            onClick={() => doSearch(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            이전
          </button>

          {getPageRange().map((p) => (
            <button
              key={p}
              onClick={() => doSearch(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-orange-600 text-white shadow"
                  : "border hover:bg-gray-50 text-gray-700"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => doSearch(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

// ── 레시피 카드 컴포넌트 ──
function RecipeCard({ recipe }: { recipe: Recipe_Info }) {
  const navigate = useNavigate();
  const thumbSrc = recipe.thumbImgUrl
    ? `http://localhost:8080${recipe.thumbImgUrl}`
    : null;

  const levelColor =
    LEVEL_COLOR[recipe.levelNm] ?? "bg-gray-100 text-gray-600";

  return (
    <div
      onClick={() => navigate(`/recipe/${recipe.recipeId}`)}
      className="bg-white rounded-xl shadow hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
    >
      {/* 썸네일 */}
      <div className="h-40 bg-orange-50 flex items-center justify-center overflow-hidden">
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={recipe.recipeNmKo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-5xl select-none">🍽️</span>
        )}
      </div>

      {/* 정보 */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">
          {recipe.recipeNmKo}
        </h3>
        {recipe.sumry && (
          <p className="text-gray-500 text-xs mb-2 line-clamp-2 leading-relaxed">
            {recipe.sumry}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {recipe.levelNm && (
            <span className={`px-2 py-0.5 rounded-full font-medium ${levelColor}`}>
              {recipe.levelNm}
            </span>
          )}
          {recipe.cookingTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {recipe.cookingTime}분
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
