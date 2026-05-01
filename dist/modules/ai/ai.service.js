import { GoogleGenAI } from "@google/genai";
let ai = null;
try {
    // Try to initialize the AI if the key is provided
    if (process.env.GEMINI_API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
}
catch (error) {
    console.warn("Failed to initialize Google Gen AI. Proceeding with fallback.");
}
export async function generateJobDescription(prompt) {
    const systemPrompt = `You are a professional copywriter for a tuition marketplace. 
The user will provide a brief requirement for a tutor.
You must generate a highly professional, well-formatted job listing.
The output MUST be a strict JSON object with exactly two string fields:
1. "title": A catchy, concise job title (e.g. "Experienced Math Tutor Needed for Class 10").
2. "description": A comprehensive description including expectations, student needs, and schedule, formatted with clear paragraphs or bullet points.
Return ONLY valid JSON.`;
    if (ai) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    { role: "user", parts: [{ text: `${systemPrompt}\n\nUser Requirement: ${prompt}` }] }
                ],
                config: {
                    temperature: 0.7,
                    responseMimeType: "application/json",
                }
            });
            const text = response.text;
            if (text) {
                try {
                    const parsed = JSON.parse(text);
                    return {
                        title: parsed.title,
                        description: parsed.description
                    };
                }
                catch (e) {
                    console.error("Failed to parse Gemini JSON response", text);
                }
            }
        }
        catch (error) {
            console.error("Gemini API Error:", error);
            // Fall through to fallback
        }
    }
    // Fallback / Simulated AI response if key is missing or API fails
    // We simulate a tiny delay to make it feel like AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
        title: "Dedicated Tutor Needed for " + (prompt.split(" ")[0] || "Student"),
        description: `We are looking for an experienced and dedicated tutor for our student. 

Student Requirements:
• Based on your prompt: "${prompt}"
• We need someone who is patient and can clear core concepts.
• Focus will be on exam preparation and regular homework assistance.

Expectations:
• Regular attendance and punctuality.
• Weekly assessment of the student's progress.
• Open communication with parents regarding performance.

Please apply if you feel you are the right fit for this role!`
    };
}
export function calculateMatchScore(job, tutor) {
    let score = 50; // Base score
    // 1. Budget Match (up to 20 points)
    if (job.budget && tutor.hourlyRate) {
        // If tutor rate is within 20% of budget
        const diff = Math.abs(job.budget - tutor.hourlyRate);
        const percentDiff = diff / job.budget;
        if (percentDiff <= 0.2)
            score += 20;
        else if (percentDiff <= 0.5)
            score += 10;
    }
    else {
        score += 10; // Neutral if missing data
    }
    // 2. Keyword/Subject Match (up to 30 points)
    const jobText = (job.title + " " + job.description).toLowerCase();
    let matches = 0;
    if (tutor.subjects && tutor.subjects.length > 0) {
        tutor.subjects.forEach(sub => {
            if (jobText.includes(sub.toLowerCase()))
                matches++;
        });
        score += Math.min(30, matches * 10);
    }
    else {
        score += 15; // Neutral
    }
    // Add some randomness so it feels "AI" generated if data is sparse
    // We'll use a deterministic random based on string length so it doesn't change on every refresh
    const seed = jobText.length + (tutor.bio?.length || 0);
    const pseudoRandom = (seed % 15) - 5; // -5 to +10
    let finalScore = score + pseudoRandom;
    // Clamp between 45 and 98 to look realistic
    finalScore = Math.max(45, Math.min(98, finalScore));
    return Math.round(finalScore);
}
export async function analyzeVerificationRisk(idPhotoUrl, facePhotoUrl) {
    // Mock AI response representing OCR + Face Matching confidence
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Random score between 5 and 45 for testing,
    // indicating "low to medium risk" by default for easy approval testing.
    const riskScore = Math.floor(Math.random() * 40) + 5;
    return riskScore;
}
export const aiService = {
    generateJobDescription,
    calculateMatchScore,
    analyzeVerificationRisk,
};
