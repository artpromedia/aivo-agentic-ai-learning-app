import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('K5', 'socialstudies')!;

const activities = [
  { id: 'community', name: 'Community', icon: '🏘️', progress: 75 },
  { id: 'history', name: 'History', icon: '⏳', progress: 60 },
  { id: 'maps', name: 'Maps', icon: '🗺️', progress: 70 },
  { id: 'cultures', name: 'Cultures', icon: '🌎', progress: 65 },
];

export function SocialStudiesPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
