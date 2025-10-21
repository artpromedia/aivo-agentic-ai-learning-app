// High School Mathematics Subjects
import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

// Algebra I
const algebraI = getSubject('HS', 'algebrai')!;
export function AlgebraIPage() {
  return <SubjectPage subject={algebraI} activities={[
    { id: 'linear', name: 'Linear Equations', icon: '📈', progress: 75 },
    { id: 'functions', name: 'Functions', icon: 'f(x)', progress: 70 },
    { id: 'polynomials', name: 'Polynomials', icon: '∑', progress: 65 },
    { id: 'word', name: 'Word Problems', icon: '📝', progress: 80 },
  ]} />;
}

// Geometry
const geometry = getSubject('HS', 'geometry')!;
export function GeometryPage() {
  return <SubjectPage subject={geometry} activities={[
    { id: 'shapes', name: 'Shapes & Angles', icon: '📐', progress: 80 },
    { id: 'proofs', name: 'Proofs', icon: '✓', progress: 70 },
    { id: 'trig', name: 'Trigonometry', icon: '△', progress: 65 },
    { id: 'area', name: 'Area & Volume', icon: '📦', progress: 75 },
  ]} />;
}

// Algebra II
const algebraII = getSubject('HS', 'algebraii')!;
export function AlgebraIIPage() {
  return <SubjectPage subject={algebraII} activities={[
    { id: 'quadratic', name: 'Quadratic Equations', icon: 'x²', progress: 70 },
    { id: 'exponential', name: 'Exponential Functions', icon: 'eˣ', progress: 65 },
    { id: 'logarithms', name: 'Logarithms', icon: 'log', progress: 60 },
    { id: 'rational', name: 'Rational Functions', icon: 'x/y', progress: 75 },
  ]} />;
}

// Precalculus
const precalculus = getSubject('HS', 'precalculus')!;
export function PrecalculusPage() {
  return <SubjectPage subject={precalculus} activities={[
    { id: 'trig', name: 'Trigonometry', icon: 'sin', progress: 70 },
    { id: 'limits', name: 'Limits', icon: 'lim', progress: 65 },
    { id: 'analytic', name: 'Analytic Geometry', icon: '📊', progress: 75 },
    { id: 'sequences', name: 'Sequences', icon: 'aₙ', progress: 70 },
  ]} />;
}

// Calculus
const calculus = getSubject('HS', 'calculus')!;
export function CalculusPage() {
  return <SubjectPage subject={calculus} activities={[
    { id: 'derivatives', name: 'Derivatives', icon: "d/dx", progress: 70 },
    { id: 'integrals', name: 'Integrals', icon: '∫', progress: 65 },
    { id: 'applications', name: 'Applications', icon: '📈', progress: 75 },
    { id: 'series', name: 'Series', icon: '∞', progress: 60 },
  ]} />;
}
