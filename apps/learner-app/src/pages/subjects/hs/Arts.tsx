// High School Arts
import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('HS', 'arts')!;

export function ArtsPage() {
  return <SubjectPage subject={subject} activities={[
    { id: 'visual', name: 'Visual Arts', icon: '🎨', progress: 85 },
    { id: 'music', name: 'Music Theory', icon: '🎵', progress: 80 },
    { id: 'theater', name: 'Theater', icon: '🎭', progress: 75 },
    { id: 'dance', name: 'Dance', icon: '💃', progress: 70 },
  ]} />;
}
