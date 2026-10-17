"""
Engine A: Dynamic Spoilage Decay Predictor
==========================================
Uses a modified Arrhenius kinetics model to predict food safety windows.

Formula:
    t_safe = t0 × exp(-k_decay × (T_ambient - T_base) / 10) × α_humidity × β_packaging

Where:
    α_humidity  = 1.0 - 0.003 × max(0, humidity - 40)
    β_packaging = {open: 0.7, sealed: 1.0, vacuum: 1.5, frozen: 3.0}
"""

import math
from datetime import datetime, timedelta, timezone
from typing import Optional

# ── Pre-calibrated spoilage parameters (food science literature) ──────────
FOOD_PARAMS = {
    "cooked_hot_meals": {"t0_hours": 4.0, "k_decay": 0.18, "t_base": 60},
    "fresh_dairy":      {"t0_hours": 6.0, "k_decay": 0.22, "t_base": 4},
    "leafy_greens":     {"t0_hours": 3.0, "k_decay": 0.25, "t_base": 4},
    "bakery_bread":     {"t0_hours": 24.0, "k_decay": 0.08, "t_base": 22},
    "canned_packaged":  {"t0_hours": 720.0, "k_decay": 0.01, "t_base": 22},
    "fruits":           {"t0_hours": 12.0, "k_decay": 0.12, "t_base": 8},
    "frozen_items":     {"t0_hours": 168.0, "k_decay": 0.03, "t_base": -18},
}

PACKAGING_BETA = {
    "open": 0.7,
    "sealed": 1.0,
    "vacuum": 1.5,
    "frozen": 3.0,
}

URGENCY_THRESHOLDS = [
    (60,  "CRITICAL"),
    (180, "URGENT"),
    (480, "NORMAL"),
]


def _humidity_factor(humidity: float) -> float:
    """Humidity above 40% accelerates microbial growth → shorter shelf life."""
    return max(0.1, 1.0 - 0.003 * max(0.0, humidity - 40.0))


def calculate_spoilage_time(
    food_category: str,
    ambient_temp: float,
    humidity: float = 50.0,
    packaging: str = "sealed",
) -> float:
    """
    Calculate safe window in **minutes** under given environmental conditions.

    Parameters
    ----------
    food_category : str   – key into FOOD_PARAMS
    ambient_temp  : float – ambient temperature in °C
    humidity      : float – relative humidity (0-100)
    packaging     : str   – one of: open, sealed, vacuum, frozen

    Returns
    -------
    float – estimated safe time remaining in minutes (≥ 1.0)
    """
    params = FOOD_PARAMS.get(food_category)
    if not params:
        raise ValueError(f"Unknown food category: {food_category}")

    t0 = params["t0_hours"]
    k  = params["k_decay"]
    t_base = params["t_base"]

    # Arrhenius-inspired exponential decay
    exponent = -k * (ambient_temp - t_base) / 10.0
    t_safe_hours = t0 * math.exp(exponent)

    # Environmental multipliers
    alpha = _humidity_factor(humidity)
    beta  = PACKAGING_BETA.get(packaging, 1.0)

    t_safe_hours *= alpha * beta

    # Clamp to at least 1 minute, and cap at 30 days
    return max(1.0, min(t_safe_hours * 60.0, 43200.0))


def get_spoilage_deadline(
    food_category: str,
    prep_time: datetime,
    ambient_temp: float,
    humidity: float = 50.0,
    packaging: str = "sealed",
) -> datetime:
    """Return the absolute datetime when the food becomes unsafe."""
    safe_minutes = calculate_spoilage_time(food_category, ambient_temp, humidity, packaging)
    return prep_time + timedelta(minutes=safe_minutes)


def get_remaining_minutes(
    food_category: str,
    prep_time: datetime,
    ambient_temp: float,
    humidity: float = 50.0,
    packaging: str = "sealed",
    now: Optional[datetime] = None,
) -> float:
    """Minutes remaining until the food is unsafe.  Negative = expired."""
    if now is None:
        now = datetime.now(timezone.utc)
    deadline = get_spoilage_deadline(food_category, prep_time, ambient_temp, humidity, packaging)
    # Ensure both are offset-aware or offset-naive for subtraction
    if deadline.tzinfo is None and now.tzinfo is not None:
        deadline = deadline.replace(tzinfo=timezone.utc)
    elif deadline.tzinfo is not None and now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)
    return (deadline - now).total_seconds() / 60.0


def get_urgency_level(remaining_minutes: float) -> str:
    """Classify urgency based on remaining safe minutes."""
    for threshold, level in URGENCY_THRESHOLDS:
        if remaining_minutes < threshold:
            return level
    return "STABLE"


def get_urgency_color(level: str) -> str:
    """Return hex colour for urgency badges."""
    return {
        "CRITICAL": "#FF4444",
        "URGENT":   "#FFB020",
        "NORMAL":   "#44BB44",
        "STABLE":   "#4488FF",
    }.get(level, "#888888")


def get_freshness_percentage(
    food_category: str,
    elapsed_minutes: float,
    ambient_temp: float,
    humidity: float = 50.0,
    packaging: str = "sealed",
) -> float:
    """
    Freshness as 0-100%.  Linearly decreases from 100→0 over the safe window.
    """
    total_safe = calculate_spoilage_time(food_category, ambient_temp, humidity, packaging)
    if total_safe <= 0:
        return 0.0
    pct = max(0.0, 100.0 * (1.0 - elapsed_minutes / total_safe))
    return round(min(100.0, pct), 1)


def get_decay_curve(
    food_category: str,
    ambient_temp: float,
    humidity: float = 50.0,
    packaging: str = "sealed",
    duration_hours: float = 24.0,
    steps: int = 100,
) -> list[dict]:
    """
    Generate freshness-over-time curve for plotting.

    Returns list of {"time_minutes": float, "freshness_pct": float}
    """
    total_safe = calculate_spoilage_time(food_category, ambient_temp, humidity, packaging)
    total_minutes = duration_hours * 60.0
    curve = []
    for i in range(steps + 1):
        t = (i / steps) * total_minutes
        pct = max(0.0, 100.0 * (1.0 - t / total_safe)) if total_safe > 0 else 0.0
        curve.append({"time_minutes": round(t, 1), "freshness_pct": round(min(100.0, pct), 1)})
    return curve
