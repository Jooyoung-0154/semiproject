import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Member, Recipe_Info } from "../../types/type";
import likeService from "../../service/likeService";
import RecipeService from "../../service/recipeService";
import RecipeCard from "../RecipeCard";

const PAGE_SIZE = 4;

interface LikedTabProps {
  currentUserId: string;
  isOwnPage: boolean;
  displayUser: Member;
}

export default function LikedTab({ currentUserId, isOwnPage, displayUser }: LikedTabProps) {
  const navigate = useNavigate();
  const [likedRecipes, setLikedRecipes] = useState<Recipe_Info[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLikedRecipes();
    setPage(1);
  }, [displayUser.id]);

  const fetchLikedRecipes = async () => {
    if (!displayUser.id) return;
    setIsLoading(true);
    try {
      const recipes = await likeService.getMyLikedRecipes(displayUser.id);
      setLikedRecipes(recipes.map(r => ({ ...r, liked: true })));
    } catch (error) {
      console.error("스크랩 레시피 불러오기 실패:", error);
      setLikedRecipes([]);
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
        setLikedRecipes(prev => prev.filter(r => r.recipeId !== recipeId));
      } else {
        alert("삭제 처리에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch (error) {
      console.error("삭제 실패 오류:", error);
      alert("서버 오류로 인해 레시피를 삭제하지 못했습니다.");
    }
  };

  const totalPages = Math.ceil(likedRecipes.length / PAGE_SIZE);
  const pagedRecipes = likedRecipes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">스크랩 레시피를 불러오는 중입니다...</div>;
  }

  if (likedRecipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="text-5xl mb-3">🤍</span>
        <p className="font-medium">스크랩한 레시피가 없습니다.</p>
        <button
          onClick={() => navigate("/browse")}
          className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-500 transition"
        >
          레시피 둘러보기
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {pagedRecipes.map((recipe) => {
          const isMyRecipe = recipe.writerId === currentUserId;
          return (
            <RecipeCard
              key={recipe.recipeId}
              recipe={recipe}
              userId={currentUserId || undefined}
              likeDisabled={!isOwnPage}
              onLikeChange={(recipeId, liked, likeCount) =>
                setLikedRecipes(prev =>
                  prev.map(r => r.recipeId === recipeId ? { ...r, liked, likeCount } : r)
                )
              }
              onDelete={isMyRecipe || currentUserId === "Admin" ? handleDeleteRecipe : undefined}
              onEdit={isMyRecipe ? (id) => navigate(`/write?edit=${id}`) : undefined}
            />
          );
        })}
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
