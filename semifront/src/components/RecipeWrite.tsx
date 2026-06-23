import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Upload, Plus, X, Tag as TagIcon, Sparkles } from "lucide-react";
import api from "../api/axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Recipe_Info, Cooking_Info, Irdnt_Info, Tag } from "../types/type";
import { useAuth } from "../context/AuthContext";
import { tagService } from "../service/tagService";
import RecipeService from "../service/recipeService";
import { IMG_BASE_URL } from "../config/api";
import askGemini from "../service/aiService";

export default function RecipeWrite() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const editRecipeId = searchParams.get("edit");
  const isEditMode = !!editRecipeId;

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
    qnt: "2",
    levelNm: "중",
    irdntCode: "",
    pcNm: "0",
  });

  // 2. 재료 (3섹션 분리)
  const [mainIngredients, setMainIngredients] = useState<Irdnt_Info[]>([
    {
      recipeId: "",
      irdntSn: 0,
      irdntNm: "",
      irdntCpcty: "",
      irdntTyCode: "",
      irdntTyNm: "재료",
    },
  ]);
  const [subIngredients, setSubIngredients] = useState<Irdnt_Info[]>([]);
  const [seasonings, setSeasonings] = useState<Irdnt_Info[]>([]);

  // 3. 조리 과정
  const [cookingInfo, setCookingInfo] = useState<Cooking_Info[]>([
    {
      recipeId: "",
      cookingNo: 1,
      cookingDc: "",
      stepTip: "",
      stepImgUrl: "",
      imgType: "",
    },
  ]);

  // 4. 이미지
  const [mainImages, setMainImages] = useState<File[]>([]);
  const [mainPreviews, setMainPreviews] = useState<string[]>([]);
  const [stepImages, setStepImages] = useState<(File | null)[]>([null]);
  const [stepPreviews, setStepPreviews] = useState<string[]>([""]);

  // 5. 태그
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const [videoUrl, setVideoUrl] = useState<string>("");
  const [useAi, setUseAi] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(isEditMode);
  const [existingMainImgUrls, setExistingMainImgUrls] = useState<string[]>([]);
  const [existingStepImgUrls, setExistingStepImgUrls] = useState<string[]>([
    "",
  ]);


  useEffect(() => {
    tagService
      .getAllTags()
      .then((res) => setAllTags(res.data))
      .catch(() => setAllTags([]));
  }, []);

  useEffect(() => {
    if (!editRecipeId) return;
    setIsLoadingEdit(true);
    RecipeService.getById(editRecipeId)
      .then(async (recipe) => {
        const info = recipe.recipeInfo;
        setRecipeInfo({
          ...info,
          cookingTime: info.cookingTime.replace("분", ""),
          qnt: info.qnt.replace("인분", ""),
          pcNm: String(recipe.price ?? 0),
        });
        setVideoUrl(info.videoUrl ?? "");

        const main = recipe.irdntInfo.filter((i) => i.irdntTyNm === "재료");
        const sub = recipe.irdntInfo.filter((i) => i.irdntTyNm === "부재료");
        const season = recipe.irdntInfo.filter((i) => i.irdntTyNm === "양념");
        setMainIngredients(
          main.length > 0
            ? main
            : [
                {
                  recipeId: "",
                  irdntSn: 0,
                  irdntNm: "",
                  irdntCpcty: "",
                  irdntTyCode: "",
                  irdntTyNm: "재료",
                },
              ],
        );
        setSubIngredients(sub);
        setSeasonings(season);

        const steps =
          recipe.cookingInfo.length > 0
            ? recipe.cookingInfo
            : [
                {
                  recipeId: "",
                  cookingNo: 1,
                  cookingDc: "",
                  stepTip: "",
                  stepImgUrl: "",
                  imgType: "",
                },
              ];
        setCookingInfo(steps);
        setStepImages(steps.map(() => null));
        setStepPreviews(steps.map(() => ""));
        setExistingStepImgUrls(steps.map((s) => s.stepImgUrl || ""));

        setSelectedTagIds(recipe.tags.map((t) => t.tagId));

        const imagesRes = await api.get(`/recipe-images/${editRecipeId}`);
        console.log("recipe-images 응답:", imagesRes.data);
        const imgUrls: string[] = (imagesRes.data ?? []).map((img: import("../types/type").RECIPE_IMAGE) => img.imgUrl);
        setExistingMainImgUrls(imgUrls.length > 0 ? imgUrls : (info.thumbImgUrl ? [info.thumbImgUrl] : []));
      })
      .catch(() => alert("레시피 정보를 불러오지 못했습니다."))
      .finally(() => setIsLoadingEdit(false));
  }, [editRecipeId]);

  const MAX_TAGS = 3;

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) return prev.filter((id) => id !== tagId);
      if (prev.length >= MAX_TAGS) {
        alert(`태그는 최대 ${MAX_TAGS}개까지 선택할 수 있습니다.`);
        return prev;
      }
      return [...prev, tagId];
    });
  };

  // 재료 헬퍼
  const addIngredient = (
    setter: React.Dispatch<React.SetStateAction<Irdnt_Info[]>>,
    tyNm: string,
  ) => {
    setter((prev) => [
      ...prev,
      {
        recipeId: "",
        irdntSn: 0,
        irdntNm: "",
        irdntCpcty: "",
        irdntTyCode: "",
        irdntTyNm: tyNm,
      },
    ]);
  };

  const removeIngredient = (
    setter: React.Dispatch<React.SetStateAction<Irdnt_Info[]>>,
    index: number,
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    setter: React.Dispatch<React.SetStateAction<Irdnt_Info[]>>,
    index: number,
    field: keyof Irdnt_Info,
    value: string,
  ) => {
    setter((prev) => {
      const newArr = [...prev];
      newArr[index] = { ...newArr[index], [field]: value };
      return newArr;
    });
  };

  // 재료 blur 핸들러
  const handleIngredientBlur = (
    setter: React.Dispatch<React.SetStateAction<Irdnt_Info[]>>,
    items: Irdnt_Info[],
    index: number,
    tyNm: string,
  ) => {
    const item = items[index];
    const isLast = index === items.length - 1;
    if (isLast && item.irdntNm.trim() !== "") {
      addIngredient(setter, tyNm);
    } else if (item.irdntNm.trim() === "" && items.length > 1) {
      removeIngredient(setter, index);
    }
  };

  // 조리 과정
  const addStep = () => {
    setCookingInfo([
      ...cookingInfo,
      {
        recipeId: "",
        cookingNo: cookingInfo.length + 1,
        cookingDc: "",
        stepTip: "",
        stepImgUrl: "",
        imgType: "",
      },
    ]);
    setStepImages([...stepImages, null]);
    setStepPreviews([...stepPreviews, ""]);
    setExistingStepImgUrls([...existingStepImgUrls, ""]);
  };

  // 조리 과정 blur 핸들러
  const handleStepBlur = (index: number) => {
    const step = cookingInfo[index];
    const isLast = index === cookingInfo.length - 1;
    if (isLast && step.cookingDc.trim() !== "") {
      addStep();
    } else if (step.cookingDc.trim() === "" && cookingInfo.length > 1) {
      removeStep(index);
    }
  };

  const removeStep = (index: number) => {
    if (cookingInfo.length > 1) {
      const filtered = cookingInfo.filter((_, i) => i !== index);
      const updated = filtered.map((step, i) => ({
        ...step,
        cookingNo: i + 1,
      }));
      setCookingInfo(updated);
      setStepImages(stepImages.filter((_, i) => i !== index));
      setStepPreviews(stepPreviews.filter((_, i) => i !== index));
      setExistingStepImgUrls(existingStepImgUrls.filter((_, i) => i !== index));
    }
  };

  const MAX_MAIN_IMAGES = 10;
  const totalMainImages = existingMainImgUrls.length + mainPreviews.length;

  // 대표 이미지 (여러 장)
  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const remaining = MAX_MAIN_IMAGES - totalMainImages;
      if (remaining <= 0) {
        alert("대표 이미지는 최대 10장까지 등록할 수 있습니다.");
        e.target.value = "";
        return;
      }
      const filesToAdd = files.slice(0, remaining);
      if (files.length > remaining) {
        alert(`최대 10장까지만 등록할 수 있어 ${remaining}장만 추가되었습니다.`);
      }
      setMainImages((prev) => [...prev, ...filesToAdd]);
      setMainPreviews((prev) => [
        ...prev,
        ...filesToAdd.map((f) => URL.createObjectURL(f)),
      ]);
      e.target.value = "";
    }
  };

  const removeMainImage = (index: number) => {
    if (index < existingMainImgUrls.length) {
      setExistingMainImgUrls((prev) => prev.filter((_, i) => i !== index));
    } else {
      const ni = index - existingMainImgUrls.length;
      setMainImages((prev) => prev.filter((_, i) => i !== ni));
      setMainPreviews((prev) => prev.filter((_, i) => i !== ni));
    }
  };

  // 단계별 이미지
  const handleStepImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newImages = [...stepImages];
      newImages[index] = file;
      setStepImages(newImages);
      const newPreviews = [...stepPreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setStepPreviews(newPreviews);
      const newExisting = [...existingStepImgUrls];
      newExisting[index] = "";
      setExistingStepImgUrls(newExisting);
    }
  };

  // 단계 이미지 업로드 공통 처리
  const uploadStepImages = async () => {
    const updated = cookingInfo.map((step, i) => ({
      ...step,
      stepImgUrl: existingStepImgUrls[i] || step.stepImgUrl || "",
    }));
    for (let i = 0; i < stepImages.length; i++) {
      if (stepImages[i]) {
        const formData = new FormData();
        formData.append("file", stepImages[i]!);
        const res = await api.post("/recipe-images/step-image", formData);
        updated[i] = { ...updated[i], stepImgUrl: res.data, imgType: "S" };
      }
    }
    return updated;
  };

  // 재료 병합 공통 처리
  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    );
    return match ? match[1] : null;
  };

  const mergeIngredients = (): Irdnt_Info[] =>
    [
      ...mainIngredients.map((i) => ({ ...i, irdntTyNm: "재료" })),
      ...subIngredients.map((i) => ({ ...i, irdntTyNm: "부재료" })),
      ...seasonings.map((i) => ({ ...i, irdntTyNm: "양념" })),
    ].filter((i) => i.irdntNm.trim() !== "");

  const buildRecipeContext = () => {
    const allIngredients = mergeIngredients();
    const ingredientText =
      allIngredients.length > 0
        ? allIngredients
            .map((i) => `${i.irdntNm}${i.irdntCpcty ? ` ${i.irdntCpcty}` : ""}`)
            .join(", ")
        : "재료 없음";
    const stepsText = cookingInfo
      .map((s, i) => `${i + 1}. ${s.cookingDc}`)
      .filter((s) => s.trim().length > 4)
      .join("\n");
    return { ingredientText, stepsText };
  };

  const buildAiPrompt = () => {
    const { ingredientText, stepsText } = buildRecipeContext();
    return `다음 레시피 정보를 바탕으로 레시피 소개글을 2~3문장으로 한국어로 작성해주세요. 소개글만 출력하세요.\n\n레시피 이름: ${recipeInfo.recipeNmKo}\n재료: ${ingredientText}\n조리 순서:\n${stepsText}`;
  };

  const buildCaloriePrompt = () => {
    const { ingredientText, stepsText } = buildRecipeContext();
    return `다음 레시피의 1인분 기준 총 칼로리를 kcal 단위로 추정해주세요. 숫자만 출력하세요 (예: 450).\n\n레시피 이름: ${recipeInfo.recipeNmKo}\n재료: ${ingredientText}\n조리 순서:\n${stepsText}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!recipeInfo.recipeNmKo.trim()) {
      alert("레시피 제목을 입력해주세요.");
      return;
    }
    const validCookingInfo = cookingInfo.filter((s) => s.cookingDc.trim() !== "");
    if (validCookingInfo.length === 0) {
      alert("조리 순서를 1단계 이상 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalSumry = recipeInfo.sumry;
      let finalCalorie = recipeInfo.calorie;

      setIsGeneratingAi(true);
      try {
        const aiTasks: Promise<string | undefined>[] = [
          askGemini(buildCaloriePrompt()),
        ];
        if (useAi) aiTasks.push(askGemini(buildAiPrompt()));

        const [calorieResult, summaryResult] = await Promise.all(aiTasks);

        if (calorieResult) {
          const parsed = calorieResult.match(/\d+/)?.[0];
          if (parsed) {
            finalCalorie = parsed;
            setRecipeInfo((prev) => ({ ...prev, calorie: parsed }));
          }
        }
        if (summaryResult) {
          finalSumry = summaryResult;
          setRecipeInfo((prev) => ({ ...prev, sumry: summaryResult }));
        }
      } catch {
        alert("AI 처리에 실패했습니다. 기존 값으로 저장을 진행합니다.");
      } finally {
        setIsGeneratingAi(false);
      }

      const updatedCookingInfo = (await uploadStepImages())
        .filter((s) => s.cookingDc.trim() !== "")
        .map((s, i) => ({ ...s, cookingNo: i + 1 }));
      const allIngredients = mergeIngredients();
      const recipePayload = {
        recipeInfo: {
          ...recipeInfo,
          sumry: finalSumry,
          calorie: finalCalorie,
          cookingTime: `${recipeInfo.cookingTime}분`,
          qnt: `${recipeInfo.qnt}인분`,
          videoUrl: videoUrl.trim() || undefined,
        },
        irdntInfo: allIngredients,
        cookingInfo: updatedCookingInfo,
        price: Number(recipeInfo.pcNm) || 0,
        writerId: user?.id ?? "",
        tags: selectedTagIds.map((id) => ({ tagId: id, tagName: "" })),
      };

      if (isEditMode && editRecipeId) {
        // 수정
        await RecipeService.updateRecipe(editRecipeId, {
          ...recipePayload,
          existingMainImgUrls,
        });
        if (mainImages.length > 0) {
          const formData = new FormData();
          mainImages.forEach((file) => formData.append("files", file));
          await api.post(`/recipe-images/${editRecipeId}/upload`, formData);
        }
        alert("레시피가 수정되었습니다!");
        navigate(`/recipe/${editRecipeId}`);
      } else {
        // 신규 등록
        const response = await api.post("/recipe/register", recipePayload);
        const recipeCode = response.data;
        if (mainImages.length > 0 && recipeCode) {
          const formData = new FormData();
          mainImages.forEach((file) => formData.append("files", file));
          await api.post(`/recipe-images/${recipeCode}/upload`, formData);
        }
        alert("레시피가 성공적으로 등록되었습니다!");
        navigate("/");
      }
    } catch (error) {
      console.error(isEditMode ? "수정 실패:" : "등록 실패:", error);
      alert(
        isEditMode
          ? "수정 중 오류가 발생했습니다."
          : "등록 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 재료 섹션 렌더러
  const renderIngredientSection = (
    label: string,
    items: Irdnt_Info[],
    setter: React.Dispatch<React.SetStateAction<Irdnt_Info[]>>,
    tyNm: string,
    placeholder: string,
  ) => (
    <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-sm text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
          {label}
        </span>
        {label === "부재료" && (
          <span className="text-xs text-gray-500 px-2 py-1">
            * 없어도 되지만 있으면 더 맛있어지는 재료예요!
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-1">
          추가 버튼을 눌러 {label}를 입력하세요
        </p>
      ) : (
        items.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <span className="text-gray-400 text-sm w-5 text-right shrink-0">
              {index + 1}
            </span>
            <input
              placeholder={placeholder}
              value={item.irdntNm}
              onChange={(e) =>
                updateIngredient(setter, index, "irdntNm", e.target.value)
              }
              onBlur={() => setTimeout(() => handleIngredientBlur(setter, items, index, tyNm), 0)}
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
            />
            <input
              placeholder="분량 (예: 300g)"
              value={item.irdntCpcty}
              onChange={(e) =>
                updateIngredient(setter, index, "irdntCpcty", e.target.value)
              }
              className="w-1/3 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
            />
            <button
              type="button"
              onClick={() => removeIngredient(setter, index)}
              className="text-gray-400 hover:text-red-500 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))
      )}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={() => addIngredient(setter, tyNm)}
          className="text-orange-500 flex items-center gap-1 text-sm font-bold hover:text-orange-700"
        >
          <Plus className="w-4 h-4" /> 추가
        </button>
      </div>
    </div>
  );

  if (isLoadingEdit) {
    return (
      <div className="text-center py-20">레시피 정보를 불러오는 중...</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-8 text-orange-500">
          {isEditMode ? "레시피 수정하기" : "레시피 등록하기"}
        </h1>

        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* 기본 정보 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">기본 정보</h2>
            <div>
              <label className="block font-medium mb-1">레시피 제목 *</label>
              <input
                type="text"
                value={recipeInfo.recipeNmKo}
                onChange={(e) =>
                  setRecipeInfo({ ...recipeInfo, recipeNmKo: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="레시피 이름을 입력하세요"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium">요리 설명</label>
                <button
                  type="button"
                  onClick={() => setUseAi((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border transition-all ${
                    useAi
                      ? "bg-orange-500 text-white border-orange-500 shadow"
                      : "bg-white text-gray-500 border-gray-300 hover:border-orange-400 hover:text-orange-500"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI 요약 {useAi ? "ON" : "OFF"}
                </button>
              </div>
              {useAi ? (
                <div className="w-full px-4 py-2 border rounded-lg h-24 bg-orange-50 border-orange-200 text-sm text-orange-700 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>
                    등록 버튼을 누르면 AI가 자동으로 요약을 작성합니다
                  </span>
                </div>
              ) : (
                <textarea
                  value={recipeInfo.sumry}
                  onChange={(e) =>
                    setRecipeInfo({ ...recipeInfo, sumry: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg h-24 resize-none"
                  placeholder="레시피를 간단히 소개해주세요"
                />
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-medium mb-1">
                  소요 시간 (분) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={recipeInfo.cookingTime}
                  onChange={(e) =>
                    setRecipeInfo({
                      ...recipeInfo,
                      cookingTime: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="예: 30"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">난이도 *</label>
                <select
                  value={recipeInfo.levelNm}
                  onChange={(e) =>
                    setRecipeInfo({ ...recipeInfo, levelNm: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="상">상</option>
                  <option value="중">중</option>
                  <option value="하">하</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">분량</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={recipeInfo.qnt}
                    onChange={(e) =>
                      setRecipeInfo({ ...recipeInfo, qnt: e.target.value })
                    }
                    className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="2"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                    인분
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 대표 이미지 (여러 장) */}
          <section>
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <h2 className="text-xl font-semibold">대표 이미지</h2>
              <span className={`text-sm font-medium ${totalMainImages >= MAX_MAIN_IMAGES ? "text-red-500" : "text-gray-500"}`}>
                ({totalMainImages}/{MAX_MAIN_IMAGES})
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              첫 번째 사진이 썸네일로 사용됩니다. 여러 장 추가 가능합니다.
            </p>
            {(existingMainImgUrls.length > 0 || mainPreviews.length > 0) && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[
                  ...existingMainImgUrls.map((url) => `${IMG_BASE_URL}/${url}`),
                  ...mainPreviews,
                ].map((preview, index) => (
                  <div
                    key={index}
                    className="relative rounded-lg overflow-hidden aspect-square border border-gray-200"
                  >
                    <img
                      src={preview}
                      alt={`이미지 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                        썸네일
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMainImage(index)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-opacity-80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {totalMainImages < MAX_MAIN_IMAGES ? (
              <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-500 text-sm">
                <Upload className="w-5 h-5" />
                <span>
                  {existingMainImgUrls.length === 0 && mainPreviews.length === 0
                    ? "클릭하여 이미지 선택"
                    : "이미지 추가"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleMainImageChange}
                  accept="image/*"
                  multiple
                />
              </label>
            ) : (
              <p className="text-center text-sm text-red-500 py-3 border-2 border-dashed border-red-200 rounded-lg bg-red-50">
                최대 10장을 모두 등록했습니다.
              </p>
            )}
          </section>

          {/* 재료 (3섹션) */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold border-b pb-2">재료</h2>
            {renderIngredientSection(
              "재료",
              mainIngredients,
              setMainIngredients,
              "재료",
              "재료명 (예: 돼지고기)",
            )}
            {renderIngredientSection(
              "부재료",
              subIngredients,
              setSubIngredients,
              "부재료",
              "부재료명 (예: 대파)",
            )}
            {renderIngredientSection(
              "양념",
              seasonings,
              setSeasonings,
              "양념",
              "양념명 (예: 간장)",
            )}
          </section>

          {/* 영상 링크 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold border-b pb-2">영상 링크 (선택)</h2>
            <div className="space-y-2">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="YouTube 링크를 입력하세요 (예: https://www.youtube.com/watch?v=...)"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              {extractYouTubeId(videoUrl) && (
                <div className="rounded-lg overflow-hidden aspect-video w-full max-w-xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(videoUrl)}`}
                    title="YouTube 미리보기"
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </section>

          {/* 조리 순서 */}
          <section className="space-y-4">
            <div className="border-b pb-2">
              <h2 className="text-xl font-semibold">조리 순서</h2>
            </div>
            {cookingInfo.map((step, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-200"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-orange-500 text-lg">
                    Step {step.cookingNo}
                  </span>
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
                  onBlur={() => setTimeout(() => handleStepBlur(index), 0)}
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
                <div>
                  {stepPreviews[index] || existingStepImgUrls[index] ? (
                    <div className="relative rounded-lg overflow-hidden aspect-square border border-gray-200 w-64">
                      <img
                        src={
                          stepPreviews[index] ||
                          `${IMG_BASE_URL}/${existingStepImgUrls[index]}`
                        }
                        alt={`Step ${index + 1} 이미지`}
                        className="w-full h-full object-cover"
                      />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 cursor-pointer transition-all group">
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
            <div className="flex justify-end">
              <button
                type="button"
                onClick={addStep}
                className="text-orange-500 flex items-center gap-1 text-sm font-bold hover:text-orange-700"
              >
                <Plus className="w-4 h-4" /> 단계 추가
              </button>
            </div>
          </section>

          {/* 태그 */}
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
            <p className="text-sm text-gray-500">
              레시피에 해당하는 태그를 선택하세요{" "}
              <span
                className={
                  selectedTagIds.length >= MAX_TAGS
                    ? "text-orange-500 font-semibold"
                    : ""
                }
              >
                ({selectedTagIds.length}/{MAX_TAGS})
              </span>
            </p>
            {allTags.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">
                등록된 태그가 없습니다. 관리자 페이지에서 태그를 먼저
                추가해주세요.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.tagId);
                  const isDisabled =
                    !isSelected && selectedTagIds.length >= MAX_TAGS;
                  return (
                    <button
                      key={tag.tagId}
                      type="button"
                      onClick={() => toggleTag(tag.tagId)}
                      disabled={isDisabled}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                        isSelected
                          ? "bg-orange-500 text-white border-orange-500 shadow"
                          : isDisabled
                            ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                            : "bg-white text-gray-600 border-gray-300 hover:border-orange-400 hover:text-orange-500"
                      }`}
                    >
                      {tag.tagName}
                    </button>
                  );
                })}
              </div>
            )}
            {selectedTagIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-xs text-gray-400 self-center">
                  선택됨:
                </span>
                {allTags
                  .filter((t) => selectedTagIds.includes(t.tagId))
                  .map((t) => (
                    <span
                      key={t.tagId}
                      className="flex items-center gap-1 px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold"
                    >
                      {t.tagName}
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

          {/* 버튼 */}
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingAi
                ? "AI 분석 중..."
                : isSubmitting
                  ? isEditMode
                    ? "수정 중..."
                    : "등록 중..."
                  : isEditMode
                    ? "레시피 수정 완료"
                    : "레시피 등록 완료"}
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
