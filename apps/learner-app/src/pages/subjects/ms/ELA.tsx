import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('MS', 'ela')!;

const activities = [
  { id: 'reading', name: 'Reading', icon: '📚', progress: 80 },
  { id: 'writing', name: 'Writing', icon: '✍️', progress: 75 },
  { id: 'grammar', name: 'Grammar', icon: '📝', progress: 70 },
  { id: 'literature', name: 'Literature', icon: '📖', progress: 65 },
];

export function ELAPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
