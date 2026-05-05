"""
Travel AI Tamil Nadu — Dynamic Pricing Engine
AI-powered pricing recommendations for transport and tickets
based on crowd predictions, time of day, season, and travel style.
"""
import math
import logging
from datetime import datetime
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


# ─── Base Price Data (Tamil Nadu transport/attraction averages) ────────────

TRANSPORT_BASE_PRICES = {
    "auto_rickshaw": {"base_km": 15, "per_km": 12, "min_fare": 25},
    "taxi": {"base_km": 25, "per_km": 18, "min_fare": 100},
    "bus": {"base_km": 2, "per_km": 1.5, "min_fare": 10},
    "train": {"base_km": 3, "per_km": 0.8, "min_fare": 15},
    "tempo_traveller": {"base_km": 20, "per_km": 15, "min_fare": 500},
}

ATTRACTION_TICKET_TIERS = {
    "free": {"base": 0, "foreign": 0},
    "budget": {"base": 25, "foreign": 100},
    "moderate": {"base": 50, "foreign": 250},
    "premium": {"base": 150, "foreign": 500},
    "luxury": {"base": 500, "foreign": 1500},
}


# ─── Surge Multipliers ───────────────────────────────────────────────────

def _crowd_surge(crowd_percentage: float) -> float:
    """Calculate surge multiplier based on current crowd level."""
    if crowd_percentage > 90:
        return 1.8
    elif crowd_percentage > 75:
        return 1.5
    elif crowd_percentage > 60:
        return 1.3
    elif crowd_percentage > 40:
        return 1.1
    elif crowd_percentage < 15:
        return 0.8  # Discount for very low crowds
    return 1.0


def _time_surge(hour: int) -> float:
    """Time-of-day surge for transport pricing."""
    if 7 <= hour <= 9 or 17 <= hour <= 19:
        return 1.4  # Rush hour
    elif 10 <= hour <= 16:
        return 1.0  # Normal
    elif 20 <= hour <= 23:
        return 1.2  # Evening premium
    else:
        return 0.9  # Night discount


def _season_multiplier(month: int) -> float:
    """Seasonal pricing adjustment."""
    peak = {11: 1.4, 12: 1.5, 1: 1.3, 2: 1.2}
    off_peak = {5: 0.7, 6: 0.6, 7: 0.65, 8: 0.75}
    return peak.get(month, off_peak.get(month, 1.0))


def _festival_premium(date: datetime) -> float:
    """Festival-based pricing premium."""
    from services.visitor_predictor import FESTIVAL_CALENDAR
    key = (date.month, date.day)
    if key in FESTIVAL_CALENDAR:
        _, mult = FESTIVAL_CALENDAR[key]
        return 1.0 + (mult - 1.0) * 0.5  # Half the crowd multiplier as price premium
    return 1.0


# ─── Dynamic Pricing Engine ──────────────────────────────────────────────

