// High School Computer Science
import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('HS', 'computerscience')!;

export function ComputerSciencePage() {
  return <SubjectPage subject={subject} activities={[
    { id: 'programming', name: 'Programming', icon: '💻', progress: 75 },
    { id: 'algorithms', name: 'Algorithms', icon: '🔄', progress: 70 },
    { id: 'datastructures', name: 'Data Structures', icon: '🗂️', progress: 65 },
    { id: 'webdev', name: 'Web Development', icon: '🌐', progress: 80 },
  ]} />;
}
