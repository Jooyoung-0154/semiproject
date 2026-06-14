import { useState, useEffect, useRef } from 'react';
import { MemberBgImage } from '../types/type';
import { memberBgImageService } from '../service/memberBgImageService';
import { API_BASE_URL } from '../config/api';

interface Props {
  memberId: string;
  isOwnPage: boolean;
  onHasBg: (hasBg: boolean) => void;
}

export default function ProfileBgSlideshow({ memberId, isOwnPage, onHasBg }: Props) {
  const [images, setImages] = useState<MemberBgImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchImages();
  }, [memberId]);

  useEffect(() => {
    onHasBg(images.length > 0);
  }, [images.length]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [images.length]);

  const fetchImages = async () => {
    try {
      const res = await memberBgImageService.getBgImages(memberId);
      setImages(res.data);
    } catch {
      setImages([]);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      await memberBgImageService.uploadBgImage(memberId, file, images.length + 1);
      await fetchImages();
    } catch {
      alert('업로드에 실패했습니다.');
    }
  };

  const handleDelete = async (bgImgId: number) => {
    try {
      await memberBgImageService.deleteBgImage(bgImgId);
      setCurrentIndex(0);
      await fetchImages();
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...images];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    const updated = reordered.map((img, i) => ({ ...img, sortOrder: i + 1 }));
    await memberBgImageService.updateSortOrders(updated);
    setImages(updated);
  };

  const handleMoveDown = async (index: number) => {
    if (index === images.length - 1) return;
    const reordered = [...images];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    const updated = reordered.map((img, i) => ({ ...img, sortOrder: i + 1 }));
    await memberBgImageService.updateSortOrders(updated);
    setImages(updated);
  };

  return (
    <>
      {images.length > 0 && (
        <div className="profile-bg-slideshow">
          {images.map((img, i) => (
            <div
              key={img.bgImgId}
              className={`profile-bg-slide ${i === currentIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${API_BASE_URL}/${img.imgUrl})` }}
            />
          ))}
          <div className="profile-bg-overlay" />
        </div>
      )}

      {images.length > 1 && (
        <div className="profile-bg-dots">
          {images.map((_, i) => (
            <span
              key={i}
              className={`profile-bg-dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      )}

      {isOwnPage && (
        <button className="profile-bg-manage-btn" onClick={() => setShowModal(true)}>
          배경 관리
        </button>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">배경 이미지 관리</h2>

            <div className="bg-manage-list">
              {images.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  등록된 배경 이미지가 없습니다.
                </p>
              )}
              {images.map((img, i) => (
                <div key={img.bgImgId} className="bg-manage-item">
                  <img
                    src={`${API_BASE_URL}/${img.imgUrl}`}
                    alt={`배경 ${i + 1}`}
                    className="bg-manage-thumb"
                  />
                  <div className="bg-manage-order-btns">
                    <button onClick={() => handleMoveUp(i)} disabled={i === 0}>▲</button>
                    <span>{i + 1}</span>
                    <button onClick={() => handleMoveDown(i)} disabled={i === images.length - 1}>▼</button>
                  </div>
                  <button
                    className="bg-manage-delete-btn"
                    onClick={() => handleDelete(img.bgImgId)}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>

            <label className="bg-upload-label">
              + 이미지 추가
              <input
                type="file"
                accept="image/*"
                className="file-input"
                onChange={async e => {
                  const file = e.target.files?.[0];
                  if (file) await handleUpload(file);
                  e.target.value = '';
                }}
              />
            </label>

            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowModal(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
