import axios from 'axios';

// Initialize Gemini
// const ENV_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // No longer needed as Gemini SDK is not called directly

export const generateItinerary = async (destination, travelers, budget, interests, duration) => {
  try {
    // Call the new FastAPI Production Backend
    const response = await axios.post('http://localhost:8000/api/itinerary/generate', {
      destination,
      travelers,
      budget,
      interests: interests || ['General sightseeing'],
      days: duration || 3,
      travel_style: 'balanced'
    });

    const data = response.data;

    // Map the FastAPI response into the format expected by the frontend
    const groupedDays = [];
    const items = data.items || [];
    const dayMap = {};
    
    items.forEach(item => {
      if (!dayMap[item.day]) {
        dayMap[item.day] = {
          day: item.day,
          theme: `Exploring ${data.destination}`,
          activities: []
        };
      }
      dayMap[item.day].activities.push({
        time: item.time_of_day,
        title: item.activity_name,
        description: item.notes,
        type: 'attraction',
        latitude: item.latitude,
        longitude: item.longitude
      });
    });
    
    Object.keys(dayMap).sort().forEach(d => groupedDays.push(dayMap[d]));

    return {
      days: groupedDays,
      travelAIMetrics: {
        esiScore: data.green_score || 24,
        ecoScore: 'A',
        fatigueIndex: 4
      },
      llmSummary: data.summary,
      centerCoordinates: items.length > 0 ? { lat: items[0].latitude, lng: items[0].longitude } : { lat: 10.826, lng: 78.678 },
      totalEstimatedCost: data.total_cost,
      bestTimeToVisit: 'Year-round',
      tips: ['Enjoy your AI-planned journey'],
      emergencyContacts: {
        police: '100',
        ambulance: '108',
        touristHelpline: '1363'
      }
    };

  } catch (error) {
    console.error("FastAPI Backend Error:", error);
    console.warn("Falling back to local mock data due to API error.");
    return generateMockData(destination, duration);
  }
};


// Enhanced fallback mock data generator
const generateMockData = (destination, duration) => {
  const daysCount = duration || 3;
  const days = [];

  const mockPlaces = {
    'Chennai': {
      activities: [
        { title: 'Kapaleeshwarar Temple', type: 'visit', rating: '4.8', cost: 'Free', lat: 13.0333, lng: 80.2693 },
        { title: 'San Thome Cathedral', type: 'visit', rating: '4.7', cost: 'Free', lat: 13.0340, lng: 80.2786 },
        { title: 'Marina Beach', type: 'visit', rating: '4.6', cost: 'Free', lat: 13.0500, lng: 80.2824 },
        { title: 'Fort St. George', type: 'visit', rating: '4.5', cost: '₹100', lat: 13.0802, lng: 80.2868 },
        { title: 'Ratna Cafe', type: 'food', rating: '4.4', cost: '₹200', lat: 13.0604, lng: 80.2785 },
      ],
      hotel: { name: 'ITC Grand Chola', rating: '4.9', priceRange: '₹15000-25000/night' },
      restaurants: [
        { name: 'Ratna Cafe', cuisine: 'South Indian', rating: '4.4', mustTry: 'Sambar Idli' },
        { name: 'Saravana Bhavan', cuisine: 'South Indian', rating: '4.2', mustTry: 'Mini Tiffin' },
      ],
      center: { lat: 13.0475, lng: 80.2707 }
    },
    'Madurai': {
      activities: [
        { title: 'Meenakshi Amman Temple', type: 'visit', rating: '4.8', cost: 'Free', lat: 9.9195, lng: 78.1190 },
        { title: 'Thirumalai Nayakkar Palace', type: 'visit', rating: '4.5', cost: '₹50', lat: 9.9166, lng: 78.1228 },
        { title: 'Murugan Idli Shop', type: 'food', rating: '4.4', cost: '₹150', lat: 9.9252, lng: 78.1198 },
        { title: 'Gandhi Memorial Museum', type: 'visit', rating: '4.3', cost: '₹20', lat: 9.9224, lng: 78.1073 },
      ],
      hotel: { name: 'Heritage Madurai', rating: '4.6', priceRange: '₹4000-8000/night' },
      restaurants: [
        { name: 'Murugan Idli Shop', cuisine: 'South Indian', rating: '4.4', mustTry: 'Ghee Podi Idli' },
        { name: 'Amma Mess', cuisine: 'Tamil', rating: '4.2', mustTry: 'Kari Dosa' },
      ],
      center: { lat: 9.9252, lng: 78.1198 }
    },
    'default': {
      activities: [
        { title: `${destination} Main Temple`, type: 'visit', rating: '4.5', cost: 'Free', lat: 11.1271, lng: 78.6569 },
        { title: `${destination} Local Market`, type: 'shopping', rating: '4.0', cost: '₹500', lat: 11.1300, lng: 78.6600 },
        { title: 'Local Restaurant', type: 'food', rating: '4.2', cost: '₹200', lat: 11.1250, lng: 78.6550 },
      ],
      hotel: { name: `${destination} Grand Hotel`, rating: '4.3', priceRange: '₹2000-5000/night' },
      restaurants: [
        { name: 'Local Thali Restaurant', cuisine: 'South Indian', rating: '4.1', mustTry: 'Meals Thali' },
      ],
      center: { lat: 11.1271, lng: 78.6569 }
    }
  };

  const cityData = mockPlaces[destination] || mockPlaces['default'];

  for (let i = 1; i <= daysCount; i++) {
    days.push({
      day: i,
      theme: `Exploration Day ${i}${!mockPlaces[destination] ? ' (Sample Data)' : ''}`,
      activities: cityData.activities.map((act, j) => ({
        time: `${9 + j * 2}:00`,
        title: act.title,
        description: `Rated ${act.rating}★ on Google Maps`,
        location: { lat: act.lat + (i * 0.001), lng: act.lng + (i * 0.001) },
        type: act.type,
        cost: act.cost,
        rating: act.rating,
        duration: '1-2 hours'
      })),
      hotel: cityData.hotel,
      restaurants: cityData.restaurants
    });
  }

  return {
    days,
    travelAIMetrics: {
      esiScore: Math.floor(Math.random() * 30) + 10, // 10-40 (Low Stress)
      ecoScore: ['A+', 'A', 'B+'][Math.floor(Math.random() * 3)],
      fatigueIndex: Math.floor(Math.random() * 4) + 2 // 2-5 (Moderate)
    },
    centerCoordinates: cityData.center,
    totalEstimatedCost: '₹5,000 - ₹15,000',
    bestTimeToVisit: 'October - March',
    tips: [
      'Carry a water bottle — Tamil Nadu can be hot!',
      'Learn basic Tamil phrases for a better experience',
      'Respect temple dress codes — cover shoulders and knees'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '108',
      touristHelpline: '1363'
    }
  };
};

