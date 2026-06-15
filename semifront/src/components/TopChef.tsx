import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { User } from "lucide-react";
import { memberService } from "../service/memberService";
import RecipeService from "../service/recipeService";
import RecipeCard from "./RecipeCard";
import type { Member, Recipe_Info } from "../types/type";
import { API_BASE_URL } from "../config/api";
import { CHEF_TABS } from "../exam/topChefData";

export default function TopChef() {
  const location = useLocation();
  const stateChefId = (location.state as { chefId?: string } | null)?.chefId;

  const [chefMember, setChefMember] = useState<Member | null>(null);
  const [chefRecipes, setChefRecipes] = useState<Recipe_Info[]>([]);
  const [selectedChefId, setSelectedChefId] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [loadingMember, setLoadingMember] = useState(false);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

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

      try {
        const res = await memberService.getMemberById(stateChefId);
        setChefMember(res.data);
      } catch {
        setChefMember(null);
      } finally {
        setLoadingMember(false);
      }

      try {
        const recipes = await RecipeService.getByWriter(stateChefId);
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
          <div className="absolute inset-0 bg-gradient-to-r from-orange-800 to-orange-400" />
          {chefMember.profileImg && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-15"
              style={{ backgroundImage: `url(${API_BASE_URL}/${chefMember.profileImg})` }}
            />
          )}
          <div className="relative px-8 py-7 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/50 shrink-0 bg-orange-300">
              {chefMember.profileImg ? (
                <img
                  src={`${API_BASE_URL}/${chefMember.profileImg}`}
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
                <span className="text-2xl font-bold">{chefMember.nickname}</span>
                {selectedSpecialty && (
                  <span className="text-xs px-2.5 py-0.5 bg-white/25 rounded-full font-medium">
                    {selectedSpecialty}
                  </span>
                )}
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
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {chefMember.nickname}의 레시피
            <span className="text-orange-500 ml-2">({chefRecipes.length})</span>
          </h2>
          {loadingRecipes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : chefRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {chefRecipes.map((recipe) => (
                <RecipeCard key={recipe.recipeId} recipe={recipe} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-16">
              등록된 레시피가 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
