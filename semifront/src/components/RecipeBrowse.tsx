import { useState, useEffect, useCallback, KeyboardEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  X,
  Plus,
  ChefHat,
  Clock3,
  Tag as TagIcon,
  Refrigerator,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import RecipeService, { BrowseParams } from "../service/recipeService";
import { tagService } from "../service/tagService";
import { Recipe_Info, Tag } from "../types/type";
import { useAuth } from "../context/AuthContext";
import RecipeCard from "./RecipeCard";
import { applyLikedStatus } from "../utils/likeUtils";

const LEVEL_OPTIONS = ["", "상", "중", "하"] as const;
const LEVEL_LABELS: Record<string, string> = {
  "": "전체",
  상: "상 (어려움)",
  중: "중 (보통)",
  하: "하 (쉬움)",
};

export default function RecipeBrowse() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 모든 필터 상태를 URL params에서 파생
  const debouncedName = searchParams.get("name") ?? "";
  const selectedLevel = searchParams.get("level") ?? "";
  const selectedTagIds = searchParams.getAll("tagId").map(Number);
  const ingredients = searchParams.getAll("ingredient");
  const cookingTimeFilter = searchParams.get("timeFilter") ?? "all";
  const sortType = searchParams.get("sort") ?? "all";
  const page = Number(searchParams.get("page") ?? "1");

  // 로컬 UI 상태만 (입력 중인 텍스트 등)
  const [nameInput, setNameInput] = useState(debouncedName);
  const [ingredientInput, setIngredientInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [recipes, setRecipes] = useState<Recipe_Info[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const PAGE_SIZE = 12;

  const updateParams = useCallback(
    (updater: (p: URLSearchParams) => void) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          updater(next);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // nameInput 디바운스 → URL 업데이트
  useEffect(() => {
    if (nameInput === debouncedName) return;
    const timer = setTimeout(() => {
      updateParams((p) => {
        if (nameInput) p.set("name", nameInput);
        else p.delete("name");
        p.delete("page");
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [nameInput]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    tagService
      .getAllTags()
      .then((res) => setTags(res.data))
      .catch(() => setTags([]));
  }, []);

  const userId = user?.id;

  // URL params 변경 시 검색 실행
  useEffect(() => {
    const controller = new AbortController();

    const doSearch = async () => {
      setIsLoading(true);
      setTotalPages(0);
      setTotal(0);
      try {
        const params: BrowseParams = {
          name: debouncedName || undefined,
          tagIds: selectedTagIds.length ? selectedTagIds : undefined,
          level: selectedLevel || undefined,
          ingredients: ingredients.length ? ingredients : undefined,
          sortType,
          cookingTimeFilter,
          page,
          size: PAGE_SIZE,
          signal: controller.signal,
        };
        const result = await RecipeService.browse(params);
        let loaded = result.recipes;
        loaded = await applyLikedStatus(loaded, userId);
        setRecipes(loaded);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "CanceledError") return;
        console.error("검색 오류:", e);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    doSearch();

    return () => controller.abort();
  }, [searchParams.toString(), userId]);

  const handleSearch = () => {
    updateParams((p) => {
      if (nameInput) p.set("name", nameInput);
      else p.delete("name");
      p.delete("page");
    });
  };

  const setSelectedLevel = (lv: string) =>
    updateParams((p) => {
      if (lv) p.set("level", lv);
      else p.delete("level");
      p.delete("page");
    });

  const setCookingTimeFilter = (value: string) =>
    updateParams((p) => {
      if (value === "all") p.delete("timeFilter");
      else p.set("timeFilter", value);
      p.delete("page");
    });

  const setSortType = (value: string) =>
    updateParams((p) => {
      if (value === "all") p.delete("sort");
      else p.set("sort", value);
      p.delete("page");
    });

  const addIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      updateParams((p) => {
        p.append("ingredient", trimmed);
        p.delete("page");
      });
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
    updateParams((p) => {
      const current = p.getAll("ingredient");
      p.delete("ingredient");
      current.filter((i) => i !== item).forEach((i) => p.append("ingredient", i));
      p.delete("page");
    });

  const toggleTag = (tag: Tag) =>
    updateParams((p) => {
      const currentIds = p.getAll("tagId").map(Number);
      p.delete("tagId");
      if (currentIds.includes(tag.tagId)) {
        currentIds
          .filter((id) => id !== tag.tagId)
          .forEach((id) => p.append("tagId", String(id)));
      } else {
        [...currentIds, tag.tagId].forEach((id) => p.append("tagId", String(id)));
      }
      p.delete("page");
    });

  const clearTags = () =>
    updateParams((p) => {
      p.delete("tagId");
      p.delete("page");
    });

  const filteredTags = tagInput.trim()
    ? tags.filter((t) =>
        t.tagName.toLowerCase().includes(tagInput.trim().toLowerCase()),
      )
    : tags;

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!window.confirm("정말 이 레시피를 삭제하시겠습니까?")) return;
    const ok = await RecipeService.deleteRecipe(recipeId);
    if (ok) {
      setRecipes((prev) => prev.filter((r) => r.recipeId !== recipeId));
    } else {
      alert("삭제에 실패했습니다.");
    }
  };

  const resetFilters = () => {
    setNameInput("");
    setTagInput("");
    setIngredientInput("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const doSearch = (targetPage: number) =>
    updateParams((p) => {
      if (targetPage === 1) p.delete("page");
      else p.set("page", String(targetPage));
    });

  const getPageRange = () => {
    const range: number[] = [];
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  };

  const hasActiveFilter =
    nameInput ||
    selectedLevel ||
    selectedTagIds.length > 0 ||
    ingredients.length > 0 ||
    cookingTimeFilter !== "all" ||
    sortType !== "all";

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-6 mb-2 space-y-4">
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
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            검색
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center mb-1 min-h-[26px]">
              <label className="text-sm font-medium text-gray-600">
                <ChefHat className="w-4 h-4 inline mr-1" />
                난이도
              </label>
            </div>
            <div className="flex gap-2 flex-wrap">
              {LEVEL_OPTIONS.map((lv) => (
                <button
                  key={lv}
                  onClick={() => setSelectedLevel(lv)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${selectedLevel === lv ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"}`}
                >
                  {LEVEL_LABELS[lv]}
                </button>
              ))}
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                <Clock3 className="w-4 h-4 inline mr-1" />
                조리시간
              </label>

              <div className="flex gap-3 flex-wrap">
                {[
                  { value: "all", label: "전체" },
                  { value: "under10", label: "뚝딱요리" },
                  { value: "under30", label: "일상요리" },
                  { value: "over30", label: "정성요리" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setCookingTimeFilter(item.value)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      cookingTimeFilter === item.value
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center mb-1 min-h-[26px]">
              <label className="text-sm font-medium text-gray-600">
                <TagIcon className="w-4 h-4 inline mr-1" />
                태그
              </label>
            </div>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              <button
                onClick={clearTags}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedTagIds.length === 0 ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"}`}
              >
                전체
              </button>
              {filteredTags.map((tag) => (
                <button
                  key={tag.tagId}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedTagIds.includes(tag.tagId) ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"}`}
                >
                  {tag.tagName}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center mb-1 min-h-[26px]">
              <label className="text-sm font-medium text-gray-600">
                <Refrigerator className="w-4 h-4 inline mr-1" />
                재료로 찾기
              </label>
            </div>
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
                className="px-3 py-2 bg-orange-100 text-orange-500 rounded-xl hover:bg-orange-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
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

      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-600 text-sm">
          {isLoading ? (
            "검색 중..."
          ) : (
            <>
              총 <span className="font-bold text-orange-500">{total}</span>개의
              레시피
            </>
          )}
        </p>

        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white"
        >
          <option value="all">최신순</option>
          <option value="popular">인기순</option>
          <option value="scrap">스크랩순</option>
          <option value="view">조회수순</option>
        </select>
      </div>

      {isLoading && recipes.length === 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 min-h-[800px]">
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
        <div
          className={`grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 min-h-[800px] transition-opacity duration-150 ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}
        >
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.recipeId}
              recipe={recipe}
              userId={user?.id}
              onLikeChange={(recipeId, liked, likeCount) =>
                setRecipes((prev) =>
                  prev.map((r) =>
                    r.recipeId === recipeId ? { ...r, liked, likeCount } : r,
                  ),
                )
              }
              onDelete={
                user?.id === recipe.writerId || user?.id === "Admin"
                  ? handleDeleteRecipe
                  : undefined
              }
              onEdit={
                user?.id === recipe.writerId || user?.id === "Admin"
                  ? (id) => navigate(`/write?edit=${id}`)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-10">
          <button
            onClick={() => doSearch(page - 1)}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {getPageRange().map((p) => (
            <button
              key={p}
              onClick={() => doSearch(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                p === page
                  ? "bg-orange-500 text-white"
                  : "border border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-500"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => doSearch(page + 1)}
            disabled={page >= totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
