import { useState, useEffect, KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { Search, Clock, ChefHat, Heart } from "lucide-react";
import RecipeService from "../service/recipeService";
import { tagService } from "../service/tagService";
import likeService from "../service/likeService";
import { useAuth } from "../context/AuthContext";
import { Recipe_Info, Tag } from "../types/type";

const BG_URL = "http://localhost:8080/image/home-bg.jpg";

const LEVEL_COLOR: Record<string, string> = {
  "상": "bg-red-100 text-red-700",
  "중": "bg-yellow-100 text-yellow-700",
  "하": "bg-green-100 text-green-700",
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [nameSearch, setNameSearch] = useState("");
  const [recipes, setRecipes] = useState<Recipe_Info[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    tagService.getAllTags().then((res) => setTags(res.data)).catch(() => setTags([]));
  }, []);

  useEffect(() => { fetchRecipes(); }, [selectedTagId]);

  const fetchRecipes = async (name?: string) => {
    setIsLoading(true);
    try {
      const result = await RecipeService.browse({
        name: name || undefined,
        tagIds: selectedTagId != null ? [selectedTagId] : undefined,
        page: 1,
        size: 9,
      });
      let loaded = result.recipes;
      if (user?.id) {
        try {
          const likedIds = await likeService.getMyLikes(user.id);
          const likedSet = new Set(likedIds);
          loaded = loaded.map((r) => ({ ...r, liked: likedSet.has(r.recipeId) }));
        } catch {}
      }
      setRecipes(loaded);
    } catch {
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => fetchRecipes(nameSearch);
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") handleSearch(); };
  const handleTagClick = (tagId: number | null) => { setSelectedTagId(tagId); setNameSearch(""); };

  return (
    <div className="space-y-10">
      <section
        className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg"
        style={{ backgroundImage: `url('${BG_URL}')`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 drop-shadow-lg">오늘 뜨 먹을까?</h1>
          <p className="text-lg md:text-xl text-white/90 drop-shadow mb-6">다양한 레시피를 검색하고 나만의 요리를 공유해보세요</p>
          <button onClick={() => navigate("/browse")} className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full shadow-lg transition-all active:scale-95 text-base">
            레시피 둘러보기 &rarr;
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-5">태그별 추천 레시피</h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => handleTagClick(null)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${selectedTagId === null ? "bg-orange-500 text-white border-orange-500 shadow" : "bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-500"}`}>
              전체
            </button>
            {tags.map((tag) => (
              <button key={tag.tagId} onClick={() => handleTagClick(tag.tagId)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${selectedTagId === tag.tagId ? "bg-orange-500 text-white border-orange-500 shadow" : "bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-500"}`}>
                {tag.tagName}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} onKeyDown={handleKeyDown} placeholder="레시피 검색..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white shadow-sm" />
            </div>
            <button onClick={handleSearch} className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow animate-pulse overflow-hidden">
                <div className="h-52 bg-gray-200" />
                <div className="p-5 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-6xl mb-4">�</span>
            <p className="text-lg font-medium">등록된 레시피가 없어요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <HomeRecipeCard
                key={recipe.recipeId}
                recipe={recipe}
                userId={user?.id}
                onClick={() => navigate(`/recipe/${recipe.recipeId}`)}
                onLikeChange={(recipeId, liked, likeCount) =>
                  setRecipes((prev) => prev.map((r) => r.recipeId === recipeId ? { ...r, liked, likeCount } : r))
                }
              />
            ))}
          </div>
        )}

        {recipes.length > 0 && (
          <div className="flex justify-center mt-8">
            <button onClick={() => navigate("/browse")} className="px-8 py-3 border-2 border-orange-500 text-orange-500 font-bold rounded-full hover:bg-orange-500 hover:text-white transition-all active:scale-95">
              더 많은 레시피 보기
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function HomeRecipeCard({
  recipe, userId, onClick, onLikeChange,
}: {
  recipe: Recipe_Info;
  userId?: string;
  onClick: () => void;
  onLikeChange?: (recipeId: string, liked: boolean, likeCount: number) => void;
}) {
  const thumbSrc = recipe.thumbImgUrl ? `http://localhost:8080${recipe.thumbImgUrl}` : null;
  const levelColor = LEVEL_COLOR[recipe.levelNm] ?? "bg-gray-100 text-gray-600";

  const handleLike = async () => {
    if (!userId) return;
    try {
      const result = await likeService.toggle(userId, recipe.recipeId);
      onLikeChange?.(recipe.recipeId, result.liked, result.likeCount);
    } catch (err) {
      console.error("좋아요 오류:", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      <div onClick={onClick} className="relative h-52 bg-orange-50 overflow-hidden cursor-pointer">
        {thumbSrc ? (
          <img src={thumbSrc} alt={recipe.recipeNmKo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><span className="text-6xl select-none">🍽️</span></div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 onClick={onClick} className="font-bold text-gray-800 text-lg line-clamp-1 flex-1 cursor-pointer">{recipe.recipeNmKo}</h3>
          <button type="button" onClick={handleLike} className="flex items-center gap-1 text-sm font-semibold flex-shrink-0 cursor-pointer hover:scale-110 transition-transform">
            <Heart style={{ width: 16, height: 16, fill: recipe.liked ? "#ec4899" : "none", stroke: recipe.liked ? "#ec4899" : "#9ca3af", strokeWidth: 2, pointerEvents: "none" }} />
            <span className={recipe.liked ? "text-pink-500" : "text-gray-400"}>{recipe.likeCount ?? 0}</span>
          </button>
        </div>
        {recipe.sumry && <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">{recipe.sumry}</p>}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {recipe.levelNm && (
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium ${levelColor}`}>
              <ChefHat className="w-3 h-3" />{recipe.levelNm}
            </span>
          )}
          {recipe.cookingTime && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
              <Clock className="w-3 h-3" />{recipe.cookingTime}
            </span>
          )}
          {recipe.qnt && <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">{recipe.qnt}</span>}
        </div>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
            {recipe.tags.map((tag) => (
              <span key={tag.tagId} className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-xs font-medium">{tag.tagName}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )}