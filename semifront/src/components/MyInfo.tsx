import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth, normalizeMember } from "../context/AuthContext.tsx";
import { memberService } from "../service/memberService.ts";
import { memberBgImageService } from "../service/memberBgImageService.ts";
import type { Member } from "../types/type.ts";
import { IMG_BASE_URL } from "../config/api";

export default function MyInfo() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();

  const [member, setMember] = useState<Member | null>(authUser);
  const [loading, setLoading] = useState(true);

  const [nickname, setNickname] = useState("");
  const [intro, setIntro] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [snsYoutube, setSnsYoutube] = useState("");
  const [snsInstagram, setSnsInstagram] = useState("");
  const [snsFacebook, setSnsFacebook] = useState("");
  const [showBgModal, setShowBgModal] = useState(false);
  const [bgImages, setBgImages] = useState<import("../types/type").MemberBgImage[]>([]);

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
          setSnsYoutube(normalized.snsYoutube ?? "");
          setSnsInstagram(normalized.snsInstagram ?? "");
          setSnsFacebook(normalized.snsFacebook ?? "");
        }

        // 배경 이미지는 모달 열릴 때 별도 로드
      } catch (error) {
        console.error("내 정보 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyInfo();
  }, [authUser?.id]);

  useEffect(() => {
    if (!showBgModal || !authUser?.id) return;
    memberBgImageService.getBgImages(authUser.id)
      .then(res => setBgImages(res.data))
      .catch(() => setBgImages([]));
  }, [showBgModal]);

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

      await memberService.updateSnsSocial(
        authUser.id,
        snsYoutube.trim(),
        snsInstagram.trim(),
        snsFacebook.trim()
      );

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

        sessionStorage.setItem("authUser", JSON.stringify(refreshed));
      }
    } catch (error) {
      console.error("회원정보 수정 실패:", error);
      alert("회원정보 수정 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteMember = () => {
    const firstConfirm = window.confirm(
      "정말 회원 탈퇴를 진행하시겠습니까?\n탈퇴 후에는 이 계정으로 다시 로그인할 수 없습니다.",
    );

    if (!firstConfirm) return;

    // 2차 확인 모달 열기
    setShowDeleteModal(true);
  };

  const confirmDeleteMember = async () => {
    if (!authUser?.id) return;

    if (deleteText !== "회원탈퇴") {
      alert("'회원탈퇴'를 정확히 입력해주세요.");
      return;
    }

    try {
      await memberService.deleteMember(authUser.id);

      alert("회원 탈퇴가 완료되었습니다.");

      logout();
      navigate("/login");
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
      alert("회원 탈퇴 중 오류가 발생했습니다.");
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
                src={`${IMG_BASE_URL}/${member.profileImg}`}
                alt="프로필"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-orange-500" />
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

        <div>
          <p className="text-sm text-gray-500 mb-2">SNS 링크</p>
          <div className="flex flex-col gap-2">
            {[
              { label: "YouTube", value: snsYoutube, setter: setSnsYoutube, placeholder: "https://youtube.com/@채널명" },
              { label: "Instagram", value: snsInstagram, setter: setSnsInstagram, placeholder: "https://instagram.com/계정명" },
              { label: "Facebook", value: snsFacebook, setter: setSnsFacebook, placeholder: "https://facebook.com/계정명" },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-20 shrink-0">{label}</span>
                <input
                  type="url"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 border rounded-xl px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center gap-3">
        <button
          onClick={() => setShowBgModal(true)}
          className="flex items-center gap-2 bg-gray-100 text-gray-600 px-5 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition text-sm"
        >
          🖼️ 배경 이미지 관리
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/mypage")}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-300"
          >
            돌아가기
          </button>
          <button
            onClick={handleSave}
            className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-orange-700"
          >
            저장
          </button>
        </div>
      </div>

      {showBgModal && (
        <div className="modal-overlay" onClick={() => setShowBgModal(false)}>
          <div className="modal-content bg-modal-wide" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">배경 이미지 관리</h2>

            <div className="bg-manage-list">
              {bgImages.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  등록된 배경 이미지가 없습니다.
                </p>
              )}
              {bgImages.map((img, i) => (
                <div key={img.bgImgId} className="bg-manage-item-v2">
                  <div className="bg-sort-col">
                    <button
                      onClick={async () => {
                        if (i === 0) return;
                        try {
                          const reordered = [...bgImages];
                          [reordered[i - 1], reordered[i]] = [reordered[i], reordered[i - 1]];
                          const updated = reordered.map((it, idx) => ({ ...it, sortOrder: idx + 1 }));
                          await memberBgImageService.updateSortOrders(updated);
                          setBgImages(updated);
                        } catch (e) {
                          console.error(e);
                          alert('순서 변경에 실패했습니다.');
                        }
                      }}
                      disabled={i === 0}
                    >▲</button>
                    <span>{i + 1}</span>
                    <button
                      onClick={async () => {
                        if (i === bgImages.length - 1) return;
                        try {
                          const reordered = [...bgImages];
                          [reordered[i], reordered[i + 1]] = [reordered[i + 1], reordered[i]];
                          const updated = reordered.map((it, idx) => ({ ...it, sortOrder: idx + 1 }));
                          await memberBgImageService.updateSortOrders(updated);
                          setBgImages(updated);
                        } catch (e) {
                          console.error(e);
                          alert('순서 변경에 실패했습니다.');
                        }
                      }}
                      disabled={i === bgImages.length - 1}
                    >▼</button>
                  </div>

                  <div className="bg-manage-body">
                    <div className="bg-preview-row">
                      <div
                        className="bg-preview-box"
                        style={{
                          backgroundImage: `url(${IMG_BASE_URL}/${img.imgUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                      <button
                        className="bg-delete-btn-v2"
                        onClick={async () => {
                          try {
                            await memberBgImageService.deleteBgImage(img.bgImgId);
                            setBgImages(prev => prev.filter(it => it.bgImgId !== img.bgImgId));
                          } catch {
                            alert('삭제에 실패했습니다.');
                          }
                        }}
                      >삭제</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-modal-footer">
              {bgImages.length >= 10 ? (
                <span className="bg-upload-label" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  + 이미지 추가 (최대 10장)
                </span>
              ) : (
                <label className="bg-upload-label cursor-pointer">
                  + 이미지 추가 ({bgImages.length}/10)
                  <input
                    type="file" accept="image/*" className="file-input"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file || !authUser?.id) return;
                      if (bgImages.length >= 10) {
                        alert('배경 이미지는 최대 10장까지 등록할 수 있습니다.');
                        e.target.value = '';
                        return;
                      }
                      try {
                        await memberBgImageService.uploadBgImage(authUser.id, file, bgImages.length + 1);
                        const res = await memberBgImageService.getBgImages(authUser.id);
                        setBgImages(res.data);
                      } catch {
                        alert('업로드에 실패했습니다.');
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              <button className="btn-modal-cancel" onClick={() => setShowBgModal(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-10 pt-6 border-t">
        <h2 className="text-lg font-bold text-red-600">회원 탈퇴</h2>
        <p className="text-sm text-gray-500 mt-2">
          탈퇴 시 계정이 비활성화되며, 같은 계정으로 다시 로그인할 수 없습니다.
        </p>

        <button
          onClick={handleDeleteMember}
          className="mt-4 px-5 py-2 rounded-2xl border border-red-300 text-red-600 font-semibold hover:bg-red-50"
        >
          회원 탈퇴
        </button>
      </div>
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title text-red-600">회원 탈퇴 확인</h2>

            <p className="text-sm text-gray-500 mt-2">
              탈퇴를 계속하려면 아래 입력창에 <b>'회원탈퇴'</b>를 입력해주세요.
            </p>

            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="회원탈퇴 입력"
              className="modal-input mt-4"
            />

            <div className="modal-actions">
              <button
                onClick={confirmDeleteMember}
                disabled={deleteText !== "회원탈퇴"}
                className="btn-modal-charge"
              >
                회원 탈퇴
              </button>

              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteText("");
                }}
                className="btn-modal-cancel"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
