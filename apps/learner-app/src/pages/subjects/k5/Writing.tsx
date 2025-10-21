import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('K5', 'writing')!;

const activities = [
  { id: 'letters', name: 'Letters', icon: 'ABC', progress: 85 },
  { id: 'words', name: 'Words', icon: '📝', progress: 70 },
  { id: 'sentences', name: 'Sentences', icon: '✍️', progress: 60 },
  { id: 'storytelling', name: 'Storytelling', icon: '📚', progress: 50 },
];

export function WritingPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
