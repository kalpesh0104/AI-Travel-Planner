"use client";

import React, { useState, memo } from "react";
import { 
  Map, Calendar, Utensils, Hotel, 
  AlertTriangle, Camera, DollarSign, Compass,
  Globe, Sun, Wind, Users, Bookmark
} from "lucide-react"; 
import "@/app/styles/travel.css";
import { useTripPlanner } from "@/app/api/travel-planner";

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

// Section title component
const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="bg-blue-600 p-2 rounded-lg">
      {icon}
    </div>
    <h2 className="text-2xl font-bold">{title}</h2>
  </div>
);

// Main Card component
const Card = memo(({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/10 backdrop-blur-lg rounded-lg p-6 shadow-lg ${className}`}>
    {children}
  </div>
));

Card.displayName = 'Card';

// AccommodationCard component
const AccommodationCard = memo(({ accommodation }: { accommodation: Accommodation }) => (
  <Card>
    <div className="flex items-start gap-3 mb-4">
      <Hotel className="w-5 h-5 text-blue-400 mt-1" />
      <div>
        <h3 className="text-xl font-semibold">{accommodation.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium bg-blue-900/40 px-2 py-0.5 rounded">{accommodation.type}</span>
          <span className="text-sm text-blue-300">{accommodation.priceRange}</span>
        </div>
      </div>
    </div>
    <div className="space-y-3">
      <div dangerouslySetInnerHTML={{ __html: accommodation.description }} />
      
      <div className="mt-4">
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
            <span key={idx} className="text-xs px-2 py-1 bg-blue-900/30 rounded-full">
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  </Card>
));

AccommodationCard.displayName = 'AccommodationCard';

// AttractionCard component
const AttractionCard = memo(({ attraction }: { attraction: Attraction }) => (
  <Card>
    <div className="flex items-start gap-3 mb-4">
      <Compass className="w-5 h-5 text-teal-400 mt-1" />
      <div>
        <h3 className="text-xl font-semibold">{attraction.name}</h3>
        <span className="text-sm font-medium bg-teal-900/40 px-2 py-0.5 rounded">{attraction.category}</span>
      </div>
    </div>
    
    <div className="space-y-3">
      <div dangerouslySetInnerHTML={{ __html: attraction.description }} />
      
      <div className="grid grid-cols-2 gap-4 mt-3">
        <div className="bg-black/20 p-3 rounded">
          <h4 className="text-sm font-semibold">Visit Length</h4>
          <p className="text-sm">{attraction.idealVisitLength}</p>
        </div>
        <div className="bg-black/20 p-3 rounded">
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
));

AttractionCard.displayName = 'AttractionCard';

// RestaurantCard component
const RestaurantCard = memo(({ restaurant }: { restaurant: Restaurant }) => (
  <Card>
    <div className="flex items-start gap-3 mb-4">
      <Utensils className="w-5 h-5 text-orange-400 mt-1" />
      <div>
        <h3 className="text-xl font-semibold">{restaurant.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium bg-orange-900/40 px-2 py-0.5 rounded">{restaurant.cuisine}</span>
          <span className="text-sm text-orange-300">{restaurant.priceRange}</span>
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
        <div className="bg-emerald-900/30 text-emerald-300 px-3 py-1.5 rounded-md text-sm inline-block">
          Local Recommendation
        </div>
      )}
    </div>
  </Card>
));

RestaurantCard.displayName = 'RestaurantCard';

// ItineraryDayCard component
const ItineraryDayCard = memo(({ dayPlan }: { dayPlan: DayPlan }) => (
  <Card>
    <div className="flex items-start gap-3 mb-4">
      <Calendar className="w-5 h-5 text-purple-400 mt-1" />
      <h3 className="text-xl font-semibold">Day {dayPlan.day}</h3>
    </div>
    
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold mb-2">Activities</h4>
        <div className="space-y-2">
          <div className="bg-orange-500/20 rounded-lg p-3">
            <span className="text-xs font-medium text-orange-300 px-2 py-0.5 bg-orange-900/50 rounded">Morning</span>
            <p className="text-sm mt-2">{dayPlan.activities.morning}</p>
          </div>
          <div className="bg-yellow-500/20 rounded-lg p-3">
            <span className="text-xs font-medium text-yellow-300 px-2 py-0.5 bg-yellow-900/50 rounded">Afternoon</span>
            <p className="text-sm mt-2">{dayPlan.activities.afternoon}</p>
          </div>
          <div className="bg-blue-500/20 rounded-lg p-3">
            <span className="text-xs font-medium text-blue-300 px-2 py-0.5 bg-blue-900/50 rounded">Evening</span>
            <p className="text-sm mt-2">{dayPlan.activities.evening}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-semibold mb-2">Meals</h4>
        <div className="grid grid-cols-3 gap-2">
          {dayPlan.meals.breakfast && (
            <div className="bg-black/20 p-3 rounded">
              <span className="text-xs font-medium block mb-1">Breakfast</span>
              <p className="text-sm">{dayPlan.meals.breakfast}</p>
            </div>
          )}
          {dayPlan.meals.lunch && (
            <div className="bg-black/20 p-3 rounded">
              <span className="text-xs font-medium block mb-1">Lunch</span>
              <p className="text-sm">{dayPlan.meals.lunch}</p>
            </div>
          )}
          {dayPlan.meals.dinner && (
            <div className="bg-black/20 p-3 rounded">
              <span className="text-xs font-medium block mb-1">Dinner</span>
              <p className="text-sm">{dayPlan.meals.dinner}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-black/20 p-3 rounded">
        <h4 className="text-sm font-semibold">Transportation</h4>
        <p className="text-sm">{dayPlan.transportation}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-semibold mb-1">Tips</h4>
        <ul className="list-disc list-inside text-sm bg-black/20 p-3 rounded">
          {dayPlan.tips.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  </Card>
));

ItineraryDayCard.displayName = 'ItineraryDayCard';

// AdvisoryCard component
const AdvisoryCard = memo(({ advisory }: { advisory: TravelAdvisory }) => {
  const severityColors = {
    low: "bg-green-800/20 border-green-600/50 text-green-400",
    medium: "bg-yellow-800/20 border-yellow-600/50 text-yellow-400",
    high: "bg-red-800/20 border-red-600/50 text-red-400"
  };
  
  return (
    <div className={`${severityColors[advisory.severity]} border rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold mb-1">{advisory.type}</h3>
          <p className="text-sm mb-2">{advisory.description}</p>
          <div className="bg-black/20 p-3 rounded-md text-sm">
            <strong>Recommendation:</strong> {advisory.recommendation}
          </div>
        </div>
      </div>
    </div>
  );
});

