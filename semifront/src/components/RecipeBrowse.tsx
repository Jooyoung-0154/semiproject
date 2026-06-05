import { useState, useEffect, useCallback, KeyboardEvent } from "react";
import { Search, X, Plus, ChefHat, Tag as TagIcon, Refrigerator} from "lucide-react";
import RecipeService, { BrowseParams } from "../service/recipeService";
import { tagService } from "../service/tagService";
import likeService from "../service/likeService";
import { Recipe_Info, Tag } from "../types/type";
import { useAuth } from "../context/AuthContext";
import RecipeCard from "./RecipeCard";

const LEVEL_OPTIONS = ["", "상", "중", "하"] as const;
const LEVEL_LABELS: Record<string, string> = { "": "전체", "상": "상 (어려움)", "중": "중 (보통)", "하": "하 (쉬움)" };

export default function RecipeBrowse() {
  const { user } = useAuth();

  const [nameInput, setNameInput] = useState("");
  const [debouncedName, setDebouncedName] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedName(nameInput), 500);
    return () => clearTimeout(timer);
  }, [nameInput]);

  const [recipes, setRecipes] = useState<Recipe_Info[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const PAGE_SIZE = 12;

  useEffect(() => {
    tagService.getAllTags().then((res) => setTags(res.data)).catch(() => setTags([]));
  }, []);

  const doSearch = useCallback(async (targetPage: number) => {
    setIsLoading(true);
    try {
      const params: BrowseParams = {
        name: debouncedName || undefined,
        tagIds: selectedTagIds.length ? selectedTagIds : undefined,
        level: selectedLevel || undefined,
        ingredients: ingredients.length ? ingredients : undefined,
        page: targetPage,
        size: PAGE_SIZE,
      };
      const result = await RecipeService.browse(params);
      let loaded = result.recipes;
      if (user?.id) {
        try {
          const likedIds = await likeService.getMyLikes(user.id);
          const likedSet = new Set(likedIds);
          loaded = loaded.map((r) => ({ ...r, liked: likedSet.has(r.recipeId) }));
        } catch {}
      }
      setRecipes(loaded);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPage(targetPage);
    } catch (e) {
      console.error("검색 오류:", e);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedName, selectedLevel, selectedTagIds, ingredients, user]);

  useEffect(() => { doSearch(1); }, [doSearch]);

  const handleSearch = () => doSearch(1);
  const addIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (trimmed && !ingredients.includes(trimmed)) setIngredients([...ingredients, trimmed]);
    setIngredientInput("");
  };
  const handleIngredientKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addIngredient(); }
  };
  const removeIngredient = (item: string) => setIngredients(ingredients.filter((i) => i !== item));
  const toggleTag = (tag: Tag) => {
    setSelectedTagIds((prev) =>
      prev.includes(tag.tagId) ? prev.filter((id) => id !== tag.tagId) : [...prev, tag.tagId]
    );
  };
  const clearTags = () => setSelectedTagIds([]);
  const filteredTags = tagInput.trim()
    ? tags.filter((t) => t.tagName.toLowerCase().includes(tagInput.trim().toLowerCase()))
    : tags;
  const resetFilters = () => {
    setNameInput(""); setDebouncedName(""); setSelectedLevel("");
    setSelectedTagIds([]); setTagInput(""); setIngredients([]); setIngredientInput("");
    setTimeout(() => doSearch(1), 0);
  };
  const getPageRange = () => {
    const range: number[] = [];
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  };
  const hasActiveFilter = nameInput || selectedLevel || selectedTagIds.length > 0 || ingredients.length > 0;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">레시피 둘러보기</h1>

      <div className="bg-white rounded-2xl shadow-md p-6 mb-8 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="레시피 이름으로 검색..." className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-base" />
          </div>
          <button onClick={handleSearch} className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" />검색
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1"><ChefHat className="w-4 h-4 inline mr-1" />난이도</label>
            <div className="flex gap-2 flex-wrap">
              {LEVEL_OPTIONS.map((lv) => (
                <button key={lv} onClick={() => setSelectedLevel(lv)} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${selectedLevel === lv ? "bg-orange-600 text-white border-orange-600" : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"}`}>
                  {LEVEL_LABELS[lv]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1"><TagIcon className="w-4 h-4 inline mr-1" />태그</label>
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="태그 검색..." className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm mb-2" />
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              <button onClick={clearTags} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedTagIds.length === 0 ? "bg-orange-600 text-white border-orange-600" : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"}`}>전체</button>
              {filteredTags.map((tag) => (
                <button key={tag.tagId} onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedTagIds.includes(tag.tagId) ? "bg-orange-600 text-white border-orange-600" : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"}`}>
                  {tag.tagName}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1"><Refrigerator className="w-4 h-4 inline mr-1"/>재료로 찾기</label>
            <div className="flex gap-2">
              <input type="text" value={ingredientInput} onChange={(e) => setIngredientInput(e.target.value)} onKeyDown={handleIngredientKeyDown} placeholder="재료 입력 후 Enter" className="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
              <button type="button" onClick={addIngredient} className="px-3 py-2 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {ingredients.map((item) => (
                  <span key={item} className="flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-full border border-orange-200">
                    {item}<button onClick={() => removeIngredient(item)} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {hasActiveFilter && (
          <div className="flex justify-end">
            <button onClick={resetFilters} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <X className="w-4 h-4" /> 필터 초기화
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600 text-sm">
          {isLoading ? "검색 중..." : <> 총 <span className="font-bold text-orange-600">{total}</span>개의 레시피 </>}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow animate-pulse">
              <div className="h-40 bg-gray-200 rounded-t-xl" />
              <div className="p-4 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
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
            <RecipeCard
              key={recipe.recipeId}
              recipe={recipe}
              userId={user?.id}
              onLikeChange={(recipeId, liked, likeCount) =>
                setRecipes((prev) => prev.map((r) => r.recipeId === recipeId ? { ...r, liked, likeCount } : r))
              }
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          {page > 1 && (
            <button onClick={() => doSearch(page - 1)} className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors">이전</button>
          )}
          {getPageRange().map((p) => (
            <button key={p} onClick={() => doSearch(p)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-orange-600 text-white shadow" : "border hover:bg-gray-50 text-gray-700"}`}>
              {p}
            </button>
          ))}
          <button onClick={() => doSearch(page + 1)} disabled={page >= totalPages} className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">다음</button>
        </div>
      )}
    </div>
  );
}

