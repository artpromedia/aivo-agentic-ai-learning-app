// High School World Languages
import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('HS', 'worldlanguages')!;

export function WorldLanguagesPage() {
  return <SubjectPage subject={subject} activities={[
    { id: 'spanish', name: 'Spanish', icon: '🇪🇸', progress: 80 },
    { id: 'french', name: 'French', icon: '🇫🇷', progress: 75 },
    { id: 'mandarin', name: 'Mandarin', icon: '🇨🇳', progress: 70 },
    { id: 'conversation', name: 'Conversation', icon: '💬', progress: 85 },
  ]} />;
}
