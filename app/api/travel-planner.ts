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

interface BookingDetails {
  destination: string;
  durationDays: number;
  startDate?: Date;
  accommodationPreference?: string;
  totalBudget?: number;
  numberOfTravelers?: number;
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
  error?: {
    message?: string;
    type?: string;
    param?: string;
    code?: string;
  };
}

// Configuration
const CONFIG = {
  REQUEST_TIMEOUT: 60000,
  API_KEYS: {
    GOOGLE: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    SEARCH_ENGINE_ID: process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID,
    GROQ: process.env.NEXT_PUBLIC_GROQ_API_KEY
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    BACKOFF_MS: 1000
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

const ITINERARY_ADJUSTMENT_PROMPT = `As an expert travel planner, adjust the existing itinerary to match the requested number of days (NUM_DAYS) while maintaining the high quality of the trip experience. If shortening the trip, prioritize must-see attractions and essential experiences. If extending the trip, add more hidden gems, relaxation time, or in-depth exploration of key areas.

Current trip information:
CURRENT_TRIP_DATA

Please provide a revised JSON itinerary array containing exactly NUM_DAYS itinerary days, following this structure for each day:
{
  "day": day number as integer,
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

Ensure the itinerary flows logically, with activities in proximity to each other when possible, and provides a balanced experience of the destination.`;

// Main service class
export class TripPlanningService {
  private static activeRequests = new Map<string, Promise<TripPlanningData>>();
  private static cachedPlans = new Map<string, TripPlanningData>();

  private static async fetchWithTimeout(
    url: string,
    options: RequestInit,
    retryCount = 0
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
      
      if (error instanceof Error) {
        // Handle timeout or network errors with retry logic
        if (error.name === 'AbortError') {
          if (retryCount < CONFIG.RETRY.MAX_ATTEMPTS) {
            console.log(`Request timed out, retrying (${retryCount + 1}/${CONFIG.RETRY.MAX_ATTEMPTS})...`);
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY.BACKOFF_MS * (retryCount + 1)));
            return this.fetchWithTimeout(url, options, retryCount + 1);
          }
          throw new Error('Request timed out after multiple attempts');
        }
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
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Google Search API error (${response.status}): ${JSON.stringify(errorData)}`);
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

  private static async callGroqAPI(
    messages: Array<{ role: string; content: string }>,
    maxTokens = 4500,
    retryCount = 0
  ): Promise<GroqResponse> {
    try {
      const requestBody = {
        model: 'deepseek-r1-distill-qwen-32b',
        messages: messages,
        temperature: 0.7,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      };
      
      const response = await this.fetchWithTimeout(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CONFIG.API_KEYS.GROQ}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      // Handle different response status codes
      if (response.status === 400) {
        const errorData = await response.json();
        console.error('Groq API 400 error:', errorData);
        
        // Check for specific error types to handle appropriately
        if (errorData?.error?.type === 'invalid_request_error') {
          if (errorData?.error?.message?.includes('context length')) {
            // Handle content too long error by reducing input or tokens
            if (retryCount < CONFIG.RETRY.MAX_ATTEMPTS) {
              // Try again with less tokens or truncated content
              const reducedTokens = Math.floor(maxTokens * 0.8);
              const reducedMessages = messages.map(msg => ({
                ...msg,
                content: msg.role === 'user' ? 
                  this.truncateContent(msg.content, 8000 - (retryCount * 2000)) : 
                  msg.content
              }));
              
              console.log(`Reducing content length and retrying (${retryCount + 1}/${CONFIG.RETRY.MAX_ATTEMPTS})...`);
              await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY.BACKOFF_MS * (retryCount + 1)));
              return this.callGroqAPI(reducedMessages, reducedTokens, retryCount + 1);
            }
          }
        }
        
        // Return a structured error response if we can't recover
        return { 
          error: {
            message: errorData?.error?.message || 'Invalid request error',
            type: errorData?.error?.type || 'invalid_request_error',
            code: errorData?.error?.code || 'unknown'
          }
        };
      } 
      else if (response.status === 429) {
        // Rate limit handling
        if (retryCount < CONFIG.RETRY.MAX_ATTEMPTS) {
          const delay = CONFIG.RETRY.BACKOFF_MS * Math.pow(2, retryCount);
          console.log(`Rate limited, retrying in ${delay}ms (${retryCount + 1}/${CONFIG.RETRY.MAX_ATTEMPTS})...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.callGroqAPI(messages, maxTokens, retryCount + 1);
        }
        throw new Error('Rate limit exceeded after multiple retries');
      }
      else if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(`Groq API error (${response.status}): ${JSON.stringify(errorData)}`);
      }
      
      return await response.json() as GroqResponse;
    } catch (error) {
      if (error instanceof Error) {
        // Network errors or timeouts can be retried
        if (retryCount < CONFIG.RETRY.MAX_ATTEMPTS && 
            (error.message.includes('timeout') || error.message.includes('network'))) {
          console.log(`API call failed with ${error.message}, retrying (${retryCount + 1}/${CONFIG.RETRY.MAX_ATTEMPTS})...`);
          await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY.BACKOFF_MS * (retryCount + 1)));
          return this.callGroqAPI(messages, maxTokens, retryCount + 1);
        }
      }
      throw error;
    }
  }
  
  private static truncateContent(content: string, maxChars: number): string {
    if (content.length <= maxChars) return content;
    
    // For JSON strings, try to preserve JSON structure
    if (content.startsWith('{') && content.endsWith('}')) {
      try {
        const jsonObj = JSON.parse(content);
        
        // If it's a search results array, limit the number of results
        if (jsonObj.length && Array.isArray(jsonObj)) {
          const truncatedArr = jsonObj.slice(0, 5); // Keep only first 5 items
          return JSON.stringify(truncatedArr);
        }
        
        // Otherwise, do simple character truncation
        return content.substring(0, maxChars) + '...';
      } catch (e) {
        // Not valid JSON, do simple truncation
        return content.substring(0, maxChars) + '...';
      }
    }
    
    // Simple truncation for non-JSON content
    return content.substring(0, maxChars) + '...';
  }

  private static async generateTripPlan(
    query: string,
    results: GoogleResult[]
  ): Promise<TripPlan> {
    // Prepare input content - limit to most relevant results if we have too many
    const limitedResults = results.slice(0, 6); // Limit to 6 results to avoid token issues
    
    const data = await this.callGroqAPI([
      { role: 'system', content: TRIP_PLANNING_PROMPT },
      { 
        role: 'user', 
        content: `Analyze these search results for a trip to ${query} and provide a comprehensive travel guide with all budget estimates ONLY in Indian Rupees (₹). Return ONLY valid JSON format with NO explanatory text:\n${JSON.stringify(limitedResults, null, 2)}` 
      }
    ]);
    
    // Handle API errors
    if (data.error) {
      throw new Error(`Groq API error: ${data.error.message || 'Unknown error'}`);
    }
    
    const tripPlanString = data?.choices?.[0]?.message?.content;
    
    if (!tripPlanString) {
      throw new Error('No trip plan generated from Groq API');
    }
    
    try {
      // Make the JSON parsing more resilient
      let cleanedPlanString = tripPlanString;
      
      // Sometimes the API returns JSON with extra text before/after the actual JSON
      const jsonStart = tripPlanString.indexOf('{');
      const jsonEnd = tripPlanString.lastIndexOf('}');
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        cleanedPlanString = tripPlanString.substring(jsonStart, jsonEnd + 1);
      }
      
      const parsedPlan = JSON.parse(cleanedPlanString) as TripPlan;
      
      // Validate and ensure budget is in Indian Rupees
      parsedPlan.budgetEstimates = parsedPlan.budgetEstimates.map(item => {
        // Ensure budget values are numbers
        return {
          ...item,
          lowRange: typeof item.lowRange === 'string' ? parseInt(item.lowRange.replace(/[^\d]/g, ''), 10) : item.lowRange,
          highRange: typeof item.highRange === 'string' ? parseInt(item.highRange.replace(/[^\d]/g, ''), 10) : item.highRange
        };
      });
      
      // Validate other fields and provide defaults if missing
      if (!parsedPlan.itinerary || !Array.isArray(parsedPlan.itinerary)) {
        parsedPlan.itinerary = [];
      }
      
      if (!parsedPlan.topAccommodations || !Array.isArray(parsedPlan.topAccommodations)) {
        parsedPlan.topAccommodations = [];
      }
      
      if (!parsedPlan.topAttractions || !Array.isArray(parsedPlan.topAttractions)) {
        parsedPlan.topAttractions = [];
      }
      
      // Make sure trip plans have at least basic minimum required information
      if (!parsedPlan.destination?.name) {
        parsedPlan.destination = { 
          ...parsedPlan.destination,
          name: query,
          // Set other required fields if missing
          overview: parsedPlan.destination?.overview || `Travel information about ${query}`,
          bestTimeToVisit: parsedPlan.destination?.bestTimeToVisit || [],
          climate: parsedPlan.destination?.climate || '',
          culture: parsedPlan.destination?.culture || '',
          language: parsedPlan.destination?.language || [],
          currency: parsedPlan.destination?.currency || ''
        };
      }
      
      if (!parsedPlan.idealTripLength) {
        parsedPlan.idealTripLength = {
          minimum: 3,  // Sensible defaults
          optimal: 5,
          extended: 7
        };
      }
      
      return parsedPlan;
    } catch (error) {
      console.error("Failed to parse trip plan JSON:", error);
      throw new Error('Invalid trip plan format received from API');
    }
  }

  private static async adjustItineraryForDuration(
    tripPlan: TripPlan, 
    numDays: number
  ): Promise<DayPlan[]> {
    // If current itinerary already matches requested days, return it as is
    if (tripPlan.itinerary.length === numDays) {
      return tripPlan.itinerary;
    }

    // Prepare a minimized version of trip data to reduce token usage
    const currentTripData = {
      destination: {
        name: tripPlan.destination.name,
        overview: tripPlan.destination.overview.substring(0, 300) + '...' // Truncate long texts
      },
      topAttractions: tripPlan.topAttractions.slice(0, 5).map(attraction => ({
        name: attraction.name,
        category: attraction.category
      })),
      topRestaurants: tripPlan.topRestaurants.slice(0, 3).map(restaurant => ({
        name: restaurant.name,
        cuisine: restaurant.cuisine
      })),
      // Include a sample of the existing itinerary for reference
      sampleItinerary: tripPlan.itinerary.slice(0, Math.min(2, tripPlan.itinerary.length))
    };

    const promptWithReplacements = ITINERARY_ADJUSTMENT_PROMPT
      .replace('NUM_DAYS', numDays.toString())
      .replace('CURRENT_TRIP_DATA', JSON.stringify(currentTripData, null, 2));

    const data = await this.callGroqAPI(
      [
        { role: 'system', content: 'You are an expert travel itinerary planner.' },
        { role: 'user', content: promptWithReplacements }
      ],
      3000
    );

    // Handle API errors
    if (data.error) {
      throw new Error(`Groq API error during itinerary adjustment: ${data.error.message || 'Unknown error'}`);
    }

    const itineraryString = data?.choices?.[0]?.message?.content;

    if (!itineraryString) {
      throw new Error('No adjusted itinerary generated');
    }

    try {
      // Make the JSON parsing more resilient
      let cleanedItineraryString = itineraryString;
      
      // Sometimes the API returns JSON with extra text before/after the actual JSON
      const jsonStart = itineraryString.indexOf('[');
      const jsonEnd = itineraryString.lastIndexOf(']');
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        cleanedItineraryString = itineraryString.substring(jsonStart, jsonEnd + 1);
      }
      
      let parsedItinerary: DayPlan[];
      
      try {
        parsedItinerary = JSON.parse(cleanedItineraryString) as DayPlan[];
      } catch (e) {
        // If parsing as array fails, try parsing as object with an itinerary property
        try {
          const objectWithItinerary = JSON.parse(cleanedItineraryString) as { itinerary?: DayPlan[] };
          if (objectWithItinerary.itinerary && Array.isArray(objectWithItinerary.itinerary)) {
            parsedItinerary = objectWithItinerary.itinerary;
          } else {
            throw new Error('Parsed object doesn\'t contain valid itinerary array');
          }
        } catch (e2) {
          console.error("Both parsing attempts failed:", e2);
          throw new Error('Could not parse itinerary JSON');
        }
      }
      
      // Validate the itinerary has the correct number of days
      if (!Array.isArray(parsedItinerary)) {
        throw new Error('Generated itinerary is not an array');
      }
      
      // If we didn't get the exact number of days requested, pad or trim the itinerary
      if (parsedItinerary.length < numDays) {
        // Pad with empty days
        const lastDay = parsedItinerary[parsedItinerary.length - 1];
        for (let i = parsedItinerary.length; i < numDays; i++) {
          parsedItinerary.push({
            day: i + 1,
            activities: {
              morning: "Free time to explore local area",
              afternoon: "Optional visit to nearby attractions",
              evening: "Dinner and relaxation"
            },
            meals: {
              breakfast: "Breakfast at accommodation",
              lunch: "Lunch at local restaurant",
              dinner: "Dinner at recommended restaurant"
            },
            transportation: lastDay?.transportation || "Local transportation options",
            tips: ["Plan according to your preferences", "Book any must-visit attractions in advance"]
          });
        }
      } else if (parsedItinerary.length > numDays) {
        // Trim excess days
        parsedItinerary = parsedItinerary.slice(0, numDays);
      }
      
      // Ensure day numbers are sequential
      return parsedItinerary.map((dayPlan, index) => ({
        ...dayPlan,
        day: index + 1,
        // Ensure all required fields exist
        activities: {
          morning: dayPlan.activities?.morning || "Free time",
          afternoon: dayPlan.activities?.afternoon || "Exploration",
          evening: dayPlan.activities?.evening || "Relaxation"
        },
        meals: dayPlan.meals || {},
        transportation: dayPlan.transportation || "Local transportation",
        tips: Array.isArray(dayPlan.tips) ? dayPlan.tips : ["Enjoy your day"]
      }));
    } catch (error) {
      console.error("Failed to parse adjusted itinerary:", error);
      throw new Error('Invalid itinerary format received');
    }
  }

  public static async planTrip(destination: string): Promise<TripPlanningData> {
    if (!destination.trim()) {
      return { success: false, error: 'Destination query cannot be empty' };
    }
    
    try {
      // Check cache first
      const cachedResult = this.cachedPlans.get(destination);
      if (cachedResult) {
        return { ...cachedResult };
      }
      
      // Check for ongoing request
      const activeRequest = this.activeRequests.get(destination);
      if (activeRequest) {
        return activeRequest;
      }
      
      this.validateConfiguration();
      
      const newRequest = (async () => {
        try {
          // Implement proper error handling with more detailed error messages
          let results: GoogleResult[];
          try {
            results = await this.fetchGoogleResults(destination);
            
            if (results.length === 0) {
              return { success: false, error: 'No search results found for this destination' };
            }
          } catch (error) {
            console.error("Google search error:", error);
            return { 
              success: false, 
              error: error instanceof Error 
                ? `Search failed: ${error.message}` 
                : 'Search failed: Unknown error occurred'
            };
          }
          
          let tripPlan: TripPlan;
          try {
            tripPlan = await this.generateTripPlan(destination, results);
          } catch (error) {
            console.error("Trip plan generation error:", error);
            
            // Provide more specific error messages based on error type
            if (error instanceof Error) {
              const errorMsg = error.message;
              
              if (errorMsg.includes('400')) {
                return { 
                  success: false, 
                  error: `API error (400): The request to generate the trip plan was invalid. This could be due to rate limits, input size, or formatting issues.` 
                };
              } else if (errorMsg.includes('429')) {
                return { 
                  success: false, 
                  error: `Rate limit exceeded (429): Too many requests to the API. Please try again later.` 
                };
              } else if (errorMsg.includes('token')) {
                return { 
                  success: false, 
                  error: `Token limit exceeded: The destination information is too extensive for processing. Try a more specific query.` 
                };
              } else {
                return { 
                  success: false, 
                  error: `Trip plan generation failed: ${errorMsg}` 
                };
              }
            }
            
            return { 
              success: false, 
              error: 'Trip plan generation failed: Unknown error occurred' 
            };
          }
          
          const response: TripPlanningData = {
            success: true,
            data: {
              results,
              tripPlan,
              timestamp: new Date().toISOString(),
            },
          };
          
          // Cache the result
          this.cachedPlans.set(destination, { ...response });
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

  public static async adjustTripDuration(
    destination: string, 
    numDays: number
  ): Promise<TripPlanningData> {
    try {
      // First ensure we have a trip plan for this destination
      let tripData = this.cachedPlans.get(destination);
      
      if (!tripData?.success || !tripData.data) {
        // If not cached, generate a new trip plan
        tripData = await this.planTrip(destination);
        
        if (!tripData.success || !tripData.data) {
          return tripData; // Return error from planTrip
        }
      }
      
      const cacheKey = `${destination}_${numDays}days`;
      // Check if we already have this specific duration cached
      const cachedDurationPlan = this.cachedPlans.get(cacheKey);
      if (cachedDurationPlan) {
        return cachedDurationPlan;
      }
      
      // Create a copy of the trip data to modify
      const updatedTripData: TripPlanningData = {
        success: true,
        data: {
          ...tripData.data!,
          tripPlan: {
            ...tripData.data!.tripPlan
          },
          timestamp: new Date().toISOString()
        }
      };
      
      // Adjust the itinerary for the requested duration
      try {
        const adjustedItinerary = await this.adjustItineraryForDuration(
          updatedTripData.data!.tripPlan, 
          numDays
        );
        
        // Update the trip plan with the new itinerary
        updatedTripData.data!.tripPlan.itinerary = adjustedItinerary;
        
        // Cache the updated plan
        this.cachedPlans.set(cacheKey, { ...updatedTripData });
        
        return updatedTripData;
      } catch (error) {
        console.error("Failed to adjust itinerary:", error);
        
        // If the adjustment fails but we have a valid trip plan, 
        // we can still return a workable result by manually extending/shrinking the itinerary
        if (updatedTripData.data?.tripPlan.itinerary) {
          const currentItinerary = updatedTripData.data.tripPlan.itinerary;
          
          if (currentItinerary.length > numDays) {
            // Simple truncation for shorter trips
            updatedTripData.data.tripPlan.itinerary = currentItinerary.slice(0, numDays);
          } else if (currentItinerary.length < numDays) {
            // Simple extension for longer trips by duplicating the last day with modifications
            const lastDay = currentItinerary[currentItinerary.length - 1];
            const extendedItinerary = [...currentItinerary];
            
            for (let i = currentItinerary.length; i < numDays; i++) {
              extendedItinerary.push({
                day: i + 1,
                activities: {
                  morning: "Free time for exploration",
                  afternoon: "Visit to local attractions of your choice",
                  evening: "Dinner and relaxation"
                },
                meals: {
                  breakfast: lastDay.meals.breakfast,
                  lunch: "Lunch at local restaurant",
                  dinner: "Dinner at recommended restaurant"
                },
                transportation: lastDay.transportation,
                tips: ["Plan according to your interests", "Consider revisiting favorite spots"]
              });
            }
            
            updatedTripData.data.tripPlan.itinerary = extendedItinerary;
          }
          
          // Cache this fallback plan
          this.cachedPlans.set(cacheKey, { ...updatedTripData });
          return updatedTripData;
        }
        
        // If we can't create a valid fallback, return error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return { 
          success: false, 
          error: `Failed to adjust trip duration: ${errorMessage}` 
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Trip duration adjustment error:', error);
      return { success: false, error: errorMessage };
    }
  }

  public static async bookTrip(bookingDetails: BookingDetails): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    try {
      // Validate basic booking requirements
      if (!bookingDetails.destination || !bookingDetails.durationDays) {
        return { 
          success: false, 
          error: 'Booking requires at least a destination and duration' 
        };
      }
      
      // Additional validation
      if (bookingDetails.durationDays < 1 || bookingDetails.durationDays > 30) {
        return {
          success: false,
          error: 'Trip duration must be between 1 and 30 days'
        };
      }
      
      if (bookingDetails.startDate && bookingDetails.startDate < new Date()) {
        return {
          success: false,
          error: 'Start date cannot be in the past'
        };
      }
      
      if (bookingDetails.numberOfTravelers && (bookingDetails.numberOfTravelers < 1 || bookingDetails.numberOfTravelers > 50)) {
        return {
          success: false,
          error: 'Number of travelers must be between 1 and 50'
        };
      }
      
      // In a real implementation, you would connect to a booking service API here
      // For now, simulate a successful booking with error handling
      
      // Simulate potential booking service errors
      if (Math.random() < 0.05) { // 5% chance of a simulated error
        return {
          success: false,
          error: 'Booking service temporarily unavailable. Please try again later.'
        };
      }
      
      // Generate a mock booking ID
      const bookingId = `BK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      // Simulate API delay with some variability
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      
      return { 
        success: true, 
        bookingId: bookingId 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Trip booking error:', error);
      return { 
        success: false, 
        error: `Booking failed: ${errorMessage}` 
      };
    }
  }

  // Clear cache for testing or memory management
  public static clearCache(destination?: string): void {
    if (destination) {
      // Clear specific destination
      this.cachedPlans.delete(destination);
      
      // Also clear any duration-specific caches for this destination
      const keysToDelete: string[] = [];
      
      this.cachedPlans.forEach((_, key) => {
        if (key.startsWith(`${destination}_`)) {
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => this.cachedPlans.delete(key));
    } else {
      // Clear all cache
      this.cachedPlans.clear();
    }
  }
}

// React hook with enhanced functionality
export const useTripPlanner = () => {
  const [tripData, setTripData] = useState<TripPlanningData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [bookingStatus, setBookingStatus] = useState<{
    isBooking: boolean;
    success?: boolean;
    bookingId?: string;
    error?: string;
  }>({ isBooking: false });

  const planTrip = async (destination: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await TripPlanningService.planTrip(destination);
      setTripData(result);
      
      // Set the initial selected duration to the optimal trip length
      if (result.success && result.data?.tripPlan.idealTripLength) {
        setSelectedDuration(result.data.tripPlan.idealTripLength.optimal);
        
        // Initialize booking details
        setBookingDetails({
          destination: destination,
          durationDays: result.data.tripPlan.idealTripLength.optimal
        });
      } else if (!result.success) {
        // Set error message from the service response
        setError(result.error || 'Failed to plan trip');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const changeTripDuration = async (numDays: number) => {
    if (!tripData?.success || !tripData.data) {
      setError('No trip data available to adjust');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const destination = tripData.data.tripPlan.destination.name;
      const result = await TripPlanningService.adjustTripDuration(destination, numDays);
      
      if (result.success) {
        setTripData(result);
        setSelectedDuration(numDays);
        
        // Update booking details with new duration
        setBookingDetails(prev => 
          prev ? { ...prev, durationDays: numDays } : { destination, durationDays: numDays }
        );
      } else {
        setError(result.error || 'Failed to adjust trip duration');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingDetails = (details: Partial<BookingDetails>) => {
    setBookingDetails(prev => prev ? { ...prev, ...details } : null);
  };

  const bookTrip = async (additionalDetails?: Partial<BookingDetails>) => {
    if (!bookingDetails) {
      const errorMessage = 'No booking details available';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
    
    const finalBookingDetails = {
      ...bookingDetails,
      ...additionalDetails
    };
    
    setBookingStatus({ isBooking: true });
    setError(null);
    
    try {
      const result = await TripPlanningService.bookTrip(finalBookingDetails);
      
      setBookingStatus({
        isBooking: false,
        success: result.success,
        bookingId: result.bookingId,
        error: result.error
      });
      
      if (!result.success) {
        setError(result.error || 'Booking failed');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setBookingStatus({
        isBooking: false,
        success: false,
        error: errorMessage
      });
      
      setError(errorMessage);
      
      return { success: false, error: errorMessage };
    }
  };

  const clearTripData = () => {
    setTripData(null);
    setError(null);
    setSelectedDuration(null);
    setBookingDetails(null);
    setBookingStatus({ isBooking: false });
  };

  // Calculate available duration options based on the trip plan
  const getDurationOptions = () => {
    if (!tripData?.success || !tripData.data?.tripPlan.idealTripLength) {
      return [];
    }
    
    const { minimum, optimal, extended } = tripData.data.tripPlan.idealTripLength;
    
    // Create an array of options ranging from minimum to extended
    const options = [];
    for (let i = minimum; i <= extended; i++) {
      options.push({
        value: i,
        label: `${i} Days`,
        isRecommended: i === optimal
      });
    }
    
    return options;
  };

  // New method to retry in case of failure
  const retryPlanTrip = async (destination: string) => {
    // Clear any cached data for this destination to force a fresh attempt
    TripPlanningService.clearCache(destination);
    return planTrip(destination);
  };

  return {
    tripData,
    planTrip,
    clearTripData,
    isLoading,
    error,
    selectedDuration,
    durationOptions: getDurationOptions(),
    changeTripDuration,
    bookingDetails,
    updateBookingDetails,
    bookTrip,
    bookingStatus,
    retryPlanTrip // Added retry method
  };
};
