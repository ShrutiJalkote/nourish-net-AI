"""Pydantic schemas for Audit / Crypto certificate objects."""

from pydantic import BaseModel
from typing import Optional


class AuditGenerateRequest(BaseModel):
    match_id: int
    pickup_temp_celsius: float = 25.0
    delivery_temp_celsius: float = 25.0


class AuditCertificate(BaseModel):
    id: int
    match_id: int
    donation_summary: str
    ngo_summary: str
    pickup_temp: float
    delivery_temp: float
    chain_hash: str
    previous_hash: str
    timestamp: str
    transaction_data: dict
    is_valid: bool


class ChainIntegrityResponse(BaseModel):
    total_records: int
    valid: bool
    broken_at_index: Optional[int] = None
    message: str
    chain: list[dict]
