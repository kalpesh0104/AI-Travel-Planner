import { useState } from 'react';

// Types
interface GoogleResult {
  title: string;
  snippet: string;
  link: string;
}

interface Accommodation {
  name: string;
  type: string;
  priceRange: string;
  description: string;
  highlights: string[];
  bestFor: string[];
}

interface Attraction {
  name: string;
  category: string;
  description: string;
  idealVisitLength: string;
  bestTimeToVisit: string;
  travelTips: string[];
}

interface Restaurant {
  name: string;
  cuisine: string;
  priceRange: string;
  specialty: string;
  atmosphere: string;
  localRecommendation: boolean;
}

interface DayPlan {
  day: number;
  activities: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  transportation: string;
  tips: string[];
}

interface TravelAdvisory {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

interface BudgetEstimate {
  category: string;
  lowRange: number;
  highRange: number;
  notes: string;
}

interface TripPlan {
  executiveSummary: string;
  destination: {
    name: string;
    overview: string;
    bestTimeToVisit: string[];
    climate: string;
    culture: string;
    language: string[];
    currency: string;
  };
  idealTripLength: {
    minimum: number;
    optimal: number;
    extended: number;
  };
  topAccommodations: Accommodation[];
  topAttractions: Attraction[];
  topRestaurants: Restaurant[];
  itinerary: DayPlan[];
  travelAdvisories: TravelAdvisory[];
  localCustoms: string[];
  packingRecommendations: string[];
  budgetEstimates: BudgetEstimate[];
  recommendations: {
    mustSee: string[];
    hiddenGems: string[];
    photospots: string[];
    familyFriendly: string[];
    soloTraveler: string[];
  };
}

interface TripPlanningData {
  success: boolean;
  data?: {
    results: GoogleResult[];
    tripPlan: TripPlan;
    timestamp: string;
  };
  error?: string;
}

// Google Search API response interfaces
interface GoogleSearchItem {
  title?: string;
  snippet?: string;
  link?: string;
}

interface GoogleSearchResponse {
  items?: GoogleSearchItem[];
}

// Groq API response interfaces
interface GroqChoice {
  message?: {
    content?: string;
  };
}

interface GroqResponse {
  choices?: GroqChoice[];
}

// Configuration
const CONFIG = {
  REQUEST_TIMEOUT: 60000,
  API_KEYS: {
    GOOGLE: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    SEARCH_ENGINE_ID: process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID,
    GROQ: process.env.NEXT_PUBLIC_GROQ_API_KEY
  }
} as const;

const TRIP_PLANNING_PROMPT = `You are an expert travel planner with deep knowledge about destinations worldwide. Analyze the provided search results and generate a comprehensive trip planning guide in JSON format. This guide should provide practical, actionable insights for travelers, balancing popular attractions with hidden gems and local experiences.

Provide your response in this JSON structure:
{
  "executiveSummary": "HTML-formatted overview highlighting key aspects of the destination and trip",
  
  "destination": {
    "name": "Full destination name",
    "overview": "HTML-formatted comprehensive overview of the destination",
    "bestTimeToVisit": ["Seasonal recommendations with reasoning"],
    "climate": "Climate information",
    "culture": "Cultural insights",
    "language": ["Main languages spoken"],
    "currency": "Local currency information"
  },
  
  "idealTripLength": {
    "minimum": "Minimum recommended days as integer",
    "optimal": "Optimal recommended days as integer",
    "extended": "Extended trip length as integer"
  },
  
  "topAccommodations": [
    {
      "name": "Accommodation name",
      "type": "Hotel/Hostel/Resort/etc.",
      "priceRange": "Budget/Mid-range/Luxury",
      "description": "HTML-formatted description",
      "highlights": ["Key features"],
      "bestFor": ["Types of travelers this suits"]
    }
  ],
  
  "topAttractions": [
    {
      "name": "Attraction name",
      "category": "Natural/Historical/Cultural/etc.",
      "description": "HTML-formatted description",
      "idealVisitLength": "Recommended visit duration",
      "bestTimeToVisit": "Optimal time of day/year",
      "travelTips": ["Practical visitor tips"]
    }
  ],
  
  "topRestaurants": [
    {
      "name": "Restaurant name",
      "cuisine": "Type of cuisine",
      "priceRange": "Budget/Mid-range/Luxury",
      "specialty": "Signature dish or specialty",
      "atmosphere": "Description of ambiance",
      "localRecommendation": "Boolean indicating if it's a local favorite"
    }
  ],
  
  "itinerary": [
    {
      "day": "Day number as integer",
      "activities": {
        "morning": "Morning activity",
        "afternoon": "Afternoon activity",
        "evening": "Evening activity"
      },
      "meals": {
        "breakfast": "Optional breakfast recommendation",
        "lunch": "Optional lunch recommendation",
        "dinner": "Optional dinner recommendation"
      },
      "transportation": "Transportation recommendations for the day",
      "tips": ["Day-specific travel tips"]
    }
  ],
  
  "travelAdvisories": [
    {
      "type": "Advisory category",
      "description": "Description of advisory",
      "severity": "low/medium/high",
      "recommendation": "Recommendation to address the advisory"
    }
  ],
  
  "localCustoms": ["Important local customs to respect"],
  "packingRecommendations": ["Essential items to pack"],
  
  "budgetEstimates": [
    {
      "category": "Expense category",
      "lowRange": "Low-end budget amount as number in Indian Rupees (₹)",
      "highRange": "High-end budget amount as number in Indian Rupees (₹)",
      "notes": "Budget notes and tips"
    }
  ],
  
  "recommendations": {
    "mustSee": ["Essential experiences"],
    "hiddenGems": ["Lesser-known attractions"],
    "photospots": ["Best photography locations"],
    "familyFriendly": ["Recommendations for families"],
    "soloTraveler": ["Recommendations for solo travelers"]
  }
}

Guidelines:
- ALL budget estimates MUST be in Indian Rupees (₹) only
- Include 5 well-researched accommodation options across different price points
- Provide 8 attractions with detailed descriptions and practical visiting information
- List 6 restaurant recommendations representing local cuisine and international options
- Create a detailed daily itinerary for the optimal trip length
- Include specific travel advisories and safety information
- Provide realistic budget estimates in Indian Rupees (₹) ONLY - not in USD or any other currency
- Balance tourist highlights with authentic local experiences
- Include practical transportation advice between attractions
- Recommend best photo spots and Instagram-worthy locations
- Suggest activities for different traveler types (families, solo, couples, etc.)
- Note any seasonal considerations or events
- Include cultural etiquette and local customs information
- Provide packing recommendations specific to the destination
- Highlight sustainable tourism practices where applicable`;

// Main service class
export class TripPlanningService {
  private static activeRequests = new Map<string, Promise<TripPlanningData>>();

