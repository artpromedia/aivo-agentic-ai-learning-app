"""
Seed training modules and sample enrollments

Run: python -m scripts.seed_training_data
"""
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import uuid
from datetime import datetime, timedelta

from app.core.database import SessionLocal
from app.models.training import (
    DifficultyLevel,
    EnrollmentStatus,
    TrainingEnrollment,
    TrainingModule,
    TrainingType,
)
from app.models import User


def seed_training_data():
    """Seed training modules and sample enrollments."""
    db = SessionLocal()
    
    try:
        # Check if training modules already exist
        existing_count = db.query(TrainingModule).count()
        if existing_count > 0:
            print(f"Training modules already exist ({existing_count} found). Skipping seed.")
            return
        
        print("Seeding training modules...")
        
        # Create training modules
        modules = [
            {
                "id": str(uuid.uuid4()),
                "title": "Introduction to AIVO Platform",
                "description": "Complete overview of the AIVO learning platform, including navigation, core features, and best practices for getting started.",
                "category": "Platform Basics",
                "type": TrainingType.VIDEO,
                "difficulty": DifficultyLevel.BEGINNER,
                "duration": 30,
                "rating": 4.8,
                "thumbnail_url": "https://picsum.photos/seed/train1/400/300",
                "content_url": "https://example.com/training/intro",
                "order": 1,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Creating Personalized Learning Paths",
                "description": "Learn how to create individualized learning paths for neurodiverse students using AIVO's adaptive AI engine.",
                "category": "Curriculum Design",
                "type": TrainingType.WORKSHOP,
                "difficulty": DifficultyLevel.INTERMEDIATE,
                "duration": 90,
                "rating": 4.9,
                "thumbnail_url": "https://picsum.photos/seed/train2/400/300",
                "content_url": "https://example.com/training/learning-paths",
                "order": 2,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "IEP Goal Setting and Tracking",
                "description": "Comprehensive guide to setting measurable IEP goals and tracking student progress using AIVO's built-in tools.",
                "category": "IEP Management",
                "type": TrainingType.GUIDE,
                "difficulty": DifficultyLevel.INTERMEDIATE,
                "duration": 45,
                "rating": 4.7,
                "thumbnail_url": "https://picsum.photos/seed/train3/400/300",
                "content_url": "https://example.com/training/iep-goals",
                "order": 3,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Sensory-Friendly Classroom Template",
                "description": "Downloadable template and guide for creating sensory-friendly classroom environments optimized for neurodiverse learners.",
                "category": "Classroom Management",
                "type": TrainingType.TEMPLATE,
                "difficulty": DifficultyLevel.BEGINNER,
                "duration": 20,
                "rating": 4.6,
                "thumbnail_url": "https://picsum.photos/seed/train4/400/300",
                "content_url": "https://example.com/training/sensory-template",
                "order": 4,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Parent Communication Best Practices",
                "description": "Strategies and templates for effective communication with parents of neurodiverse students.",
                "category": "Parent Engagement",
                "type": TrainingType.VIDEO,
                "difficulty": DifficultyLevel.BEGINNER,
                "duration": 35,
                "rating": 4.5,
                "thumbnail_url": "https://picsum.photos/seed/train5/400/300",
                "content_url": "https://example.com/training/parent-comm",
                "order": 5,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Data-Driven Instruction with AIVO",
                "description": "Advanced workshop on leveraging AIVO's analytics and reporting features to inform instructional decisions.",
                "category": "Data Analytics",
                "type": TrainingType.WORKSHOP,
                "difficulty": DifficultyLevel.ADVANCED,
                "duration": 120,
                "rating": 4.9,
                "thumbnail_url": "https://picsum.photos/seed/train6/400/300",
                "content_url": "https://example.com/training/data-driven",
                "order": 6,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "AIVO Certified Educator Program",
                "description": "Complete certification program covering all aspects of teaching neurodiverse students with AIVO. Includes assessment and certification exam.",
                "category": "Certification",
                "type": TrainingType.CERTIFICATION,
                "difficulty": DifficultyLevel.ADVANCED,
                "duration": 240,
                "rating": 4.9,
                "thumbnail_url": "https://picsum.photos/seed/train7/400/300",
                "content_url": "https://example.com/training/certification",
                "order": 7,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Behavior Support Strategies",
                "description": "Evidence-based behavior support strategies for students with autism and ADHD.",
                "category": "Behavioral Support",
                "type": TrainingType.VIDEO,
                "difficulty": DifficultyLevel.INTERMEDIATE,
                "duration": 60,
                "rating": 4.7,
                "thumbnail_url": "https://picsum.photos/seed/train8/400/300",
                "content_url": "https://example.com/training/behavior",
                "order": 8,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Universal Design for Learning (UDL)",
                "description": "Implementing UDL principles in your classroom using AIVO's flexible content delivery system.",
                "category": "Instructional Design",
                "type": TrainingType.GUIDE,
                "difficulty": DifficultyLevel.INTERMEDIATE,
                "duration": 50,
                "rating": 4.8,
                "thumbnail_url": "https://picsum.photos/seed/train9/400/300",
                "content_url": "https://example.com/training/udl",
                "order": 9,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "AIVO Mobile App Mastery",
                "description": "Complete guide to using AIVO's mobile app for on-the-go access and classroom management.",
                "category": "Platform Basics",
                "type": TrainingType.VIDEO,
                "difficulty": DifficultyLevel.BEGINNER,
                "duration": 25,
                "rating": 4.5,
                "thumbnail_url": "https://picsum.photos/seed/train10/400/300",
                "content_url": "https://example.com/training/mobile-app",
                "order": 10,
            },
        ]
        
        # Insert modules
        for module_data in modules:
            module = TrainingModule(**module_data)
            db.add(module)
        
        db.commit()
        print(f"✅ Created {len(modules)} training modules")
        
        # Create sample enrollments for existing teachers
        print("\nCreating sample enrollments...")
        
        # Get teachers and admins (anyone who might take training)
        teachers = db.query(User).filter(
            User.role.in_(["teacher", "district_admin", "admin"])
        ).limit(10).all()
        
        if not teachers:
            print("No users found with teacher, district_admin, or admin roles. Skipping enrollment creation.")
            print("Training modules have been created successfully!")
            return
        
        enrolled_count = 0
        for i, teacher in enumerate(teachers):
            # Enroll each teacher in 2-3 random modules
            num_enrollments = min(3, len(modules))
            for j in range(num_enrollments):
                module = modules[j % len(modules)]
                
                # Vary enrollment status
                if j == 0:
                    # First module - completed
                    status = EnrollmentStatus.COMPLETED
                    progress = 100
                    started_at = datetime.utcnow() - timedelta(days=14)
                    completed_at = datetime.utcnow() - timedelta(days=7)
                    rating = 4.5 + (i % 5) * 0.1
                elif j == 1:
                    # Second module - in progress
                    status = EnrollmentStatus.IN_PROGRESS
                    progress = 30 + (i % 6) * 10
                    started_at = datetime.utcnow() - timedelta(days=3)
                    completed_at = None
                    rating = None
                else:
                    # Third module - not started
                    status = EnrollmentStatus.NOT_STARTED
                    progress = 0
                    started_at = None
                    completed_at = None
                    rating = None
                
                enrollment = TrainingEnrollment(
                    id=str(uuid.uuid4()),
                    user_id=teacher.id,
                    module_id=module["id"],
                    status=status,
                    progress=progress,
                    started_at=started_at,
                    completed_at=completed_at,
                    rating=rating,
                )
                
                db.add(enrollment)
                enrolled_count += 1
        
        db.commit()
        print(f"✅ Created {enrolled_count} sample enrollments")
        
        print("\n✨ Training data seeding complete!")
        
    except Exception as e:
        print(f"❌ Error seeding training data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_training_data()
