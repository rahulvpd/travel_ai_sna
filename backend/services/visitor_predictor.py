"""
Travel AI Tamil Nadu — Visitor Flow Predictor
Machine Learning model for predicting tourist crowd levels
at heritage sites based on time, weather, and calendar features.

Uses scikit-learn (if available) with a gradient boosting regressor,
falling back to a rules-based heuristic if scikit-learn is not installed.
"""
import math
import json
import os
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

# ─── Feature Engineering ──────────────────────────────────────────────────

# Tamil Nadu holiday/festival calendar (month, day) -> crowd multiplier
FESTIVAL_CALENDAR = {
    (1, 14): ("Pongal", 2.5),
    (1, 15): ("Pongal Day 2", 2.3),
    (1, 16): ("Pongal Day 3", 2.0),
    (1, 26): ("Republic Day", 1.8),
    (4, 14): ("Tamil New Year", 2.2),
    (8, 15): ("Independence Day", 1.9),
    (10, 2): ("Gandhi Jayanti", 1.5),
    (10, 24): ("Diwali Approx", 1.6),
    (11, 1): ("Tamil Nadu Day", 1.4),
    (12, 25): ("Christmas", 1.7),
}

# Weather impact coefficients
WEATHER_IMPACT = {
    "clear": 1.0,
    "sunny": 1.0,
    "cloudy": 0.9,
    "partly_cloudy": 0.95,
    "rainy": 0.5,
    "heavy_rain": 0.2,
    "stormy": 0.1,
    "foggy": 0.7,
    "hot": 0.8,  # >40°C discourages visitors
}


def _extract_features(
    date: datetime,
    temperature: float = 30.0,
    weather: str = "clear",
    capacity: int = 1000,
    base_popularity: float = 0.6,
) -> list:
    """Extract ML-ready features from contextual data."""
    hour = date.hour
    day_of_week = date.weekday()  # 0=Mon, 6=Sun
    month = date.month
    day_of_month = date.day
    is_weekend = 1 if day_of_week >= 5 else 0

    # Time-of-day as cyclical features
    hour_sin = math.sin(2 * math.pi * hour / 24)
    hour_cos = math.cos(2 * math.pi * hour / 24)

    # Season features (Tamil Nadu climate)
    # Peak tourist: Oct-Feb (post-monsoon cool); Off-peak: Mar-May (hot)
    month_sin = math.sin(2 * math.pi * month / 12)
    month_cos = math.cos(2 * math.pi * month / 12)

    # Festival check
    festival_mult = 1.0
    for (fm, fd), (_, mult) in FESTIVAL_CALENDAR.items():
        if month == fm and day_of_month == fd:
            festival_mult = mult
            break

    # Weather factor
    weather_factor = WEATHER_IMPACT.get(weather.lower(), 0.8)

    # Temperature penalty (optimal: 22-32°C)
    temp_factor = 1.0
    if temperature > 38:
        temp_factor = 0.6
    elif temperature > 35:
        temp_factor = 0.8
    elif temperature < 15:
        temp_factor = 0.7

    return [
        hour, hour_sin, hour_cos,
        day_of_week, is_weekend,
        month, month_sin, month_cos,
        temperature, temp_factor,
        weather_factor,
        festival_mult,
        capacity,
        base_popularity,
    ]


# ─── ML Predictor (scikit-learn) ──────────────────────────────────────────

try:
    from sklearn.ensemble import GradientBoostingRegressor
    import numpy as np

    SKLEARN_AVAILABLE = True
    logger.info("scikit-learn available — using GradientBoosting predictor")
except ImportError:
    SKLEARN_AVAILABLE = False
    logger.info("scikit-learn not available — using rules-based predictor")


