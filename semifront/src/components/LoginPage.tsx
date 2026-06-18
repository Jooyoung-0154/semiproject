import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import axios from "axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      await login({ id, password });
      const from = (location.state as { from?: string })?.from ?? "/";
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      let message = "로그인에 실패했습니다. 다시 시도해주세요.";
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400) {
          message = "잘못된 회원정보입니다. 아이디와 비밀번호를 확인해주세요.";
        } else {
          message = err.response.data?.message || message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh]">
    <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6">로그인</h1>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">아이디</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="아이디를 입력하세요"
            required
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium mb-2">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => setIsCapsLockOn(e.getModifierState("CapsLock"))}
            onKeyUp={(e) => setIsCapsLockOn(e.getModifierState("CapsLock"))}
            onBlur={() => setIsCapsLockOn(false)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="비밀번호를 입력하세요"
            required
          />
          {isCapsLockOn && (
            <div className="capslock-tooltip">⚠ Caps Lock이 켜져 있습니다.</div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white rounded-2xl py-3 font-semibold hover:bg-orange-700 transition-colors"
        >
          로그인
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        계정이 없으신가요?{" "}
        <Link
          to="/signup"
          className="text-orange-500 font-semibold hover:underline"
        >
          회원가입
        </Link>
      </p>
    </div>
    </div>
  );
}
