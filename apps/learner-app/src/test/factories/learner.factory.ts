export interface MockLearner {
  id: string
  user_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  grade_level: number
  grade_theme: 'K5' | 'MS' | 'HS'
  school_name: string
  district_name: string
  state_code: string
  has_iep: boolean
  diagnoses: string[]
  accommodations: string[]
  baseline_assessment_completed: boolean
}

let learnerIdCounter = 1

export const createMockLearner = (
  overrides?: Partial<MockLearner>
): MockLearner => {
  const gradeLevel = overrides?.grade_level ?? 3
  let gradeTheme: 'K5' | 'MS' | 'HS' = 'K5'
  
  if (gradeLevel <= 5) {
    gradeTheme = 'K5'
  } else if (gradeLevel <= 8) {
    gradeTheme = 'MS'
  } else {
    gradeTheme = 'HS'
  }

  const id = `learner-${learnerIdCounter++}`
  return {
    id,
    user_id: `user-${learnerIdCounter}`,
    first_name: `First${id}`,
    last_name: `Last${id}`,
    date_of_birth: '2015-03-15',
    grade_level: gradeLevel,
    grade_theme: gradeTheme,
    school_name: 'Test Elementary School',
    district_name: 'Test School District',
    state_code: 'CA',
    has_iep: false,
    diagnoses: [],
    accommodations: [],
    baseline_assessment_completed: false,
    ...overrides,
  }
}

export const createMockLearnerWithIEP = (
  overrides?: Partial<MockLearner>
): MockLearner => {
  return createMockLearner({
    has_iep: true,
    diagnoses: ['ADHD', 'Dyslexia'],
    accommodations: ['Extended time', 'Reduced distractions', 'Text-to-speech'],
    ...overrides,
  })
}