class VisitorFlowPredictor:
    """
    Predicts visitor counts at heritage sites using:
    - Gradient Boosting (if scikit-learn is available)
    - Rules-based heuristic (fallback)
    """

    def __init__(self):
        self.model = None
        self.is_trained = False
        self._generate_training_data_and_fit()

    def _generate_training_data_and_fit(self):
        """Generate synthetic training data from domain knowledge and fit the model."""
        if not SKLEARN_AVAILABLE:
            return

        X_train = []
        y_train = []

        # Generate synthetic training samples based on Tamil Nadu tourism patterns
        base_date = datetime(2025, 1, 1)
        for day_offset in range(365):
            date = base_date + timedelta(days=day_offset)
            for hour in [6, 8, 10, 12, 14, 16, 18, 20]:
                for weather in ["clear", "cloudy", "rainy"]:
                    for capacity in [500, 1000, 2000]:
                        features = _extract_features(
                            date.replace(hour=hour),
                            temperature=25 + 8 * math.sin(2 * math.pi * date.month / 12),
                            weather=weather,
                            capacity=capacity,
                            base_popularity=0.6,
                        )

                        # Generate target using domain rules (so the model learns patterns)
                        hour_factor = _hour_curve(hour)
                        weekend_bonus = 1.3 if date.weekday() >= 5 else 1.0
                        season_factor = _season_curve(date.month)
                        weather_f = WEATHER_IMPACT.get(weather, 0.8)
                        festival_f = features[11]  # festival_mult from feature extraction

                        predicted = (
                            capacity
                            * 0.6  # base_popularity
                            * hour_factor
                            * weekend_bonus
                            * season_factor
                            * weather_f
                            * festival_f
                        )
                        # Add noise for robustness
                        noise = 1.0 + (hash(f"{date}{hour}{weather}") % 20 - 10) / 100.0
                        predicted = max(5, int(predicted * noise))

                        X_train.append(features)
                        y_train.append(predicted)

        X_train = np.array(X_train)
        y_train = np.array(y_train)

        self.model = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42,
        )
        self.model.fit(X_train, y_train)
        self.is_trained = True
        logger.info(f"VisitorFlowPredictor trained on {len(X_train)} samples")

    def predict(
        self,
        place_name: str,
        date: Optional[datetime] = None,
        temperature: float = 30.0,
        weather: str = "clear",
        capacity: int = 1000,
        base_popularity: float = 0.6,
    ) -> Dict:
        """Predict visitor count for a given place and conditions."""
        if date is None:
            date = datetime.now()

        features = _extract_features(date, temperature, weather, capacity, base_popularity)

        if self.is_trained and self.model and SKLEARN_AVAILABLE:
            predicted = int(self.model.predict(np.array([features]))[0])
        else:
            predicted = _rules_predict(features, capacity)

        predicted = max(5, min(capacity, predicted))
        percentage = int((predicted / capacity) * 100)

        # Determine crowd level
        if percentage > 85:
            crowd_level = "Very High"
            recommendation = "Consider visiting early morning or late afternoon"
        elif percentage > 65:
            crowd_level = "High"
            recommendation = "Moderate crowds expected — book tickets in advance"
        elif percentage > 40:
            crowd_level = "Moderate"
            recommendation = "Good time to visit — comfortable crowd levels"
        elif percentage > 15:
            crowd_level = "Low"
            recommendation = "Excellent time to visit — minimal crowds"
        else:
            crowd_level = "Very Low"
            recommendation = "Near-empty — perfect for photography and peaceful exploration"

        # Festival check
        festival_info = None
        month_day = (date.month, date.day)
        if month_day in FESTIVAL_CALENDAR:
            festival_info = FESTIVAL_CALENDAR[month_day][0]

        return {
            "place": place_name,
            "predictedVisitors": predicted,
            "capacity": capacity,
            "percentage": percentage,
            "crowdLevel": crowd_level,
            "recommendation": recommendation,
            "festival": festival_info,
            "conditions": {
                "temperature": temperature,
                "weather": weather,
                "isWeekend": date.weekday() >= 5,
                "hour": date.hour,
            },
            "model": "GradientBoosting" if self.is_trained else "RulesBased",
        }

    def predict_range(
        self,
        place_name: str,
        hours_ahead: int = 12,
        temperature: float = 30.0,
        weather: str = "clear",
        capacity: int = 1000,
    ) -> List[Dict]:
        """Predict visitor flow for the next N hours."""
        now = datetime.now()
        predictions = []

        for h in range(hours_ahead):
            future = now + timedelta(hours=h)
            pred = self.predict(
                place_name, future, temperature, weather, capacity
            )
            pred["hour"] = future.strftime("%H:%M")
            pred["timestamp"] = future.isoformat()
            predictions.append(pred)

        return predictions


