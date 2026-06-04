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

  const [nickname, setNickname] = useState("");
  const [intro, setIntro] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");

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

        if (normalized) {
          setNickname(normalized.nickname ?? "");
          setIntro(normalized.intro ?? "");
        }
      } catch (error) {
        console.error("내 정보 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyInfo();
  }, [authUser]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!authUser?.id || !member) return;

    try {
      if (nickname !== member.nickname) {
        await memberService.updateNickname(authUser.id, nickname);
      }

      if (intro !== member.intro) {
        await memberService.updateIntro(authUser.id, intro);
      }

      if (selectedFile) {
        await memberService.updateProfileImage(authUser.id, selectedFile);
      }

      alert("회원정보가 수정되었습니다.");
      navigate("/mypage");
      window.location.reload();

      const response = await memberService.getMemberById(authUser.id);
      const refreshed = normalizeMember(response.data);

      if (refreshed) {
        setMember(refreshed);
        setNickname(refreshed.nickname ?? "");
        setIntro(refreshed.intro ?? "");
        setSelectedFile(null);
        setPreviewImage("");

        localStorage.setItem("authUser", JSON.stringify(refreshed));
      }
    } catch (error) {
      console.error("회원정보 수정 실패:", error);
      alert("회원정보 수정 중 오류가 발생했습니다.");
    }
  };

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
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            className="hidden"
          />

          <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-orange-200 hover:opacity-80 transition">
            {previewImage ? (
              <img
                src={previewImage}
                alt="미리보기"
                className="w-full h-full object-cover"
              />
            ) : member.profileImg ? (
              <img
                src={`http://localhost:8080${member.profileImg}`}
                alt="프로필"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-orange-600" />
            )}
          </div>
        </label>

        <div>
          <h1 className="text-3xl font-bold">내 정보</h1>
          <p className="text-gray-500 mt-1">
            회원가입 시 입력한 정보와 프로필 정보를 수정할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-sm text-gray-500 mb-1">아이디</p>
          <div className="border rounded-2xl px-4 py-3 bg-gray-50">
            {member.id}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">닉네임</p>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full border rounded-2xl px-4 py-3"
          />
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">생년월일</p>
          <div className="border rounded-2xl px-4 py-3 bg-gray-50">
            {member.birthDate || "등록된 생년월일이 없습니다."}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">성별</p>
          <div className="border rounded-2xl px-4 py-3 bg-gray-50">
            {member.gender || "등록된 성별이 없습니다."}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">소개글</p>
          <textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={4}
            className="w-full border rounded-2xl px-4 py-3 resize-none"
            placeholder="자신을 소개해주세요."
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={() => navigate("/mypage")}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-300"
        >
          돌아가기
        </button>

        <button
          onClick={handleSave}
          className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-orange-700"
        >
          저장
        </button>
      </div>
    </div>
  );
}
