"""Pydantic schemas for NGO objects."""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class OrgType(str, Enum):
    SHELTER = "shelter"
    KITCHEN = "kitchen"
    FOOD_BANK = "food_bank"
    COMMUNITY_CENTER = "community_center"


class NGOCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    org_type: OrgType = OrgType.KITCHEN
    capacity_kg: float = Field(..., gt=0, le=10000)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    dietary_prefs: list[str] = Field(default_factory=lambda: ["vegetarian", "non-vegetarian"])
    beneficiary_count: int = Field(default=100, ge=1)
    has_refrigeration: bool = False
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None


class NGOResponse(BaseModel):
    id: int
    name: str
    org_type: str
    capacity_kg: float
    latitude: float
    longitude: float
    dietary_prefs: list[str]
    beneficiary_count: int
    has_refrigeration: bool
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    created_at: str
    current_load_kg: float
    available_capacity_kg: float
