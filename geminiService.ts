
import { GoogleGenAI, Modality } from "@google/genai";
import { Verse } from "./types";

export const getChildFriendlyExplanation = async (verse: Verse, surahName: string, isPremium: boolean, userName?: string, gender?: string, language?: string): Promise<string> => {
  if (!isPremium) return "L'assistant IA est réservé aux membres Premium.";
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const persona = userName ? `Tu t'adresses à ${userName}, un ${gender === 'girl' ? 'petite fille' : 'petit garçon'} de 4 à 8 ans.` : `Tu es un assistant bienveillant pour un enfant de 4 à 8 ans.`;
    
    // Choose instruction language based on user's language
    let prompt = `${persona} Explique ce verset de la sourate ${surahName} de manière simple et noble. "${verse.arabic} - ${verse.french}"`;
    let systemInstruction = "Tu es 'Lumi', une petite guide bienveillante. Ton langage est doux, clair et respecte strictement le dogme des gens de la Sounnah et du Consensus musulman. RÈGLES CRITIQUES : 1. INTERDICTION d'anthropomorphisme. 2. Fidélité au consensus. 3. Pédagogie : maximum 2 courtes phrases.";

    if (language?.startsWith('en')) {
      prompt = `${persona} Explain this verse from Surah ${surahName} in a simple and noble way for a child. "${verse.arabic}"`;
      systemInstruction = "You are 'Lumi', a kind little guide. Your language is sweet, clear, and strictly respects Islamic consensus. CRITICAL RULES: 1. NO anthropomorphism. 2. Pedagogical: maximum 2 short sentences in English.";
    } else if (language?.startsWith('ar')) {
      prompt = `اشرح هذا الجزء من سورة ${surahName} بأسلوب بسيط ونبيل للطفل. "${verse.arabic}"`;
      systemInstruction = "أنت 'لومي'، مرشدة صغيرة طيبة. لغتك لطيفة وواضحة وتحترم العقيدة الإسلامية. قواعد حرجة: 1. لا تجسيم. 2. تربوية: جملتان قصيرتان كحد أقصى باللغة العربية.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });
    return response.text || "C'est un verset magnifique ! Médite sur la grandeur de ton Seigneur.";
  } catch (error) {
    console.error("Error fetching explanation:", error);
    return "C'est une parole noble de ton Seigneur qui t'enseigne la sagesse.";
  }
};

export const generateCompliment = async (surahName: string, isPremium: boolean, userName?: string, gender?: string, language?: string): Promise<string> => {
  if (!isPremium) return "MachaAllah ! Quel bel effort, continue ainsi sur ce noble chemin.";
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let prompt = `${userName ? `Félicite ${userName} (${gender === 'girl' ? 'fille' : 'garçon'})` : "L'enfant"} qui vient de terminer la sourate ${surahName}. Maximum 2 phrases.`;
    let systemInstruction = "Tu es 'Lumi', la compagne d'apprentissage de l'enfant. Tu l'encourages avec noblesse et sincérité. N'utilise jamais le mot 'magique'.";

    if (language?.startsWith('en')) {
      prompt = `Congratulate ${userName || "the child"} for finishing Surah ${surahName}. Maximum 2 sentences.`;
      systemInstruction = "You are 'Lumi', the child's learning companion. Encourage them with nobility and sincerity in English. Don't use the word 'magic'.";
    } else if (language?.startsWith('ar')) {
      prompt = `هنئ ${userName || "الطفل"} على إنهاء سورة ${surahName}. جملتان كحد أقصى.`;
      systemInstruction = "أنتِ 'لومي'، رفيقة تعلم الطفل. شجعيه بنبل وإخلاص باللغة العربية. لا تستخدمي كلمة 'سحر'.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.5,
      }
    });
    return response.text || "MachaAllah ! Quel bel effort, continue ainsi sur ce noble chemin.";
  } catch (error) {
    return "MachaAllah ! Tu as fait un travail remarquable pour apprendre ce noble texte !";
  }
};

export const generateMascotAudio = async (text: string, isPremium: boolean): Promise<string | undefined> => {
  if (!isPremium) return undefined;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Dis de manière calme, féminine et encourageante : ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Error generating speech:", error);
    return undefined;
  }
};

export async function decodeAudioBuffer(base64: string, ctx: AudioContext): Promise<AudioBuffer> {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Utilisation sécurisée de Int16Array pour éviter les erreurs d'alignement
  const dataInt16 = new Int16Array(bytes.buffer, 0, Math.floor(bytes.byteLength / 2));
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}
