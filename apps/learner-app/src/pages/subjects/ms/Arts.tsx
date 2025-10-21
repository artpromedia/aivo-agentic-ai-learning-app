import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('MS', 'arts')!;

const activities = [
  { id: 'visual', name: 'Visual Arts', icon: '🎨', progress: 85 },
  { id: 'music', name: 'Music', icon: '🎵', progress: 80 },
  { id: 'drama', name: 'Drama', icon: '🎭', progress: 75 },
  { id: 'dance', name: 'Dance', icon: '💃', progress: 70 },
];

export function ArtsPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
