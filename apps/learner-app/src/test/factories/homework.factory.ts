export interface MockHomeworkSession {
  id: string
  learner_id: string
  subject: string
  topic: string
  status: 'in_progress' | 'completed' | 'needs_help'
  current_step: number
  total_steps: number
  started_at: string
  completed_at: string | null
}

let sessionIdCounter = 1

const subjects = ['Math', 'Reading', 'Science', 'Social Studies', 'Writing']
const topics: Record<string, string[]> = {
  Math: ['Addition', 'Subtraction', 'Multiplication', 'Division', 'Fractions'],
  Reading: ['Comprehension', 'Vocabulary', 'Phonics', 'Fluency'],
  Science: ['Plants', 'Animals', 'Weather', 'Solar System', 'Matter'],
  'Social Studies': ['Geography', 'History', 'Civics', 'Economics'],
  Writing: ['Narrative', 'Expository', 'Persuasive', 'Grammar'],
}

export const createMockHomeworkSession = (
  overrides?: Partial<MockHomeworkSession>
): MockHomeworkSession => {
  const subject = overrides?.subject ?? subjects[Math.floor(Math.random() * subjects.length)]
  const subjectTopics = topics[subject] || ['General']
  const topic = overrides?.topic ?? subjectTopics[Math.floor(Math.random() * subjectTopics.length)]
  
  const id = `session-${sessionIdCounter++}`
  return {
    id,
    learner_id: `learner-${sessionIdCounter}`,
    subject,
    topic,
    status: 'in_progress',
    current_step: 1,
    total_steps: 4,
    started_at: new Date().toISOString(),
    completed_at: null,
    ...overrides,
  }
}

export const createMockCompletedSession = (
  overrides?: Partial<MockHomeworkSession>
): MockHomeworkSession => {
  return createMockHomeworkSession({
    status: 'completed',
    current_step: 4,
    completed_at: new Date().toISOString(),
    ...overrides,
  })
}