  private static async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  }

  private static validateConfiguration(): void {
    if (!CONFIG.API_KEYS.GOOGLE || !CONFIG.API_KEYS.SEARCH_ENGINE_ID || !CONFIG.API_KEYS.GROQ) {
      throw new Error('API keys not configured');
    }
  }

  private static async fetchGoogleResults(query: string): Promise<GoogleResult[]> {
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.append('key', CONFIG.API_KEYS.GOOGLE || '');
    searchUrl.searchParams.append('cx', CONFIG.API_KEYS.SEARCH_ENGINE_ID || '');
    searchUrl.searchParams.append('q', `${query} travel guide tourism attractions accommodation`);
    searchUrl.searchParams.append('num', '10');

    const response = await this.fetchWithTimeout(searchUrl.toString(), { method: 'GET' });
    
    if (!response.ok) {
      throw new Error(`Google Search API error: ${response.status}`);
    }
    
    const data = await response.json() as GoogleSearchResponse;
    
    if (!data?.items || !Array.isArray(data.items)) {
      throw new Error('Invalid Google Search API response format');
    }
    
    return data.items.map((item: GoogleSearchItem) => ({
      title: item.title || 'No title available',
      snippet: item.snippet || 'No snippet available',
      link: item.link || '#',
    }));
  }

  private static async generateTripPlan(
    query: string,
    results: GoogleResult[]
  ): Promise<TripPlan> {
    const response = await this.fetchWithTimeout(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.API_KEYS.GROQ}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-r1-distill-qwen-32b',
          messages: [
            { role: 'system', content: TRIP_PLANNING_PROMPT },
            { 
              role: 'user', 
              content: `Analyze these search results for a trip to ${query} and provide a comprehensive travel guide with all budget estimates ONLY in Indian Rupees (₹). Return ONLY valid JSON format with NO explanatory text:\n${JSON.stringify(results, null, 2)}` 
            },
          ],
          temperature: 0.7,
          max_tokens: 4500,
          response_format: { type: 'json_object' },
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Groq API error (${response.status}): ${
          errorData ? JSON.stringify(errorData) : response.statusText
        }`
      );
    }
    
    const data = await response.json() as GroqResponse;
    const tripPlanString = data?.choices?.[0]?.message?.content;
    
    if (!tripPlanString) {
      throw new Error('No trip plan generated from Groq API');
    }
    
    try {
      const parsedPlan = JSON.parse(tripPlanString) as TripPlan;
      
      // Validate and ensure budget is in Indian Rupees
      parsedPlan.budgetEstimates = parsedPlan.budgetEstimates.map(item => {
        // Ensure budget values are numbers
        return {
          ...item,
          lowRange: typeof item.lowRange === 'string' ? parseInt(item.lowRange.replace(/[^\d]/g, ''), 10) : item.lowRange,
          highRange: typeof item.highRange === 'string' ? parseInt(item.highRange.replace(/[^\d]/g, ''), 10) : item.highRange
        };
      });
      
      return parsedPlan;
    } catch (error) {
      console.error("Failed to parse trip plan JSON:", error);
      throw new Error('Invalid trip plan format received from API');
    }
  }

  public static async planTrip(destination: string): Promise<TripPlanningData> {
    if (!destination.trim()) {
      return { success: false, error: 'Destination query cannot be empty' };
    }
    
    try {
      const activeRequest = this.activeRequests.get(destination);
      if (activeRequest) {
        return activeRequest;
      }
      
      this.validateConfiguration();
      
      const newRequest = (async () => {
        try {
          const results = await this.fetchGoogleResults(destination);
          
          if (results.length === 0) {
            return { success: false, error: 'No search results found for this destination' };
          }
          
          const tripPlan = await this.generateTripPlan(destination, results);
          
          const response: TripPlanningData = {
            success: true,
            data: {
              results,
              tripPlan,
              timestamp: new Date().toISOString(),
            },
          };
          
          return response;
        } finally {
          this.activeRequests.delete(destination);
        }
      })();
      
      this.activeRequests.set(destination, newRequest);
      return newRequest;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Trip planning error:', error);
      return { success: false, error: errorMessage };
    }
  }
}

// React hook
export const useTripPlanner = () => {
  const [tripData, setTripData] = useState<TripPlanningData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const planTrip = async (destination: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await TripPlanningService.planTrip(destination);
      setTripData(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearTripData = () => {
    setTripData(null);
    setError(null);
  };

  return {
    tripData,
    planTrip,
    clearTripData,
    isLoading,
    error
  };
};