
import { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getStats } from "../_lib/db_ops";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow admin access (auth check should be here in prod)
  
  try {
    const stats = await getStats();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a high-level business analyst for a premium cannabis dispensary called "Bud n' Buddies".
      Analyze these current store statistics and provide 3 very concise, high-impact business insights or recommendations.
      
      Stats:
      - Total Revenue: $${stats.totalRevenue}
      - Total Orders: ${stats.totalOrders}
      - Avg Order Value: $${stats.avgOrderValue}
      - Total Customers: ${stats.totalCustomers}
      - Top Products: ${stats.topProducts.map(p => p.name).join(", ")}
      
      Format: Return a JSON array of strings. Each string is one insight.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown formatting from Gemini
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const insights = JSON.parse(jsonStr);

    return res.status(200).json({ insights });
  } catch (error) {
    console.error("Insights Error:", error);
    return res.status(500).json({ insights: ["Establish more customer relationships to drive recurring revenue.", "Focus on inventory turnover for top-selling flower.", "Monitor average order value trends for potential bundle opportunities."] });
  }
}
