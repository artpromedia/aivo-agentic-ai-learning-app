// High School Social Studies Subjects
import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

// US History
const usHistory = getSubject('HS', 'ushistory')!;
export function USHistoryPage() {
  return <SubjectPage subject={usHistory} activities={[
    { id: 'colonial', name: 'Colonial Era', icon: '🏛️', progress: 75 },
    { id: 'revolution', name: 'Revolution', icon: '🗽', progress: 80 },
    { id: 'civilwar', name: 'Civil War', icon: '⚔️', progress: 70 },
    { id: 'modern', name: 'Modern America', icon: '🇺🇸', progress: 85 },
  ]} />;
}

// World History
const worldHistory = getSubject('HS', 'worldhistory')!;
export function WorldHistoryPage() {
  return <SubjectPage subject={worldHistory} activities={[
    { id: 'ancient', name: 'Ancient Civilizations', icon: '🏺', progress: 80 },
    { id: 'medieval', name: 'Medieval Period', icon: '🏰', progress: 75 },
    { id: 'renaissance', name: 'Renaissance', icon: '🎨', progress: 70 },
    { id: 'modern', name: 'Modern World', icon: '🌍', progress: 85 },
  ]} />;
}

// Government & Economics
const govEcon = getSubject('HS', 'govecon')!;
export function GovEconPage() {
  return <SubjectPage subject={govEcon} activities={[
    { id: 'government', name: 'U.S. Government', icon: '🏛️', progress: 75 },
    { id: 'politics', name: 'Politics', icon: '🗳️', progress: 70 },
    { id: 'economics', name: 'Economics', icon: '💰', progress: 80 },
    { id: 'civics', name: 'Civic Engagement', icon: '📊', progress: 75 },
  ]} />;
}
