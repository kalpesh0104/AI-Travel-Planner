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

  private static async adjustItineraryForDuration(
    tripPlan: TripPlan, 
    numDays: number
  ): Promise<DayPlan[]> {
    // If current itinerary already matches requested days, return it as is
    if (tripPlan.itinerary.length === numDays) {
      return tripPlan.itinerary;
    }

    // Prepare prompt with current trip data but without the full itinerary
    const currentTripData = {
      destination: tripPlan.destination,
      topAttractions: tripPlan.topAttractions,
      topRestaurants: tripPlan.topRestaurants,
      recommendations: tripPlan.recommendations,
      // Include a sample of the existing itinerary for reference
      sampleItinerary: tripPlan.itinerary.slice(0, Math.min(3, tripPlan.itinerary.length))
    };

    const promptWithReplacements = ITINERARY_ADJUSTMENT_PROMPT
      .replace('NUM_DAYS', numDays.toString())
      .replace('CURRENT_TRIP_DATA', JSON.stringify(currentTripData, null, 2));

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
            { role: 'system', content: 'You are an expert travel itinerary planner.' },
            { role: 'user', content: promptWithReplacements }
          ],
          temperature: 0.7,
          max_tokens: 3000,
          response_format: { type: 'json_object' },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to adjust itinerary: ${response.statusText}`);
    }

    const data = await response.json() as GroqResponse;
    const itineraryString = data?.choices?.[0]?.message?.content;

    if (!itineraryString) {
      throw new Error('No adjusted itinerary generated');
    }

    try {
      const parsedItinerary = JSON.parse(itineraryString) as DayPlan[];
      
      // Validate the itinerary has the correct number of days
      if (!Array.isArray(parsedItinerary) || parsedItinerary.length !== numDays) {
        throw new Error(`Generated itinerary doesn't have the requested ${numDays} days`);
      }
      
      // Ensure day numbers are sequential
      return parsedItinerary.map((dayPlan, index) => ({
        ...dayPlan,
        day: index + 1
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
      const adjustedItinerary = await this.adjustItineraryForDuration(
        updatedTripData.data!.tripPlan, 
        numDays
      );
      
      // Update the trip plan with the new itinerary
      updatedTripData.data!.tripPlan.itinerary = adjustedItinerary;
      
      // Cache the updated plan (but don't overwrite the original)
      const cacheKey = `${destination}_${numDays}days`;
      this.cachedPlans.set(cacheKey, { ...updatedTripData });
      
      return updatedTripData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Trip duration adjustment error:', error);
      return { success: false, error: errorMessage };
    }
  }

  public static async bookTrip(bookingDetails: BookingDetails): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    try {
      // This would typically connect to a booking service API
      // For now, we'll simulate a successful booking
      
      // Validate basic booking requirements
      if (!bookingDetails.destination || !bookingDetails.durationDays) {
        return { 
          success: false, 
          error: 'Booking requires at least a destination and duration' 
        };
      }
      
      // Generate a mock booking ID
      const bookingId = `BK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      // In a real implementation, you would:
      // 1. Connect to a booking service API
      // 2. Send the booking details
      // 3. Process payment
      // 4. Return the booking confirmation
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { 
        success: true, 
        bookingId: bookingId 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Trip booking error:', error);
      return { success: false, error: errorMessage };
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
      setError('No booking details available');
      return { success: false, error: 'No booking details available' };
    }
    
    const finalBookingDetails = {
      ...bookingDetails,
      ...additionalDetails
    };
    
    setBookingStatus({ isBooking: true });
    
    try {
      const result = await TripPlanningService.bookTrip(finalBookingDetails);
      
      setBookingStatus({
        isBooking: false,
        success: result.success,
        bookingId: result.bookingId,
        error: result.error
      });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setBookingStatus({
        isBooking: false,
        success: false,
        error: errorMessage
      });
      
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

  return {
    tripData,
    planTrip,
    clearTripData,
    isLoading,
    error,
    // New functionality
    selectedDuration,
    durationOptions: getDurationOptions(),
    changeTripDuration,
    bookingDetails,
    updateBookingDetails,
    bookTrip,
    bookingStatus
  };
};