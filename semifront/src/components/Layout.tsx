import { useEffect, useRef, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { User, LogIn, LogOut, ShieldCheck, Search, Bell } from "lucide-react";
import TopChefNav from "./TopChefNav";
import { memberService } from "../service/memberService.ts";
import RecipeService from "../service/recipeService";
import type { Member, Recipe_Info, Notification } from "../types/type.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { IMG_BASE_URL } from "../config/api";
import { notificationService } from "../service/notificationService";

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [memberResults, setMemberResults] = useState<Member[]>([]);
  const [recipeResults, setRecipeResults] = useState<Recipe_Info[]>([]);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(
    () => {
      return sessionStorage.getItem("notificationEnabled") !== "false";
    },
  );

  const unreadCount = notificationEnabled
    ? notifications.filter((noti) => !noti.isRead).length
    : 0;

  const fetchNotifications = async () => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    if (!notificationEnabled) {
      setNotifications([]);
      return;
    }

    try {
      const response = await notificationService.getList(user.id);
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("알림 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (!user?.id || !notificationEnabled) return;

    const timer = window.setInterval(fetchNotifications, 10000);
    return () => window.clearInterval(timer);
  }, [user?.id, notificationEnabled]);

  useEffect(() => {
    sessionStorage.setItem("notificationEnabled", String(notificationEnabled));
    if (!notificationEnabled) {
      setNotifications([]);
    } else {
      fetchNotifications();
    }
  }, [notificationEnabled]);

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

  const handleReadAllNotifications = async () => {
    if (!user?.id) return;

    const backup = notifications;

    // 화면 즉시 초기화
    setNotifications([]);

    try {
      await notificationService.readAll(user.id);
    } catch (error) {
      console.error("전체 읽음 처리 실패:", error);
      alert("알림 읽음 처리에 실패했습니다.");

      // 실패하면 원래 목록 복구
      setNotifications(backup);
    }
  };

  const handleReadNotification = async (noti: Notification) => {
    try {
      if (!noti.isRead) {
        await notificationService.read(noti.notiId);

        setNotifications((prev) =>
          prev.map((item) =>
            item.notiId === noti.notiId ? { ...item, isRead: true } : item,
          ),
        );
      }

      if (noti.type === "RECIPE_LIKE" || noti.type === "RECIPE_COMMENT") {
        navigate(`/recipe/${noti.targetId}`);
        setShowNotifications(false);
      }

      if (noti.type === "POST_COMMENT" || noti.type === "POST_LIKE") {
        navigate(`/mypage`);
        setShowNotifications(false);
      }

      if (noti.type === "GUESTBOOK" || noti.type === "FOLLOW") {
        navigate(`/mypage`);
        setShowNotifications(false);
      }
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
    }
  };

  const toggleNotificationEnabled = () => {
    setNotificationEnabled((prev) => !prev);
  };

  const location = useLocation();
  const isOnTopChef = location.pathname === "/topchef";

  const [showTopChefPanel, setShowTopChefPanel] = useState(false);
  const topChefRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef(location);
  locationRef.current = location;

  // /topchef 진입 시 자동 열기, 이탈 시 닫기
  useEffect(() => {
    setShowTopChefPanel(isOnTopChef);
  }, [isOnTopChef]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current.pathname === "/topchef") return;
      if (topChefRef.current && !topChefRef.current.contains(e.target as Node)) {
        setShowTopChefPanel(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const browseHref = (() => {
    const saved = sessionStorage.getItem("browseParams");
    return saved ? `/browse?${saved}` : "/browse";
  })();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50" ref={topChefRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-2xl font-bold text-orange-500 tracking-tight"
            >
              🍳 Chef's Cuisine
            </Link>

            <div className="relative w-90 ml-6">
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
                                src={`${IMG_BASE_URL}/${recipe.thumbImgUrl}`}
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
                                src={`${IMG_BASE_URL}/${member.profileImg}`}
                                alt={member.nickname}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4 text-orange-500" />
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

            <nav className="flex items-center gap-8">
              <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
                <Link
                  to={browseHref}
                  className="hover:text-orange-500 transition-colors"
                >
                  레시피 검색
                </Link>

                <Link
                  to="/write"
                  className="hover:text-orange-500 transition-colors"
                >
                  레시피 작성
                </Link>

                <div ref={topChefRef}>
                  <button
                    onClick={() => setShowTopChefPanel((prev) => !prev)}
                    className={`hover:text-orange-500 transition-colors ${showTopChefPanel ? "text-orange-500 font-semibold" : ""}`}
                  >
                    홈스토랑
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowNotifications((prev) => !prev)}
                        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200"
                        title="알림"
                      >
                        <Bell
                          className={`w-5 h-5 ${
                            notificationEnabled
                              ? "text-gray-700"
                              : "text-gray-400"
                          }`}
                        />

                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>

                      {showNotifications && (
                        <div className="absolute right-0 top-12 w-80 bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden z-[100]">
                          <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">알림</span>

                              <button
                                type="button"
                                onClick={toggleNotificationEnabled}
                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                                  notificationEnabled
                                    ? "bg-orange-500"
                                    : "bg-gray-300"
                                }`}
                                title="알림 ON/OFF"
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    notificationEnabled
                                      ? "translate-x-5"
                                      : "translate-x-1"
                                  }`}
                                />
                              </button>

                              <span className="text-[11px] text-gray-500">
                                {notificationEnabled ? "ON" : "OFF"}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={handleReadAllNotifications}
                              disabled={
                                !notificationEnabled ||
                                notifications.length === 0
                              }
                              className="text-xs text-orange-500 font-semibold hover:underline disabled:text-gray-300 disabled:no-underline"
                            >
                              전체 읽음
                            </button>
                          </div>

                          <div className="max-h-80 overflow-y-auto">
                            {!notificationEnabled ? (
                              <p className="text-sm text-gray-400 text-center py-8">
                                알림이 꺼져 있습니다.
                              </p>
                            ) : notifications.length > 0 ? (
                              notifications.map((noti) => (
                                <button
                                  type="button"
                                  key={noti.notiId}
                                  onClick={() => handleReadNotification(noti)}
                                  className={`w-full text-left px-4 py-3 border-b hover:bg-orange-50 ${
                                    noti.isRead ? "bg-white" : "bg-orange-50"
                                  }`}
                                >
                                  <p className="text-sm text-gray-800 font-medium leading-5">
                                    {noti.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {noti.regDate}
                                  </p>
                                </button>
                              ))
                            ) : (
                              <p className="text-sm text-gray-400 text-center py-8">
                                알림이 없습니다.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {user.id === "Admin" && (
                      <button
                        onClick={() => navigate("/admin")}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 transition-all active:scale-95"
                        title="관리자페이지"
                      >
                        <ShieldCheck className="w-5 h-5 text-white" />
                      </button>
                    )}

                    <button
                      onClick={() => navigate("/mypage")}
                      className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-700 transition-all shadow-md active:scale-95"
                    >
                      <User className="w-4 h-4" />
                      <span>{user.nickname}</span>
                    </button>

                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-all"
                      title="로그아웃"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>로그아웃</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-700 transition-all shadow-md active:scale-95"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>로그인</span>
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>

        {/* 홈스토랑 드롭다운 — 헤더 전체 너비 */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out border-t border-gray-100 bg-white ${
            showTopChefPanel ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <TopChefNav onClose={() => !isOnTopChef && setShowTopChefPanel(false)} />
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-2 pb-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 레시피 공유 플랫폼. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
