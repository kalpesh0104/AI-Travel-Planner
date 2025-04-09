"use client";
import React, { useState, useEffect } from "react";
import { 
  Map, Calendar, Utensils, Hotel, 
  AlertTriangle, Camera, DollarSign, Compass,
  Globe, Sun, Wind, Users, Bookmark, Menu, X,
  LucideIcon, Clock
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

// Component props interfaces
interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface AccommodationCardProps {
  accommodation: Accommodation;
}

interface AttractionCardProps {
  attraction: Attraction;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
}

interface DestinationCompactProps {
  destination: string;
}

interface DayPlanCardProps {
  dayPlan: DayPlan;
}

// Tab button component
const TabButton: React.FC<TabButtonProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 w-full ${active ? 'bg-gray-800 text-white' : 'bg-black text-gray-400'} transition-colors`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

// Card component
const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`bg-black border border-gray-800 rounded-lg p-4 shadow-lg ${className}`}>
    {children}
  </div>
);

// Day Plan Card Component
const DayPlanCard: React.FC<DayPlanCardProps> = ({ dayPlan }) => (
  <Card className="mb-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold">Day {dayPlan.day}</h3>
      <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">{dayPlan.transportation}</span>
    </div>
    
    <div className="space-y-3">
      <div className="bg-gray-900 p-2 rounded">
        <div className="flex items-center mb-1">
          <span className="text-xs font-semibold text-gray-400 w-20">Morning</span>
          <div className="h-px bg-gray-800 flex-grow mx-2"></div>
        </div>
        <p className="text-xs">{dayPlan.activities.morning}</p>
        {dayPlan.meals.breakfast && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            <Utensils className="w-3 h-3 text-gray-500" />
            <span className="text-gray-400">{dayPlan.meals.breakfast}</span>
          </div>
        )}
      </div>
      
      <div className="bg-gray-900 p-2 rounded">
        <div className="flex items-center mb-1">
          <span className="text-xs font-semibold text-gray-400 w-20">Afternoon</span>
          <div className="h-px bg-gray-800 flex-grow mx-2"></div>
        </div>
        <p className="text-xs">{dayPlan.activities.afternoon}</p>
        {dayPlan.meals.lunch && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            <Utensils className="w-3 h-3 text-gray-500" />
            <span className="text-gray-400">{dayPlan.meals.lunch}</span>
          </div>
        )}
      </div>
      
      <div className="bg-gray-900 p-2 rounded">
        <div className="flex items-center mb-1">
          <span className="text-xs font-semibold text-gray-400 w-20">Evening</span>
          <div className="h-px bg-gray-800 flex-grow mx-2"></div>
        </div>
        <p className="text-xs">{dayPlan.activities.evening}</p>
        {dayPlan.meals.dinner && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            <Utensils className="w-3 h-3 text-gray-500" />
            <span className="text-gray-400">{dayPlan.meals.dinner}</span>
          </div>
        )}
      </div>
    </div>
    
    {dayPlan.tips.length > 0 && (
      <div className="mt-3 bg-gray-800 p-2 rounded">
        <div className="text-xs font-semibold mb-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          <span>Tips</span>
        </div>
        <ul className="text-xs space-y-1">
          {dayPlan.tips.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </div>
    )}
  </Card>
);

// Accommodation Card (Compact)
const AccommodationCard: React.FC<AccommodationCardProps> = ({ accommodation }) => (
  <Card className="mb-3">
    <div className="flex items-start gap-2">
      <Hotel className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
      <div>
        <h3 className="text-sm font-semibold">{accommodation.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">{accommodation.type}</span>
          <span className="text-xs text-gray-400">{accommodation.priceRange}</span>
        </div>
        <p className="text-xs mt-2 text-gray-300">{accommodation.description}</p>
      </div>
    </div>
  </Card>
);

// Attraction Card (Compact)
const AttractionCard: React.FC<AttractionCardProps> = ({ attraction }) => (
  <Card className="mb-3">
    <div className="flex items-start gap-2">
      <Compass className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
      <div>
        <h3 className="text-sm font-semibold">{attraction.name}</h3>
        <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">{attraction.category}</span>
        <p className="text-xs mt-2 text-gray-300">{attraction.description}</p>
      </div>
    </div>
  </Card>
);

// Restaurant Card (Compact)
const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => (
  <Card className="mb-3">
    <div className="flex items-start gap-2">
      <Utensils className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
      <div>
        <h3 className="text-sm font-semibold">{restaurant.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">{restaurant.cuisine}</span>
          <span className="text-xs text-gray-400">{restaurant.priceRange}</span>
        </div>
        <p className="text-xs mt-2 text-gray-300">{restaurant.specialty}</p>
      </div>
    </div>
  </Card>
);

// Main component
const DestinationCompact: React.FC<DestinationCompactProps> = ({ destination }) => {
  const { 
    tripData, 
    planTrip, 
    isLoading, 
    error, 
    selectedDuration, 
    durationOptions, 
    changeTripDuration 
  } = useTripPlanner();
  
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [previousDestination, setPreviousDestination] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isDurationSelectorOpen, setIsDurationSelectorOpen] = useState<boolean>(false);
  const [isChangingDuration, setIsChangingDuration] = useState<boolean>(false);
  
  // Fetch data only once when destination changes or on initial load
  useEffect(() => {
    if (destination && (isInitialLoad || destination !== previousDestination)) {
      const fetchData = async () => {
        try {
          const result = await planTrip(destination);
          if (result.success && result.data) {
            setTripPlan(result.data.tripPlan);
          }
          setIsInitialLoad(false);
          setPreviousDestination(destination);
        } catch (err) {
          console.error("Error fetching trip data:", err);
          setIsInitialLoad(false);
        }
      };
      
      fetchData();
    }
  }, [destination, planTrip, isInitialLoad, previousDestination]);

  // Update tripPlan when tripData changes (e.g., after duration change)
  useEffect(() => {
    if (tripData?.success && tripData.data) {
      setTripPlan(tripData.data.tripPlan);
    }
  }, [tripData]);
  
  // Handle duration change
  const handleDurationChange = async (days: number) => {
    setIsChangingDuration(true);
    try {
      await changeTripDuration(days);
      setIsDurationSelectorOpen(false);
    } catch (err) {
      console.error("Error changing trip duration:", err);
    } finally {
      setIsChangingDuration(false);
    }
  };
  
  if (isLoading && isInitialLoad) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-3 border-gray-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-black rounded-lg text-center border border-gray-800">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  
  if (!tripPlan) {
    return null;
  }
  
  const getAverageBudget = (estimates: BudgetEstimate[]): number => {
    if (!estimates || estimates.length === 0) return 0;
    const total = estimates.reduce((sum: number, item: BudgetEstimate) => sum + (item.lowRange + item.highRange) / 2, 0);
    return Math.round(total / estimates.length);
  };
  
  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-10">
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-lg font-bold">{tripPlan.destination.name}</h1>
          <div className="flex items-center gap-2">
            {/* Duration Selector Button */}
            <div className="relative">
              <button 
                onClick={() => setIsDurationSelectorOpen(!isDurationSelectorOpen)}
                className="flex items-center gap-1 bg-gray-800 text-white px-2 py-1 rounded-md text-xs"
              >
                <Clock size={14} />
                <span>{selectedDuration || tripPlan.idealTripLength.optimal} Days</span>
              </button>
              
              {/* Duration Dropdown */}
              {isDurationSelectorOpen && (
                <div className="absolute right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20 w-40">
                  <div className="p-2 border-b border-gray-700">
                    <h3 className="text-xs font-semibold">Select Trip Duration</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {durationOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleDurationChange(option.value)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-700 flex items-center justify-between ${
                          (selectedDuration || tripPlan.idealTripLength.optimal) === option.value ? 'bg-gray-700' : ''
                        }`}
                      >
                        <span>{option.value} Days</span>
                        {option.isRecommended && (
                          <span className="text-gray-400 text-xs">Recommended</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden bg-gray-800 p-1 rounded-md"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
      <div className="flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <nav className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block md:w-56 bg-black border-r border-gray-800 flex-shrink-0`}>
          <TabButton 
            icon={<Globe size={16} />} 
            label="Overview" 
            active={activeTab === 'overview'}
            onClick={() => {setActiveTab('overview'); setIsMobileMenuOpen(false)}}
          />
          <TabButton 
            icon={<Calendar size={16} />} 
            label="Itinerary" 
            active={activeTab === 'itinerary'}
            onClick={() => {setActiveTab('itinerary'); setIsMobileMenuOpen(false)}}
          />
          <TabButton 
            icon={<DollarSign size={16} />} 
            label="Budget" 
            active={activeTab === 'budget'}
            onClick={() => {setActiveTab('budget'); setIsMobileMenuOpen(false)}}
          />
          <TabButton 
            icon={<Hotel size={16} />} 
            label="Accommodations" 
            active={activeTab === 'accommodations'}
            onClick={() => {setActiveTab('accommodations'); setIsMobileMenuOpen(false)}}
          />
          <TabButton 
            icon={<Compass size={16} />} 
            label="Attractions" 
            active={activeTab === 'attractions'}
            onClick={() => {setActiveTab('attractions'); setIsMobileMenuOpen(false)}}
          />
          <TabButton 
            icon={<Utensils size={16} />} 
            label="Restaurants" 
            active={activeTab === 'restaurants'}
            onClick={() => {setActiveTab('restaurants'); setIsMobileMenuOpen(false)}}
          />
          <TabButton 
            icon={<Users size={16} />} 
            label="Local Tips" 
            active={activeTab === 'tips'}
            onClick={() => {setActiveTab('tips'); setIsMobileMenuOpen(false)}}
          />
          <TabButton 
            icon={<AlertTriangle size={16} />} 
            label="Advisories" 
            active={activeTab === 'advisories'}
            onClick={() => {setActiveTab('advisories'); setIsMobileMenuOpen(false)}}
          />
        </nav>
        {/* Content Area */}
        <main className="flex-grow p-4 overflow-y-auto">
          {/* Loading overlay when changing duration */}
          {isChangingDuration && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center">
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-sm">Updating your trip...</p>
              </div>
            </div>
          )}
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <Card className="mb-4 bg-gradient-to-b from-gray-900 to-black">
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex flex-wrap gap-2">
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
                  
                  <div className="bg-gray-900 rounded-lg p-3">
                    <h3 className="text-xs font-semibold mb-2">Trip Length</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-800 rounded p-1">
                        <div className="text-sm font-bold">{tripPlan.idealTripLength.minimum}</div>
                        <div className="text-xs">Min</div>
                      </div>
                      <div className={`${selectedDuration === tripPlan.idealTripLength.optimal ? 'bg-white text-black' : 'bg-gray-800'} rounded p-1`}>
                        <div className="text-sm font-bold">{tripPlan.idealTripLength.optimal}</div>
                        <div className="text-xs">Ideal</div>
                      </div>
                      <div className="bg-gray-800 rounded p-1">
                        <div className="text-sm font-bold">{tripPlan.idealTripLength.extended}</div>
                        <div className="text-xs">Extended</div>
                      </div>
                    </div>
                    
                    {/* Current Duration Indicator */}
                    {selectedDuration && selectedDuration !== tripPlan.idealTripLength.optimal && (
                      <div className="mt-2 p-1 bg-gray-800 rounded text-center">
                        <div className="text-xs">Current plan: <span className="font-bold">{selectedDuration} Days</span></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-1">Overview</h3>
                  <p className="text-xs">{tripPlan.executiveSummary}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-900 rounded-lg p-2">
                    <h3 className="text-xs font-semibold mb-1 flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      Must See
                    </h3>
                    <ul className="space-y-1">
                      {tripPlan.recommendations.mustSee.slice(0, 3).map((item: string, idx: number) => (
                        <li key={idx} className="text-xs bg-gray-800 p-1 rounded">{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-2">
                    <h3 className="text-xs font-semibold mb-1 flex items-center gap-1">
                      <Bookmark className="w-3 h-3" />
                      Hidden Gems
                    </h3>
                    <ul className="space-y-1">
                      {tripPlan.recommendations.hiddenGems.slice(0, 3).map((item: string, idx: number) => (
                        <li key={idx} className="text-xs bg-gray-800 p-1 rounded">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
              
              <div className="bg-gray-900 rounded-lg p-3">
                <h3 className="text-xs font-semibold mb-2">Weather & Best Time</h3>
                <ul className="space-y-1 text-xs">
                  {tripPlan.destination.bestTimeToVisit.map((time: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Itinerary Tab */}
          {activeTab === 'itinerary' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Your {tripPlan.itinerary.length}-Day Itinerary</h3>
                <button 
                  onClick={() => setIsDurationSelectorOpen(!isDurationSelectorOpen)}
                  className="flex items-center gap-1 bg-gray-800 text-white px-2 py-1 rounded-md text-xs"
                >
                  <Clock size={14} />
                  <span>Change Duration</span>
                </button>
              </div>
              
              {tripPlan.itinerary.map((dayPlan) => (
                <DayPlanCard key={dayPlan.day} dayPlan={dayPlan} />
              ))}
            </div>
          )}
          
          {/* Budget Tab */}
          {activeTab === 'budget' && (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Card>
                  <div className="text-center">
                    <div className="text-xs mb-1">Daily Cost</div>
                    <div className="text-xl font-bold">₹{getAverageBudget(tripPlan.budgetEstimates)}</div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-xs mb-1">Total ({selectedDuration || tripPlan.idealTripLength.optimal} days)</div>
                    <div className="text-xl font-bold">₹{getAverageBudget(tripPlan.budgetEstimates) * (selectedDuration || tripPlan.idealTripLength.optimal)}</div>
                  </div>
                </Card>
              </div>
              
              <h3 className="text-sm font-semibold mb-2">Breakdown</h3>
              {tripPlan.budgetEstimates.map((budget: BudgetEstimate, idx: number) => (
                <Card key={idx} className="mb-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs">{budget.category}</h4>
                    <div className="bg-gray-800 px-2 py-0.5 rounded-full text-xs">
                      ₹{budget.lowRange} - ₹{budget.highRange}
                    </div>
                  </div>
                  <p className="text-xs opacity-70 mt-1">{budget.notes}</p>
                </Card>
              ))}
            </div>
          )}
          {/* Accommodations Tab */}
          {activeTab === 'accommodations' && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Where to Stay</h3>
              {tripPlan.topAccommodations.map((accommodation: Accommodation, idx: number) => (
                <AccommodationCard key={idx} accommodation={accommodation} />
              ))}
            </div>
          )}
          {/* Attractions Tab */}
          {activeTab === 'attractions' && (
            <div>
              <h3 className="text-sm font-semibold mb-2">What to See & Do</h3>
              {tripPlan.topAttractions.map((attraction: Attraction, idx: number) => (
                <AttractionCard key={idx} attraction={attraction} />
              ))}
            </div>
          )}
          {/* Restaurants Tab */}
          {activeTab === 'restaurants' && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Where to Eat</h3>
              {tripPlan.topRestaurants.map((restaurant: Restaurant, idx: number) => (
                <RestaurantCard key={idx} restaurant={restaurant} />
              ))}
            </div>
          )}
          {/* Local Tips Tab */}
          {activeTab === 'tips' && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Local Customs & Tips</h3>
              {tripPlan.localCustoms.map((custom: string, idx: number) => (
                <Card key={idx} className="mb-2 border-l-2 border-gray-700">
                  <p className="text-xs">{custom}</p>
                </Card>
              ))}
            </div>
          )}
          {/* Advisories Tab */}
          {activeTab === 'advisories' && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Travel Advisories</h3>
              {tripPlan.travelAdvisories.map((advisory: TravelAdvisory, idx: number) => (
                <Card key={idx} className="mb-2 border-l-2 border-gray-700">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-400" />
                    <div>
                      <h4 className="text-xs font-semibold">{advisory.type}</h4>
                      <p className="text-xs mt-1 text-gray-300">{advisory.description}</p>
                      <div className="bg-gray-900 p-2 rounded mt-2 text-xs">
                        <strong>Recommendation:</strong> {advisory.recommendation}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DestinationCompact;