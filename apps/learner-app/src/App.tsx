import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from '@aivo/auth';
import { ThemeProvider, LearnerErrorBoundary } from '@aivo/ui';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { Lock } from './pages/Lock';
import { SensoryProfileSetup } from './components/SensoryProfile';
import { SelfRegulationHub } from './components/SelfRegulation';
import { ExecutiveFunctionPage } from './pages/ExecutiveFunction';
import { SubjectSelection } from './pages/SubjectSelection';
import { ModelCloning } from './pages/ModelCloning';
import { BaselineAssessment } from './pages/BaselineAssessment';
import { AssessmentResults } from './pages/AssessmentResults';
import { ReadingActivity } from './pages/activities/Reading';
import { MathActivity } from './pages/activities/Math';
import { SpeechActivity } from './pages/activities/Speech';
import { Rewards } from './pages/Rewards';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { GradeBasedThemeSync } from './components/GradeBasedThemeSync';
import { ConnectivityBanner } from './components/ConnectivityBanner';

// K5 Subject Pages
import { MathPage as K5Math } from './pages/subjects/k5/Math';
import { SciencePage as K5Science } from './pages/subjects/k5/Science';
import { ReadingPage as K5Reading } from './pages/subjects/k5/Reading';
import { WritingPage as K5Writing } from './pages/subjects/k5/Writing';
import { SocialStudiesPage as K5SocialStudies } from './pages/subjects/k5/SocialStudies';
import { ArtPage as K5Art } from './pages/subjects/k5/Art';
import { MusicPage as K5Music } from './pages/subjects/k5/Music';
import { PEPage as K5PE } from './pages/subjects/k5/PE';
import { HealthPage as K5Health } from './pages/subjects/k5/Health';
import { TechnologyPage as K5Technology } from './pages/subjects/k5/Technology';

// MS Subject Pages
import { MathPage as MSMath } from './pages/subjects/ms/Math';
import { SciencePage as MSScience } from './pages/subjects/ms/Science';
import { ELAPage as MSELA } from './pages/subjects/ms/ELA';
import { SocialStudiesPage as MSSocialStudies } from './pages/subjects/ms/SocialStudies';
import { WorldLanguagesPage as MSWorldLanguages } from './pages/subjects/ms/WorldLanguages';
import { ArtsPage as MSArts } from './pages/subjects/ms/Arts';
import { PEHealthPage as MSPEHealth } from './pages/subjects/ms/PEHealth';
import { TechnologyCSPage as MSTechnologyCS } from './pages/subjects/ms/TechnologyCS';

// HS Subject Pages
import { AlgebraIPage, GeometryPage, AlgebraIIPage, PrecalculusPage, CalculusPage } from './pages/subjects/hs/Math';
import { BiologyPage, ChemistryPage, PhysicsPage } from './pages/subjects/hs/Science';
import { ELAPage as HSELA } from './pages/subjects/hs/ELA';
import { USHistoryPage, WorldHistoryPage, GovEconPage } from './pages/subjects/hs/SocialStudies';
import { ComputerSciencePage } from './pages/subjects/hs/ComputerScience';
import { WorldLanguagesPage as HSWorldLanguages } from './pages/subjects/hs/WorldLanguages';
import { ArtsPage as HSArts } from './pages/subjects/hs/Arts';
import { PEHealthPage as HSPEHealth } from './pages/subjects/hs/PEHealth';
import { SubjectDetailPage } from './pages/SubjectDetail';
import { ActivityPage } from './pages/ActivityPage';
import HomeworkHelperPage from './pages/HomeworkHelper';
import { HomeworkSession, HomeworkInbox } from './components/HomeworkHelper';

