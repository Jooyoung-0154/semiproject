const askGemini = async (userPrompt: any) => {
  try {
    const response = await fetch('http://localhost:8080/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: userPrompt }),
    });
    
    const data = await response.json();
    // Google's response structure: data.candidates[0].content.parts[0].text
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error calling Gemini proxy:", error);
  }
};

export default askGemini;