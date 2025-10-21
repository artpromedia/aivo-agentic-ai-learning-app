import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('MS', 'math')!;

const activities = [
  { id: 'prealgebra', name: 'Pre-Algebra', icon: '➕', progress: 70 },
  { id: 'algebraI', name: 'Algebra I', icon: 'x', progress: 65 },
  { id: 'geometry', name: 'Geometry', icon: '📐', progress: 60 },
  { id: 'problemsolving', name: 'Problem Solving', icon: '🧩', progress: 75 },
];

export function MathPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
