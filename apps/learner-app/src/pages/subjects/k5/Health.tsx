import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('K5', 'health')!;

const activities = [
  { id: 'body', name: 'My Body', icon: '🧒', progress: 85 },
  { id: 'nutrition', name: 'Nutrition', icon: '🥗', progress: 75 },
  { id: 'safety', name: 'Safety', icon: '🛡️', progress: 80 },
  { id: 'wellness', name: 'Wellness', icon: '😊', progress: 70 },
];

export function HealthPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
