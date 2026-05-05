/**
 * Travel AI — Multi-AI Orchestrator Service (Backend Proxy)
 * All AI calls are now routed through the secure FastAPI backend
 * API keys are kept server-side, not exposed in the browser.
 */

import { aiService } from './api';

const getCache = (key) => {
    try {
        const raw = localStorage.getItem(`travelai_${key}`);
        if (raw) {
            const { value, ts } = JSON.parse(raw);
            if (Date.now() - ts < 24 * 60 * 60 * 1000) return value;
        }
    } catch (e) { console.error('Cache ignored', e); }
    return null;
};

const setCache = (key, value) => {
    try {
        localStorage.setItem(`travelai_${key}`, JSON.stringify({ value, ts: Date.now() }));
    } catch (e) { console.error('Cache set ignored', e); }
};

export const queryAI = async (prompt) => {
    const cacheKey = `query_${prompt.substring(0, 50).replace(/\s+/g, '_')}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
        const response = await aiService.query(prompt);
        if (response.data?.text) {
            setCache(cacheKey, response.data);
            return response.data;
        }
    } catch (err) {
        console.warn('AI Query failed:', err.message);
    }
    throw new Error('AI service unavailable. Please try again.');
};

export const queryMultiAI = async (prompt) => {
    return queryAI(prompt);
};

export const getPlaceHistory = async (placeName) => {
    const cacheKey = `history_v2_${placeName.toLowerCase().replace(/\s+/g, '_')}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
        const response = await aiService.getPlaceHistory(placeName);
        if (response.data) {
            setCache(cacheKey, response.data);
            return response.data;
        }
    } catch (err) {
        console.warn('AI Error in getPlaceHistory:', err.message);
    }
    return { title: `The Living History of ${placeName}`, narrative: "Information temporarily unavailable. Please try again later.", timeline: [], dynasties: [], funFact: '', livingTradition: '', numberInsights: [] };
};

export const getPlaceUniqueness = async (placeName) => {
    const cacheKey = `unique_v2_${placeName.toLowerCase().replace(/\s+/g, '_')}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
        const response = await aiService.getPlaceUniqueness(placeName);
        if (response.data) {
            setCache(cacheKey, response.data);
            return response.data;
        }
    } catch (err) {
        console.warn('AI Error in getPlaceUniqueness:', err.message);
    }
    return { tagline: `Discover ${placeName}`, uniqueFeatures: [], bestKeptSecrets: [], photographySpots: [], bestExperience: '', localTip: '', livingCulture: '', whatBooksWontTellYou: '' };
};

export const getTrendingPlaces = async () => {
    const cacheKey = 'trending_places_v4';
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
        const response = await aiService.getTrendingPlaces();
        if (response.data?.places) {
            setCache(cacheKey, response.data.places);
            return response.data.places;
        }
    } catch (err) {
        console.warn('AI Error in getTrendingPlaces:', err.message);
    }
    return [];
};

export const getHiddenGems = async (districtName) => {
    const cacheKey = `gems_v2_${districtName.toLowerCase().replace(/\s+/g, '_')}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
        const response = await aiService.getHiddenGems(districtName);
        if (response.data?.gems) {
            setCache(cacheKey, response.data.gems);
            return response.data.gems;
        }
    } catch (err) {
        console.warn('AI Error in getHiddenGems:', err.message);
    }
    return [];
};