class DynamicPricingEngine:
    """
    Calculates AI-recommended dynamic prices for transport and attraction tickets.
    Factors: crowd level, time of day, season, festivals, travel style.
    """

    def get_transport_price(
        self,
        mode: str,
        distance_km: float,
        crowd_percentage: float = 50.0,
        date: Optional[datetime] = None,
    ) -> Dict:
        """Calculate dynamic transport price for a given mode and distance."""
        if date is None:
            date = datetime.now()

        base = TRANSPORT_BASE_PRICES.get(mode)
        if not base:
            return {"error": f"Unknown transport mode: {mode}"}

        # Base fare calculation
        fare = max(base["min_fare"], base["base_km"] + base["per_km"] * distance_km)

        # Apply multipliers
        crowd_mult = _crowd_surge(crowd_percentage)
        time_mult = _time_surge(date.hour)
        season_mult = _season_multiplier(date.month)
        festival_mult = _festival_premium(date)

        dynamic_fare = fare * crowd_mult * time_mult * season_mult * festival_mult
        savings = max(0, fare * 1.5 - dynamic_fare)  # Savings vs peak

        return {
            "mode": mode,
            "distance_km": round(distance_km, 1),
            "baseFare": round(fare, 0),
            "dynamicFare": round(dynamic_fare, 0),
            "currency": "INR",
            "multipliers": {
                "crowd": round(crowd_mult, 2),
                "timeOfDay": round(time_mult, 2),
                "season": round(season_mult, 2),
                "festival": round(festival_mult, 2),
                "total": round(crowd_mult * time_mult * season_mult * festival_mult, 2),
            },
            "recommendation": self._transport_recommendation(mode, crowd_mult, time_mult),
            "potentialSavings": round(savings, 0),
        }

    def get_ticket_price(
        self,
        attraction_name: str,
        tier: str = "moderate",
        is_foreign: bool = False,
        crowd_percentage: float = 50.0,
        date: Optional[datetime] = None,
    ) -> Dict:
        """Calculate dynamic ticket pricing for an attraction."""
        if date is None:
            date = datetime.now()

        ticket = ATTRACTION_TICKET_TIERS.get(tier, ATTRACTION_TICKET_TIERS["moderate"])
        base_price = ticket["foreign"] if is_foreign else ticket["base"]

        if base_price == 0:
            return {
                "attraction": attraction_name,
                "price": 0,
                "currency": "INR",
                "tier": "free",
                "recommendation": "Free entry — visit anytime!",
            }

        # Apply crowd and season modifiers
        season_mult = _season_multiplier(date.month)
        festival_mult = _festival_premium(date)

        # Tickets don't surge as much as transport
        crowd_adj = 1.0 + (crowd_percentage - 50) * 0.002  # ±20% max
        crowd_adj = max(0.8, min(1.2, crowd_adj))

        dynamic_price = base_price * crowd_adj * season_mult * festival_mult

        return {
            "attraction": attraction_name,
            "basePrice": round(base_price, 0),
            "dynamicPrice": round(dynamic_price, 0),
            "currency": "INR",
            "tier": tier,
            "isWeekend": date.weekday() >= 5,
            "multipliers": {
                "crowd": round(crowd_adj, 2),
                "season": round(season_mult, 2),
                "festival": round(festival_mult, 2),
            },
            "recommendation": self._ticket_recommendation(crowd_adj, season_mult),
        }

    def get_budget_breakdown(
        self,
        destination: str,
        days: int,
        travelers: int = 1,
        budget_level: str = "moderate",
        date: Optional[datetime] = None,
    ) -> Dict:
        """Generate a full budget breakdown with dynamic pricing."""
        if date is None:
            date = datetime.now()

        season_mult = _season_multiplier(date.month)

        # Per-person daily estimates (INR)
        budget_tiers = {
            "budget": {"accommodation": 800, "food": 400, "transport": 300, "attractions": 200, "misc": 150},
            "moderate": {"accommodation": 2500, "food": 800, "transport": 600, "attractions": 400, "misc": 300},
            "luxury": {"accommodation": 8000, "food": 2000, "transport": 1500, "attractions": 800, "misc": 500},
        }

        daily = budget_tiers.get(budget_level, budget_tiers["moderate"])
        adjusted_daily = {k: round(v * season_mult) for k, v in daily.items()}
        daily_total = sum(adjusted_daily.values())
        trip_total = daily_total * days * travelers

        return {
            "destination": destination,
            "days": days,
            "travelers": travelers,
            "budgetLevel": budget_level,
            "seasonMultiplier": round(season_mult, 2),
            "dailyBreakdown": adjusted_daily,
            "dailyTotal": daily_total,
            "tripTotal": trip_total,
            "formattedTotal": f"₹{trip_total:,}",
            "tips": self._budget_tips(budget_level, season_mult, date.month),
        }

    def _transport_recommendation(self, mode: str, crowd_mult: float, time_mult: float) -> str:
        if crowd_mult > 1.3 and time_mult > 1.2:
            return f"High demand for {mode} right now. Consider walking or public bus for short distances."
        elif crowd_mult < 0.9:
            return f"Low demand — great time to book a {mode} at reduced rates!"
        elif time_mult > 1.3:
            return f"Rush hour pricing active. Wait 30-60 minutes for normal rates."
        return f"Standard pricing for {mode}. Good time to travel."

    def _ticket_recommendation(self, crowd_adj: float, season_mult: float) -> str:
        if season_mult > 1.3:
            return "Peak season pricing active. Book online for discounts."
        elif crowd_adj > 1.1:
            return "High crowd premium. Visit early morning for better experience."
        elif crowd_adj < 0.9:
            return "Low-crowd discount available — excellent time to visit!"
        return "Standard pricing. Consider combo tickets for savings."

    def _budget_tips(self, level: str, season_mult: float, month: int) -> List[str]:
        tips = []
        if season_mult > 1.2:
            tips.append("Peak season — book accommodation 2-3 weeks in advance for best rates.")
        if season_mult < 0.8:
            tips.append("Off-season rates! You can negotiate 30-40% discounts at most hotels.")
        if level == "budget":
            tips.append("Use Tamil Nadu state buses (TNSTC) — cheapest and most reliable inter-city transport.")
            tips.append("Eat at local 'mess' restaurants for authentic meals under ₹100.")
        elif level == "luxury":
            tips.append("Book heritage properties (CGH Earth, Taj) for authentic luxury experiences.")
            tips.append("Hire a dedicated driver for ₹2,500-3,500/day for the most comfortable experience.")
        tips.append("Download the 'TNSTC' and 'IRCTC' apps for real-time transport booking.")
        return tips


# ─── Module-level singleton ──────────────────────────────────────────────

_engine = None

def get_pricing_engine() -> DynamicPricingEngine:
    global _engine
    if _engine is None:
        _engine = DynamicPricingEngine()
    return _engine
