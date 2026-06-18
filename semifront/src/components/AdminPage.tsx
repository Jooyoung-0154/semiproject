import { useState, useEffect } from "react";
import { ShieldCheck, RefreshCw, Tag as TagIcon, Plus, Trash2, CheckCircle2, XCircle, UserPen } from "lucide-react";
import { adminService } from "../service/etcService";
import { tagService } from "../service/tagService";
import { Member, Tag } from "../types/type";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { memberService } from "../service/memberService";

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 관리자가 아니면 홈으로 리다이렉트
  useEffect(() => {
    if (!user || user.id !== "Admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // ── initBatch 상태
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // ── 태그 상태
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [tagLoading, setTagLoading] = useState(false);
  const [tagMsg, setTagMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  // ── 회원 검색/삭제 상태
  const [memberKeyword, setMemberKeyword] = useState("");
  const [memberResults, setMemberResults] = useState<Member[]>([]);
  const [memberSearching, setMemberSearching] = useState(false);
  const [memberMsg, setMemberMsg] = useState<{ ok: boolean; msg: string } | null>(null);

  // 태그 목록 로드
  const loadTags = () => {
    tagService
      .getAllTags()
      .then((res) => setTags(res.data))
      .catch(() => setTags([]));
  };

  useEffect(() => {
    loadTags();
  }, []);

  // ── initBatch 실행
  const handleBatch = async () => {
    if (!window.confirm("공공데이터 동기화를 실행하시겠습니까? 서버 부하가 클 수 있습니다.")) return;
    setBatchLoading(true);
    setBatchResult(null);
    try {
      const res = await adminService.startBatch();
      setBatchResult({ ok: true, msg: res.data || "동기화 요청이 전송되었습니다. 서버 로그를 확인하세요." });
    } catch {
      setBatchResult({ ok: false, msg: "동기화 중 오류가 발생했습니다." });
    } finally {
      setBatchLoading(false);
    }
  };

  // ── 태그 추가
  const handleAddTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    setTagLoading(true);
    setTagMsg(null);
    try {
      await tagService.createTag({ tagId: 0, tagName: name });
      setNewTagName("");
      setTagMsg({ ok: true, msg: `"${name}" 태그가 추가되었습니다.` });
      loadTags();
    } catch {
      setTagMsg({ ok: false, msg: "태그 추가 중 오류가 발생했습니다." });
    } finally {
      setTagLoading(false);
    }
  };

  // ── 태그 삭제
  const handleDeleteTag = async (tag: Tag) => {
    if (!window.confirm(`"${tag.tagName}" 태그를 삭제하시겠습니까?`)) return;
    try {
      await tagService.deleteTag(tag.tagId);
      setTagMsg({ ok: true, msg: `"${tag.tagName}" 태그가 삭제되었습니다.` });
      loadTags();
    } catch {
      setTagMsg({ ok: false, msg: "태그 삭제 중 오류가 발생했습니다." });
    }
  };
  // ── 회원 검색
  const handleSearchMember = async () => {
    const kw = memberKeyword.trim();
    if (!kw) return;
    setMemberSearching(true);
    setMemberMsg(null);
    try {
      const res = await memberService.searchMembers(kw);
      setMemberResults(res.data);
      if (res.data.length === 0) setMemberMsg({ ok: true, msg: "검색 결과가 없습니다." });
    } catch {
      setMemberMsg({ ok: false, msg: "회원 검색 중 오류가 발생했습니다." });
    } finally {
      setMemberSearching(false);
    }
  };

  // ── 회원 삭제
  const handleDeleteMember = async (member: Member) => {
    if (!window.confirm(`"${member.nickname}" (${member.id}) 회원을 삭제하시겠습니까?`)) return;
    try {
      await memberService.deleteMember(member.id);
      setMemberResults((prev) => prev.filter((m) => m.id !== member.id));
      setMemberMsg({ ok: true, msg: `"${member.nickname}" 회원이 삭제되었습니다.` });
    } catch {
      setMemberMsg({ ok: false, msg: "회원 삭제 중 오류가 발생했습니다." });
    }
  };

  if (!user || user.id !== "Admin") return null;

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-red-600" />
        <h1 className="text-3xl font-bold text-gray-800">관리자 페이지</h1>
      </div>

      {/* ── 공공데이터 동기화 ── */}
      <section className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">공공데이터 동기화 (initBatch)</h2>
        <p className="text-sm text-gray-500">
          외부 공공 레시피 데이터를 서버 DB로 동기화합니다. 시간이 다소 소요될 수 있습니다.
        </p>

        <button
          onClick={handleBatch}
          disabled={batchLoading}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-5 h-5 ${batchLoading ? "animate-spin" : ""}`} />
          {batchLoading ? "동기화 실행 중..." : "동기화 실행"}
        </button>

        {batchResult && (
          <div
            className={`flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-lg ${
              batchResult.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {batchResult.ok ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {batchResult.msg}
          </div>
        )}
      </section>

      {/* ── 태그 관리 ── */}
      <section className="bg-white rounded-2xl shadow-md p-6 space-y-5">
        <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-orange-500" />
          태그 관리
        </h2>

        {/* 태그 추가 입력 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            placeholder="새 태그 이름 (예: 다이어트, 간식, 야식)"
            className="flex-1 px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
          />
          <button
            onClick={handleAddTag}
            disabled={tagLoading || !newTagName.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>

        {tagMsg && (
          <div
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg ${
              tagMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {tagMsg.ok ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {tagMsg.msg}
          </div>
        )}

        {/* 태그 목록 */}
        {tags.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">등록된 태그가 없습니다.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag.tagId}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-sm font-medium text-orange-700"
              >
                <span>{tag.tagName}</span>
                <button
                  onClick={() => handleDeleteTag(tag)}
                  className="text-orange-400 hover:text-red-500 transition-colors ml-0.5"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* ── 회원 관리 ── */}
      <section className="bg-white rounded-2xl shadow-md p-6 space-y-5">
        <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
          <UserPen className="w-5 h-5 text-orange-500" />
          회원 관리
        </h2>

        {/* 검색 입력 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={memberKeyword}
            onChange={(e) => setMemberKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchMember()}
            placeholder="아이디 또는 닉네임으로 검색"
            className="flex-1 px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
          />
          <button
            onClick={handleSearchMember}
            disabled={memberSearching || !memberKeyword.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {memberSearching ? "검색 중..." : "검색"}
          </button>
        </div>

        {/* 메시지 */}
        {memberMsg && (
          <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg ${memberMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {memberMsg.ok ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
            {memberMsg.msg}
          </div>
        )}

        {/* 검색 결과 목록 */}
        {memberResults.length > 0 && (
          <div className="flex flex-col gap-2">
            {memberResults.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl"
              >
                <div
                  className="cursor-pointer hover:opacity-70 transition-opacity"
                  onClick={() => navigate(`/mypage/${m.id}`)}
                >
                  <span className="font-semibold text-gray-800 text-sm underline decoration-dotted">{m.nickname}</span>
                  <span className="ml-2 text-xs text-gray-400 underline decoration-dotted">({m.id})</span>
                </div>
                <button
                  onClick={() => handleDeleteMember(m)}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors font-medium"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
