import api from '../api/axios';
import { MemberBgImage } from '../types/type';

export const memberBgImageService = {
  getBgImages: (memberId: string) =>
    api.get<MemberBgImage[]>(`/member-bg-images/${memberId}`),

  uploadBgImage: (memberId: string, file: File, sortOrder: number) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/member-bg-images/${memberId}/upload`, formData, {
      params: { sortOrder },
    });
  },

  deleteBgImage: (bgImgId: number) =>
    api.delete(`/member-bg-images/${bgImgId}`),

  updateSortOrders: (bgImages: MemberBgImage[]) =>
    api.put(`/member-bg-images/sort-order`, bgImages),
};
