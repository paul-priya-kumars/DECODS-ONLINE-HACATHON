# UNDO THE FUTURE API Documentation

This document describes the API endpoints available for the UNDO THE FUTURE platform.

## Base URL

All API endpoints are relative to the base URL of the application.

## Endpoints

### GET /api/health

**Purpose:** Check if the API server is running and healthy.

**Method:** `GET`

**Request:** No parameters or body required.

**Success Response:**
```json
{
  "success": true,
  "data": {
    "service": "UNDO THE FUTURE API",
    "status": "online",
    "version": "1.0.0",
    "phase": 1
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

**Status Codes:**
- 200: Success
- 500: Internal server error

**Future Implementation:** This endpoint will remain largely the same, with potential additions like database connectivity checks.

---

### POST /api/parse-plan

**Purpose:** Parse a natural language plan into structured data using AI.

**Method:** `POST`

**Request Body:**
```json
{
  "input": "I want to organize a 500-person hackathon with a ₹2 lakh budget in 30 days with 3 organizers."
}
```

**Request Validation:**
- `input`: Required string, cannot be empty
- Trim whitespace is applied
- Obviously oversized input may be rejected (implementation-dependent)

**Success Response:**
```json
{
  "success": true,
  "data": {
    "plan": {
      "title": "500-person hackathon",
      "type": "event",
      "participants": 500,
      "budget": 200000,
      "timeline_days": 30,
      "organizers": 3,
      "location": null,
      "resources": [],
      "constraints": []
    },
    "dependencies": []
  },
  "meta": {
    "phase": 2,
    "mock": false
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data. Please provide a non-empty input string."
  }
}
```

**Status Codes:**
- 200: Success
- 400: Validation error
- 401/403: Authentication error (if API key missing or invalid)
- 422: Unprocessable entity (if AI returns invalid JSON)
- 500: Internal server error
- 502: Bad gateway (AI provider error)
- 503: Service unavailable (AI not configured)

**Future Implementation (Phase 2+):**
- Improved AI models and providers
- Enhanced dependency extraction
- Better handling of edge cases and ambiguous inputs
- Caching of frequent queries
- Support for multimodal input (images, diagrams, etc.)

---

### POST /api/simulate

**Purpose:** Run simulations on a structured plan to generate normal, stress, and failure scenarios.

**Method:** `POST`

**Request Body:**
```json
{
  "plan": {
    "title": "500-person hackathon",
    "type": "event",
    "participants": 500,
    "budget": 200000,
    "timeline_days": 30,
    "organizers": 3,
    "location": null,
    "resources": [],
    "constraints": []
  }
}
```

**Request Validation:**
- `plan`: Required object
  - `title`: Required string
  - `type`: Required string
  - `participants`: Required non-negative integer
  - `budget`: Required non-negative number
  - `timeline_days`: Required positive integer
  - `organizers`: Required non-negative integer
  - `location`: Optional string or null
  - `resources`: Optional array of strings (defaults to empty)
  - `constraints`: Optional array of strings (defaults to empty)

**Success Response:**
```json
{
  "success": true,
  "data": {
    "simulation_id": "demo-simulation-id",
    "scenarios": {
      "normal": {
        "risk": "LOW",
        "risk_score": 20,
        "estimated_cost": 175000,
        "timeline_days": 30,
        "impact": "Plan operates within expected assumptions.",
        "consequences": []
      },
      "stress": {
        "risk": "MEDIUM",
        "risk_score": 55,
        "estimated_cost": 205000,
        "timeline_days": 32,
        "impact": "Some assumptions become unfavorable.",
        "consequences": []
      },
      "failure": {
        "risk": "HIGH",
        "risk_score": 85,
        "estimated_cost": 245000,
        "timeline_days": 40,
        "impact": "Major assumptions fail and create cascading effects.",
        "consequences": []
      }
    }
  },
  "meta": {
    "phase": 1,
    "mock": true
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data. Please check your plan object."
  }
}
```

**Status Codes:**
- 200: Success
- 400: Validation error
- 500: Internal server error

**Future Implementation (Phase 3):**
- Replace placeholder logic with actual simulation engine
- Generate realistic scenarios based on plan parameters
- Calculate risk scores using risk engine
- Generate meaningful consequence chains
- Store simulation results in database

---

### POST /api/resimulate

**Purpose:** Re-run a simulation with modified assumptions to compare before/after scenarios.

**Method:** `POST`

**Request Body:**
```json
{
  "simulation_id": "demo-simulation-id",
  "assumptions": {
    "participants": 400,
    "budget": 220000,
    "timeline_days": 30,
    "organizers": 3
  }
}
```

**Request Validation:**
- `simulation_id`: Required string, cannot be empty
- `assumptions`: Required object with optional fields:
  - `participants`: Non-negative integer
  - `budget`: Non-negative number
  - `timeline_days`: Positive integer
  - `organizers`: Non-negative integer

**Success Response:**
```json
{
  "success": true,
  "data": {
    "simulation_id": "demo-simulation-id",
    "before": {
      "risk": "HIGH",
      "risk_score": 85
    },
    "after": {
      "risk": "MEDIUM",
      "risk_score": 55
    },
    "changes": [
      "Participant count changed from 500 to 400.",
      "Simulation recalculation will be implemented in a later phase."
    ]
  },
  "meta": {
    "phase": 1,
    "mock": true
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data. Please provide simulation_id and assumptions object."
  }
}
```

**Status Codes:**
- 200: Success
- 400: Validation error
- 500: Internal server error

**Future Implementation (Phase 4):**
- Retrieve original simulation from database
- Apply new assumptions to plan
- Re-run simulation engine
- Compare before/after risk scores and outcomes
- Return actual comparison data

---

### GET /api/history

**Purpose:** Retrieve simulation history for the user.

**Method:** `GET`

**Request:** No parameters or body required.

**Success Response:**
```json
{
  "success": true,
  "data": {
    "simulations": []
  },
  "meta": {
    "phase": 1,
    "mock": true
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

**Status Codes:**
- 200: Success
- 500: Internal server error

**Future Implementation (Phase 5):**
- Fetch simulation history from database
- Return list of past simulations with metadata
- Support pagination and filtering
- Include simulation IDs, timestamps, and summary data

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {}, // Response data varies by endpoint
  "meta": {
    "phase": number,
    "mock": boolean // Indicates whether data is placeholder (true) or actual (false)
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE", // Standard error code
    "message": "Human readable error message"
  },
  "meta": {
    "phase": number,
    "mock": boolean
  }
}
```

## Error Codes

- `VALIDATION_ERROR`: Request data failed validation (400)
- `AI_CONFIGURATION_ERROR`: AI parser not configured (503)
- `AI_PROVIDER_ERROR`: AI provider error occurred (502)
- `AI_PARSE_ERROR`: AI returned invalid JSON or failed validation (500)
- `NOT_FOUND`: Requested resource not found (404)
- `INTERNAL_ERROR`: Unexpected server error (500)
- `SIMULATION_NOT_FOUND`: Specific simulation not found (404)

## Status Codes

- 200: Request successful
- 400: Bad request (validation errors)
- 401: Unauthorized (missing or invalid API key)
- 403: Forbidden (insufficient permissions)
- 404: Resource not found
- 422: Unprocessable entity (semantic errors)
- 500: Internal server error
- 502: Bad gateway (AI provider error)
- 503: Service unavailable (AI not configured)
- 504: Gateway timeout (AI provider timeout)

## Notes for Frontend Developer

1. All endpoints are relative to the API root (e.g., if your app is at `https://example.com`, the health endpoint is at `https://example.com/api/health`)
2. All POST endpoints expect JSON in the request body and return JSON in the response
3. The `/api/parse-plan` endpoint is now implemented in Phase 2 with actual AI parsing
4. The `/api/simulate`, `/api/resimulate`, and `/api/history` endpoints remain as Phase 1 placeholders
5. The `meta.phase` and `meta.mock` fields indicate the implementation phase and whether data is placeholder
6. Error responses follow a consistent format for easy handling
7. Authentication for AI services is handled via environment variables (not exposed to frontend)