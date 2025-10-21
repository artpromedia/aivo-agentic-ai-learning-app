// High School PE & Health
import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('HS', 'pehealth')!;

export function PEHealthPage() {
  return <SubjectPage subject={subject} activities={[
    { id: 'fitness', name: 'Fitness Training', icon: '💪', progress: 85 },
    { id: 'wellness', name: 'Wellness', icon: '🧘', progress: 80 },
    { id: 'health', name: 'Health Education', icon: '❤️', progress: 75 },
    { id: 'sports', name: 'Sports Science', icon: '⚽', progress: 70 },
  ]} />;
}
