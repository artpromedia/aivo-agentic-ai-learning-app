# AIVO Curriculum Service

Part of **PROMPT 57: Base Brain Training & Curriculum Integration**.

## Overview

The Curriculum Service manages educational standards, school district data, and training corpus for the AIVO Base Brain. It imports and structures curriculum data from:

- **US Standards**: Common Core (Math, ELA), NGSS (Science), all 50 state standards
- **International**: UK National Curriculum, IB (PYP/MYP/DP), Australian Curriculum, CBSE, ICSE, Chinese standards
- **Districts**: US school districts (NCES data), international education regions

## Features

- 📚 **Educational Standards Database**: Structured storage of K-12 standards worldwide
- 🏫 **School District Management**: District-specific curriculum mappings
- 🧠 **Training Corpus**: Curriculum-aligned training data for base brain models
- 🌍 **International Support**: Multi-country, multi-language curriculum systems
- 🔄 **Automated Imports**: Bulk import pipelines for major standards

## Architecture

```
curriculum-service/
├── app/
│   ├── api/          # FastAPI endpoints (Part B)
│   ├── core/         # Config, database, dependencies
│   ├── models/       # SQLAlchemy ORM models
│   ├── ingestion/    # Standards import pipelines
│   └── main.py       # FastAPI application
├── alembic/          # Database migrations
├── models/           # SQL schema definitions
├── data/             # Curriculum data storage
└── pyproject.toml    # Python dependencies
```

## Database Schema

### Core Tables

- **education_systems**: Education systems by country (K-12, Year 1-13, etc.)
- **school_districts**: School districts with location and demographics
- **educational_standards**: Individual learning standards (Common Core, NGSS, etc.)
- **district_standards**: Mapping of standards adopted by districts
- **curriculum_content**: Lessons, examples, problems aligned to standards
- **training_corpus**: Training data for base brain models
- **base_model_versions**: AI model versions and training metadata
- **district_brain_instances**: District-specific brain clones

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
cd services/curriculum-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -e .

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials
```

### Database Setup

```bash
# Create database
createdb aivo_curriculum

# Run migrations
alembic upgrade head
```

### Run Service

```bash
# Development
uvicorn app.main:app --reload --port 8003

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8003 --workers 4
```

## Usage

### Import Standards

```python
from sqlalchemy.orm import Session
from app.ingestion.standards_importer import StandardsImporter, DistrictImporter
from app.core.database import SessionLocal

db = SessionLocal()

# Import Common Core Math
importer = StandardsImporter(db)
await importer.import_common_core_math()

# Import all US standards
await importer.bulk_import_all_us_standards()

# Import districts
district_importer = DistrictImporter(db)
await district_importer.import_us_districts()

await importer.close()
await district_importer.close()
```

### API Endpoints (Part B - Coming Soon)

- `GET /api/v1/standards` - List educational standards
- `GET /api/v1/districts` - List school districts
- `POST /api/v1/curriculum/import` - Trigger curriculum import
- `GET /api/v1/training/corpus` - Get training data
- `POST /api/v1/brain/create` - Create base brain instance

## Data Sources

### US Standards

- **Common Core**: [corestandards.org](http://www.corestandards.org/)
- **NGSS**: [nextgenscience.org](https://www.nextgenscience.org/)
- **NCES Districts**: [nces.ed.gov](https://nces.ed.gov/ccd/)

### International Standards

- **UK**: National Curriculum (gov.uk)
- **IB**: International Baccalaureate (ibo.org)
- **Australia**: Australian Curriculum (australiancurriculum.edu.au)
- **India**: CBSE (cbse.gov.in), ICSE (cisce.org)
- **China**: Ministry of Education

## Development

### Run Tests

```bash
pytest
```

### Linting

```bash
ruff check .
```

### Format Code

```bash
black .
```

### Type Checking

```bash
mypy app/
```

## Integration with AI Inference Service

The Curriculum Service provides training data and standards context to the AI Inference Service (PROMPT 56B):

1. **Base Brain Training**: Training corpus → Base model
2. **District Cloning**: District standards → District brain instance
3. **Standard Alignment**: Learner questions aligned to curriculum standards
4. **Pacing Awareness**: AI knows when topics are taught (district pacing calendars)

## Next Steps (Part B)

- [ ] API endpoints for curriculum management
- [ ] Real-time standard search and retrieval
- [ ] Training data export for brain models
- [ ] District brain provisioning workflow
- [ ] Analytics dashboards for curriculum coverage

## License

Proprietary - Aivo Learning Platform

## Support

For questions or issues, contact the Aivo development team.
