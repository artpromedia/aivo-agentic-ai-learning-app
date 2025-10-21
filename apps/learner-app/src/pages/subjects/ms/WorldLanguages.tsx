import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('MS', 'worldlanguages')!;

const activities = [
  { id: 'spanish', name: 'Spanish', icon: '🇪🇸', progress: 75 },
  { id: 'french', name: 'French', icon: '🇫🇷', progress: 70 },
  { id: 'vocabulary', name: 'Vocabulary', icon: '📚', progress: 80 },
  { id: 'conversation', name: 'Conversation', icon: '💬', progress: 65 },
];

export function WorldLanguagesPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
