"""Pydantic schemas for Donation objects."""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class PackagingType(str, Enum):
    OPEN = "open"
    SEALED = "sealed"
    VACUUM = "vacuum"
    FROZEN = "frozen"


class FoodCategory(str, Enum):
    COOKED_HOT_MEALS = "cooked_hot_meals"
    FRESH_DAIRY = "fresh_dairy"
    LEAFY_GREENS = "leafy_greens"
    BAKERY_BREAD = "bakery_bread"
    CANNED_PACKAGED = "canned_packaged"
    FRUITS = "fruits"
    FROZEN_ITEMS = "frozen_items"


class DonationCreate(BaseModel):
    donor_name: str = Field(..., min_length=1, max_length=200)
    food_category: FoodCategory
    quantity_kg: float = Field(..., gt=0, le=5000)
    prep_time: str = Field(..., description="ISO-8601 datetime of food preparation")
    ambient_temp_celsius: float = Field(..., ge=-30, le=60)
    humidity_percent: float = Field(default=50.0, ge=0, le=100)
    packaging_type: PackagingType = PackagingType.SEALED
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    notes: Optional[str] = None


class DonationResponse(BaseModel):
    id: int
    donor_name: str
    food_category: str
    quantity_kg: float
    prep_time: str
    ambient_temp_celsius: float
    humidity_percent: float
    packaging_type: str
    latitude: float
    longitude: float
    notes: Optional[str] = None
    created_at: str
    spoilage_deadline: str
    urgency_level: str
    freshness_pct: float
    remaining_minutes: float
    status: str
