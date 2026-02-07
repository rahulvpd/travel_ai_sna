import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import TripPlanner from './pages/TripPlanner';
import ItineraryGenerator from './pages/ItineraryGenerator';
import DestinationDetails from './pages/DestinationDetails';
import FoodFinder from './pages/FoodFinder';
import CultureHub from './pages/CultureHub';
import TravelTools from './pages/TravelTools';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider } from './context/AuthContext';

// Placeholder components for future modules
import Destinations from './pages/Destinations';
const Assistant = () => <div className="pt-24 text-center min-h-screen">Chat with our AI Assistant! (Coming Soon)</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen font-sans">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/planner" element={<TripPlanner />} />
              <Route path="/planner" element={<TripPlanner />} />
              <Route path="/itinerary" element={<ItineraryGenerator />} />
              <Route path="/food" element={<FoodFinder />} />
              <Route path="/culture" element={<CultureHub />} />
              <Route path="/tools" element={<TravelTools />} />
              <Route path="/destinations/:id" element={<DestinationDetails />} />
              <Route path="/assistant" element={<Assistant />} />
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
