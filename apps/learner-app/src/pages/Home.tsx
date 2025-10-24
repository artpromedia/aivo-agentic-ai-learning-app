import { Card, Grid, Button, ProgressBar } from '@aivo/ui';
import { PageWrapper } from '../components/PageWrapper';

export default function Home() {
  return (
    <PageWrapper>
    <div className="min-h-screen bg-gradient-to-br from-speech-100 to-primary-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-neutral-900">
          Welcome back! 👋
        </h1>
        <p className="text-center text-xl mb-8 text-neutral-700">Ready to learn something amazing today?</p>
        
        <div className="mb-8">
          <Card padding="lg" hover>
            <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
            <ProgressBar value={60} showLabel color="primary" size="lg" />
          </Card>
        </div>

        <Grid cols="2" gap="lg">
          <Card padding="lg" hover icon={<span className="text-4xl">📚</span>} iconColor="bg-math-100" title="Math">
            <p className="text-neutral-600 mb-4">Continue where you left off</p>
            <Button variant="primary" fullWidth>Start Lesson</Button>
          </Card>
          
          <Card padding="lg" hover icon={<span className="text-4xl">🎨</span>} iconColor="bg-reading-100" title="Reading">
            <p className="text-neutral-600 mb-4">New story waiting for you</p>
            <Button variant="secondary" fullWidth>Start Lesson</Button>
          </Card>
        </Grid>
      </div>
    </div>
    </PageWrapper>
  );
}
