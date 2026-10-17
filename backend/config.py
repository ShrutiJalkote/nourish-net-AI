"""
NourishNet AI — Configuration Module
Central configuration for all engines, parameters, and app settings.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ── App Metadata ──────────────────────────────────────────────────────────
APP_NAME = os.getenv("APP_NAME", "NourishNet AI")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
APP_DESCRIPTION = "Real-Time Food Rescue & Intelligent Redistribution Platform"
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# ── Server ────────────────────────────────────────────────────────────────
BACKEND_HOST = os.getenv("BACKEND_HOST", "0.0.0.0")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))
FRONTEND_PORT = int(os.getenv("FRONTEND_PORT", "8501"))
SECRET_KEY = os.getenv("SECRET_KEY", "nourishnet-dev-key-2026")

# ── Database ──────────────────────────────────────────────────────────────
DATABASE_PATH = os.getenv("DATABASE_PATH", "./data/nourishnet.db")

# ── Delivery ──────────────────────────────────────────────────────────────
MAX_DELIVERY_RANGE_KM = float(os.getenv("MAX_DELIVERY_RANGE_KM", "50"))
AVG_SPEED_KMH = 30.0          # Average city delivery speed
LOADING_TIME_MIN = 10.0        # Time to load food at pickup
OPENROUTESERVICE_API_KEY = os.getenv("OPENROUTESERVICE_API_KEY", "")

# ── Spoilage Engine Parameters ────────────────────────────────────────────
# Modified Arrhenius model:  t_safe = t0 * exp(-k * (T-T_base)/10) * α * β
FOOD_PARAMS = {
    "cooked_hot_meals": {
        "display_name": "Cooked Hot Meals",
        "t0_hours": 4.0,
        "k_decay": 0.18,
        "t_base_celsius": 60,
        "notes": "Must stay above 60°C or below 5°C",
    },
    "fresh_dairy": {
        "display_name": "Fresh Dairy",
        "t0_hours": 6.0,
        "k_decay": 0.22,
        "t_base_celsius": 4,
        "notes": "Rapid degradation above 10°C",
    },
    "leafy_greens": {
        "display_name": "Leafy Greens / Salads",
        "t0_hours": 3.0,
        "k_decay": 0.25,
        "t_base_celsius": 4,
        "notes": "Most perishable category",
    },
    "bakery_bread": {
        "display_name": "Bakery / Bread",
        "t0_hours": 24.0,
        "k_decay": 0.08,
        "t_base_celsius": 22,
        "notes": "Slow degradation; mold-driven",
    },
    "canned_packaged": {
        "display_name": "Canned / Packaged",
        "t0_hours": 720.0,
        "k_decay": 0.01,
        "t_base_celsius": 22,
        "notes": "Shelf-stable baseline",
    },
    "fruits": {
        "display_name": "Fruits",
        "t0_hours": 12.0,
        "k_decay": 0.12,
        "t_base_celsius": 8,
        "notes": "Ethylene-sensitive",
    },
    "frozen_items": {
        "display_name": "Frozen Items",
        "t0_hours": 168.0,
        "k_decay": 0.03,
        "t_base_celsius": -18,
        "notes": "Only degrades if thaw chain broken",
    },
}

# Packaging multipliers for spoilage
PACKAGING_MULTIPLIERS = {
    "open": 0.7,
    "sealed": 1.0,
    "vacuum": 1.5,
    "frozen": 3.0,
}

# ── Matcher Engine Weights ────────────────────────────────────────────────
MATCH_WEIGHTS = {
    "urgency": 0.30,
    "capacity_fit": 0.20,
    "community_need": 0.20,
    "proximity": 0.20,
    "dietary_match": 0.10,
}

# ── Urgency Thresholds (minutes) ─────────────────────────────────────────
URGENCY_THRESHOLDS = {
    "CRITICAL": 60,      # < 60 min
    "URGENT": 180,       # < 180 min
    "NORMAL": 480,       # < 480 min
    "STABLE": float("inf"),  # >= 480 min
}

URGENCY_COLORS = {
    "CRITICAL": "#FF4444",
    "URGENT": "#FFB020",
    "NORMAL": "#44BB44",
    "STABLE": "#4488FF",
}

# ── ESG Impact Factors ────────────────────────────────────────────────────
ESG_FACTORS = {
    "meals_per_kg": 2.5,           # 1 kg ≈ 2.5 meals
    "co2_per_kg": 2.5,             # 1 kg food waste ≈ 2.5 kg CO₂e
    "water_per_kg": 100.0,         # 1 kg food ≈ 100L water footprint
    "trees_per_ton_co2": 45.0,     # 1 ton CO₂ ≈ 45 trees/year
    "bathtub_liters": 300.0,       # 1 bathtub ≈ 300 liters
}

# ── Indian Cities Coordinates ─────────────────────────────────────────────
CITIES = {
    "Mumbai": {"lat": 19.0760, "lng": 72.8777},
    "Delhi": {"lat": 28.6139, "lng": 77.2090},
    "Bangalore": {"lat": 12.9716, "lng": 77.5946},
    "Hyderabad": {"lat": 17.3850, "lng": 78.4867},
    "Chennai": {"lat": 13.0827, "lng": 80.2707},
    "Kolkata": {"lat": 22.5726, "lng": 88.3639},
    "Pune": {"lat": 18.5204, "lng": 73.8567},
    "Ahmedabad": {"lat": 23.0225, "lng": 72.5714},
    "Jaipur": {"lat": 26.9124, "lng": 75.7873},
    "Lucknow": {"lat": 26.8467, "lng": 80.9462},
}
