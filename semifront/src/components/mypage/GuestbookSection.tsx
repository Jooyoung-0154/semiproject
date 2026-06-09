import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Guestbook, Member } from "../../types/type";
import { guestbookService } from "../../service/guestbookService";
import { formatDateTime } from "../../utils/dateFormatter";

interface GuestbookSectionProps {
  displayUser: Member;
  currentUserId: string;
  authUser: Member | null;
}

export default function GuestbookSection({ displayUser, currentUserId, authUser }: GuestbookSectionProps) {
  const [guestbookMessages, setGuestbookMessages] = useState<Guestbook[]>([]);
  const [newGuestbook, setNewGuestbook] = useState("");
  const [editingGuestbookId, setEditingGuestbookId] = useState<number | null>(null);
  const [editedGuestbookText, setEditedGuestbookText] = useState("");

  useEffect(() => {
    fetchGuestbookMessages();
  }, [displayUser.id]);

  const fetchGuestbookMessages = async () => {
    if (!displayUser.id) return;
    try {
      const response = await guestbookService.getList(displayUser.id);
      const messages = response.data?.list ?? response.data ?? [];
      setGuestbookMessages(Array.isArray(messages) ? messages : []);
    } catch (error) {
      console.error("방명록 불러오기 실패:", error);
    }
  };

  const handleGuestbookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newGuestbook.trim();
    const hostId = displayUser.id ?? "";
    const writerId = currentUserId;
    if (!content || !writerId || !hostId) return;

    try {
      const payload: Guestbook = {
        guestbookId: 0,
        hostId,
        writerId,
        writerNickname: authUser?.nickname,
        content,
        regDate: new Date().toISOString(),
      };
      const response = await guestbookService.write(payload);
      const created = response.data?.data ?? response.data ?? null;
      if (created && typeof created === "object") {
        await fetchGuestbookMessages();
      } else {
        setGuestbookMessages(prev => [payload, ...prev]);
      }
      setNewGuestbook("");
    } catch (error) {
      console.error("방명록 작성 실패:", error);
      alert("방명록 작성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleGuestbookEditInit = (msg: Guestbook) => {
    setEditingGuestbookId(msg.guestbookId);
    setEditedGuestbookText(msg.content ?? "");
  };

  const handleGuestbookCancelEdit = () => {
    setEditingGuestbookId(null);
    setEditedGuestbookText("");
  };

  const handleGuestbookSave = async (msg: Guestbook) => {
    const content = editedGuestbookText.trim();
    if (!content) return;
    try {
      await guestbookService.modify({ ...msg, content });
      await fetchGuestbookMessages();
      setEditingGuestbookId(null);
      setEditedGuestbookText("");
    } catch (error) {
      console.error("방명록 수정 실패:", error);
      alert("방명록 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleGuestbookDelete = async (msg: Guestbook) => {
    if (!currentUserId || !displayUser.id) return;
    if (!window.confirm("정말 이 방명록을 삭제하시겠습니까?")) return;
    try {
      await guestbookService.remove(msg.guestbookId, currentUserId, msg.writerId, displayUser.id);
      await fetchGuestbookMessages();
    } catch (error) {
      console.error("방명록 삭제 실패:", error);
      alert("방명록 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="guestbook-container">
      <div className="section-title-wrap">
        <MessageSquare className="title-icon" />
        <h3 className="section-title">방명록</h3>
      </div>

      <form onSubmit={handleGuestbookSubmit} className="guestbook-form">
        <textarea
          value={newGuestbook}
          onChange={(e) => setNewGuestbook(e.target.value)}
          placeholder="방명록을 남겨주세요..."
          className="guestbook-textarea"
          rows={3}
        />
        <button type="submit" className="btn-submit">작성하기</button>
      </form>

      <div className="guestbook-list">
        {guestbookMessages.length > 0 ? (
          guestbookMessages.map((msg) => (
            <div key={msg.guestbookId} className="guestbook-item">
              <div className="guestbook-item-header">
                <div>
                  <span className="guestbook-author">{msg.writerNickname?.trim() || msg.writerId}</span>
                  <span className="guestbook-date">{formatDateTime(msg.regDate)}</span>
                </div>
                {msg.writerId === currentUserId && (
                  <div className="guestbook-actions">
                    <button
                      type="button"
                      onClick={() => handleGuestbookEditInit(msg)}
                      className="guestbook-action-btn guestbook-action-edit"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGuestbookDelete(msg)}
                      className="guestbook-action-btn guestbook-action-delete"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>

              {editingGuestbookId === msg.guestbookId ? (
                <div className="guestbook-edit-panel">
                  <textarea
                    value={editedGuestbookText}
                    onChange={(e) => setEditedGuestbookText(e.target.value)}
                    className="guestbook-edit-textarea"
                    rows={3}
                  />
                  <div className="guestbook-edit-actions">
                    <button type="button" onClick={() => handleGuestbookSave(msg)} className="guestbook-action-btn guestbook-action-save">저장</button>
                    <button type="button" onClick={handleGuestbookCancelEdit} className="guestbook-action-btn guestbook-action-cancel">취소</button>
                  </div>
                </div>
              ) : (
                <p className="guestbook-message">{msg.content}</p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">작성된 방명록이 없습니다.</div>
        )}
      </div>
    </div>
  );
}
