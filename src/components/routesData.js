export const hyderabadLocations = [
  // Central Hyderabad
  "Abids", "Narayanguda", "Himayatnagar", "Basheerbagh", "Somajiguda", "Raj Bhavan Road",
  "Lakdikapul", "Masab Tank", "Khairatabad", "Liberty", "Nampally", "Koti", "Malakpet",
  // Old City
  "Charminar", "Laad Bazaar", "Mecca Masjid", "Pathergatti", "Madina", "Yakutpura",
  "Barkas", "Chandrayangutta", "Falaknuma", "Bahadurpura", "Dabeerpura", "Purani Haveli",
  "Shalibanda", "Chatrinaka", "Aliabad", "Hussainialam", "Moghalpura", "Golconda",
  "Ibrahim Bagh", "Langar House", "Shah Ali Banda", "Rein Bazaar",
  // North Hyderabad
  "Secunderabad", "Parade Ground", "Clock Tower", "Marredpally", "Bolarum", "Alwal",
  "Kompally", "Quthbullapur", "Jeedimetla", "Balanagar", "Dundigal", "Medchal",
  "Shamirpet", "Keesara", "Ghatkesar", "Uppal", "Nagole", "Boduppal", "Peerzadiguda",
  "Kapra", "Ecil", "Sainikpuri", "Neredmet", "Trimulgherry", "Bowenpally",
  "Begumpet", "Rasoolpura", "Karkhana", "Malkajgiri", "Safilguda", "Nacharam",
  "Habsiguda", "Tarnaka", "Chilkalguda", "Secunderabad Cantonment",
  // West Hyderabad
  "Banjara Hills", "Jubilee Hills", "Film Nagar", "Yousufguda", "Madhura Nagar",
  "Ameerpet", "Punjagutta", "Panjagutta", "Erragadda", "SR Nagar", "Sanath Nagar",
  "Bharath Nagar", "Nizampet", "Kukatpally", "JNTU", "Pragathi Nagar", "Moosapet",
  "Balanagar", "Fateh Nagar", "Suraram", "Jeedimetla", "Chintal", "Quthbullapur",
  "Bachupally", "Miyapur", "Lingampally", "Chandanagar", "Kondapur", "Gachibowli",
  "Madhapur", "Hitech City", "Jubilee Hills Check Post", "Road No 36", "Road No 45",
  "Banjara Hills Road No 12", "KBR Park", "GVK One", "Inorbit Mall", "Forum Mall",
  // South Hyderabad
  "Mehdipatnam", "Tolichowki", "Attapur", "Rajendranagar", "Shamshabad", "Airport",
  "Aramgarh", "Budvel", "Rajiv Gandhi International Airport", "Mokila", "Chevella",
  "Moinabad", "Gandipet", "Kokapet", "Narsingi", "Manikonda", "Tellapur",
  "Gopanpally", "Gachibowli", "Financial District", "Nanakramguda", "Raidurg",
  "Madhapur", "Ayyappa Society", "Kavuri Hills", "Banjara Hills", "Masab Tank",
  // East Hyderabad
  "Dilsukhnagar", "Gaddiannaram", "Kothapet", "LB Nagar", "Vanasthalipuram",
  "Hayathnagar", "BN Reddy Nagar", "Mansoorabad", "Champapet", "Meerpet",
  "Saroor Nagar", "Chaitanyapuri", "Karmanghat", "Balapur", "Pedda Amberpet",
  "Amberpet", "Ramanthapur", "Uppal", "Boduppal", "Ghatkesar", "Keesara",
  "Medipally", "Pocharam", "Dammaiguda", "Cherlapally", "Almasguda",
  // Metro Corridor Areas
  "Ameerpet Metro", "Begumpet Metro", "Prakash Nagar", "Kukatpally Metro",
  "Miyapur Metro", "JNTU Metro", "Nizampet Metro", "Lingampally Metro",
  "Hitec City Metro", "Raidurg Metro", "Madhapur Metro", "Peddamma Gudi Metro",
  "Jubilee Hills Metro", "Yousufguda Metro", "Madhura Nagar Metro",
  // IT Corridor
  "Cyberabad", "HITEC City", "Kondapur", "Gachibowli", "Madhapur", "Nanakramguda",
  "Manikonda", "Raidurg", "Kokapet", "Tellapur", "Kollur", "Shankarpally",
  "Financial District", "DLF Cyber City", "Raheja Mindspace", "Cyber Towers",
  "HITEC City Phase 2", "Gachibowli ORR", "Biodiversity Park", "ISB Hyderabad",
  // Additional Popular Areas
  "Tank Bund", "Hussain Sagar", "Lumbini Park", "Sanjeevaiah Park", "Eat Street",
  "Shilparamam", "Hitex Exhibition Center", "Osman Sagar", "Durgam Cheruvu",
  "KBR National Park", "Nehru Zoological Park", "Ramoji Film City", "Birla Mandir",
  // More areas...
  "Patancheru", "Bollaram", "Isnapur", "Miyapur", "Bachupally", "Nizampet",
  "Pragathi Nagar", "Kukatpally Housing Board", "KPHB Colony", "Allwyn Colony",
  "Shamsabad", "Rajendranagar", "Budvel", "Upparpally", "Tukkuguda", "Shamshabad Airport",
  "Financial District", "Gachibowli Stadium", "ISB", "Microsoft", "Google Hyderabad",
  "Uppal Depot", "Ramanthapur", "Habsiguda", "Tarnaka", "Secunderabad Railway Station",
  "Malkajgiri", "Safilguda", "Neredmet", "Alwal", "Bollaram", "Jeedimetla",
  "Kondapur", "Manikonda", "Narsingi", "Kokapet", "Mokila", "Shankarpally",
  "Kollur", "Patancheru", "Sangareddy", "Gachibowli Junction"
];

