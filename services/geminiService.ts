
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateReminderMessage = async (memberName: string, amount: number, serviceName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera un recordatorio de WhatsApp educado y amigable para ${memberName} sobre su pago de $${amount} para la suscripción de ${serviceName}. El mensaje debe estar en español, ser corto y conciso.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
      }
    });
    return response.text?.trim() || `¡Hola ${memberName}! Solo paso a recordarte el pago de ${serviceName}. ¿Podrías enviar los $${amount} cuando tengas un momento? ¡Gracias!`;
  } catch (error) {
    console.error("Error al generar recordatorio con IA:", error);
    return `¡Hola ${memberName}! Solo paso a recordarte el pago de ${serviceName}. ¿Podrías enviar los $${amount} cuando tengas un momento? ¡Gracias!`;
  }
};
