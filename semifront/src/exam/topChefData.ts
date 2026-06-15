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
      // { id: "멤버ID", specialty: "김치찌개" },
    ],
  },
  {
    id: "western",
    label: "양식",
    chefs: [
      // { id: "멤버ID", specialty: "파스타" },
    ],
  },
  {
    id: "asian",
    label: "아시안",
    chefs: [
      // { id: "멤버ID", specialty: "초밥" },
    ],
  },
  {
    id: "chinese",
    label: "중식",
    chefs: [
      { id: "Jooyoung1", specialty: ["중식"] },
    ],
  },
];
