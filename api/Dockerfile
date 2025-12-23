FROM python:3.12-slim

WORKDIR /app

# Copy project files for skycli package installation
COPY pyproject.toml README.md /app/
COPY src/ /app/src/

# Copy ephemeris file (required by Skyfield for astronomical calculations)
COPY de421.bsp /app/

# Copy API requirements and install dependencies
COPY api/requirements.txt /app/api/
RUN pip install --no-cache-dir -r /app/api/requirements.txt

# Copy API application
COPY api/app /app/app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
