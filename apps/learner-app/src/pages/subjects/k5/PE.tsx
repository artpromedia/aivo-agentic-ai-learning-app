import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('K5', 'pe')!;

const activities = [
  { id: 'movement', name: 'Movement', icon: '🏃', progress: 90 },
  { id: 'sports', name: 'Sports', icon: '⚽', progress: 80 },
  { id: 'fitness', name: 'Fitness', icon: '💪', progress: 75 },
  { id: 'coordination', name: 'Coordination', icon: '🤸', progress: 70 },
];

export function PEPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
