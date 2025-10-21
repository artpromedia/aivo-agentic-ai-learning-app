import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('K5', 'technology')!;

const activities = [
  { id: 'computers', name: 'Computers', icon: '💻', progress: 70 },
  { id: 'typing', name: 'Typing', icon: '⌨️', progress: 65 },
  { id: 'digital', name: 'Digital Citizenship', icon: '🌐', progress: 75 },
  { id: 'coding', name: 'Coding Basics', icon: '🤖', progress: 60 },
];

export function TechnologyPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
