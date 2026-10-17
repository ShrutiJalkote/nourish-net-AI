"""Pydantic schemas for Match result objects."""

from pydantic import BaseModel
from typing import Optional


class MatchRequest(BaseModel):
    donation_id: Optional[int] = None  # None = batch match all unmatched


class MatchResult(BaseModel):
    id: int
    donation_id: int
    ngo_id: int
    donor_name: str
    ngo_name: str
    food_category: str
    quantity_kg: float
    composite_score: float
    urgency_score: float
    capacity_fit_score: float
    need_score: float
    proximity_score: float
    dietary_match_score: float
    distance_km: float
    eta_minutes: float
    matched_at: str
    status: str
    tier: int = 1
    tier_name: str = "Human Relief"
    shap_explanation: Optional[dict] = None
