import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('MS', 'science')!;

const activities = [
  { id: 'life', name: 'Life Science', icon: '🌱', progress: 75 },
  { id: 'earth', name: 'Earth Science', icon: '🌍', progress: 70 },
  { id: 'physical', name: 'Physical Science', icon: '⚛️', progress: 65 },
  { id: 'experiments', name: 'Experiments', icon: '🔬', progress: 80 },
];

export function SciencePage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
