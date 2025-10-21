import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('MS', 'pehealth')!;

const activities = [
  { id: 'fitness', name: 'Physical Fitness', icon: '💪', progress: 85 },
  { id: 'sports', name: 'Sports', icon: '⚽', progress: 80 },
  { id: 'health', name: 'Health Education', icon: '❤️', progress: 75 },
  { id: 'nutrition', name: 'Nutrition', icon: '🥗', progress: 70 },
];

export function PEHealthPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
