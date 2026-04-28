import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function askAboutPhoto(question: string, photoContext?: string) {
  try {
    const prompt = `
      你是一个专门为6-12岁儿童设计的AI助手。
      用户刚刚拍摄了一张照片（上下文：${photoContext || "一个有趣的世界观察"}）。
      小朋友问了一个问题："${question}"
      请用亲切、简单、富有启发性的语言回答。字数控制在50字以内。
      回答风格：博学但平易近人，像一个大哥哥或大姐姐。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text || "这是一个很好的观察！";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "哎呀，我的大脑暂时断网了。不过这是一个很好的观察，你可以试着再问我一次！";
  }
}

export async function identifyAndCategorize(imageDescription: string) {
  try {
    const prompt = `
      根据以下描述： "${imageDescription}"
      将其分类到以下一类： "animal", "plant", "artifact", "building", "general"。
      并返回一个JSON对象，包含：
      {
        "category": "分类名",
        "nameZh": "中文名",
        "nameEn": "英文名",
        "fact": "一句话有趣科普"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    const text = response.text || "";
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid response format");
  } catch (error) {
    return {
      category: "general",
      nameZh: "奇妙发现",
      nameEn: "Discovery",
      fact: "这个世界上充满了惊喜，继续观察吧！"
    };
  }
}
