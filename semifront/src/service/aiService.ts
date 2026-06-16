const askGemini = async (userPrompt: any): Promise<string> => {
  const response = await fetch('http://localhost:8080/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: userPrompt }),
  });

  if (!response.ok) {
    throw new Error(`Gemini 프록시 오류: HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error(`Gemini 응답 형식 오류: ${JSON.stringify(data)}`);
  }

  return text;
};

export default askGemini;