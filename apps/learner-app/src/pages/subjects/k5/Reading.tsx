import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('K5', 'reading')!;

const activities = [
  { id: 'phonics', name: 'Phonics', icon: '🔤', progress: 80 },
  { id: 'sightwords', name: 'Sight Words', icon: '👁️', progress: 70 },
  { id: 'stories', name: 'Stories', icon: '📖', progress: 65 },
  { id: 'comprehension', name: 'Comprehension', icon: '🤔', progress: 55 },
];

export function ReadingPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
