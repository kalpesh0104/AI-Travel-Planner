"use client";

import React, { useState, useEffect } from "react";
import { 
  Map, Calendar, Utensils, Hotel, 
  AlertTriangle, Camera, DollarSign, Compass,
  Globe, Sun, Wind, Users, Bookmark
} from "lucide-react"; 
import { useTripPlanner } from "../api/travel-planner";

// Type definitions
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

interface DestinationInfo {
  name: string;
  language: string[];
  currency: string;
  climate: string;
  bestTimeToVisit: string[];
  overview?: string;
  culture?: string;
}

interface TripPlan {
  destination: DestinationInfo;
  executiveSummary: string;
  idealTripLength: {
    minimum: number;
    optimal: number;
    extended: number;
  };
  recommendations: {
    mustSee: string[];
    hiddenGems: string[];
    photospots: string[];
    familyFriendly?: string[];
    soloTraveler?: string[];
  };
  budgetEstimates: BudgetEstimate[];
  topAccommodations: Accommodation[];
  topAttractions: Attraction[];
  topRestaurants: Restaurant[];
  travelAdvisories: TravelAdvisory[];
  localCustoms: string[];
  packingRecommendations: string[];
  itinerary: DayPlan[];
}

// Section title component
const SectionTitle = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-4 mt-8">
    <div className="bg-gray-800 p-2 rounded-lg">
      {icon}
    </div>
    <h2 className="text-xl font-bold">{title}</h2>
  </div>
);

// Card component
const Card = ({ children, className = "" }) => (
  <div className={`bg-gray-900/90 border border-gray-800 rounded-lg p-5 shadow-lg ${className}`}>
    {children}
  </div>
);