export const getWeather = async (lat, lng) => {
    const cacheKey = `weather_${lat}_${lng}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
        const resp = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia/Kolkata&forecast_days=5`
        );
        const data = await resp.json();
        const result = {
            current: {
                temp: Math.round(data.current?.temperature_2m || 28),
                humidity: data.current?.relative_humidity_2m || 60,
                windSpeed: Math.round(data.current?.wind_speed_10m || 10),
                code: data.current?.weather_code || 0,
                condition: weatherCodeToText(data.current?.weather_code || 0),
            },
            forecast: (data.daily?.time || []).map((date, i) => ({
                date,
                maxTemp: Math.round(data.daily.temperature_2m_max[i]),
                minTemp: Math.round(data.daily.temperature_2m_min[i]),
                condition: weatherCodeToText(data.daily.weather_code[i]),
            })),
        };
        setCache(cacheKey, result);
        return result;
    } catch {
        return { current: { temp: 28, humidity: 60, condition: 'Sunny', windSpeed: 10 }, forecast: [] };
    }
};

const weatherCodeToText = (code) => {
    if (code <= 1) return 'Clear ☀️';
    if (code <= 3) return 'Cloudy ⛅';
    if (code <= 48) return 'Foggy 🌫️';
    if (code <= 57) return 'Drizzle 🌦️';
    if (code <= 67) return 'Rainy 🌧️';
    if (code <= 77) return 'Snowy ❄️';
    if (code <= 82) return 'Showers 🌧️';
    if (code <= 99) return 'Thunderstorm ⛈️';
    return 'Clear ☀️';
};

export const getSmartPackingList = async (destination, duration, month) => {
    const cacheKey = `packing_${destination}_${duration}_${month}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    return {
        essentials: ['Passport/ID', 'Cash & Cards', 'Phone charger'],
        clothing: ['Light cotton clothes', 'Comfortable shoes', 'Scarf for temples'],
        electronics: ['Phone', 'Power bank', 'Camera'],
        health: ['Sunscreen', 'Water bottle', 'First aid kit'],
        culturalEtiquette: ['Cover shoulders in temples', 'Remove shoes before entering'],
        doNotForget: ['Travel insurance', 'Copies of documents']
    };
};

export const estimateBudget = async (destination, duration, travelers, budgetLevel) => {
    const cacheKey = `budget_${destination}_${duration}_${travelers}_${budgetLevel}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
        const response = await aiService.estimateBudget(destination, duration, travelers, budgetLevel);
        if (response.data) {
            setCache(cacheKey, response.data);
            return response.data;
        }
    } catch (err) {
        console.warn('AI Error in estimateBudget:', err.message);
    }
    return null;
};

export const translateToTamil = async (phrases) => {
    const cacheKey = `tamil_${phrases.join('_').substring(0, 50)}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
        const response = await aiService.translateToTamil(phrases);
        if (response.data?.translations) {
            setCache(cacheKey, response.data.translations);
            return response.data.translations;
        }
    } catch (err) {
        console.warn('AI Error in translateToTamil:', err.message);
    }
    return phrases.map(p => ({ english: p, tamil: '', pronunciation: '', usage: '' }));
};

export const getChennaiTourismInsights = async (focusArea = 'culture') => {
    const cacheKey = `chennai_insights_v2_${focusArea}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
        const response = await aiService.getPlaceUniqueness(`Chennai ${focusArea}`);
        if (response.data) {
            const mappedData = {
                title: response.data.tagline || `Chennai ${focusArea} Highlights`,
                highlights: (response.data.uniqueFeatures || []).map(f => ({
                    name: f.title,
                    type: f.icon || '✨',
                    description: f.description
                })),
                localSecret: (response.data.bestKeptSecrets && response.data.bestKeptSecrets.length > 0) ? response.data.bestKeptSecrets[0] : '',
                bestTimeToExperience: response.data.localTip || ''
            };
            setCache(cacheKey, mappedData);
            return mappedData;
        }
    } catch (err) {
        console.warn('AI Error in getChennaiTourismInsights:', err.message);
    }
    return null;
};

export default {
    queryAI,
    queryMultiAI,
    getPlaceHistory,
    getPlaceUniqueness,
    getTrendingPlaces,
    getHiddenGems,
    getWeather,
    getSmartPackingList,
    estimateBudget,
    translateToTamil,
    getChennaiTourismInsights,
};