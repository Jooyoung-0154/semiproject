//결제
export interface Purchase {
  purchaseId: number; // 결제 번호
  userId: string; // 구매자
  recipeCode: string; // 구매한 레시피
  purchasePrice: number; // ★ 결제 당시의 가격
  purchaseDate: string; // 구매 일시
}

//멤버
export interface Member {
  id: string;
  password?: string; // 보안상 선택 사항(?) 표시
  balance: number;
  nickname: string;
  profileImg: string;
  intro: string;
  followerIds: string[];
  followingIds: string[];
  myReviews: Review[]; // Review 타입이 따로 정의되어 있어야 함
  myPosts: Post[];
  followingCount: number; // 내가 팔로우하는 사람들의 수
  followerCount: number; // 나를 팔로우하는 사람들의 수
  recipeCount?: number; // 작성한 레시피 수
}

//충전
export interface Charge {
  chargeId: number; // 충전 번호
  userId: string; // 충전한 유저
  amount: number; // 충전 금액
  chargeMethod: string; // 충전 수단 (예: CARD, CASH, PAY)
  chargeDate: string; // 충전 일시
}

//방명록
export interface Guestbook {
  guestbookId: number;
  hostId: string;
  writerId: string;
  writerNickname?: string;
  content: string;
  regDate: string;
}

//과정정보
export interface Cooking_Info {
  recipeId: string;
  cookingNo: number;
  cookingDc: string;
  stepTip: string;
  stepImgUrl: string;
  imgType: string;
}

//재료정보
export interface Irdnt_Info {
  recipeId?: string;
  irdntSn?: number;      // DB: int
  irdntNm: string;
  irdntCpcty?: string;
  irdntTyCode?: string;
  irdntTyNm?: string;
}

//게시글 댓글
export interface PostComment {
  commentId: number;
  postId: number;
  writerId: string;
  content: string;
  regDate: string;
}

/* 팔로우 정보*/
export interface Follow {
  followerId: string; // 팔로우를 누른 사람
  followingId: string; // 팔로우를 당한 사람
}

/* 자유 게시글*/
export interface Post {
  postId: number;
  writerId: string;
  content: string;
  postImg: string;
  regDate: string;
  likeCount: number;
  comments: PostComment[]; // 댓글 목록
}

/* 레시피 이미지*/
export interface RECIPE_IMAGE {
  imgUrl: string;
  sortOrder: number;
  recipeCode: string;
}

//레시피 정보
export interface Recipe_Info {
  recipeId: string; // 레시피 ID (varchar UUID)
  recipeNmKo: string; // 레시피 명(한글)
  sumry: string; // 요약 설명
  nationCode: string; // 유형 코드
  nationNm: string; // 유형명 (한식, 일식 등)
  tyCode: string; // 음식 분류 코드
  tyNm: string; // 음식 분류명
  cookingTime: string; // 조리 시간
  calorie: string; // 칼로리
  qnt: string; // 분량
  levelNm: string; // 난이도
  irdntCode: string; // 재료 코드
  pcNm: string; // 가격대
  price?: number; // 가격 (조회 시 서버에서 채워짐)
  thumbImgUrl?: string; // 대표 이미지 URL (조회 시 서버에서 채워줌)
  writerId?: string; // 작성자 ID
  writerNickname?: string; // 작성자 닉네임
  tags?: Tag[]; // 태그 목록 (조회 시 서버에서 채워줌)
  likeCount?: number; // 좋아요 수
  liked?: boolean;   // 현재 유저 좋아요 여부
}

//레시피 객체
export interface Recipe {
  recipeCode: string; // 레시피 코드 (varchar UUID)
  recipeInfo: Recipe_Info; // 상세 정보 (위의 interface 사용)
  cookingInfo: Cooking_Info[]; // 조리 단계 목록
  irdntInfo: Irdnt_Info[]; // 재료 목록
  hit: number; // 조회수
  like: number; // 좋아요 수
  price: number; // 가격
  tags: Tag[]; // 태그 목록
}

//태그
export interface Tag {
  tagId: number; // 태그 ID
  tagName: string; // 태그 이름
}

// 레시피와 태그 매핑
export interface RecipeTag {
  recipeId: string; // 레시피 ID
  tagId: number; // 태그 ID
}

/* 장바구니 (쇼핑리스트)*/
export interface ShoppingList {
  cartId: number; // 장바구니 고유 번호
  userId: string; // 유저 ID
  recipeCode: string; // 담은 레시피 번호
  addDate: string; // 담은 날짜
}

/* 레시피 리뷰*/
export interface Review {
  reviewId: number; // 리뷰 ID
  recipeCode: string; // 레시피 코드
  id: string; // 작성자 ID
  reviewContent: string; // 리뷰 내용
  reviewHit: number; // 리뷰 조회수
  thumbsUp: boolean; // 추천 여부 (Java의 boolean 대응)
  regDate: string; // 등록일
}
