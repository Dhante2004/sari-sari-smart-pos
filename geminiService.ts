
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Sale } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getBusinessInsights(products: Product[], sales: Sale[]) {
  const context = {
    totalProducts: products.length,
    lowStock: products.filter(p => p.stockQuantity <= p.minStockLevel),
    recentSales: sales.slice(-20),
    inventoryValue: products.reduce((acc, p) => acc + (p.costPrice * p.stockQuantity), 0)
  };

  const prompt = `As a Filipino business expert (Sari-Sari Store Consultant), analyze this store data and provide a helpful summary in Taglish (mix of English and Tagalog).
  
  Store Data Context:
  - Low Stock Items: ${context.lowStock.map(i => i.name).join(', ')}
  - Recent Sales: ${JSON.stringify(context.recentSales)}
  - Total Inventory Cost Value: PHP ${context.inventoryValue}

  Provide a concise summary, highlight fast-moving items, and give 2-3 specific "tito/tita" advice tips for the store owner.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            fastMovingItems: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            restockSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productName: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            },
            estimatedProfitTrend: { type: Type.STRING }
          },
          required: ["summary", "fastMovingItems", "restockSuggestions", "estimatedProfitTrend"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
