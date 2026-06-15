import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Member } from "../types/type.ts";
import { authService } from "../service/authService.ts";
import { memberService } from "../service/memberService.ts";

interface LoginParams {
  id: string;
  password: string;
}

interface RegisterParams {
  id: string;
  password: string;
  nickname: string;
  birthDate: string;
  gender: string;
}

interface AuthContextValue {
  user: Member | null;
  login: (params: LoginParams) => Promise<void>;
  logout: () => void;
  register: (member: RegisterParams) => Promise<void>;
}

const defaultAuthContext: AuthContextValue = {
  user: null,
  login: async () => {
    throw new Error("AuthProvider is not available.");
  },
  logout: () => {
    throw new Error("AuthProvider is not available.");
  },
  register: async () => {
    throw new Error("AuthProvider is not available.");
  },
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContext);

export function normalizeMember(data: any): Member | null {
  if (!data || typeof data !== "object") return null;

  const resolve = (value: any): any => {
    if (!value || typeof value !== "object") return null;
    if ("user" in value) return resolve(value.user);
    return value;
  };

  const member = resolve(data);
  if (!member || typeof member !== "object") return null;

  //json 이름 찾기
  const id =
    typeof member.id === "string"
      ? member.id
      : typeof member.userId === "string"
        ? member.userId
        : typeof member.memberId === "string"
          ? member.memberId
          : undefined;

  if (!id) return null;

  return {
    id,
    password: undefined,
    birthDate: String(member.birthDate ?? ""),
    gender: String(member.gender ?? ""),
    balance: Number(member.balance) || 0,
    nickname: String(member.nickname ?? member.name ?? ""),
    profileImg: String(member.profileImg ?? ""),
    intro: String(member.intro ?? ""),
    followerIds: Array.isArray(member.followerIds) ? member.followerIds : [],
    followingIds: Array.isArray(member.followingIds) ? member.followingIds : [],
    myReviews: Array.isArray(member.myReviews) ? member.myReviews : [],
    myPosts: Array.isArray(member.myPosts) ? member.myPosts : [],
    followingCount: Number(member.followingCount) || 0,
    followerCount: Number(member.followerCount) || 0,
    recipeCount: Number(member.recipeCount) || 0,
    scrapPublic:
      typeof member.scrapPublic === "boolean" ? member.scrapPublic : true,
    snsYoutube: member.snsYoutube ?? undefined,
    snsInstagram: member.snsInstagram ?? undefined,
    snsFacebook: member.snsFacebook ?? undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Member | null>(() => {
    try {
      const savedUser = sessionStorage.getItem("authUser");
      const parsed = savedUser ? JSON.parse(savedUser) : null;
      return normalizeMember(parsed);
    } catch {
      return null;
    }
  });

  const login = async ({ id, password }: LoginParams) => {
    const response = await authService.login({ id, password });
    const normalized = normalizeMember(response.data);
    if (!normalized) {
      console.warn("Unexpected login response shape:", response.data);
      throw new Error("로그인 응답이 올바르지 않습니다.");
    }
    setUser(normalized);
    sessionStorage.setItem("authUser", JSON.stringify(normalized));
  };

  const logout = () => {
    authService.logout().catch(() => {});
    setUser(null);
    sessionStorage.removeItem("authUser");
  };

  const register = async (member: RegisterParams) => {
    const response = await memberService.register(member);
    if (!response.data.success) {
      throw new Error(response.data.message || "회원가입에 실패했습니다.");
    }
  };

  const value = useMemo(() => ({ user, login, logout, register }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === defaultAuthContext) {
    console.warn(
      "useAuth is being used outside AuthProvider. Default auth context will be used.",
    );
  }
  return context;
}
