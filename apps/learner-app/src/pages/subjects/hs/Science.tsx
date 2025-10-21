// High School Science Subjects
import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

// Biology
const biology = getSubject('HS', 'biology')!;
export function BiologyPage() {
  return <SubjectPage subject={biology} activities={[
    { id: 'cells', name: 'Cell Biology', icon: '🔬', progress: 80 },
    { id: 'genetics', name: 'Genetics', icon: '🧬', progress: 75 },
    { id: 'evolution', name: 'Evolution', icon: '🦎', progress: 70 },
    { id: 'ecology', name: 'Ecology', icon: '🌿', progress: 85 },
  ]} />;
}

// Chemistry
const chemistry = getSubject('HS', 'chemistry')!;
export function ChemistryPage() {
  return <SubjectPage subject={chemistry} activities={[
    { id: 'atoms', name: 'Atomic Structure', icon: '⚛️', progress: 75 },
    { id: 'molecules', name: 'Molecules & Bonds', icon: '🔗', progress: 70 },
    { id: 'reactions', name: 'Chemical Reactions', icon: '⚗️', progress: 80 },
    { id: 'stoichiometry', name: 'Stoichiometry', icon: '⚖️', progress: 65 },
  ]} />;
}

// Physics
const physics = getSubject('HS', 'physics')!;
export function PhysicsPage() {
  return <SubjectPage subject={physics} activities={[
    { id: 'motion', name: 'Motion', icon: '🏃', progress: 75 },
    { id: 'energy', name: 'Energy', icon: '⚡', progress: 80 },
    { id: 'electricity', name: 'Electricity', icon: '💡', progress: 70 },
    { id: 'waves', name: 'Waves', icon: '🌊', progress: 65 },
  ]} />;
}