// AccommodationCard component
const AccommodationCard = ({ accommodation }) => (
  <Card>
    <div className="flex items-start gap-3 mb-3">
      <Hotel className="w-5 h-5 text-gray-400 mt-1" />
      <div>
        <h3 className="text-lg font-semibold">{accommodation.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium bg-gray-800 px-2 py-0.5 rounded">{accommodation.type}</span>
          <span className="text-sm text-gray-300">{accommodation.priceRange}</span>
        </div>
      </div>
    </div>
    <div className="space-y-3">
      <p className="text-sm">{accommodation.description}</p>
      
      <div className="mt-3">
        <h4 className="text-sm font-semibold mb-2">Highlights</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          {accommodation.highlights.map((highlight, idx) => (
            <li key={idx}>{highlight}</li>
          ))}
        </ul>
      </div>
      
      <div className="mt-2">
        <h4 className="text-sm font-semibold mb-2">Best For</h4>
        <div className="flex flex-wrap gap-2">
          {accommodation.bestFor.map((type, idx) => (
            <span key={idx} className="text-xs px-2 py-1 bg-gray-800 rounded-full">
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  </Card>
);

// AttractionCard component
const AttractionCard = ({ attraction }) => (
  <Card>
    <div className="flex items-start gap-3 mb-3">
      <Compass className="w-5 h-5 text-gray-400 mt-1" />
      <div>
        <h3 className="text-lg font-semibold">{attraction.name}</h3>
        <span className="text-sm font-medium bg-gray-800 px-2 py-0.5 rounded">{attraction.category}</span>
      </div>
    </div>
    
    <div className="space-y-3">
      <p className="text-sm">{attraction.description}</p>
      
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-gray-800 p-3 rounded">
          <h4 className="text-sm font-semibold">Visit Length</h4>
          <p className="text-sm">{attraction.idealVisitLength}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <h4 className="text-sm font-semibold">Best Time</h4>
          <p className="text-sm">{attraction.bestTimeToVisit}</p>
        </div>
      </div>
      
      <div className="mt-2">
        <h4 className="text-sm font-semibold mb-2">Travel Tips</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          {attraction.travelTips.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  </Card>
);

// RestaurantCard component
const RestaurantCard = ({ restaurant }) => (
  <Card>
    <div className="flex items-start gap-3 mb-3">
      <Utensils className="w-5 h-5 text-gray-400 mt-1" />
      <div>
        <h3 className="text-lg font-semibold">{restaurant.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium bg-gray-800 px-2 py-0.5 rounded">{restaurant.cuisine}</span>
          <span className="text-sm text-gray-300">{restaurant.priceRange}</span>
        </div>
      </div>
    </div>
    
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">Specialty</h4>
        <p className="text-sm">{restaurant.specialty}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-semibold">Atmosphere</h4>
        <p className="text-sm">{restaurant.atmosphere}</p>
      </div>
      
      {restaurant.localRecommendation && (
        <div className="bg-gray-800 px-3 py-1.5 rounded-md text-sm inline-block">
          Local Recommendation
        </div>
      )}
    </div>
  </Card>
);

// Main component
const DestinationImages = ({ destination }) => {
  // Use the trip planner hook from the service
  const { tripData, planTrip, isLoading, error } = useTripPlanner();
  const [tripPlan, setTripPlan] = useState(null);
  
  // Fetch data once when destination changes
  useEffect(() => {
    const fetchData = async () => {
      if (!destination) return;
      
      try {
        const result = await planTrip(destination);
        if (result.success && result.data) {
          setTripPlan(result.data.tripPlan);
        }
      } catch (err) {
        console.error("Error fetching trip data:", err);
      }
    };
    
    fetchData();
  }, [destination, planTrip]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-12 h-12 border-4 border-gray-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg text-center">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p>{error}</p>
      </div>
    );
  }

  if (!tripPlan) {
    return null;
  }

  const getAverageBudget = (estimates) => {
    if (!estimates || estimates.length === 0) return 0;
    const total = estimates.reduce((sum, item) => sum + (item.lowRange + item.highRange) / 2, 0);
    return Math.round(total / estimates.length);
  };

  return (
    <div className="space-y-8 w-full mx-auto px-4">
      {/* Destination Overview */}
      <section className="mb-8">
        <Card className="bg-gradient-to-r from-gray-900 to-black border border-gray-800">
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">{tripPlan.destination.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center gap-1 text-xs bg-gray-800 px-2 py-1 rounded-full">
                  <Globe className="w-3 h-3" />
                  <span>{tripPlan.destination.language.join(", ")}</span>
                </div>
                <div className="flex items-center gap-1 text-xs bg-gray-800 px-2 py-1 rounded-full">
                  <DollarSign className="w-3 h-3" />
                  <span>{tripPlan.destination.currency}</span>
                </div>
                <div className="flex items-center gap-1 text-xs bg-gray-800 px-2 py-1 rounded-full">
                  <Sun className="w-3 h-3" />
                  <span>{tripPlan.destination.climate}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3">
              <h3 className="font-semibold mb-2 text-sm">Recommended Trip Length</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-700 rounded p-2">
                  <div className="text-lg font-bold">{tripPlan.idealTripLength.minimum}</div>
                  <div className="text-xs">Min</div>
                </div>
                <div className="bg-white text-black rounded p-2">
                  <div className="text-lg font-bold">{tripPlan.idealTripLength.optimal}</div>
                  <div className="text-xs">Ideal</div>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <div className="text-lg font-bold">{tripPlan.idealTripLength.extended}</div>
                  <div className="text-xs">Extended</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-3">
              <h3 className="text-lg font-semibold mb-2">Overview</h3>
              <p className="text-sm">{tripPlan.executiveSummary}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Best Time</h3>
              <ul className="space-y-1 text-sm">
                {tripPlan.destination.bestTimeToVisit.map((time, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="bg-gray-800 p-1 rounded">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <span>{time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-3">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Must See
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {tripPlan.recommendations.mustSee.map((item, idx) => (
                  <div key={idx} className="bg-gray-700 rounded-lg p-2">
                    <p className="text-xs">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Hidden Gems
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {tripPlan.recommendations.hiddenGems.map((item, idx) => (
                  <div key={idx} className="bg-gray-700 rounded-lg p-2">
                    <p className="text-xs">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>
      
      {/* Budget Overview */}
      <SectionTitle icon={<DollarSign className="w-5 h-5 text-white" />} title="Budget" />
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm">Average Daily Cost</span>
              <span className="font-bold text-lg">₹{getAverageBudget(tripPlan.budgetEstimates)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div className="bg-white h-1.5 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm">Recommended Budget</span>
              <span className="font-bold text-lg">₹{getAverageBudget(tripPlan.budgetEstimates) * tripPlan.idealTripLength.optimal}</span>
            </div>
            <div className="text-xs opacity-80">For {tripPlan.idealTripLength.optimal} days</div>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tripPlan.budgetEstimates.map((budget, idx) => (
          <Card key={idx}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm">{budget.category}</h3>
              <div className="flex items-center bg-gray-800 px-2 py-0.5 rounded-full text-xs">
                <span>₹{budget.lowRange} - ₹{budget.highRange}</span>
              </div>
            </div>
            <p className="text-xs opacity-80">{budget.notes}</p>
          </Card>
        ))}
      </div>
      
      {/* Accommodations */}
      <SectionTitle icon={<Hotel className="w-5 h-5 text-white" />} title="Where to Stay" />
      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4">
        {tripPlan.topAccommodations.map((accommodation, idx) => (
          <AccommodationCard key={idx} accommodation={accommodation} />
        ))}
      </div>
      
      {/* Attractions */}
      <SectionTitle icon={<Compass className="w-5 h-5 text-white" />} title="Attractions" />
      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 mb-6">
        {tripPlan.topAttractions.map((attraction, idx) => (
          <AttractionCard key={idx} attraction={attraction} />
        ))}
      </div>
      
      {/* Restaurants */}
      <SectionTitle icon={<Utensils className="w-5 h-5 text-white" />} title="Where to Eat" />
      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4">
        {tripPlan.topRestaurants.map((restaurant, idx) => (
          <RestaurantCard key={idx} restaurant={restaurant} />
        ))}
      </div>
      
      {/* Local Tips */}
      <SectionTitle icon={<Users className="w-5 h-5 text-white" />} title="Local Tips" />
      <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4">
        {tripPlan.localCustoms.map((custom, idx) => (
          <Card key={idx} className="border-l-4 border-gray-500">
            <p className="text-sm">{custom}</p>
          </Card>
        ))}
      </div>
      
      {/* Safety */}
      <SectionTitle icon={<AlertTriangle className="w-5 h-5 text-white" />} title="Travel Advisories" />
      <div className="space-y-3">
        {tripPlan.travelAdvisories.map((advisory, idx) => {
          const severityColors = {
            low: "bg-gray-800 border-gray-600 text-gray-300",
            medium: "bg-gray-800 border-gray-500 text-gray-300",
            high: "bg-gray-800 border-gray-400 text-gray-300"
          };
          
          return (
            <div key={idx} className={`${severityColors[advisory.severity]} border rounded-lg p-3`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">{advisory.type}</h3>
                  <p className="text-xs mb-2">{advisory.description}</p>
                  <div className="bg-black/30 p-2 rounded-md text-xs">
                    <strong>Recommendation:</strong> {advisory.recommendation}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DestinationImages;