// Enhanced predefined route data
export const routesData = [
  // Metro Red Line Routes
  {
    route_id: "R0001",
    from: "Miyapur",
    to: "Kukatpally",
    route_name: "Metro Red Line - Miyapur to Kukatpally",
    intermediate_stops: ["JNTU"],
    total_stops: ["Miyapur", "JNTU", "Kukatpally"],
    distance_km: 6.2,
    estimated_time_minutes: 12
  },
  {
    route_id: "R0002",
    from: "Kukatpally",
    to: "Ameerpet",
    route_name: "Metro Red Line - Kukatpally to Ameerpet",
    intermediate_stops: ["Balanagar", "Moosapet", "Bharath Nagar", "Erragadda", "ESI Hospital", "SR Nagar"],
    total_stops: ["Kukatpally", "Balanagar", "Moosapet", "Bharath Nagar", "Erragadda", "ESI Hospital", "SR Nagar", "Ameerpet"],
    distance_km: 8.4,
    estimated_time_minutes: 18
  },
  {
    route_id: "R0003",
    from: "Ameerpet",
    to: "Dilsukhnagar",
    route_name: "Metro Red Line - Ameerpet to Dilsukhnagar",
    intermediate_stops: ["Punjagutta", "Irrum Manzil", "Khairatabad", "Lakdikapul", "Assembly", "Nampally", "Gandhi Bhavan", "Osmania Medical", "MG Bus Station", "Malakpet", "New Market", "Musarambagh"],
    total_stops: ["Ameerpet", "Punjagutta", "Irrum Manzil", "Khairatabad", "Lakdikapul", "Assembly", "Nampally", "Gandhi Bhavan", "Osmania Medical", "MG Bus Station", "Malakpet", "New Market", "Musarambagh", "Dilsukhnagar"],
    distance_km: 15.8,
    estimated_time_minutes: 32
  },
  {
    route_id: "R0004",
    from: "Dilsukhnagar",
    to: "LB Nagar",
    route_name: "Metro Red Line - Dilsukhnagar to LB Nagar",
    intermediate_stops: ["Chaitanyapuri", "Victoria Memorial"],
    total_stops: ["Dilsukhnagar", "Chaitanyapuri", "Victoria Memorial", "LB Nagar"],
    distance_km: 4.2,
    estimated_time_minutes: 8
  },
  // Metro Blue Line Routes
  {
    route_id: "R0005",
    from: "Raidurg",
    to: "Hitech City",
    route_name: "Metro Blue Line - Raidurg to Hitech City",
    intermediate_stops: ["Cyber Gateway", "Madhapur"],
    total_stops: ["Raidurg", "Cyber Gateway", "Madhapur", "Hitech City"],
    distance_km: 5.1,
    estimated_time_minutes: 10
  },
  // Major IT Corridor Route
  {
    route_id: "R0006",
    from: "Gachibowli",
    to: "Hitech City",
    route_name: "IT Corridor - Gachibowli to Hitech City",
    intermediate_stops: ["Financial District", "Nanakramguda", "Raidurg", "Cyber Gateway", "Madhapur"],
    total_stops: ["Gachibowli", "Financial District", "Nanakramguda", "Raidurg", "Cyber Gateway", "Madhapur", "Hitech City"],
    distance_km: 12.3,
    estimated_time_minutes: 25
  },
  // Old City to New City Route
  {
    route_id: "R0007",
    from: "Charminar",
    to: "Banjara Hills",
    route_name: "Heritage Route - Charminar to Banjara Hills",
    intermediate_stops: ["Laad Bazaar", "Pathergatti", "Nampally", "Abids", "Somajiguda", "Punjagutta"],
    total_stops: ["Charminar", "Laad Bazaar", "Pathergatti", "Nampally", "Abids", "Somajiguda", "Punjagutta", "Banjara Hills"],
    distance_km: 18.5,
    estimated_time_minutes: 35
  }
];

