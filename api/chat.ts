
import { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getProducts } from "./_lib/db_ops";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Fetch product context
    const { products } = await getProducts();
    const productContext = products.map(p => 
      `${p.name} - ${p.category} - $${p.price}. Description: ${p.description}`
    ).join("\n");

    const systemPrompt = `
      You are "Bud", the expert AI Budtender for Bud n' Buddies Cannabis in Sherwood Park, Alberta.
      Your goal is to help customers find the perfect product based on their needs (sleep, energy, pain relief, recreation).
      
      Store Rules:
      - We are open until 2 AM every day.
      - We deliver 365 days a year.
      - We offer free membership.
      - Be friendly, professional, and slightly edgy/premium.
      
      Current Product Menu:
      ${productContext}
      
      When recommending:
      1. Mention the specific product name and price.
      2. Briefly explain why it fits their needs.
      3. Keep responses concise and engaging.
    `;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I am Bud, your expert AI Budtender. How can I help you elevate your experience today?" }] },
        ...(history || [])
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });
  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: "The Budtender is currently offline. Please try again in a moment." });
  }
}
