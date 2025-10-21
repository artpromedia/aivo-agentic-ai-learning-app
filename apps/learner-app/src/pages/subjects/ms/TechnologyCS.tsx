import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('MS', 'technologycs')!;

const activities = [
  { id: 'coding', name: 'Coding', icon: '💻', progress: 70 },
  { id: 'digital', name: 'Digital Literacy', icon: '🌐', progress: 80 },
  { id: 'robotics', name: 'Robotics', icon: '🤖', progress: 65 },
  { id: 'design', name: 'Digital Design', icon: '🎨', progress: 75 },
];

export function TechnologyCSPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
