# 스크랩 레시피 공개 설정 기능 설계

## 개요

마이페이지 스크랩 레시피 탭에 "남에게 보이기" ON/OFF 토글을 추가한다.
본인 페이지에서만 토글이 보이고, 타인 방문 시에는 설정값에 따라 탭이 노출/숨김 처리된다.

---

## 요구사항

- `isOwnPage` && `activeTab === "liked"` 일 때 tabs-header 오른쪽에 토글 버튼 표시
- 스크랩 탭 노출 조건: `isOwnPage || scrapPublic`
- 숨김 조건: `!isOwnPage && !scrapPublic` → 탭 버튼 자체를 숨기고, 해당 탭이 활성 중이면 `"recipes"`로 자동 전환
- 기본값: 공개 (true)
- 설정은 백엔드 DB에 영구 저장 (다른 사람이 방문했을 때도 올바르게 반영)

---

## 아키텍처

### DB

```sql
ALTER TABLE member ADD COLUMN SCRAP_PUBLIC TINYINT(1) NOT NULL DEFAULT 1;
```

### 백엔드

**Member.java**
- `private boolean scrapPublic;` 필드 추가
- getter/setter 추가

**sql-Member.xml**
- `selectMemberById`: `SCRAP_PUBLIC as scrapPublic` 컬럼 추가
- `updateScrapPublic` 쿼리 추가:
  ```xml
  <update id="updateScrapPublic">
      UPDATE member SET SCRAP_PUBLIC = #{scrapPublic} WHERE ID = #{id}
  </update>
  ```

**MemberMapper.java**
- `int updateScrapPublic(@Param("id") String id, @Param("scrapPublic") boolean scrapPublic);`

**MemberService.java**
- `public boolean updateScrapPublic(String id, boolean scrapPublic)`

**MemberController.java**
- `PUT /api/member/{id}/scrap-public?scrapPublic=true|false`
- 기존 `updateIntro` 엔드포인트 패턴과 동일

### 프론트엔드

**type.ts**
- `Member` 인터페이스에 `scrapPublic?: boolean` 추가

**AuthContext.tsx**
- `normalizeMember` 함수에 `scrapPublic: raw.scrapPublic ?? true` 추가

**memberService.ts**
- `updateScrapPublic: (id: string, scrapPublic: boolean) => api.put(...)` 추가

**MyPage.tsx**
- `scrapPublic` 로컬 상태: `displayUser.scrapPublic ?? true` 로 초기화
- 탭 버튼 조건부 렌더:
  ```tsx
  {(isOwnPage || scrapPublic) && (
    <button onClick={() => setActiveTab("liked")} ...>스크랩 레시피</button>
  )}
  ```
- 토글 버튼 (tabs-header 오른쪽):
  ```tsx
  {isOwnPage && activeTab === "liked" && (
    <button onClick={handleToggleScrapPublic}>
      남에게 보이기 {scrapPublic ? "ON" : "OFF"}
    </button>
  )}
  ```
- `useEffect`: `!isOwnPage && !scrapPublic && activeTab === "liked"` 일 때 `setActiveTab("recipes")`
- `handleToggleScrapPublic`: 즉시 로컬 상태 업데이트 후 API 호출, 실패 시 롤백

---

## 데이터 흐름

```
[본인] 토글 클릭
  → setScrapPublic(!scrapPublic)  (낙관적 업데이트)
  → PUT /api/member/{id}/scrap-public
  → 실패 시 setScrapPublic(scrapPublic)  (롤백)

[타인 방문]
  → GET /api/member/{id}  (scrapPublic 포함)
  → scrapPublic === false → 탭 버튼 숨김
  → scrapPublic === true  → 탭 버튼 보임
```

---

## 변경 파일 목록

| 레이어 | 파일 |
|--------|------|
| DB | `member` 테이블 DDL |
| 백엔드 | `Member.java` |
| 백엔드 | `sql-Member.xml` |
| 백엔드 | `MemberMapper.java` |
| 백엔드 | `MemberService.java` |
| 백엔드 | `MemberController.java` |
| 프론트 | `semifront/src/types/type.ts` |
| 프론트 | `semifront/src/context/AuthContext.tsx` |
| 프론트 | `semifront/src/service/memberService.ts` |
| 프론트 | `semifront/src/components/MyPage.tsx` |
