import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
// Ensure you have VITE_GEMINI_API_KEY in your .env file OR pass it to the function
const ENV_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const generateItinerary = async (destination, travelers, budget, interests, duration, userKey) => {
  const apiKey = userKey || ENV_API_KEY;

  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return generateMockData(destination, duration);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const daysCount = duration || 3;


    const prompt = `You are an expert Tamil Nadu travel planner. Create a ${daysCount}-day itinerary for ${travelers} travelers to ${destination}, Tamil Nadu with a ${budget} budget.

**CRITICAL - GOOGLE DATA INTEGRATION**:
1. RECOMMEND ONLY REAL PLACES from Google Maps knowledge.
2. PRIORITIZE HIGHLY-RATED PLACES: Only include hotels/attractions with 4.5+ stars and restaurants with 4.2+ stars on Google Maps.
3. INCLUDE ACCURATE RATINGS: For every activity, include a "rating" field (e.g. 4.6).
4. LOCAL AUTHENTICITY: Suggest legendary spots like "Murugan Idli Shop" in Madurai, "Dakshin" in Chennai, etc.
5. REAL COORDINATES: Provide exact lat/lng for every location.

**Traveler Interests**: ${interests || 'General sightseeing, culture, food'}

**OUTPUT FORMAT** (CRITICAL - Return ONLY valid JSON, NO markdown):
{
  "days": [
    {
      "day": 1,
      "theme": "Theme Name",
      "activities": [
        {
          "time": "09:00",
          "title": "Place Name",
          "description": "Short desc mentioning rating (e.g. 4.8★ rated heritage site)",
          "location": { "lat": 12.34, "lng": 78.90 },
          "type": "visit",
          "cost": "₹ amount",
          "rating": "4.8"
        }
      ]
    }
  ],
  "centerCoordinates": { "lat": 12.34, "lng": 78.90 },
  "totalEstimatedCost": "₹ range",
  "tips": ["Tip 1", "Tip 2"]
}

Return ONLY the JSON. No conversational text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up any markdown formatting
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    // Remove any leading/trailing text before/after JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    const parsedData = JSON.parse(text);

    // Validate structure
    if (!parsedData.days || !Array.isArray(parsedData.days) || parsedData.days.length === 0) {
      throw new Error("Invalid itinerary structure");
    }

    return parsedData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    console.warn("Falling back to mock data due to API error.");
    return generateMockData(destination, duration);
  }
};




// Fallback mock data generator
const generateMockData = (destination, duration) => {
  const daysCount = duration || 3;
  const days = [];

  for (let i = 1; i <= daysCount; i++) {
    days.push({
      day: i,
      theme: `Exploration Day ${i} (Mock Data)`,
      activities: [
        { time: "09:00", title: `Explore ${destination} - Part ${i}`, description: "Sightseeing and local culture.", location: { lat: 13.0827 + (i * 0.01), lng: 80.2707 + (i * 0.01) } },
        { time: "14:00", title: `Local Cuisine & Markets`, description: "Taste the best local food.", location: { lat: 13.0850 + (i * 0.01), lng: 80.2750 + (i * 0.01) } }
      ]
    });
  }

  return {
    days: days,
    centerCoordinates: { lat: 13.0827, lng: 80.2707 }
  };
};
