import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import RecipeService from "../service/recipeService";
import { tagService } from "../service/tagService";
import { useAuth } from "../context/AuthContext";
import { Recipe_Info, Tag } from "../types/type";
import RecipeCard from "./RecipeCard";

import { applyLikedStatus } from "../utils/likeUtils";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  const [recipes, setRecipes] = useState<Recipe_Info[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    tagService
      .getAllTags()
      .then((res) => setTags(res.data))
      .catch(() => setTags([]));
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [selectedTagId]);

  const fetchRecipes = async (name?: string) => {
    setIsLoading(true);
    try {
      const result = await RecipeService.browse({
        name: name || undefined,
        tagIds: selectedTagId != null ? [selectedTagId] : undefined,
        page: 1,
        size: 8,
      });
      let loaded = result.recipes;
      loaded = await applyLikedStatus(loaded, user?.id);
      setRecipes(loaded);
    } catch {
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagClick = (tagId: number | null) => {
    setSelectedTagId(tagId);
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!window.confirm("정말 이 레시피를 삭제하시겠습니까?")) return;
    const ok = await RecipeService.deleteRecipe(recipeId);
    if (ok) {
      setRecipes((prev) => prev.filter((r) => r.recipeId !== recipeId));
    } else {
      alert("삭제에 실패했습니다.");
    }
  };

  const handleEditRecipe = (recipeId: string) => {
    navigate(`/write?edit=${recipeId}`);
  };

  return (
    <div className="space-y-10">
      <section
        className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg"
        style={{
          backgroundImage: `url('/home-bg.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 drop-shadow-lg">
            오늘 뭐 먹을까?
          </h1>
          <p className="text-lg md:text-xl text-white/90 drop-shadow mb-6">
            다양한 레시피를 검색하고 나만의 요리를 공유해보세요
          </p>
          <button
            onClick={() => navigate("/browse")}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-500 text-white font-bold rounded-full shadow-lg transition-all active:scale-95 text-base"
          >
            레시피 둘러보기 &rarr;
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-5">
          태그별 추천 레시피
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleTagClick(null)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${selectedTagId === null ? "bg-orange-500 text-white border-orange-500 shadow" : "bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-500"}`}
            >
              전체
            </button>
            {tags.map((tag) => (
              <button
                key={tag.tagId}
                onClick={() => handleTagClick(tag.tagId)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${selectedTagId === tag.tagId ? "bg-orange-500 text-white border-orange-500 shadow" : "bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-500"}`}
              >
                {tag.tagName}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow animate-pulse overflow-hidden"
              >
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
            <span className="text-6xl mb-4">?</span>
            <p className="text-lg font-medium">등록된 레시피가 없어요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
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
                  user?.id === "Admin" || user?.id === recipe.writerId
                    ? handleDeleteRecipe
                    : undefined
                }
                onEdit={
                  user?.id === "Admin" ||user?.id === recipe.writerId 
                  ? handleEditRecipe : undefined
                }
              />
            ))}
          </div>
        )}

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
