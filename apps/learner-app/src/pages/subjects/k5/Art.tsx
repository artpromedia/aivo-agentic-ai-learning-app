import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('K5', 'art')!;

const activities = [
  { id: 'drawing', name: 'Drawing', icon: '✏️', progress: 80 },
  { id: 'painting', name: 'Painting', icon: '🖌️', progress: 75 },
  { id: 'crafts', name: 'Crafts', icon: '✂️', progress: 70 },
  { id: 'creativity', name: 'Free Create', icon: '🌈', progress: 90 },
];

export function ArtPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
