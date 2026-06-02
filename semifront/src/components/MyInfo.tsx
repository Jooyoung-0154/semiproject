import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth, normalizeMember } from "../context/AuthContext.tsx";
import { memberService } from "../service/memberService.ts";
import type { Member } from "../types/type.ts";

export default function MyInfo() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [member, setMember] = useState<Member | null>(authUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyInfo = async () => {
      if (!authUser?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await memberService.getMemberById(authUser.id);
        const normalized = normalizeMember(response.data);
        setMember(normalized);
      } catch (error) {
        console.error("내 정보 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyInfo();
  }, [authUser]);

  if (loading) return <div className="text-center py-10">로딩 중...</div>;

  if (!member) {
    return (
      <div className="text-center py-10">
        <p>회원 정보를 불러올 수 없습니다.</p>
        <button onClick={() => navigate("/mypage")}>마이페이지로 이동</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg p-8 mt-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
          <User className="w-10 h-10 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">내 정보</h1>
          <p className="text-gray-500 mt-1">회원가입 시 입력한 정보입니다.</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-sm text-gray-500 mb-1">아이디</p>
          <div className="border rounded-2xl px-4 py-3">{member.id}</div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">닉네임</p>
          <div className="border rounded-2xl px-4 py-3">{member.nickname}</div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">생년월일</p>
          <div className="border rounded-2xl px-4 py-3">
            {member.birthDate || "등록된 생년월일이 없습니다."}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">성별</p>
          <div className="border rounded-2xl px-4 py-3">
            {member.gender || "등록된 성별이 없습니다."}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => navigate("/mypage")}
          className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-orange-700"
        >
          돌아가기
        </button>
      </div>
    </div>
  );
}
