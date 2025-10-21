import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('MS', 'socialstudies')!;

const activities = [
  { id: 'worldhistory', name: 'World History', icon: '🌍', progress: 70 },
  { id: 'geography', name: 'Geography', icon: '🗺️', progress: 75 },
  { id: 'civics', name: 'Civics', icon: '🏛️', progress: 65 },
  { id: 'cultures', name: 'Cultures', icon: '🌎', progress: 80 },
];

export function SocialStudiesPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
