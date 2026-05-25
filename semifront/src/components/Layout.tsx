import { Outlet, Link, useNavigate } from "react-router";
import { User, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
