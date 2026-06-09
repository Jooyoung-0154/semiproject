import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router";
import { User, LogIn, LogOut, ShieldCheck, Search } from "lucide-react";
import { memberService } from "../service/memberService.ts";
import RecipeService from "../service/recipeService";
import type { Member, Recipe_Info } from "../types/type.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { API_BASE_URL } from "../config/api";

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [memberResults, setMemberResults] = useState<Member[]>([]);
  const [recipeResults, setRecipeResults] = useState<Recipe_Info[]>([]);
  const [showSearchBox, setShowSearchBox] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmed = keyword.trim();

      if (!trimmed) {
        setMemberResults([]);
        setRecipeResults([]);
        setShowSearchBox(false);
        return;
      }

      try {
        const memberRes = await memberService.searchMembers(trimmed);
        setMemberResults(memberRes.data ?? []);

        const recipeRes = await RecipeService.browse({
          name: trimmed,
          page: 1,
          size: 5,
        });
        setRecipeResults(recipeRes.recipes ?? []);

        setShowSearchBox(true);
      } catch (error) {
        console.error("통합 검색 실패:", error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* 로고 */}
            <Link
              to="/"
              className="text-2xl font-bold text-orange-600 tracking-tight"
            >
              🍳 Chef's Cuisine
            </Link>

            {/* 통합 검색창 */}
            <div className="relative w-80 ml-6 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="레시피 또는 회원 검색..."
                className="w-full pl-9 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />

              {showSearchBox && (
                <div className="absolute top-12 left-0 w-full bg-white border rounded-2xl shadow-lg z-50 overflow-hidden">
                  <div className="p-3 border-b">
                    <p className="text-xs font-bold text-gray-500 mb-2">
                      레시피
                    </p>

                    {recipeResults.length > 0 ? (
                      recipeResults.map((recipe) => (
                        <button
                          key={recipe.recipeId}
                          onClick={() => {
                            setKeyword("");
                            setShowSearchBox(false);
                            navigate(`/recipe/${recipe.recipeId}`);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-orange-50 text-sm"
                        >
                          <div className="w-10 h-10 rounded-xl bg-orange-50 overflow-hidden flex items-center justify-center shrink-0">
                            {recipe.thumbImgUrl ? (
                              <img
                                src={`${API_BASE_URL}${recipe.thumbImgUrl}`}
                                alt={recipe.recipeNmKo}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-lg">🍽️</span>
                            )}
                          </div>

                          <div className="min-w-0 text-left">
                            <p className="font-semibold text-gray-800 truncate">
                              {recipe.recipeNmKo}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {recipe.sumry || "레시피 설명이 없습니다."}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 px-3 py-2">
                        검색된 레시피가 없습니다.
                      </p>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="text-xs font-bold text-gray-500 mb-2">회원</p>

                    {memberResults.length > 0 ? (
                      memberResults.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => {
                            setKeyword("");
                            setShowSearchBox(false);
                            navigate(`/mypage/${member.id}`);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-orange-50 text-sm"
                        >
                          <div className="w-8 h-8 rounded-full bg-orange-100 overflow-hidden flex items-center justify-center">
                            {member.profileImg ? (
                              <img
                                src={`${API_BASE_URL}${member.profileImg}`}
                                alt={member.nickname}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4 text-orange-600" />
                            )}
                          </div>
                          <span className="font-medium">{member.nickname}</span>
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 px-3 py-2">
                        검색된 회원이 없습니다.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 네비게이션 메뉴 */}
            <nav className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                <Link
                  to="/browse"
                  className="hover:text-orange-600 transition-colors"
                >
                  레시피 둘러보기
                </Link>

                <Link
                  to="/write"
                  className="hover:text-orange-600 transition-colors"
                >
                  레시피 작성
                </Link>
                <Link
                  to="/mypage"
                  className="hover:text-orange-600 transition-colors"
                >
                  마이페이지
                </Link>
              </div>

              {/* 로그인/프로필 버튼 */}
              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    {user.id === "Admin" && (
                      <button
                        onClick={() => navigate("/admin")}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-all shadow-md active:scale-95"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>관리자</span>
                      </button>
                    )}
                    <button
                      onClick={() => navigate("/mypage")}
                      className="flex items-center gap-2 px-5 py-2 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 transition-all shadow-md active:scale-95"
                    >
                      <User className="w-4 h-4" />
                      <span>{user.nickname}</span>
                    </button>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>로그아웃</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 px-5 py-2 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 transition-all shadow-md active:scale-95"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>로그인</span>
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* 푸터 (추가해두면 사이트가 더 완성도 있어 보입니다) */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 레시피 공유 플랫폼. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
