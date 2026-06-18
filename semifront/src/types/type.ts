//멤버
export interface Member {
  id: string;
  password?: string; // 보안상 선택 사항(?) 표시
  birthDate?: string;
  gender?: string;
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
  scrapPublic?: boolean; // 스크랩 레시피 공개 여부
  snsYoutube?: string;
  snsInstagram?: string;
  snsFacebook?: string;
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
  postId: string;
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
  postId: string;
  writerId: string;
  content: string;
  postImg: string;
  regDate: string;
  likeCount: number;
  liked?: boolean;
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
  hit?: number; // 조회수
  writerId?: string; // 작성자 ID
  writerNickname?: string; // 작성자 닉네임
  writerProfileImg?: string; // 작성자 프로필 이미지
  tags?: Tag[]; // 태그 목록 (조회 시 서버에서 채워줌)
  likeCount?: number; // 좋아요 수
  liked?: boolean;   // 현재 유저 좋아요 여부
  videoUrl?: string; // YouTube 영상 링크
  createdAt?: string; // 등록일시
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

/* 리뷰 이미지 */
export interface ReviewImage {
  imageId: number;
  reviewId: string;
  imageUrl: string;
}

/* 레시피 리뷰*/
export interface Review {
  reviewId: string; // 리뷰 ID
  recipeCode: string; // 레시피 코드
  id: string; // 작성자 ID
  reviewContent: string; // 리뷰 내용
  thumbsUp: boolean; // 추천 여부 (Java의 boolean 대응)
  regDate: string; // 등록일
}


/* 멤버 프로필 배경 이미지 */
export interface MemberBgImage {
  bgImgId: number;
  memberId: string;
  imgUrl: string;
  sortOrder: number;
}

export interface Notification {
  notiId: number;
  receiverId: string;
  senderId: string;
  type: string;
  targetId?: string;
  message: string;
  isRead: boolean;
  regDate: string;
}
