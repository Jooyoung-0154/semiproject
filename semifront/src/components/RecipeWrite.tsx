import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Upload, Plus, X, Tag as TagIcon } from "lucide-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Recipe, Recipe_Info, Cooking_Info, Irdnt_Info, Tag } from "../types/type";
import { useAuth } from "../context/AuthContext";
import { tagService } from "../service/tagService";

export default function RecipeWrite() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 1. 기본 정보
  const [recipeInfo, setRecipeInfo] = useState<Recipe_Info>({
    recipeId: "",
    recipeNmKo: "",
    sumry: "",
    nationCode: "3020001",
    nationNm: "한식",
    tyCode: "",
    tyNm: "한식",
    cookingTime: "30",
    calorie: "0",
    qnt: "2인분",
    levelNm: "중",
    irdntCode: "",
    pcNm: "0",
  });

  // 2. 재료
  const [irdntInfo, setIrdntInfo] = useState<Irdnt_Info[]>([
    { recipeId: "", irdntSn: 1, irdntNm: "", irdntCpcty: "", irdntTyCode: "", irdntTyNm: "" },
  ]);

  // 3. 조리 과정
  const [cookingInfo, setCookingInfo] = useState<Cooking_Info[]>([
    { recipeId: "", cookingNo: 1, cookingDc: "", stepTip: "", stepImgUrl: "", imgType: "" },
  ]);

  // 4. 이미지 파일 state
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string>("");
  const [stepImages, setStepImages] = useState<(File | null)[]>([null]);
  const [stepPreviews, setStepPreviews] = useState<string[]>([""]);

  // 5. 태그
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 태그 목록 로드
  useEffect(() => {
    tagService.getAllTags().then((res) => setAllTags(res.data)).catch(() => setAllTags([]));
  }, []);

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // --- 재료 추가/삭제 ---
  const addIngredient = () => {
    setIrdntInfo([
      ...irdntInfo,
      { recipeId: "", irdntSn: 0, irdntNm: "", irdntCpcty: "", irdntTyCode: "", irdntTyNm: "" },
    ]);
  };

  const removeIngredient = (index: number) => {
    if (irdntInfo.length > 1) setIrdntInfo(irdntInfo.filter((_, i) => i !== index));
  };

  // --- 조리 과정 추가/삭제 ---
  const addStep = () => {
    setCookingInfo([
      ...cookingInfo,
      { recipeId: "", cookingNo: cookingInfo.length + 1, cookingDc: "", stepTip: "", stepImgUrl: "", imgType: "" },
    ]);
    setStepImages([...stepImages, null]);
    setStepPreviews([...stepPreviews, ""]);
  };

  const removeStep = (index: number) => {
    if (cookingInfo.length > 1) {
      const filtered = cookingInfo.filter((_, i) => i !== index);
      const updated = filtered.map((step, i) => ({ ...step, cookingNo: i + 1 }));
      setCookingInfo(updated);
      setStepImages(stepImages.filter((_, i) => i !== index));
      setStepPreviews(stepPreviews.filter((_, i) => i !== index));
    }
  };

  // --- 대표 이미지 ---
  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImage(file);
      setMainPreview(URL.createObjectURL(file));
    }
  };

  // --- 단계별 이미지 ---
  const handleStepImageChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newImages = [...stepImages];
      newImages[index] = file;
      setStepImages(newImages);

      const newPreviews = [...stepPreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setStepPreviews(newPreviews);
    }
  };

  // --- 최종 제출 ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. 단계별 이미지 먼저 업로드 → stepImgUrl 채우기
      const updatedCookingInfo = [...cookingInfo];
      for (let i = 0; i < stepImages.length; i++) {
        if (stepImages[i]) {
          const formData = new FormData();
          formData.append("file", stepImages[i]!);
          const res = await api.post("/recipe-images/step-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          updatedCookingInfo[i] = {
            ...updatedCookingInfo[i],
            stepImgUrl: res.data,
            imgType: "S",
          };
        }
      }

      // 2. 레시피 전체 데이터 저장
      const fullRecipeData: Partial<Recipe> & { writerId?: string } = {
        recipeInfo: {
          ...recipeInfo, cookingTime: `${recipeInfo.cookingTime}분`
    },
        irdntInfo: irdntInfo,
        cookingInfo: updatedCookingInfo,
        price: Number(recipeInfo.pcNm) || 0,
        writerId: user?.id ?? "",
        tags: selectedTagIds.map((id) => ({ tagId: id, tagName: "" })),
      };

      const response = await api.post("/recipe/register", fullRecipeData);
      const recipeCode = response.data;

      // 3. 대표 이미지 업로드
      if (mainImage && recipeCode) {
        const formData = new FormData();
        formData.append("files", mainImage);
        await api.post(`/recipe-images/${recipeCode}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert("레시피가 성공적으로 등록되었습니다!");
      navigate("/");
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-8 text-orange-600">레시피 등록하기</h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── 기본 정보 ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">기본 정보</h2>

            <div>
              <label className="block font-medium mb-1">레시피 제목 *</label>
              <input
                type="text"
                value={recipeInfo.recipeNmKo}
                onChange={(e) => setRecipeInfo({ ...recipeInfo, recipeNmKo: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="레시피 이름을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">요리 설명</label>
              <textarea
                value={recipeInfo.sumry}
                onChange={(e) => setRecipeInfo({ ...recipeInfo, sumry: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg h-24 resize-none"
                placeholder="레시피를 간단히 소개해주세요"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">소요 시간 (분) *</label>
                <input
                  type="number"
                  min="1"
                  value={recipeInfo.cookingTime}
                  onChange={(e) => setRecipeInfo({ ...recipeInfo, cookingTime: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="예: 30"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">난이도 *</label>
                <select
                  value={recipeInfo.levelNm}
                  onChange={(e) => setRecipeInfo({ ...recipeInfo, levelNm: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="상">상</option>
                  <option value="중">중</option>
                  <option value="하">하</option>
                </select>
              </div>
            </div>
          </section>

          {/* ── 대표 이미지 ── */}
          <section>
            <h2 className="text-xl font-semibold border-b pb-2 mb-3">대표 이미지</h2>
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden relative">
              {mainPreview ? (
                <>
                  <img src={mainPreview} alt="대표 이미지" className="h-full w-full object-cover" />
                  <span className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    클릭하여 변경 
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="text-sm text-gray-500">클릭하여 대표 이미지 선택</p>
                </div>
              )}
              <input type="file" className="hidden" onChange={handleMainImageChange} accept="image/*" />
            </label>
          </section>

          {/* ── 재료 ── */}
          <section className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-semibold">재료</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="text-orange-600 flex items-center gap-1 text-sm font-bold hover:text-orange-700"
              >
                <Plus className="w-4 h-4" /> 재료 추가
              </button>
            </div>

            {irdntInfo.map((irdnt, index) => (
              <div key={index} className="flex gap-2 items-center">
                <span className="text-gray-400 text-sm w-5 text-right flex-shrink-0">{index + 1}</span>
                <input
                  placeholder="재료명 (예: 돼지고기)"
                  value={irdnt.irdntNm}
                  onChange={(e) => {
                    const newArr = [...irdntInfo];
                    newArr[index] = { ...newArr[index], irdntNm: e.target.value };
                    setIrdntInfo(newArr);
                  }}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
                <input
                  placeholder="분량 (예: 300g)"
                  value={irdnt.irdntCpcty}
                  onChange={(e) => {
                    const newArr = [...irdntInfo];
                    newArr[index] = { ...newArr[index], irdntCpcty: e.target.value };
                    setIrdntInfo(newArr);
                  }}
                  className="w-1/3 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="text-gray-400 hover:text-red-500 flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </section>

          {/* ── 조리 순서 ── */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-semibold">조리 순서</h2>
              <button
                type="button"
                onClick={addStep}
                className="text-orange-600 flex items-center gap-1 text-sm font-bold hover:text-orange-700"
              >
                <Plus className="w-4 h-4" /> 단계 추가
              </button>
            </div>

            {cookingInfo.map((step, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-orange-600 text-lg">Step {step.cookingNo}</span>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <textarea
                  placeholder="조리 설명을 입력하세요 *"
                  value={step.cookingDc}
                  onChange={(e) => {
                    const newArr = [...cookingInfo];
                    newArr[index] = { ...newArr[index], cookingDc: e.target.value };
                    setCookingInfo(newArr);
                  }}
                  className="w-full px-3 py-2 border rounded-md min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-orange-400"
                  required
                />

                <input
                  placeholder="꿀팁이 있다면 적어주세요 (선택)"
                  value={step.stepTip}
                  onChange={(e) => {
                    const newArr = [...cookingInfo];
                    newArr[index] = { ...newArr[index], stepTip: e.target.value };
                    setCookingInfo(newArr);
                  }}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                />

                {/* 단계 이미지 업로드 */}
                <div>
                  {stepPreviews[index] ? (
                    <div className="relative rounded-md overflow-hidden">
                      <img
                        src={stepPreviews[index]}
                        alt={`Step ${index + 1} 이미지`}
                        className="w-full max-h-48 object-cover"
                      />
                      <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 cursor-pointer transition-all group">
                        <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100">
                          클릭하여 변경
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleStepImageChange(e, index)}
                          accept="image/*"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 text-sm text-gray-500 border border-dashed border-gray-300 rounded-md px-4 py-3 hover:bg-gray-100 cursor-pointer w-full">
                      <Upload className="w-4 h-4" />
                      <span>과정 사진 추가 (선택)</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleStepImageChange(e, index)}
                        accept="image/*"
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* ── 태그 선택 ── */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold border-b pb-2 flex items-center gap-2">
              <TagIcon className="w-5 h-5 text-orange-500" />
              태그 선택
              {selectedTagIds.length > 0 && (
                <span className="ml-1 text-sm font-medium text-white bg-orange-500 rounded-full px-2 py-0.5">
                  {selectedTagIds.length}
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500">레시피에 해당하는 태그를 선택하세요 (복수 선택 가능)</p>

            {allTags.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">
                등록된 태그가 없습니다. 관리자 페이지에서 태그를 먼저 추가해주세요.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag.tagId}
                    type="button"
                    onClick={() => toggleTag(tag.tagId)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                      selectedTagIds.includes(tag.tagId)
                        ? "bg-orange-500 text-white border-orange-500 shadow"
                        : "bg-white text-gray-600 border-gray-300 hover:border-orange-400 hover:text-orange-500"
                    }`}
                  >
                    # {tag.tagName}
                  </button>
                ))}
              </div>
            )}

            {selectedTagIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-xs text-gray-400 self-center">선택됨:</span>
                {allTags
                  .filter((t) => selectedTagIds.includes(t.tagId))
                  .map((t) => (
                    <span
                      key={t.tagId}
                      className="flex items-center gap-1 px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold"
                    >
                      # {t.tagName}
                      <button
                        type="button"
                        onClick={() => toggleTag(t.tagId)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </section>

          {/* ── 버튼 ── */}
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "등록 중..." : "레시피 등록 완료"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 font-medium"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
