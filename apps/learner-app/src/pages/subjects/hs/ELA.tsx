// High School English Language Arts
import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('HS', 'ela')!;

export function ELAPage() {
  return <SubjectPage subject={subject} activities={[
    { id: 'literature', name: 'Literature Analysis', icon: '📚', progress: 80 },
    { id: 'composition', name: 'Composition', icon: '✍️', progress: 75 },
    { id: 'rhetoric', name: 'Rhetoric', icon: '🗣️', progress: 70 },
    { id: 'research', name: 'Research', icon: '🔍', progress: 65 },
  ]} />;
}
