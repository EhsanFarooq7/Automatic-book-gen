from pydantic import BaseModel
from typing import Optional


class BookCreate(BaseModel):
    title: str
    notes_on_outline_before: str


class OutlineReview(BaseModel):
    book_id: str
    status_outline_notes: str  # 'yes', 'no', or 'no_notes_needed'
    notes_on_outline_after: Optional[str] = None

