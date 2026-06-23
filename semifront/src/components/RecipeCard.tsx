import { useNavigate } from "react-router-dom";
import { Heart, ChefHat, Clock, Trash2, User, Eye, Pencil} from "lucide-react";
import likeService from "../service/likeService";
import { Recipe_Info } from "../types/type";
import { IMG_BASE_URL } from "../config/api";

const LEVEL_COLOR: Record<string, string> = {
  상: "bg-red-100 text-red-700",
  중: "bg-yellow-100 text-yellow-700",
  하: "bg-green-100 text-green-700",
};

interface RecipeCardProps {
  recipe: Recipe_Info;
  userId?: string;
  onLikeChange?: (recipeId: string, liked: boolean, likeCount: number) => void;
  likeDisabled?: boolean;
  onDelete?: (recipeId: string) => void;
  onEdit?: (recipeId: string) => void;
}

export default function RecipeCard({
  recipe,
  userId,
  onLikeChange,
  likeDisabled = false,
  onDelete,
  onEdit,
}: RecipeCardProps) {
  const navigate = useNavigate();
  const thumbSrc = recipe.thumbImgUrl
    ? `${IMG_BASE_URL}/${recipe.thumbImgUrl}`
    : null;
  const levelColor = LEVEL_COLOR[recipe.levelNm] ?? "bg-gray-100 text-gray-600";
  const profileImgSrc = recipe.writerProfileImg
    ? `${IMG_BASE_URL}/${recipe.writerProfileImg}`
    : null;
  const hasAuthor = !!(
    recipe.writerId ||
    recipe.writerNickname ||
    profileImgSrc
  );
  const hasBottomRow =
    (recipe.tags && recipe.tags.length > 0) || !!onDelete || !!onEdit;

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
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group flex flex-col h-[300px]">
      {/* 썸네일 */}
      <div
        className="relative h-40 bg-orange-50 overflow-hidden cursor-pointer shrink-0"
        onClick={() => navigate(`/recipe/${recipe.recipeId}`)}
      >
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={recipe.recipeNmKo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl select-none">🍽️</span>
          </div>
        )}

        {/* 작성자 오버레이 (이미지 왼쪽 상단) */}
        {hasAuthor && (
          <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/65 px-2 py-1 rounded-full">
            {profileImgSrc ? (
              <img
                src={profileImgSrc}
                alt={recipe.writerNickname}
                className="w-7 h-7 rounded-full object-cover border border-white/50 shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-orange-400" />
              </div>
            )}
            <span className="text-white text-sm font-medium leading-none">
              {recipe.writerNickname ?? recipe.writerId}
            </span>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-4 flex flex-col flex-1 overflow-hidden">
        {/* 제목 + 좋아요 */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3
            className="font-bold text-gray-800 text-base line-clamp-1 flex-1 cursor-pointer hover:text-orange-500 transition"
            onClick={() => navigate(`/recipe/${recipe.recipeId}`)}
          >
            {recipe.recipeNmKo}
          </h3>
          {onLikeChange !== undefined && (
            <button
              type="button"
              onClick={handleLike}
              disabled={likeDisabled}
              className={`flex items-center gap-1 text-xs shrink-0 transition-transform ${likeDisabled ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
            >
              <Heart
                style={{
                  width: 16,
                  height: 16,
                  fill: recipe.liked ? "#ec4899" : "none",
                  stroke: recipe.liked ? "#ec4899" : "#9ca3af",
                  strokeWidth: 2,
                  pointerEvents: "none",
                }}
              />
              <span
                className={recipe.liked ? "text-pink-500" : "text-gray-400"}
              >
                {recipe.likeCount ?? 0}
              </span>
            </button>
          )}
        </div>

        {/* 요약 */}
        {recipe.sumry && (
          <p className="text-gray-400 text-xs mb-2 line-clamp-1">
            {recipe.sumry}
          </p>
        )}

        {/* 뱃지 */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            {recipe.levelNm && (
              <span
                className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full font-medium ${levelColor}`}
              >
                <ChefHat className="w-3 h-3" />
                {recipe.levelNm}
              </span>
            )}
            {recipe.cookingTime && (
              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                <Clock className="w-3 h-3" />
                {recipe.cookingTime}
              </span>
            )}
          </div>
          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium shrink-0">
            <Eye className="w-3 h-3" />
            {(recipe.hit ?? 0).toLocaleString()}
          </span>
        </div>

        {/* 하단 행: 태그 왼쪽 + 수정·삭제 오른쪽 */}
        {hasBottomRow && (
          <div className="flex items-center gap-2 pt-2 mt-auto border-t border-gray-100">
            <div className="flex flex-wrap gap-1 flex-1">
              {recipe.tags?.map((tag) => (
                <span
                  key={tag.tagId}
                  className="px-1.5 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-xs font-medium"
                >
                  {tag.tagName}
                </span>
              ))}
            </div>
            {(onEdit || onDelete) && (
              <div className="flex items-center gap-2 shrink-0">
                {onEdit && (
                  <button
                    onClick={() => onEdit(recipe.recipeId)}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-600 transition font-medium"
                  >
                    <span title="수정">
                      <Pencil className="w-3.5 h-3.5"/>
                    </span> 
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(recipe.recipeId)}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition font-medium"
                  >
                    <span title="삭제">
                      <Trash2 className="w-3.5 h-3.5" />
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
