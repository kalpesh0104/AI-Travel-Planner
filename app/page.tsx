"use client";

import React, { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./styles/page.css";

// Define searchAnimations that was missing from the original code
const searchAnimations = {
  searchBar: {
    focused: { scale: 1.02, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)" },
    unfocused: { scale: 1, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }
  },
  stagger: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        staggerChildren: 0.05, 
        staggerDirection: -1 
      }
    }
  },
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  }
};

// Component prop interfaces
interface TravelQueryProps {
  destination: string;
}

interface TravelParameterProps {
  parameter: string;
}

interface ImageQueryProps {
  query: string;
}

type TravelComponentConfig = 
  | {
      name: string;
      component: React.LazyExoticComponent<React.ComponentType<TravelQueryProps>>;
      propType: 'destination';
    }
  | {
      name: string;
      component: React.LazyExoticComponent<React.ComponentType<TravelParameterProps>>;
      propType: 'parameter';
    }
  | {
      name: string;
      component: React.LazyExoticComponent<React.ComponentType<ImageQueryProps>>;
      propType: 'query';
    };

interface TravelSearchFormProps {
  destination: string;
  setDestination: (destination: string) => void;
  handleSearch: (e: React.FormEvent<HTMLFormElement>) => void;
  isSearching: boolean;
}

interface TravelResultsSectionProps {
  submittedDestination: string;
  activeComponents: string[];
}

const TRAVEL_COMPONENTS: TravelComponentConfig[] = [
  { 
    name: 'DestinationImages', 
    component: lazy(() => import("./component/travel-planner")), 
    propType: 'destination' 
  },
  { 
    name: 'ImageResult', 
    component: lazy(() => import("./component/ImageResult")), 
    propType: 'query' 
  }
];

const TravelSearchForm: React.FC<TravelSearchFormProps> = ({ destination, setDestination, handleSearch, isSearching }) => (
  <form onSubmit={handleSearch} className="search-form">
    <motion.div
      className="search-bar-wrapper"
      variants={searchAnimations.searchBar}
      animate={isSearching ? "focused" : "unfocused"}
    >
      <input
        type="text"
        placeholder="Where would you like to travel?"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        className="search-input"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="search-button"
      >
        {isSearching ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="search-loader"
          >
            ○
          </motion.div>
        ) : (
          "Explore"
        )}
      </motion.button>
    </motion.div>
  </form>
);

const TravelResultsSection: React.FC<TravelResultsSectionProps> = ({ submittedDestination, activeComponents }) => (
  <motion.div
    variants={searchAnimations.stagger}
    initial="initial"
    animate="animate"
    exit="exit"
    className="results-container"
  >
    <Suspense fallback={<div className="results-loader">Planning your perfect trip...</div>}>
      {TRAVEL_COMPONENTS.filter(comp => activeComponents.includes(comp.name)).map((config) => {
        if (config.propType === 'destination') {
          const Component = config.component;
          return (
            <motion.div
              key={config.name}
              variants={searchAnimations.fadeUp}
              layout
              className="result-card"
            >
              <Component destination={submittedDestination} />
            </motion.div>
          );
        } else if (config.propType === 'query') {
          const Component = config.component;
          return (
            <motion.div
              key={config.name}
              variants={searchAnimations.fadeUp}
              layout
              className="result-card"
            >
              <Component query={submittedDestination} />
            </motion.div>
          );
        }
        
        const Component = config.component;
        return (
          <motion.div
            key={config.name}
            variants={searchAnimations.fadeUp}
            layout
            className="result-card"
          >
            <Component parameter={submittedDestination} />
          </motion.div>
        );
      })}
    </Suspense>
  </motion.div>
);

const Page: React.FC = () => {
  const [destination, setDestination] = useState("");
  const [submittedDestination, setSubmittedDestination] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeComponents, setActiveComponents] = useState<string[]>([]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (destination.trim()) {
      setIsSearching(true);
      setSubmittedDestination(destination);
      
      // Activate all components by default when a new search is performed
      if (activeComponents.length === 0) {
        setActiveComponents(TRAVEL_COMPONENTS.map(comp => comp.name));
      }
      
      setTimeout(() => setIsSearching(false), 1000);
    }
  };

  const toggleComponent = (componentName: string) => {
    setActiveComponents(prev => 
      prev.includes(componentName)
        ? prev.filter(name => name !== componentName)
        : [...prev, componentName]
    );
  };

  return (
    <div className="search-container">
      <div className="background-layer" />

      <motion.h1 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="main-heading"
      >
        Smart Trip Planner
      </motion.h1>

      <motion.div layout className="search-section">
        <TravelSearchForm
          destination={destination}
          setDestination={setDestination}
          handleSearch={handleSearch}
          isSearching={isSearching}
        />
      </motion.div>

      <div className="component-toggle-container">
        {TRAVEL_COMPONENTS.map(({ name }) => (
          <button
            key={name}
            onClick={() => toggleComponent(name)}
            className={`glass-toggle ${activeComponents.includes(name) ? 'active' : ''}`}
            data-component={name.toLowerCase()}
            aria-label={`Toggle ${name}`}
            title={name}
          >
            <span className="toggle-label">{name}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {submittedDestination && (
          <motion.div
            variants={searchAnimations.fadeUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="query-display"
          >
            Planning your trip to: <span className="query-text">{submittedDestination}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {submittedDestination && (
          <TravelResultsSection 
            submittedDestination={submittedDestination} 
            activeComponents={activeComponents} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Page;