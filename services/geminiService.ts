
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateReminderMessage = async (memberName: string, amount: number, serviceName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera un mensaje de WhatsApp para recordar un pago pendiente. 
      Destinatario: ${memberName}. 
      Monto: $${amount}. 
      Servicio: ${serviceName}. 
      Tono: Muy amigable, educado y breve. En español. 
      Evita sonar agresivo o formal, debe parecer un amigo recordándole a otro.`,
      config: {
        temperature: 0.8,
        maxOutputTokens: 120,
      }
    });
    return response.text?.trim() || `¡Hola ${memberName}! Solo paso a recordarte el pago de ${serviceName} ($${amount}). ¿Podrías enviarlo cuando puedas? ¡Gracias!`;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `¡Hola ${memberName}! Recordatorio amigable del pago de ${serviceName} por $${amount}. ¡Gracias!`;
  }
};