AdvisoryCard.displayName = 'AdvisoryCard';

// BudgetCard component
const BudgetCard = memo(({ budgetEstimate }: { budgetEstimate: BudgetEstimate }) => (
  <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 shadow-lg">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-medium">{budgetEstimate.category}</h3>
      <div className="flex items-center bg-blue-900/30 px-3 py-1 rounded-full">
        <DollarSign className="w-4 h-4 mr-1" />
        <span>${budgetEstimate.lowRange} - ${budgetEstimate.highRange}</span>
      </div>
    </div>
    <p className="text-sm opacity-80">{budgetEstimate.notes}</p>
  </div>
));

BudgetCard.displayName = 'BudgetCard';

// Main component
const TripPlannerDashboard = ({ destination = "" }: { destination?: string }) => {
  const { tripData, planTrip, isLoading, error } = useTripPlanner();
  const [searchQuery, setSearchQuery] = useState(destination);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await planTrip(searchQuery);
    }
  };

  const getAverageBudget = (estimates: BudgetEstimate[]) => {
    if (!estimates || estimates.length === 0) return 0;
    const total = estimates.reduce((sum, item) => sum + (item.lowRange + item.highRange) / 2, 0);
    return Math.round(total / estimates.length);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white" />
      </div>
    );
  }

  const tripPlan = tripData?.data?.tripPlan;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-b from-blue-950 to-purple-950 min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-6 text-center text-white">Travel Explorer</h1>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center">
            <div className="relative flex-grow">
              <Compass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Where do you want to go?"
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-lg"
              disabled={isLoading}
            >
              Plan Trip
            </button>
          </div>
        </form>
        
        {error && (
          <div className="text-center text-red-500 p-4 mb-6 bg-red-900/20 rounded-lg max-w-2xl mx-auto">
            {error}
          </div>
        )}
      </header>

      {tripPlan && (
        <div className="space-y-16">
          {/* Destination Overview */}
          <section>
            <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 rounded-xl p-8 shadow-lg border border-blue-800/30">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-5xl font-bold mb-2 text-white">{tripPlan.destination.name}</h1>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <div className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded-full">
                      <Globe className="w-4 h-4" />
                      <span>{tripPlan.destination.language.join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded-full">
                      <DollarSign className="w-4 h-4" />
                      <span>{tripPlan.destination.currency}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded-full">
                      <Sun className="w-4 h-4" />
                      <span>{tripPlan.destination.climate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Recommended Trip Length</h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white/10 rounded p-2">
                      <div className="text-xl font-bold">{tripPlan.idealTripLength.minimum}</div>
                      <div className="text-xs">Minimum</div>
                    </div>
                    <div className="bg-blue-600 rounded p-2">
                      <div className="text-xl font-bold">{tripPlan.idealTripLength.optimal}</div>
                      <div className="text-xs">Optimal</div>
                    </div>
                    <div className="bg-white/10 rounded p-2">
                      <div className="text-xl font-bold">{tripPlan.idealTripLength.extended}</div>
                      <div className="text-xs">Extended</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="md:col-span-3">
                  <h3 className="text-xl font-semibold mb-3">Overview</h3>
                  <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: tripPlan.executiveSummary }} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Best Time to Visit</h3>
                  <ul className="space-y-2">
                    {tripPlan.destination.bestTimeToVisit.map((time, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="bg-blue-900/40 p-1 rounded">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span>{time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Must See
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {tripPlan.recommendations.mustSee.map((item, idx) => (
                      <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-lg p-3">
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Bookmark className="w-5 h-5" />
                    Hidden Gems
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {tripPlan.recommendations.hiddenGems.map((item, idx) => (
                      <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-lg p-3">
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Budget Section */}
          <section>
            <SectionTitle icon={<DollarSign className="w-5 h-5 text-white" />} title="Budget" />
            
            <Card className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Trip Cost Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-900/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span>Average Daily Cost</span>
                    <span className="font-bold text-xl">${getAverageBudget(tripPlan.budgetEstimates)} USD</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                <div className="bg-purple-900/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span>Recommended Budget</span>
                    <span className="font-bold text-xl">${getAverageBudget(tripPlan.budgetEstimates) * tripPlan.idealTripLength.optimal} USD</span>
                  </div>
                  <div className="text-sm opacity-80">For {tripPlan.idealTripLength.optimal} days</div>
                </div>
              </div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tripPlan.budgetEstimates.map((budget, idx) => (
                <BudgetCard key={idx} budgetEstimate={budget} />
              ))}
            </div>
          </section>
          
          {/* Accommodations Section */}
          <section>
            <SectionTitle icon={<Hotel className="w-5 h-5 text-white" />} title="Where to Stay" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tripPlan.topAccommodations.map((accommodation, idx) => (
                <AccommodationCard key={idx} accommodation={accommodation} />
              ))}
            </div>
          </section>
          
          {/* Attractions Section */}
          <section>
            <SectionTitle icon={<Compass className="w-5 h-5 text-white" />} title="Attractions & Activities" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {tripPlan.topAttractions.map((attraction, idx) => (
                <AttractionCard key={idx} attraction={attraction} />
              ))}
            </div>
            
            <div className="bg-black/20 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Best Photo Spots
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tripPlan.recommendations.photospots.map((spot, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-lg p-4 text-center">
                    <Camera className="w-6 h-6 mb-2 mx-auto" />
                    <p className="text-sm">{spot}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Restaurants Section */}
          <section>
            <SectionTitle icon={<Utensils className="w-5 h-5 text-white" />} title="Where to Eat" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tripPlan.topRestaurants.map((restaurant, idx) => (
                <RestaurantCard key={idx} restaurant={restaurant} />
              ))}
            </div>
          </section>
          
          {/* Safety & Advisories Section */}
          <section>
            <SectionTitle icon={<AlertTriangle className="w-5 h-5 text-white" />} title="Travel Advisories" />
            <div className="space-y-4">
              {tripPlan.travelAdvisories.map((advisory, idx) => (
                <AdvisoryCard key={idx} advisory={advisory} />
              ))}
            </div>
          </section>
          
          {/* Local Customs Section */}
          <section>
            <SectionTitle icon={<Users className="w-5 h-5 text-white" />} title="Local Customs" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tripPlan.localCustoms.map((custom, idx) => (
                <Card key={idx} className="border-l-4 border-yellow-500">
                  <p>{custom}</p>
                </Card>
              ))}
            </div>
          </section>
          
          {/* Packing List Section */}
          <section>
            <SectionTitle icon={<Bookmark className="w-5 h-5 text-white" />} title="Packing List" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tripPlan.packingRecommendations.map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-lg p-4 flex items-center gap-3">
                  <div className="bg-blue-900/40 p-2 rounded-full">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </section>
          
          {/* Itinerary Section */}
          <section>
            <SectionTitle icon={<Calendar className="w-5 h-5 text-white" />} title="Itinerary" />
            <div className="mb-4 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg p-4">
              <h3 className="text-xl font-semibold">{tripPlan.idealTripLength.optimal}-Day Perfect Itinerary</h3>
            </div>
            <div className="space-y-8">
              {tripPlan.itinerary.map((dayPlan, idx) => (
                <ItineraryDayCard key={idx} dayPlan={dayPlan} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default memo(TripPlannerDashboard);