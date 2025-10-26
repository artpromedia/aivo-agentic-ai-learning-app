import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BigButton } from '../components/BigButton';
import { EncouragementBanner } from '../components/EncouragementBanner';

interface Question {
  id: number;
  question: string;
  type: 'multiple-choice' | 'scale' | 'visual' | 'rating';
  options?: string[];
  images?: string[];
  category: 'reading' | 'math' | 'science' | 'social_studies' | 'social_emotional' | 'speech' | 'learning_style';
}

interface LearnerProfile {
  first_name: string;
  grade_level: number;
  date_of_birth: string;
  has_iep: boolean;
  diagnoses: string[];
}

// Question generators based on grade level
const getAgeAppropriateQuestions = (gradeLevel: number, firstName: string): Question[] => {
  const isElementary = gradeLevel <= 5;
  const isMiddleSchool = gradeLevel >= 6 && gradeLevel <= 8;

  if (isElementary) {
    // K-5: Simple, visual, engaging - comprehensive subject coverage
    return [
      // Reading Assessment
      {
        id: 1,
        question: `Hi ${firstName}! How do you feel about reading stories?`,
        type: 'visual',
        images: ['😊', '😐', '😕', '😢'],
        category: 'reading'
      },
      {
        id: 2,
        question: "Can you read a whole book by yourself?",
        type: 'multiple-choice',
        options: ['Yes, I love it! 📚', 'Sometimes with help 👨‍🏫', 'Just starting to learn 🌱', 'Not yet 🤔'],
        category: 'reading'
      },
      
      // Math Assessment
      {
        id: 3,
        question: "How do you feel about math and numbers?",
        type: 'visual',
        images: ['🤩', '😊', '😐', '😰'],
        category: 'math'
      },
      {
        id: 4,
        question: "What's easiest for you in math?",
        type: 'multiple-choice',
        options: ['Counting & adding ➕', 'Shapes & patterns 🔷', 'Measuring things 📏', 'Word problems �'],
        category: 'math'
      },
      
      // Science Assessment
      {
        id: 5,
        question: "Do you like learning about science (animals, plants, space)?",
        type: 'visual',
        images: ['🤩', '😊', '😐', '😕'],
        category: 'science'
      },
      {
        id: 6,
        question: "What science topic sounds most fun?",
        type: 'multiple-choice',
        options: ['Animals & nature 🦋', 'Space & planets 🌍', 'How things work ⚙️', 'Weather & seasons ☀️'],
        category: 'science'
      },
      
      // Social Studies Assessment
      {
        id: 7,
        question: "Do you like learning about people and places?",
        type: 'visual',
        images: ['😊', '�', '�', '�'],
        category: 'social_studies'
      },
      
      // Social-Emotional Skills
      {
        id: 8,
        question: "When you feel upset or angry, what helps you feel better?",
        type: 'multiple-choice',
        options: ['Taking deep breaths 😮‍�', 'Talking to someone �', 'Taking a break �️', 'Doing something fun 🎨'],
        category: 'social_emotional'
      },
      {
        id: 9,
        question: "How do you feel when working with other kids?",
        type: 'visual',
        images: ['�', '�', '�', '😢'],
        category: 'social_emotional'
      },
      {
        id: 10,
        question: "When something is hard, how do you feel?",
        type: 'multiple-choice',
        options: ['I keep trying! 💪', 'I ask for help 🙋', 'I feel frustrated 😤', 'I want to stop �'],
        category: 'social_emotional'
      },
      
      // Speech & Communication
      {
        id: 11,
        question: "How do you like to share your ideas?",
        type: 'multiple-choice',
        options: ['Talking out loud �️', 'Writing or drawing ✏️', 'Showing with actions 🤸', 'Using pictures 🖼️'],
        category: 'speech'
      },
      {
        id: 12,
        question: "When you talk, do people understand you easily?",
        type: 'rating',
        options: ['Always! 👍', 'Most of the time ✓', 'Sometimes 🤔', 'Need to repeat �'],
        category: 'speech'
      },
      
      // Learning Style
      {
        id: 13,
        question: "What's your favorite way to learn new things?",
        type: 'multiple-choice',
        options: ['Looking at pictures 🖼️', 'Listening to stories 🎧', 'Doing activities 🎨', 'Playing games 🎮'],
        category: 'learning_style'
      },
      {
        id: 14,
        question: "How long can you focus on one activity?",
        type: 'rating',
        options: ['A few minutes ⏱️', '10-15 minutes ⏰', '20-30 minutes 🕐', 'More than 30 minutes �'],
        category: 'learning_style'
      }
    ];
  } else if (isMiddleSchool) {
    // 6-8: More specific, still engaging - comprehensive assessment
    return [
      // Reading Assessment
      {
        id: 1,
        question: `Hey ${firstName}! How confident are you with reading comprehension?`,
        type: 'rating',
        options: ['Not confident', 'Somewhat confident', 'Confident', 'Very confident'],
        category: 'reading'
      },
      {
        id: 2,
        question: "What reading skill is hardest for you?",
        type: 'multiple-choice',
        options: ['Understanding main ideas', 'Remembering details', 'Vocabulary/new words', 'Reading speed'],
        category: 'reading'
      },
      
      // Math Assessment
      {
        id: 3,
        question: "How comfortable are you with math problem-solving?",
        type: 'rating',
        options: ['Struggling', 'Need some help', 'Doing okay', 'Doing great'],
        category: 'math'
      },
      {
        id: 4,
        question: "Which math area do you find most challenging?",
        type: 'multiple-choice',
        options: ['Fractions & decimals', 'Algebra & equations', 'Geometry & shapes', 'Word problems'],
        category: 'math'
      },
      
      // Science Assessment
      {
        id: 5,
        question: "How interested are you in science topics?",
        type: 'rating',
        options: ['Not interested', 'Somewhat interested', 'Interested', 'Very interested'],
        category: 'science'
      },
      {
        id: 6,
        question: "Which science area interests you most?",
        type: 'multiple-choice',
        options: ['Life science (biology)', 'Physical science (chemistry)', 'Earth & space science', 'Environmental science'],
        category: 'science'
      },
      
      // Social Studies Assessment
      {
        id: 7,
        question: "How do you feel about social studies (history, geography, civics)?",
        type: 'rating',
        options: ['Not interested', 'It\'s okay', 'Interested', 'Love it'],
        category: 'social_studies'
      },
      {
        id: 8,
        question: "What social studies topic interests you most?",
        type: 'multiple-choice',
        options: ['History & events', 'Geography & cultures', 'Government & civics', 'Current events'],
        category: 'social_studies'
      },
      
      // Social-Emotional Skills
      {
        id: 9,
        question: "How well do you manage stress when schoolwork gets overwhelming?",
        type: 'rating',
        options: ['Very difficult', 'Somewhat difficult', 'Manageable', 'Handle it well'],
        category: 'social_emotional'
      },
      {
        id: 10,
        question: "When working in groups, how do you usually participate?",
        type: 'multiple-choice',
        options: ['Lead and organize', 'Contribute ideas actively', 'Listen and support', 'Prefer to work alone'],
        category: 'social_emotional'
      },
      {
        id: 11,
        question: "How do you handle disagreements with classmates?",
        type: 'multiple-choice',
        options: ['Talk it out calmly', 'Ask teacher for help', 'Try to avoid conflict', 'Get upset easily'],
        category: 'social_emotional'
      },
      
      // Speech & Communication
      {
        id: 12,
        question: "How comfortable are you speaking in front of the class?",
        type: 'rating',
        options: ['Very nervous', 'A bit nervous', 'Comfortable', 'Very comfortable'],
        category: 'speech'
      },
      {
        id: 13,
        question: "How do you prefer to communicate your ideas?",
        type: 'multiple-choice',
        options: ['Oral presentations', 'Written reports', 'Visual projects', 'Digital/multimedia'],
        category: 'speech'
      },
      
      // Learning Style
      {
        id: 14,
        question: "What's your preferred learning method?",
        type: 'multiple-choice',
        options: ['Visual (diagrams, videos)', 'Auditory (lectures, discussions)', 'Kinesthetic (hands-on)', 'Reading/Writing'],
        category: 'learning_style'
      },
      {
        id: 15,
        question: "When facing a difficult assignment, you typically:",
        type: 'multiple-choice',
        options: ['Break it into smaller tasks', 'Ask for clarification', 'Research online', 'Work with classmates'],
        category: 'learning_style'
      }
    ];
  } else {
    // 9-12: Academic, mature, comprehensive - college/career readiness focus
    return [
      // Reading Assessment
      {
        id: 1,
        question: `Welcome ${firstName}! Rate your reading comprehension and analysis skills:`,
        type: 'rating',
        options: ['Below grade level', 'At grade level', 'Above grade level', 'Advanced'],
        category: 'reading'
      },
      {
        id: 2,
        question: "Which reading/writing skill is most challenging for you?",
        type: 'multiple-choice',
        options: ['Literary analysis', 'Essay writing & structure', 'Research & citations', 'Vocabulary & grammar'],
        category: 'reading'
      },
      
      // Math Assessment
      {
        id: 3,
        question: "How confident are you in your mathematical reasoning abilities?",
        type: 'rating',
        options: ['Need significant support', 'Need occasional help', 'Competent', 'Highly proficient'],
        category: 'math'
      },
      {
        id: 4,
        question: "Which math area requires the most support?",
        type: 'multiple-choice',
        options: ['Algebra & functions', 'Geometry & trigonometry', 'Statistics & probability', 'Calculus concepts'],
        category: 'math'
      },
      
      // Science Assessment
      {
        id: 5,
        question: "Rate your understanding of scientific concepts and methods:",
        type: 'rating',
        options: ['Need support', 'Developing', 'Proficient', 'Advanced'],
        category: 'science'
      },
      {
        id: 6,
        question: "Which science discipline aligns with your strengths/interests?",
        type: 'multiple-choice',
        options: ['Biology & life sciences', 'Chemistry & chemical processes', 'Physics & mechanics', 'Environmental/Earth science'],
        category: 'science'
      },
      
      // Social Studies Assessment
      {
        id: 7,
        question: "How comfortable are you with social studies analysis and critical thinking?",
        type: 'rating',
        options: ['Need support', 'Developing', 'Proficient', 'Advanced'],
        category: 'social_studies'
      },
      {
        id: 8,
        question: "Which social studies area interests you most?",
        type: 'multiple-choice',
        options: ['US/World history', 'Government & politics', 'Economics & finance', 'Psychology & sociology'],
        category: 'social_studies'
      },
      
      // Social-Emotional Skills
      {
        id: 9,
        question: "How do you handle academic stress and deadlines?",
        type: 'rating',
        options: ['Often overwhelmed', 'Sometimes struggle', 'Usually manage well', 'Thrive under pressure'],
        category: 'social_emotional'
      },
      {
        id: 10,
        question: "How would you describe your self-advocacy skills?",
        type: 'rating',
        options: ['Rarely ask for help', 'Sometimes advocate', 'Usually speak up', 'Strong self-advocate'],
        category: 'social_emotional'
      },
      {
        id: 11,
        question: "In collaborative academic settings, you typically:",
        type: 'multiple-choice',
        options: ['Take leadership roles', 'Contribute equally', 'Support team members', 'Prefer independent work'],
        category: 'social_emotional'
      },
      {
        id: 12,
        question: "How do you manage academic setbacks or disappointing grades?",
        type: 'multiple-choice',
        options: ['Analyze and adjust strategy', 'Seek help from teachers', 'Feel discouraged', 'Maintain perspective'],
        category: 'social_emotional'
      },
      
      // Speech & Communication
      {
        id: 13,
        question: "Rate your comfort level with formal presentations and public speaking:",
        type: 'rating',
        options: ['Very uncomfortable', 'Somewhat uncomfortable', 'Comfortable', 'Very confident'],
        category: 'speech'
      },
      {
        id: 14,
        question: "How effectively can you articulate complex ideas?",
        type: 'rating',
        options: ['Need support', 'Developing', 'Effective', 'Highly articulate'],
        category: 'speech'
      },
      {
        id: 15,
        question: "Which communication format best showcases your abilities?",
        type: 'multiple-choice',
        options: ['Oral presentations/debates', 'Written essays/reports', 'Digital media/multimedia', 'Visual/graphic design'],
        category: 'speech'
      },
      
      // Learning Style & College Readiness
      {
        id: 16,
        question: "What is your dominant learning style?",
        type: 'multiple-choice',
        options: ['Visual (charts, diagrams, videos)', 'Auditory (lectures, podcasts)', 'Kinesthetic (labs, practice)', 'Reading/Writing (notes, essays)'],
        category: 'learning_style'
      },
      {
        id: 17,
        question: "Rate your organizational and time management skills:",
        type: 'rating',
        options: ['Need structured support', 'Developing consistency', 'Generally effective', 'Highly organized'],
        category: 'learning_style'
      },
      {
        id: 18,
        question: "When approaching complex academic material, you prefer to:",
        type: 'multiple-choice',
        options: ['Analyze independently first', 'Discuss with peers', 'Seek instructor guidance', 'Research multiple sources'],
        category: 'learning_style'
      }
    ];
  }
};

