import { useState, useEffect, useRef } from 'react';
import { MemberBgImage } from '../types/type';
import { memberBgImageService } from '../service/memberBgImageService';
import { IMG_BASE_URL } from '../config/api';

interface Props {
  memberId: string;
}

export default function ProfileBgSlideshow({ memberId }: Props) {
  const [images, setImages] = useState<MemberBgImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchImages = async () => {
    try {
      const res = await memberBgImageService.getBgImages(memberId);
      setImages(res.data);
      setCurrentIndex(0);
    } catch {
      setImages([]);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [memberId]);

  const count = images.length;

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (count <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % count);
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [count]);

  if (count === 0) return null;

  const prevIndex = (currentIndex - 1 + count) % count;
  const nextIndex = (currentIndex + 1) % count;
  const prevImg = images[prevIndex];
  const nextImg = images[nextIndex];

  return (
    <section className="profile-bg-section">

      {/* 왼쪽 슬롯: 이전 이미지의 오른쪽 절반 */}
      {count > 1 && (
        <div
          className="profile-bg-slot profile-bg-slot--prev"
          style={{ backgroundImage: `url(${IMG_BASE_URL}/${prevImg.imgUrl})` }}
          onClick={() => setCurrentIndex(prevIndex)}
        />
      )}

      {/* 메인 슬롯: 현재 이미지 페이드 */}
      <div className={`profile-bg-slot profile-bg-slot--main${count === 1 ? ' solo' : ''}`}>
        {images.map((img, i) => (
          <div
            key={img.bgImgId}
            className={`profile-bg-slide${i === currentIndex ? ' active' : ''}`}
            style={{ backgroundImage: `url(${IMG_BASE_URL}/${img.imgUrl})` }}
          />
        ))}
        {count > 1 && (
          <div className="profile-bg-dots">
            {images.map((img, i) => (
              <span
                key={img.bgImgId}
                className={`profile-bg-dot${i === currentIndex ? ' active' : ''}`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 오른쪽 슬롯: 다음 이미지의 왼쪽 절반 */}
      {count > 1 && (
        <div
          className="profile-bg-slot profile-bg-slot--next"
          style={{ backgroundImage: `url(${IMG_BASE_URL}/${nextImg.imgUrl})` }}
          onClick={() => setCurrentIndex(nextIndex)}
        />
      )}

    </section>
  );
}
