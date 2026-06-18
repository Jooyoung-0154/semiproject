import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      await register({
        id,
        password,
        nickname,
        birthDate,
        gender,
      });
      alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "회원가입에 실패했습니다. 입력 정보를 확인해주세요.";
      setError(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh]">
    <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6">회원가입</h1>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">아이디</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="사용할 아이디"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">비밀번호</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="비밀번호를 입력하세요"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="표시할 닉네임"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">생년월일</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">성별</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          >
            <option value="">성별 선택</option>
            <option value="남성">남성</option>
            <option value="여성">여성</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white rounded-2xl py-3 font-semibold hover:bg-orange-700 transition-colors"
        >
          회원가입
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        이미 계정이 있으신가요?{" "}
        <Link
          to="/login"
          className="text-orange-500 font-semibold hover:underline"
        >
          로그인
        </Link>
      </p>
    </div>
    </div>
  );
}