export function BaselineAssessment() {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showEncouragement, setShowEncouragement] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLearnerProfile = async () => {
      try {
        const learnerId = localStorage.getItem('current_learner_id');
        const parentToken = localStorage.getItem('access_token');

        console.log('🔍 Loading learner profile...', { learnerId, hasToken: !!parentToken });

        if (!learnerId) {
          console.error('❌ No learner ID found');
          setLoading(false);
          return;
        }

        let profileLoaded = false;

        // Try to fetch learner profile from backend
        if (parentToken) {
          try {
            console.log('📡 Fetching learner profile from backend...');
            const response = await fetch(`http://localhost:9000/api/v1/learners/${learnerId}`, {
              headers: {
                'Authorization': `Bearer ${parentToken}`
              }
            });

            if (response.ok) {
              const profile = await response.json();
              console.log('✅ Profile loaded from backend:', profile);
              setLearnerProfile(profile);
              
              // Generate age-appropriate questions
              const questions = getAgeAppropriateQuestions(
                profile.grade_level,
                profile.first_name
              );
              console.log(`📝 Generated ${questions.length} questions for grade ${profile.grade_level}`);
              setAssessmentQuestions(questions);
              profileLoaded = true;
            } else {
              console.warn('⚠️ Backend response not OK:', response.status);
            }
          } catch (err) {
            console.error('❌ Error fetching learner profile:', err);
          }
        }

        // Fallback: Use localStorage data if backend fetch failed
        if (!profileLoaded) {
          const storedProfile = localStorage.getItem('learner_profile');
          console.log('💾 Checking localStorage for profile...', { hasProfile: !!storedProfile });
          if (storedProfile) {
            const profile = JSON.parse(storedProfile);
            console.log('✅ Profile loaded from localStorage:', profile);
            setLearnerProfile(profile);
            
            const questions = getAgeAppropriateQuestions(
              profile.grade_level || 5,
              profile.first_name || 'Student'
            );
            console.log(`📝 Generated ${questions.length} questions for grade ${profile.grade_level || 5}`);
            setAssessmentQuestions(questions);
            profileLoaded = true;
          }
        }

        // Ultimate fallback: Default questions for grade 5 only if nothing else worked
        if (!profileLoaded) {
          console.warn('⚠️ Using default fallback: grade 5 questions');
          const defaultQuestions = getAgeAppropriateQuestions(5, 'Student');
          setAssessmentQuestions(defaultQuestions);
        }

      } catch (error) {
        console.error('Error loading learner profile:', error);
        // Fallback to default questions
        const defaultQuestions = getAgeAppropriateQuestions(5, 'Student');
        setAssessmentQuestions(defaultQuestions);
      } finally {
        setLoading(false);
      }
    };

    loadLearnerProfile();
  }, []);

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const progress = assessmentQuestions.length > 0 
    ? ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto"></div>
          <p className="text-2xl text-purple-600 font-semibold">Preparing your personalized assessment...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const handleAnswer = (optionIndex: number) => {
    // Save answer
    const newAnswers = { ...answers, [currentQuestion.id]: optionIndex };
    setAnswers(newAnswers);
    
    // Show encouragement
    setShowEncouragement(true);
    
    // Move to next question or finish
    setTimeout(() => {
      setShowEncouragement(false);
      if (currentQuestionIndex < assessmentQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Save assessment results to localStorage
        const assessmentResults = {
          answers: newAnswers,
          completed_at: new Date().toISOString(),
          total_questions: assessmentQuestions.length,
          learner_id: localStorage.getItem('current_learner_id')
        };
        
        localStorage.setItem('assessment_results', JSON.stringify(assessmentResults));
        localStorage.setItem('lastAssessmentDate', new Date().toISOString());
        
        // After assessment, clone the model based on results
        navigate('/cloning');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-8">
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1 h-6 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-2xl font-bold text-purple-600">
            {currentQuestionIndex + 1}/{assessmentQuestions.length}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-12 shadow-2xl mb-8">
          <h2 className="text-5xl font-bold text-center text-neutral-900 mb-12">
            {currentQuestion.question}
          </h2>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentQuestion.type === 'visual' && currentQuestion.images?.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-3xl flex items-center justify-center text-9xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                style={{ fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif' }}
                aria-label={`Option ${index + 1}`}
              >
                <span role="img" aria-label={`Emoji ${index + 1}`}>{emoji}</span>
              </button>
            ))}

            {currentQuestion.type !== 'visual' && currentQuestion.options?.map((option, index) => (
              <BigButton
                key={index}
                onClick={() => handleAnswer(index)}
                variant={index === 0 ? 'primary' : index === 1 ? 'success' : index === 2 ? 'warning' : 'secondary'}
                className="min-h-[100px] text-xl"
              >
                {option}
              </BigButton>
            ))}
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-center text-2xl text-purple-600">
          Pick the answer that feels right for you! There's no wrong answer. 💜
        </p>
      </div>

      {/* Encouragement Banner */}
      <EncouragementBanner show={showEncouragement} />
    </div>
  );
}
