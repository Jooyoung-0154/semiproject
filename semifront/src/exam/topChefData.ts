export interface ChefEntry {
  id: string;
  specialty: string[]; // 전문 분야 (여러 개 가능)
}

export interface ChefTab {
  id: string;
  label: string;
  chefs: ChefEntry[];
}

// 멤버 ID와 전문 분야를 직접 기입하세요
export const CHEF_TABS: ChefTab[] = [
  {
    id: "korean",
    label: "한식",
    chefs: [
      { id: "J02", specialty: ["제육볶음"] },
      { id: "mk2", specialty: ["정통 한식"] },
    ],
  },
  {
    id: "chinese",
    label: "중식",
    chefs: [
      { id: "Jooyoung1", specialty: ["중식", "동파육"] },
      { id: "J03", specialty: ["딤섬 여왕"] },
    ],
  },
  {
    id: "japanese",
    label: "일식",
    chefs: [
      { id: "Jooyoung2", specialty: ["조림"] },
      { id: "J01", specialty: ["스키야키"] },
    ],
  },
  {
    id: "western",
    label: "양식",
    chefs: [
      { id: "Jooyoung3", specialty: ["연어스테이크"] },
      { id: "mk3", specialty: ["창작", "퓨전"] },
      { id: "mk1", specialty: ["파인다이닝"] },
    ],
  },
];
