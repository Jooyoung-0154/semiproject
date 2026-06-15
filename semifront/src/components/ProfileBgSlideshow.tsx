import { useState, useEffect, useRef } from 'react';
import { MemberBgImage } from '../types/type';
import { memberBgImageService } from '../service/memberBgImageService';
import { API_BASE_URL } from '../config/api';

interface Props {
  memberId: string;
}

export default function ProfileBgSlideshow({ memberId }: Props) {
  const [images, setImages] = useState<MemberBgImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchImages();
  }, [memberId]);

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

  if (images.length === 0) return null;

  return (
    <section className="profile-bg-section">
      {images.map((img, i) => (
        <div
          key={img.bgImgId}
          className={`profile-bg-slide ${i === currentIndex ? 'active' : ''}`}
          style={{
            backgroundImage: `url(${API_BASE_URL}/${img.imgUrl})`,
            backgroundPosition: `${img.posX ?? 50}% ${img.posY ?? 50}%`,
            backgroundSize: `${img.bgSize ?? 120}%`,
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#e5e7eb',
          }}
        />
      ))}
      <div className="profile-bg-overlay" />
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
    </section>
  );
}
