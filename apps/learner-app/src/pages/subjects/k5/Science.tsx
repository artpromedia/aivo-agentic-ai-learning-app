import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('K5', 'science')!;

const activities = [
  { id: 'nature', name: 'Nature Walk', icon: '🌿', progress: 70 },
  { id: 'experiments', name: 'Experiments', icon: '🧪', progress: 55 },
  { id: 'animals', name: 'Animals', icon: '🐾', progress: 85 },
  { id: 'weather', name: 'Weather', icon: '🌤️', progress: 60 },
];

export function SciencePage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