# ─── Helper Functions ─────────────────────────────────────────────────────

def _hour_curve(hour: int) -> float:
    """Bell curve for visitor activity through the day."""
    if hour < 6:
        return 0.05
    elif hour < 8:
        return 0.2
    elif hour < 10:
        return 0.6
    elif hour < 12:
        return 0.9
    elif hour < 14:
        return 0.7  # Lunch dip
    elif hour < 16:
        return 0.85
    elif hour < 18:
        return 0.95  # Afternoon peak
    elif hour < 20:
        return 0.5
    else:
        return 0.1


def _season_curve(month: int) -> float:
    """Season multiplier for Tamil Nadu tourism."""
    # Peak: Nov-Feb; Low: May-Jul
    season_map = {
        1: 1.3, 2: 1.2, 3: 1.0, 4: 0.8,
        5: 0.6, 6: 0.5, 7: 0.5, 8: 0.7,
        9: 0.8, 10: 1.0, 11: 1.3, 12: 1.4,
    }
    return season_map.get(month, 0.8)


def _rules_predict(features: list, capacity: int) -> int:
    """Fallback rules-based prediction when scikit-learn is not available."""
    hour = features[0]
    is_weekend = features[4]
    temp_factor = features[9]
    weather_factor = features[10]
    festival_mult = features[11]
    base_popularity = features[13]

    hour_factor = _hour_curve(int(hour))
    weekend_bonus = 1.3 if is_weekend else 1.0
    month = int(features[5])
    season_factor = _season_curve(month)

    predicted = (
        capacity
        * base_popularity
        * hour_factor
        * weekend_bonus
        * season_factor
        * weather_factor
        * temp_factor
        * festival_mult
    )

    return max(5, int(predicted))


# ─── Network Evolution Predictor ──────────────────────────────────────────

class NetworkEvolutionPredictor:
    """
    Predicts how the heritage tourism network evolves over time.
    Uses simple graph growth models (Barabási–Albert inspired).
    """

    def __init__(self):
        self.base_nodes = 30  # Current heritage sites
        self.growth_rate = 0.05  # 5% annual growth in connections

    def predict_evolution(self, years_ahead: int = 5) -> Dict:
        """Predict network metrics N years into the future."""
        predictions = []
        nodes = self.base_nodes
        edges = int(nodes * 1.5)  # Current edge count estimate

        for year in range(1, years_ahead + 1):
            # New sites discovered/restored each year
            new_nodes = max(1, int(nodes * 0.03))
            nodes += new_nodes

            # New connections form preferentially
            new_edges = int(edges * self.growth_rate) + new_nodes * 2
            edges += new_edges

            # Network metrics evolve
            avg_degree = (2 * edges) / nodes
            density = (2 * edges) / (nodes * (nodes - 1)) if nodes > 1 else 0
            clustering = min(0.95, 0.6 + year * 0.02)  # Increases with maturity

            predictions.append({
                "year": datetime.now().year + year,
                "nodes": nodes,
                "edges": edges,
                "avgDegree": round(avg_degree, 2),
                "density": round(density, 4),
                "clusteringCoefficient": round(clustering, 3),
                "newSitesDiscovered": new_nodes,
                "newConnectionsFormed": new_edges,
            })

        return {
            "currentState": {
                "nodes": self.base_nodes,
                "edges": int(self.base_nodes * 1.5),
            },
            "predictions": predictions,
            "model": "BarabasiAlbert-Inspired",
        }


# ─── Module-level instances ──────────────────────────────────────────────

# Lazy initialization to avoid slow startup
_predictor = None
_network_predictor = None


def get_visitor_predictor() -> VisitorFlowPredictor:
    global _predictor
    if _predictor is None:
        _predictor = VisitorFlowPredictor()
    return _predictor


def get_network_predictor() -> NetworkEvolutionPredictor:
    global _network_predictor
    if _network_predictor is None:
        _network_predictor = NetworkEvolutionPredictor()
    return _network_predictor
