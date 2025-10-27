"""
Seed sample IEP data for testing
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from datetime import date, timedelta
from app.core.database import SessionLocal
from app.models.iep import IEPGoal, IEPGoalStatus
from app.models.learner import Learner
import uuid

def seed_iep_data():
    db = SessionLocal()
    
    try:
        # Get existing learners
        learners = db.query(Learner).limit(10).all()
        
        if not learners:
            print("No learners found. Please seed learners first.")
            return
        
        print(f"Found {len(learners)} learners")
        
        # Sample IEP goals for each learner
        categories = ["reading", "math", "social", "motor", "communication"]
        statuses = [IEPGoalStatus.ON_TRACK, IEPGoalStatus.NEEDS_ATTENTION, 
                   IEPGoalStatus.EXCEEDING, IEPGoalStatus.NOT_STARTED]
        
        sample_goals = [
            {
                "goal_name": "Improve reading comprehension to grade level",
                "category": "reading",
                "current_level": "2nd grade level",
                "target_level": "4th grade level",
                "description": "Student will read and comprehend grade-level texts with 80% accuracy"
            },
            {
                "goal_name": "Master basic multiplication facts",
                "category": "math",
                "current_level": "Addition/subtraction proficient",
                "target_level": "Multiply numbers 0-12 fluently",
                "description": "Student will demonstrate multiplication fluency with 90% accuracy"
            },
            {
                "goal_name": "Improve social interaction with peers",
                "category": "social",
                "current_level": "Minimal peer interaction",
                "target_level": "Initiates and maintains conversations",
                "description": "Student will initiate appropriate social interactions 5 times per day"
            },
            {
                "goal_name": "Develop fine motor skills for writing",
                "category": "motor",
                "current_level": "Difficulty with pencil grip",
                "target_level": "Writes legibly without fatigue",
                "description": "Student will write 3 paragraphs with proper letter formation"
            },
            {
                "goal_name": "Expand expressive vocabulary",
                "category": "communication",
                "current_level": "50-word vocabulary",
                "target_level": "150-word functional vocabulary",
                "description": "Student will use appropriate words to express needs and wants"
            }
        ]
        
        goals_created = 0
        today = date.today()
        
        for learner in learners:
            # Create 2-3 goals per learner
            num_goals = min(3, len(sample_goals))
            
            for i in range(num_goals):
                goal_template = sample_goals[i % len(sample_goals)]
                
                # Vary the dates to create overdue, current, and future goals
                if i == 0:
                    # Overdue goal
                    start_date = today - timedelta(days=180)
                    target_date = today - timedelta(days=30)
                    progress = 60
                    status = IEPGoalStatus.NEEDS_ATTENTION
                elif i == 1:
                    # Current goal
                    start_date = today - timedelta(days=90)
                    target_date = today + timedelta(days=60)
                    progress = 45
                    status = IEPGoalStatus.ON_TRACK
                else:
                    # Future goal
                    start_date = today - timedelta(days=30)
                    target_date = today + timedelta(days=150)
                    progress = 20
                    status = IEPGoalStatus.NOT_STARTED
                
                goal = IEPGoal(
                    id=str(uuid.uuid4()),
                    learner_id=learner.id,
                    goal_name=goal_template["goal_name"],
                    goal_description=goal_template["description"],
                    category=goal_template["category"],
                    current_level=goal_template["current_level"],
                    target_level=goal_template["target_level"],
                    start_date=start_date,
                    target_date=target_date,
                    progress_percentage=progress,
                    status=status,
                    accommodations=[
                        "Extended time on tests",
                        "Preferential seating",
                        "Visual aids and supports"
                    ]
                )
                
                db.add(goal)
                goals_created += 1
        
        db.commit()
        print(f"\n✅ Created {goals_created} IEP goals for {len(learners)} learners")
        
        # Show summary
        print("\nSummary by status:")
        for status in [IEPGoalStatus.ON_TRACK, IEPGoalStatus.NEEDS_ATTENTION, 
                      IEPGoalStatus.EXCEEDING, IEPGoalStatus.NOT_STARTED]:
            count = db.query(IEPGoal).filter(IEPGoal.status == status).count()
            print(f"  {status.value}: {count}")
        
        overdue_count = db.query(IEPGoal).filter(
            IEPGoal.target_date < today,
            IEPGoal.progress_percentage < 100
        ).count()
        print(f"  OVERDUE: {overdue_count}")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_iep_data()
