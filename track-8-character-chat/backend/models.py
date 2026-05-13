"""Pydantic request/response models for the Character Chat API."""

from pydantic import BaseModel, Field


class Character(BaseModel):
    """A user-defined character with personality and constraints."""
    name: str = Field(..., min_length=1, max_length=50)
    personality: str = Field(..., min_length=1, max_length=500)
    never_say: str = Field(..., min_length=1, max_length=200)


class Message(BaseModel):
    """A single message in the conversation."""
    role: str = Field(..., pattern=r"^(user|assistant)$")
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    """Request body for the /api/chat endpoint."""
    character: Character
    messages: list[Message] = Field(..., max_length=11)


class OpenerRequest(BaseModel):
    """Request body for the /api/opener endpoint."""
    character: Character


class ChatResponse(BaseModel):
    """Response body containing the character's reply."""
    reply: str
