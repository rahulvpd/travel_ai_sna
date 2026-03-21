import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import TripPlanner from './pages/TripPlanner';
import Planner from './pages/Planner'; // Ensure Planner is imported
import ItineraryGenerator from './pages/ItineraryGenerator';
import DestinationDetails from './pages/DestinationDetails';
import FoodFinder from './pages/FoodFinder';
import CultureHub from './pages/CultureHub';
import TravelTools from './pages/TravelTools';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider } from './context/AuthContext';
import GeminiDemo from './pages/GeminiDemo';

// Placeholder components for future modules
import Destinations from './pages/Destinations';
import AnimatedBackground from './components/ui/AnimatedBackground';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen font-sans relative">
          <AnimatedBackground />
          <Navbar />
          <main className="flex-grow z-10">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/destinations" element={<Destinations />} />
              {/* Removed duplicate /planner route */}
              <Route path="/planner" element={<TripPlanner />} />
              <Route path="/itinerary" element={<Planner />} />
              <Route path="/food" element={<FoodFinder />} />
              <Route path="/culture" element={<CultureHub />} />
              <Route path="/tools" element={<TravelTools />} />
              <Route path="/destinations/:id" element={<DestinationDetails />} />
              <Route path="/destinations/:id" element={<DestinationDetails />} />
              <Route path="/gemini-demo" element={<GeminiDemo />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
