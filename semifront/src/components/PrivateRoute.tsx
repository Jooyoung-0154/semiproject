import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }
  }, [user, navigate, location.pathname]);

  if (!user) return null;
  return <>{children}</>;
}
