"""Application configuration — Vertex AI / Gemini settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    GOOGLE_CLOUD_PROJECT: str = "neon-emitter-458622-e3"
    GOOGLE_CLOUD_LOCATION: str = "global"
    GOOGLE_GENAI_USE_VERTEXAI: bool = True


settings = Settings()
