"""Configuration via environment variables."""

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    n2yo_api_key: str = ""
    # Accept comma-separated string, parsed into list via computed_field
    cors_origins_str: str = "http://localhost:5173,http://localhost:5174"
    environment: str = "development"

    @computed_field
    @property
    def cors_origins(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins_str.split(",")]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()
