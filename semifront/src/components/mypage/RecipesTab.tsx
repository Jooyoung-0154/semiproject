import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Recipe_Info, Member } from "../../types/type";
import RecipeService from "../../service/recipeService";
import RecipeCard from "../RecipeCard";

const PAGE_SIZE = 4;

interface RecipesTabProps {
  displayUser: Member;
  currentUserId: string;
  isOwnPage: boolean;
}

export default function RecipesTab({ displayUser, currentUserId, isOwnPage }: RecipesTabProps) {
  const navigate = useNavigate();
  const [myRecipes, setMyRecipes] = useState<Recipe_Info[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchMyRecipes();
    setPage(1);
  }, [displayUser.id]);

  const fetchMyRecipes = async () => {
    if (!displayUser.id) return;
    setIsLoading(true);
    try {
      const recipes = await RecipeService.getByWriter(displayUser.id);
      setMyRecipes(recipes);
    } catch (error) {
      console.error("내 레시피 불러오기 실패:", error);
      setMyRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!window.confirm("정말 이 레시피를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.")) return;
    try {
      const ok = await RecipeService.deleteRecipe(recipeId);
      if (ok === true) {
        alert("레시피가 성공적으로 삭제되었습니다.");
        setMyRecipes(prev => prev.filter(r => r.recipeId !== recipeId));
      } else {
        alert("삭제 처리에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch (error) {
      console.error("삭제 실패 오류:", error);
      alert("서버 오류로 인해 레시피를 삭제하지 못했습니다.");
    }
  };

  const totalPages = Math.ceil(myRecipes.length / PAGE_SIZE);
  const pagedRecipes = myRecipes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow animate-pulse overflow-hidden">
            <div className="h-40 bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (myRecipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="text-5xl mb-3">🍽️</span>
        <p className="font-medium">작성한 레시피가 없습니다.</p>
        {isOwnPage && (
          <button
            onClick={() => navigate("/write")}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-500 transition"
          >
            레시피 작성하기
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {pagedRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.recipeId}
            recipe={recipe}
            onDelete={isOwnPage || currentUserId === "Admin" ? handleDeleteRecipe : undefined}
            onEdit={isOwnPage ? (id) => navigate(`/write?edit=${id}`) : undefined}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-8">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | "...")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === "..." ? (
                <span key={`e-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPage(item as number)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                    page === item
                      ? "bg-orange-500 text-white"
                      : "border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500"
                  }`}
                >
                  {item}
                </button>
              )
            )}

          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