// ✅ ENHANCED: Find routes between locations with better matching
export function findRoutesBetween(startLocation, endLocation) {
  console.log(`🔍 Finding routes between "${startLocation}" and "${endLocation}"`);
  
  if (!startLocation || !endLocation) {
    console.log("❌ Missing start or end location");
    return [];
  }

  const startLower = startLocation.toLowerCase().trim();
  const endLower = endLocation.toLowerCase().trim();
  
  if (startLower === endLower) {
    console.log("❌ Start and end locations are the same");
    return [];
  }

  const matchingRoutes = routesData.filter(route => {
    const routeStops = route.total_stops.map(stop => stop.toLowerCase());
    const startIndex = routeStops.findIndex(stop => stop.includes(startLower) || startLower.includes(stop));
    const endIndex = routeStops.findIndex(stop => stop.includes(endLower) || endLower.includes(stop));
    
    const hasValidRoute = startIndex !== -1 && endIndex !== -1 && startIndex < endIndex;
    
    if (hasValidRoute) {
      console.log(`✅ Found route: ${route.route_name} (${startIndex} → ${endIndex})`);
    }
    
    return hasValidRoute;
  });

  console.log(`📊 Found ${matchingRoutes.length} matching routes`);
  return matchingRoutes;
}

// ✅ NEW: Create dynamic route for direct trips
export function createDirectRoute(startLocation, endLocation, intermediateStops = []) {
  console.log(`🛤️ Creating direct route: ${startLocation} → ${endLocation}`);
  
  const routeId = `DIRECT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const totalStops = [startLocation, ...intermediateStops, endLocation];
  
  // Estimate distance (rough calculation - 2-5 km per stop)
  const estimatedDistance = Math.max(5, totalStops.length * 3.5);
  
  const directRoute = {
    route_id: routeId,
    from: startLocation,
    to: endLocation,
    route_name: `Direct Route - ${startLocation} to ${endLocation}`,
    intermediate_stops: intermediateStops,
    total_stops: totalStops,
    distance_km: estimatedDistance,
    estimated_time_minutes: Math.ceil(estimatedDistance * 2), // ~2 min per km
    is_direct_route: true,
    created_at: new Date().toISOString()
  };
  
  console.log(`✅ Created direct route:`, directRoute);
  return directRoute;
}

// ✅ ENHANCED: Get route by ID with fallback
export function getRouteById(routeId) {
  if (!routeId) {
    console.log("❌ No routeId provided");
    return null;
  }
  
  console.log(`🔍 Looking for route: ${routeId}`);
  
  // First check predefined routes
  const predefinedRoute = routesData.find(route => route.route_id === routeId);
  if (predefinedRoute) {
    console.log(`✅ Found predefined route: ${predefinedRoute.route_name}`);
    return predefinedRoute;
  }
  
  // Handle direct routes (they start with "DIRECT_")
  if (routeId.startsWith('DIRECT_')) {
    console.log(`⚠️ Direct route ${routeId} not found in memory - this is expected for page refreshes`);
    return null;
  }
  
  console.log(`❌ Route ${routeId} not found`);
  return null;
}

// ✅ ENHANCED: Calculate distance between stops with fallback
export function calculateDistanceBetweenStops(routeId, pickupStop, dropStop) {
  console.log(`📏 Calculating distance: ${pickupStop} → ${dropStop} on route ${routeId}`);
  
  const route = getRouteById(routeId);
  if (!route) {
    console.log("❌ Route not found, using fallback calculation");
    // Fallback: estimate 5km for unknown routes
    return 5.0;
  }

  const pickupIndex = route.total_stops.findIndex(stop => 
    stop.toLowerCase() === pickupStop.toLowerCase()
  );
  const dropIndex = route.total_stops.findIndex(stop => 
    stop.toLowerCase() === dropStop.toLowerCase()
  );

  if (pickupIndex === -1 || dropIndex === -1 || pickupIndex >= dropIndex) {
    console.log(`❌ Invalid stops: pickup=${pickupIndex}, drop=${dropIndex}`);
    return 0;
  }

  const totalStops = route.total_stops.length;
  const segmentsTraveled = dropIndex - pickupIndex;
  const distance = (segmentsTraveled / (totalStops - 1)) * (route.distance_km || 10);
  
  const result = Math.max(1.0, Math.round(distance * 10) / 10); // Min 1km, round to 1 decimal
  console.log(`✅ Calculated distance: ${result} km (${segmentsTraveled}/${totalStops-1} segments)`);
  return result;
}

// ✅ ENHANCED: Get available pickup stops with validation
export function getAvailablePickupStops(routeId) {
  console.log(`🚌 Getting pickup stops for route: ${routeId}`);
  
  const route = getRouteById(routeId);
  if (!route) {
    console.log("❌ Route not found for pickup stops");
    return [];
  }

  // Return all stops except the last one (can't pickup at final destination)
  const pickupStops = route.total_stops.slice(0, -1);
  console.log(`✅ Available pickup stops: ${pickupStops.join(', ')}`);
  return pickupStops;
}

// ✅ ENHANCED: Get available drop stops with validation
export function getAvailableDropStops(routeId, pickupStop) {
  console.log(`🏁 Getting drop stops for route: ${routeId}, pickup: ${pickupStop}`);
  
  const route = getRouteById(routeId);
  if (!route) {
    console.log("❌ Route not found for drop stops");
    return [];
  }

  const pickupIndex = route.total_stops.findIndex(stop =>
    stop.toLowerCase() === pickupStop.toLowerCase()
  );

  if (pickupIndex === -1) {
    console.log(`❌ Pickup stop "${pickupStop}" not found in route`);
    return [];
  }

  // Return all stops after pickup
  const dropStops = route.total_stops.slice(pickupIndex + 1);
  console.log(`✅ Available drop stops: ${dropStops.join(', ')}`);
  return dropStops;
}

// ✅ ENHANCED: Get unique intermediate stops from multiple routes
export function getUniqueIntermediateStops(routes, startLocation, endLocation) {
  console.log(`🛤️ Getting unique intermediates from ${routes.length} routes`);
  
  const allIntermediates = new Set();
  const startLower = startLocation.toLowerCase();
  const endLower = endLocation.toLowerCase();

  routes.forEach(route => {
    console.log(`Processing route: ${route.route_name}`);
    
    const startIdx = route.total_stops.findIndex(stop =>
      stop.toLowerCase() === startLower
    );
    const endIdx = route.total_stops.findIndex(stop =>
      stop.toLowerCase() === endLower
    );

    if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
      // Add intermediate stops (excluding start and end)
      for (let i = startIdx + 1; i < endIdx; i++) {
        allIntermediates.add(route.total_stops[i]);
        console.log(`Added intermediate: ${route.total_stops[i]}`);
      }
    }
  });

  const result = Array.from(allIntermediates).sort();
  console.log(`✅ Unique intermediates: ${result.join(', ')}`);
  return result;
}

// ✅ ENHANCED: Filter routes by selected intermediates
export function filterRoutesByIntermediates(routes, startLocation, endLocation, selectedIntermediates) {
  console.log(`🔍 Filtering ${routes.length} routes by intermediates: ${selectedIntermediates.join(', ')}`);
  
  if (!selectedIntermediates.length) {
    console.log("No intermediates selected, returning all routes");
    return routes;
  }

  const startLower = startLocation.toLowerCase();
  const endLower = endLocation.toLowerCase();

  const filteredRoutes = routes.filter(route => {
    const startIdx = route.total_stops.findIndex(stop =>
      stop.toLowerCase() === startLower
    );
    const endIdx = route.total_stops.findIndex(stop =>
      stop.toLowerCase() === endLower
    );

    if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
      return false;
    }

    // Check if all selected intermediates exist in correct order
    const routeSegment = route.total_stops.slice(startIdx, endIdx + 1).map(s => s.toLowerCase());
    
    return selectedIntermediates.every(intermediate => {
      const intermIdx = routeSegment.findIndex(stop => stop === intermediate.toLowerCase());
      const isValid = intermIdx > 0 && intermIdx < routeSegment.length - 1; // Between start and end
      
      console.log(`Route ${route.route_id} - ${intermediate}: index=${intermIdx}, valid=${isValid}`);
      return isValid;
    });
  });

  console.log(`✅ Filtered to ${filteredRoutes.length} routes`);
  return filteredRoutes;
}

// Search function for locations
export function searchLocations(query) {
  if (!query || query.length < 2) return [];
  const lowerQuery = query.toLowerCase();
  return hyderabadLocations.filter(location =>
    location.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
}

// ✅ NEW: Validate route data
export function validateRouteData(routeData) {
  const errors = [];
  
  if (!routeData.route_id) errors.push("Missing route_id");
  if (!routeData.total_stops || !Array.isArray(routeData.total_stops)) {
    errors.push("Missing or invalid total_stops array");
  } else if (routeData.total_stops.length < 2) {
    errors.push("Route must have at least 2 stops");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ✅ NEW: Get route summary for display
export function getRouteSummary(routeId) {
  const route = getRouteById(routeId);
  if (!route) {
    return {
      name: "Unknown Route",
      stops: [],
      distance: "N/A",
      duration: "N/A"
    };
  }
  
  return {
    name: route.route_name,
    stops: route.total_stops,
    distance: `${route.distance_km} km`,
    duration: `${route.estimated_time_minutes} min`,
    intermediates: route.intermediate_stops || []
  };
}

export default {
  hyderabadLocations,
  routesData,
  findRoutesBetween,
  createDirectRoute,
  getRouteById,
  calculateDistanceBetweenStops,
  getAvailablePickupStops,
  getAvailableDropStops,
  getUniqueIntermediateStops,
  filterRoutesByIntermediates,
  searchLocations,
  validateRouteData,
  getRouteSummary
};