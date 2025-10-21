import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('K5', 'math')!;

const activities = [
  { id: 'counting', name: 'Counting', icon: '🔢', progress: 75 },
  { id: 'addition', name: 'Addition', icon: '➕', progress: 60 },
  { id: 'subtraction', name: 'Subtraction', icon: '➖', progress: 45 },
  { id: 'shapes', name: 'Shapes', icon: '🔷', progress: 80 },
];

export function MathPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
