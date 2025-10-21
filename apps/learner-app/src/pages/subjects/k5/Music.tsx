import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('K5', 'music')!;

const activities = [
  { id: 'songs', name: 'Songs', icon: '🎤', progress: 85 },
  { id: 'rhythms', name: 'Rhythms', icon: '🥁', progress: 70 },
  { id: 'instruments', name: 'Instruments', icon: '🎹', progress: 65 },
  { id: 'sounds', name: 'Sounds', icon: '🔊', progress: 75 },
];

export function MusicPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