function App() {
  return (
    <LearnerErrorBoundary>
      <AuthProvider apiBaseUrl={import.meta.env.VITE_API_URL || '/api'}>
        <ThemeProvider defaultTheme="MS" persistTheme>
          <GradeBasedThemeSync />
          <BrowserRouter>
          <ConnectivityBanner />
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected Routes for Learners */}
          <Route path="/*" element={
            <ProtectedRoute allowedRoles={['learner']}>
              <Routes>
                <Route path="/" element={<Lock />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route 
                  path="/sensory-profile" 
                  element={
                    <SensoryProfileSetup 
                      learnerId="demo_learner_123" 
                      onComplete={() => window.location.href = '/'} 
                    />
                  } 
                />
                <Route 
                  path="/calm" 
                  element={
                    <SelfRegulationHub 
                      learnerId="demo_learner_123" 
                      onClose={() => window.location.href = '/'} 
                    />
                  } 
                />
                <Route path="/organize" element={<ExecutiveFunctionPage />} />
                <Route path="/subjects" element={<SubjectSelection />} />
                <Route path="/cloning" element={<ModelCloning />} />
                <Route path="/assessment" element={<BaselineAssessment />} />
                <Route path="/assessment-results" element={<AssessmentResults />} />
                <Route path="/activity/reading" element={<ReadingActivity />} />
                <Route path="/activity/math" element={<MathActivity />} />
                <Route path="/activity/speech" element={<SpeechActivity />} />
                <Route path="/rewards" element={<Rewards />} />
                
                {/* Homework Helper */}
                <Route path="/homework-helper" element={<HomeworkInbox learnerId="demo_learner_123" />} />
                <Route path="/homework-helper/new" element={<HomeworkHelperPage />} />
                <Route path="/homework-helper/:sessionId" element={<HomeworkSession />} />
                
                {/* Activity Route - For individual lessons/activities */}
                <Route path="/learner/:theme/subject/:subjectId/activity/:activityId" element={<ActivityPage />} />
                
                {/* Subject Detail Route - Dynamic for all themes */}
                <Route path="/learner/:theme/subject/:subjectId" element={<SubjectDetailPage />} />
                
                {/* K5 Subject Routes */}
                <Route path="/learner/k5/math" element={<K5Math />} />
                <Route path="/learner/k5/science" element={<K5Science />} />
                <Route path="/learner/k5/reading" element={<K5Reading />} />
                <Route path="/learner/k5/writing" element={<K5Writing />} />
                <Route path="/learner/k5/socialstudies" element={<K5SocialStudies />} />
                <Route path="/learner/k5/art" element={<K5Art />} />
                <Route path="/learner/k5/music" element={<K5Music />} />
                <Route path="/learner/k5/pe" element={<K5PE />} />
                <Route path="/learner/k5/health" element={<K5Health />} />
                <Route path="/learner/k5/technology" element={<K5Technology />} />
                
                {/* MS Subject Routes */}
                <Route path="/learner/ms/math" element={<MSMath />} />
                <Route path="/learner/ms/science" element={<MSScience />} />
                <Route path="/learner/ms/ela" element={<MSELA />} />
                <Route path="/learner/ms/socialstudies" element={<MSSocialStudies />} />
                <Route path="/learner/ms/worldlanguages" element={<MSWorldLanguages />} />
                <Route path="/learner/ms/arts" element={<MSArts />} />
                <Route path="/learner/ms/pehealth" element={<MSPEHealth />} />
                <Route path="/learner/ms/technologycs" element={<MSTechnologyCS />} />
                
                {/* HS Math Routes */}
                <Route path="/learner/hs/algebrai" element={<AlgebraIPage />} />
                <Route path="/learner/hs/geometry" element={<GeometryPage />} />
                <Route path="/learner/hs/algebraii" element={<AlgebraIIPage />} />
                <Route path="/learner/hs/precalculus" element={<PrecalculusPage />} />
                <Route path="/learner/hs/calculus" element={<CalculusPage />} />
                
                {/* HS Science Routes */}
                <Route path="/learner/hs/biology" element={<BiologyPage />} />
                <Route path="/learner/hs/chemistry" element={<ChemistryPage />} />
                <Route path="/learner/hs/physics" element={<PhysicsPage />} />
                
                {/* HS Other Routes */}
                <Route path="/learner/hs/ela" element={<HSELA />} />
                <Route path="/learner/hs/ushistory" element={<USHistoryPage />} />
                <Route path="/learner/hs/worldhistory" element={<WorldHistoryPage />} />
                <Route path="/learner/hs/govecon" element={<GovEconPage />} />
                <Route path="/learner/hs/computerscience" element={<ComputerSciencePage />} />
                <Route path="/learner/hs/worldlanguages" element={<HSWorldLanguages />} />
                <Route path="/learner/hs/arts" element={<HSArts />} />
                <Route path="/learner/hs/pehealth" element={<HSPEHealth />} />
              </Routes>
            </ProtectedRoute>
          } />
        </Routes>
        
        {/* Global PWA Components */}
        <OfflineIndicator />
        <PWAInstallPrompt />
      </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
    </LearnerErrorBoundary>
  );
}

export default App;
