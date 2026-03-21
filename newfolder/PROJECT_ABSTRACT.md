# Project Abstract: Tamil Nadu Tourism AI Planner

## Overview
The **Tamil Nadu Tourism AI Planner** is a modern, web-based application designed to revolutionize travel planning for Tamil Nadu, India. By leveraging Generative AI (Google Gemini), the platform offers personalized, dynamic itinerary generation that goes beyond static travel guides. The application combines a visually stunning, "premium" user interface with practical travel utilities to create an immersive and efficient planning experience.

## Key Features

### 1. AI-Powered Itinerary Generation (Gemini Integration)
*   **Dynamic Planning:** Users input their destination, budget, interests (e.g., Culture, Food, Adventure), and duration. The Gemini API generates a day-by-day itinerary complete with time slots, activity descriptions, and "local authentic" recommendations.
*   **Smart Fallback:** A robust mock data system ensures the application remains functional even without an API key or internet connection, providing a seamless demo experience.
*   **Custom API Key:** One-click integration for users to input their own Gemini API keys for live data.

### 2. Interactive Mapping (Leaflet & OpenStreetMap)
*   **Visual Routes:** Generated itineraries are automatically mapped on an interactive map using Leaflet and OpenStreetMap.
*   **Geospatial Accuracy:** Coordinates from the AI (or mock data) are plotted to show the spatial layout of the trip, helping users understand travel distances.

### 3. Premium UI/UX Design
*   **Visual Storytelling:** The landing page features a "Golden Frame" aesthetic, parallax scrolling effects, and high-quality imagery to evoke the rich heritage of Tamil Nadu.
*   **Modern Aesthetics:** Glassmorphism, smooth gradients, and motion design (Framer Motion) create a high-end, app-like feel.
*   **Responsive & Accessible:** Fully responsive design ensures the application works seamlessly on desktops, tablets, and mobile devices.

### 4. Comprehensive Travel Hub
*   **Destination Guides:** Dedicated pages for major cities (Chennai, Madurai, etc.) with curated highlights.
*   **Cultural Insights:** A specific section dedicated to festivals, art forms (Bharatanatyam), and traditions.
*   **Culinary Guide:** "Food Finder" modules to help users discover local cuisine.

## Technology Stack
*   **Frontend:** React.js, Vite, Tailwind CSS
*   **AI Integration:** Google Generative AI SDK (Gemini Pro)
*   **Mapping:** Leaflet, React Leaflet, OpenStreetMap
*   **Animations:** Framer Motion
*   **Icons:** Lucide React

## Project Status
The application is currently in a **Release Candidate** state. The core AI planning features, mapping, and UI overhaul are fully implemented and verified. Recent experimental features (Voice AI, 3D Elements) were reverted to ensure stability and focus on the core value proposition: **AI-driven, text-based travel planning with a premium visual experience.**
