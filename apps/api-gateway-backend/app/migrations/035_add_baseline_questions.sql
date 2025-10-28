-- ═══════════════════════════════════════════════════════════════════════
-- BASELINE ASSESSMENT - EXPANDED QUESTION BANK
-- 5 questions per domain × 6 domains × 3 grade bands = 90 questions
-- Migration: 035_add_baseline_questions.sql
-- Created: 2025-10-28
-- ═══════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
-- K-5 READING (5 questions)
-- ═══════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('reading-k5-001', 'single_choice', 'reading', 'phonics', 'K-5',
  'Which word starts with the /b/ sound?',
  '[{"id":"a","label":"cat","correct":false},{"id":"b","label":"dog","correct":false},{"id":"c","label":"ball","correct":true},{"id":"d","label":"sun","correct":false}]',
  -2.0, 1.3, 0.25, 'remember', 20, 1),

('reading-k5-002', 'single_choice', 'reading', 'fluency', 'K-5',
  'Read this sentence: "The cat sat on the mat." How many words did you read?',
  '[{"id":"a","label":"5","correct":false},{"id":"b","label":"6","correct":true},{"id":"c","label":"7","correct":false},{"id":"d","label":"8","correct":false}]',
  -1.5, 1.4, 0.25, 'understand', 30, 1),

('reading-k5-003', 'single_choice', 'reading', 'vocabulary', 'K-5',
  'What does "gigantic" mean?',
  '[{"id":"a","label":"Very small","correct":false},{"id":"b","label":"Very big","correct":true},{"id":"c","label":"Very fast","correct":false},{"id":"d","label":"Very slow","correct":false}]',
  -1.0, 1.5, 0.25, 'understand', 25, 1),

('reading-k5-004', 'single_choice', 'reading', 'comprehension', 'K-5',
  'Max has a dog. His dog likes to play fetch. What does Max''s dog like to do?',
  '[{"id":"a","label":"Sleep","correct":false},{"id":"b","label":"Eat","correct":false},{"id":"c","label":"Play fetch","correct":true},{"id":"d","label":"Swim","correct":false}]',
  -0.8, 1.4, 0.25, 'understand', 40, 1),

('reading-k5-005', 'single_choice', 'reading', 'inference', 'K-5',
  'Sara put on her coat and grabbed her umbrella. What is the weather probably like?',
  '[{"id":"a","label":"Sunny","correct":false},{"id":"b","label":"Rainy","correct":true},{"id":"c","label":"Snowy","correct":false},{"id":"d","label":"Windy","correct":false}]',
  -0.5, 1.6, 0.25, 'analyze', 45, 1);

-- ═══════════════════════════════════════════════════════════════════════
-- K-5 MATH (5 questions)
-- ═══════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, allow_calculator
) VALUES
('math-k5-001', 'single_choice', 'math', 'number_sense', 'K-5',
  'Which number is bigger: 45 or 54?',
  '[{"id":"a","label":"45","correct":false},{"id":"b","label":"54","correct":true},{"id":"c","label":"They are the same","correct":false}]',
  -1.8, 1.3, 0.33, 'understand', 20, 0),

('math-k5-002', 'single_choice', 'math', 'operations', 'K-5',
  'What is 8 + 7?',
  '[{"id":"a","label":"14","correct":false},{"id":"b","label":"15","correct":true},{"id":"c","label":"16","correct":false},{"id":"d","label":"17","correct":false}]',
  -1.2, 1.4, 0.25, 'apply', 30, 0),

('math-k5-003', 'single_choice', 'math', 'operations', 'K-5',
  'Sarah has 12 cookies. She gives 5 to her friend. How many cookies does she have left?',
  '[{"id":"a","label":"5","correct":false},{"id":"b","label":"6","correct":false},{"id":"c","label":"7","correct":true},{"id":"d","label":"8","correct":false}]',
  -0.8, 1.5, 0.25, 'apply', 40, 0),

('math-k5-004', 'single_choice', 'math', 'geometry', 'K-5',
  'How many sides does a triangle have?',
  '[{"id":"a","label":"2","correct":false},{"id":"b","label":"3","correct":true},{"id":"c","label":"4","correct":false},{"id":"d","label":"5","correct":false}]',
  -1.5, 1.2, 0.25, 'remember', 20, 0),

('math-k5-005', 'single_choice', 'math', 'data_analysis', 'K-5',
  'Look at the tally marks: |||| |||| ||  How many are there?',
  '[{"id":"a","label":"10","correct":false},{"id":"b","label":"11","correct":false},{"id":"c","label":"12","correct":true},{"id":"d","label":"13","correct":false}]',
  -0.6, 1.4, 0.25, 'apply', 35, 0);

-- ═══════════════════════════════════════════════════════════════════════
-- K-5 SCIENCE (5 questions)
-- ═══════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('science-k5-001', 'single_choice', 'science', 'life_science', 'K-5',
  'What do plants need to grow?',
  '[{"id":"a","label":"Only water","correct":false},{"id":"b","label":"Only sunlight","correct":false},{"id":"c","label":"Sunlight, water, and air","correct":true},{"id":"d","label":"Only soil","correct":false}]',
  -1.5, 1.3, 0.25, 'remember', 30, 1),

('science-k5-002', 'single_choice', 'science', 'physical_science', 'K-5',
  'Which object will float in water?',
  '[{"id":"a","label":"Rock","correct":false},{"id":"b","label":"Penny","correct":false},{"id":"c","label":"Cork","correct":true},{"id":"d","label":"Marble","correct":false}]',
  -1.0, 1.4, 0.25, 'understand', 35, 1),

('science-k5-003', 'single_choice', 'science', 'earth_space', 'K-5',
  'What causes day and night?',
  '[{"id":"a","label":"The Moon moving","correct":false},{"id":"b","label":"The Earth spinning","correct":true},{"id":"c","label":"The Sun moving","correct":false},{"id":"d","label":"Clouds covering the Sun","correct":false}]',
  -0.5, 1.5, 0.25, 'understand', 40, 1),

('science-k5-004', 'single_choice', 'science', 'scientific_inquiry', 'K-5',
  'You want to find out which paper towel is strongest. What should you do?',
  '[{"id":"a","label":"Ask your teacher","correct":false},{"id":"b","label":"Test them by seeing which holds more water","correct":true},{"id":"c","label":"Buy the most expensive one","correct":false},{"id":"d","label":"Pick the prettiest one","correct":false}]',
  -0.3, 1.6, 0.25, 'apply', 50, 1),

('science-k5-005', 'multi_select', 'science', 'life_science', 'K-5',
  'Which of these are living things? (Choose all that apply)',
  '[{"id":"a","label":"Tree","correct":true},{"id":"b","label":"Rock","correct":false},{"id":"c","label":"Dog","correct":true},{"id":"d","label":"Water","correct":false}]',
  -0.2, 1.5, 0.0, 'analyze', 45, 1);

-- ═══════════════════════════════════════════════════════════════════════
-- K-5 WRITING (5 questions)
-- ═══════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('writing-k5-001', 'single_choice', 'writing', 'mechanics', 'K-5',
  'Which sentence has the correct punctuation?',
  '[{"id":"a","label":"I like pizza","correct":false},{"id":"b","label":"I like pizza.","correct":true},{"id":"c","label":"i like pizza.","correct":false},{"id":"d","label":"I like pizza,","correct":false}]',
  -1.3, 1.4, 0.25, 'understand', 30, 1),

('writing-k5-002', 'single_choice', 'writing', 'grammar', 'K-5',
  'Which word is a noun?',
  '[{"id":"a","label":"run","correct":false},{"id":"b","label":"happy","correct":false},{"id":"c","label":"dog","correct":true},{"id":"d","label":"quickly","correct":false}]',
  -0.9, 1.3, 0.25, 'remember', 25, 1),

('writing-k5-003', 'single_choice', 'writing', 'conventions', 'K-5',
  'Which sentence is written correctly?',
  '[{"id":"a","label":"She go to school","correct":false},{"id":"b","label":"She goes to school","correct":true},{"id":"c","label":"She going to school","correct":false},{"id":"d","label":"She goed to school","correct":false}]',
  -0.7, 1.5, 0.25, 'apply', 35, 1),

('writing-k5-004', 'single_choice', 'writing', 'organization', 'K-5',
  'What should come first when you tell a story?',
  '[{"id":"a","label":"The end","correct":false},{"id":"b","label":"The middle","correct":false},{"id":"c","label":"The beginning","correct":true},{"id":"d","label":"It doesn''t matter","correct":false}]',
  -0.5, 1.4, 0.25, 'understand', 30, 1),

('writing-k5-005', 'constructed_response', 'writing', 'development', 'K-5',
  'Write 2-3 sentences about your favorite animal.',
  NULL,
  -0.3, 1.6, 0.0, 'create', 120, 1);

-- ═══════════════════════════════════════════════════════════════════════
-- K-5 SEL (5 questions)
-- ═══════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('sel-k5-001', 'single_choice', 'sel', 'self_awareness', 'K-5',
  'How do you feel when you get a good grade?',
  '[{"id":"a","label":"😊 Happy","correct":true},{"id":"b","label":"😢 Sad","correct":false},{"id":"c","label":"😠 Angry","correct":false},{"id":"d","label":"😴 Sleepy","correct":false}]',
  -1.8, 1.2, 0.25, 'understand', 25, 1),

('sel-k5-002', 'single_choice', 'sel', 'self_management', 'K-5',
  'What should you do when you feel angry?',
  '[{"id":"a","label":"Hit someone","correct":false},{"id":"b","label":"Take deep breaths","correct":true},{"id":"c","label":"Yell loudly","correct":false},{"id":"d","label":"Run away","correct":false}]',
  -1.0, 1.4, 0.25, 'apply', 35, 1),

('sel-k5-003', 'single_choice', 'sel', 'social_awareness', 'K-5',
  'Your friend is crying. What should you do?',
  '[{"id":"a","label":"Laugh at them","correct":false},{"id":"b","label":"Walk away","correct":false},{"id":"c","label":"Ask if they''re okay and try to help","correct":true},{"id":"d","label":"Tell the teacher to make them stop","correct":false}]',
  -0.8, 1.5, 0.25, 'apply', 40, 1),

('sel-k5-004', 'single_choice', 'sel', 'relationship_skills', 'K-5',
  'How do you make friends?',
  '[{"id":"a","label":"Be kind and share","correct":true},{"id":"b","label":"Take their toys","correct":false},{"id":"c","label":"Ignore everyone","correct":false},{"id":"d","label":"Only play by yourself","correct":false}]',
  -0.6, 1.4, 0.25, 'understand', 30, 1),

('sel-k5-005', 'single_choice', 'sel', 'responsible_decision_making', 'K-5',
  'You found a toy that isn''t yours. What should you do?',
  '[{"id":"a","label":"Keep it","correct":false},{"id":"b","label":"Hide it","correct":false},{"id":"c","label":"Try to find the owner or give it to a teacher","correct":true},{"id":"d","label":"Throw it away","correct":false}]',
  -0.4, 1.5, 0.25, 'evaluate', 45, 1);

-- ═══════════════════════════════════════════════════════════════════════
-- 6-8 READING (5 questions)
-- ═══════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, stimulus, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('reading-68-001', 'single_choice', 'reading', 'vocabulary', '6-8',
  'In the sentence "The athlete showed remarkable perseverance," what does perseverance mean?',
  NULL,
  '[{"id":"a","label":"Giving up quickly","correct":false},{"id":"b","label":"Continuing despite difficulties","correct":true},{"id":"c","label":"Running fast","correct":false},{"id":"d","label":"Being lazy","correct":false}]',
  -0.3, 1.5, 0.25, 'understand', 35, 1),

('reading-68-002', 'single_choice', 'reading', 'comprehension', '6-8',
  'What is the main idea of this paragraph?',
  'Photosynthesis is the process by which plants convert sunlight into energy. Chlorophyll in the leaves absorbs light, and the plant uses carbon dioxide from the air and water from the soil to create glucose and oxygen.',
  '[{"id":"a","label":"Plants need water","correct":false},{"id":"b","label":"How plants make energy from sunlight","correct":true},{"id":"c","label":"Leaves are green","correct":false},{"id":"d","label":"Plants make oxygen","correct":false}]',
  0.0, 1.6, 0.25, 'understand', 50, 1),

('reading-68-003', 'single_choice', 'reading', 'inference', '6-8',
  'Based on this passage, what can you infer about Maria?',
  'Maria checked her watch for the third time in five minutes. She shifted from foot to foot, glancing down the street. A bead of sweat rolled down her forehead despite the cool morning air.',
  '[{"id":"a","label":"Maria is exercising","correct":false},{"id":"b","label":"Maria is nervous or anxious about something","correct":true},{"id":"c","label":"Maria is angry","correct":false},{"id":"d","label":"Maria is hungry","correct":false}]',
  0.3, 1.7, 0.25, 'analyze', 60, 1),

('reading-68-004', 'multi_select', 'reading', 'fluency', '6-8',
  'Which strategies help you read more fluently? (Choose all that apply)',
  NULL,
  '[{"id":"a","label":"Reading in meaningful phrases","correct":true},{"id":"b","label":"Skipping all punctuation","correct":false},{"id":"c","label":"Paying attention to punctuation marks","correct":true},{"id":"d","label":"Reading one word at a time without pausing","correct":false}]',
  0.2, 1.6, 0.0, 'apply', 45, 1),

('reading-68-005', 'single_choice', 'reading', 'inference', '6-8',
  'What is the author''s tone in this sentence: "Oh great, another Monday morning."',
  NULL,
  '[{"id":"a","label":"Excited","correct":false},{"id":"b","label":"Sarcastic","correct":true},{"id":"c","label":"Hopeful","correct":false},{"id":"d","label":"Angry","correct":false}]',
  0.5, 1.7, 0.25, 'analyze', 40, 1);

-- ═══════════════════════════════════════════════════════════════════════
-- 6-8 MATH (5 questions)
-- ═══════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, allow_calculator
) VALUES
('math-68-001', 'single_choice', 'math', 'operations', '6-8',
  'What is -5 + 8?',
  '[{"id":"a","label":"-3","correct":false},{"id":"b","label":"3","correct":true},{"id":"c","label":"13","correct":false},{"id":"d","label":"−13","correct":false}]',
  -0.2, 1.5, 0.25, 'apply', 30, 0),

('math-68-002', 'single_choice', 'math', 'algebra', '6-8',
  'Solve for x: 3x + 5 = 20',
  '[{"id":"a","label":"x = 3","correct":false},{"id":"b","label":"x = 5","correct":true},{"id":"c","label":"x = 7","correct":false},{"id":"d","label":"x = 15","correct":false}]',
  0.2, 1.6, 0.25, 'apply', 60, 1),

('math-68-003', 'single_choice', 'math', 'geometry', '6-8',
  'What is the area of a rectangle with length 8 cm and width 5 cm?',
  '[{"id":"a","label":"13 cm²","correct":false},{"id":"b","label":"26 cm²","correct":false},{"id":"c","label":"40 cm²","correct":true},{"id":"d","label":"80 cm²","correct":false}]',
  0.0, 1.5, 0.25, 'apply', 45, 1),

('math-68-004', 'single_choice', 'math', 'data_analysis', '6-8',
  'The test scores are: 85, 90, 75, 90, 80. What is the mode?',
  '[{"id":"a","label":"75","correct":false},{"id":"b","label":"80","correct":false},{"id":"c","label":"85","correct":false},{"id":"d","label":"90","correct":true}]',
  0.3, 1.6, 0.25, 'analyze', 50, 1),

('math-68-005', 'single_choice', 'math', 'number_sense', '6-8',
  'What is 25% of 80?',
  '[{"id":"a","label":"15","correct":false},{"id":"b","label":"20","correct":true},{"id":"c","label":"25","correct":false},{"id":"d","label":"30","correct":false}]',
  0.1, 1.5, 0.25, 'apply', 40, 1);

-- ═══════════════════════════════════════════════════════════════════════
-- 6-8 SCIENCE (5 questions)
-- ═══════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('science-68-001', 'single_choice', 'science', 'physical_science', '6-8',
  'Which state of matter has a definite shape and volume?',
  '[{"id":"a","label":"Gas","correct":false},{"id":"b","label":"Liquid","correct":false},{"id":"c","label":"Solid","correct":true},{"id":"d","label":"Plasma","correct":false}]',
  0.0, 1.5, 0.25, 'remember', 30, 1),

('science-68-002', 'single_choice', 'science', 'life_science', '6-8',
  'What is the function of mitochondria in a cell?',
  '[{"id":"a","label":"Protein synthesis","correct":false},{"id":"b","label":"Energy production","correct":true},{"id":"c","label":"Waste removal","correct":false},{"id":"d","label":"Cell division","correct":false}]',
  0.3, 1.6, 0.25, 'understand', 40, 1),

('science-68-003', 'single_choice', 'science', 'earth_space', '6-8',
  'What causes the seasons on Earth?',
  '[{"id":"a","label":"Distance from the Sun","correct":false},{"id":"b","label":"Tilt of Earth''s axis","correct":true},{"id":"c","label":"Speed of Earth''s rotation","correct":false},{"id":"d","label":"The Moon''s orbit","correct":false}]',
  0.2, 1.6, 0.25, 'understand', 45, 1),

('science-68-004', 'single_choice', 'science', 'scientific_inquiry', '6-8',
  'What is the first step of the scientific method?',
  '[{"id":"a","label":"Conduct an experiment","correct":false},{"id":"b","label":"Form a hypothesis","correct":false},{"id":"c","label":"Ask a question","correct":true},{"id":"d","label":"Analyze data","correct":false}]',
  0.1, 1.5, 0.25, 'remember', 35, 1),

('science-68-005', 'multi_select', 'science', 'physical_science', '6-8',
  'Which are examples of chemical changes? (Choose all that apply)',
  '[{"id":"a","label":"Burning wood","correct":true},{"id":"b","label":"Melting ice","correct":false},{"id":"c","label":"Rusting iron","correct":true},{"id":"d","label":"Breaking glass","correct":false}]',
  0.4, 1.7, 0.0, 'analyze', 55, 1);

-- ═══════════════════════════════════════════════════════════════════════
-- 6-8 WRITING (5 questions)
-- ═══════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('writing-68-001', 'single_choice', 'writing', 'grammar', '6-8',
  'Choose the sentence with correct subject-verb agreement:',
  '[{"id":"a","label":"The group of students are going.","correct":false},{"id":"b","label":"The group of students is going.","correct":true},{"id":"c","label":"The group of students were going.","correct":false},{"id":"d","label":"The group of students be going.","correct":false}]',
  0.2, 1.6, 0.25, 'apply', 40, 1),

('writing-68-002', 'single_choice', 'writing', 'conventions', '6-8',
  'Which sentence uses commas correctly?',
  '[{"id":"a","label":"I bought apples oranges and bananas.","correct":false},{"id":"b","label":"I bought apples, oranges, and bananas.","correct":true},{"id":"c","label":"I bought, apples oranges and bananas.","correct":false},{"id":"d","label":"I bought apples oranges, and bananas.","correct":false}]',
  0.1, 1.5, 0.25, 'apply', 35, 1),

('writing-68-003', 'single_choice', 'writing', 'organization', '6-8',
  'What is the purpose of a thesis statement in an essay?',
  '[{"id":"a","label":"To introduce the topic and state the main argument","correct":true},{"id":"b","label":"To provide evidence","correct":false},{"id":"c","label":"To conclude the essay","correct":false},{"id":"d","label":"To transition between paragraphs","correct":false}]',
  0.3, 1.6, 0.25, 'understand', 45, 1),

('writing-68-004', 'single_choice', 'writing', 'development', '6-8',
  'Which is the best topic sentence for a paragraph about recycling?',
  '[{"id":"a","label":"Recycling is good.","correct":false},{"id":"b","label":"I recycle at home.","correct":false},{"id":"c","label":"Recycling reduces waste and conserves natural resources.","correct":true},{"id":"d","label":"Many people recycle.","correct":false}]',
  0.2, 1.6, 0.25, 'evaluate', 50, 1),

('writing-68-005', 'constructed_response', 'writing', 'development', '6-8',
  'Write a paragraph (4-5 sentences) explaining why it''s important to set goals.',
  NULL,
  0.4, 1.7, 0.0, 'create', 180, 1);

-- ═══════════════════════════════════════════════════════════════════════
-- 6-8 SEL (5 questions)
-- ═══════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('sel-68-001', 'single_choice', 'sel', 'self_awareness', '6-8',
  'Which of these is an example of self-awareness?',
  '[{"id":"a","label":"Recognizing when you''re feeling stressed","correct":true},{"id":"b","label":"Ignoring your emotions","correct":false},{"id":"c","label":"Blaming others for your feelings","correct":false},{"id":"d","label":"Never thinking about your emotions","correct":false}]',
  0.0, 1.5, 0.25, 'understand', 40, 1),

('sel-68-002', 'single_choice', 'sel', 'self_management', '6-8',
  'You have a big test tomorrow but your friends want to play video games. What shows good self-management?',
  '[{"id":"a","label":"Play games and study later","correct":false},{"id":"b","label":"Study now and plan time with friends after the test","correct":true},{"id":"c","label":"Skip studying completely","correct":false},{"id":"d","label":"Study for 5 minutes then play all night","correct":false}]',
  0.2, 1.6, 0.25, 'apply', 50, 1),

('sel-68-003', 'single_choice', 'sel', 'social_awareness', '6-8',
  'Your classmate seems upset and withdrawn. What should you do?',
  '[{"id":"a","label":"Ignore them","correct":false},{"id":"b","label":"Make fun of them","correct":false},{"id":"c","label":"Ask if they''re okay and if they want to talk","correct":true},{"id":"d","label":"Tell everyone they''re acting weird","correct":false}]',
  0.1, 1.5, 0.25, 'apply', 45, 1),

('sel-68-004', 'single_choice', 'sel', 'relationship_skills', '6-8',
  'What is the best way to resolve a conflict with a friend?',
  '[{"id":"a","label":"Yell at them","correct":false},{"id":"b","label":"Stop being their friend","correct":false},{"id":"c","label":"Talk calmly and listen to their perspective","correct":true},{"id":"d","label":"Ignore them until they apologize","correct":false}]',
  0.3, 1.6, 0.25, 'apply', 55, 1),

('sel-68-005', 'single_choice', 'sel', 'responsible_decision_making', '6-8',
  'Your friend wants you to copy their homework. What should you consider?',
  '[{"id":"a","label":"Whether you''ll get caught","correct":false},{"id":"b","label":"The ethical implications and long-term consequences","correct":true},{"id":"c","label":"Whether other people do it","correct":false},{"id":"d","label":"Whether the teacher will notice","correct":false}]',
  0.4, 1.7, 0.25, 'evaluate', 60, 1);

-- ═══════════════════════════════════════════════════════════════════════
-- 9-12 READING (5 questions)
-- ═══════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, stimulus, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('reading-912-001', 'single_choice', 'reading', 'vocabulary', '9-12',
  'In academic writing, what does "juxtapose" mean?',
  NULL,
  '[{"id":"a","label":"To combine","correct":false},{"id":"b","label":"To place side by side for comparison","correct":true},{"id":"c","label":"To oppose","correct":false},{"id":"d","label":"To separate","correct":false}]',
  0.5, 1.7, 0.25, 'understand', 35, 1),

('reading-912-002', 'single_choice', 'reading', 'comprehension', '9-12',
  'What is the central argument of this passage?',
  'While social media has connected billions of people globally, studies show it has paradoxically increased feelings of isolation among young adults. The curated nature of online personas creates unrealistic comparisons, and the replacement of face-to-face interaction with digital communication reduces the depth of human connection.',
  '[{"id":"a","label":"Social media is popular","correct":false},{"id":"b","label":"Social media increases isolation despite connecting people","correct":true},{"id":"c","label":"Young adults use social media","correct":false},{"id":"d","label":"Face-to-face communication is better","correct":false}]',
  0.8, 1.8, 0.25, 'analyze', 70, 1),

('reading-912-003', 'single_choice', 'reading', 'inference', '9-12',
  'Based on the author''s tone and word choice, what can you infer about their stance?',
  'The so-called "revolutionary" technology merely repackages existing ideas with a sleeker interface, offering little substantive innovation while commanding premium prices.',
  '[{"id":"a","label":"The author is enthusiastic","correct":false},{"id":"b","label":"The author is skeptical and critical","correct":true},{"id":"c","label":"The author is neutral","correct":false},{"id":"d","label":"The author is confused","correct":false}]',
  1.0, 1.8, 0.25, 'analyze', 60, 1),

('reading-912-004', 'multi_select', 'reading', 'comprehension', '9-12',
  'Which rhetorical devices does this sentence use? "Ask not what your country can do for you—ask what you can do for your country."',
  NULL,
  '[{"id":"a","label":"Chiasmus (inverted structure)","correct":true},{"id":"b","label":"Metaphor","correct":false},{"id":"c","label":"Anaphora (repetition)","correct":true},{"id":"d","label":"Hyperbole","correct":false}]',
  1.2, 1.8, 0.0, 'analyze', 80, 1),

('reading-912-005', 'single_choice', 'reading', 'inference', '9-12',
  'What can you infer about the historical context of this passage?',
  'The assembly lines hummed with unprecedented efficiency, as workers performed repetitive tasks with mechanical precision. The promise of prosperity came at the cost of autonomy, as laborers became extensions of the machines they operated.',
  '[{"id":"a","label":"Ancient agricultural society","correct":false},{"id":"b","label":"Industrial Revolution era","correct":true},{"id":"c","label":"Digital age","correct":false},{"id":"d","label":"Renaissance period","correct":false}]',
  0.9, 1.7, 0.25, 'analyze', 75, 1);

-- ═══════════════════════════════════════════════════════════════════════
-- 9-12 MATH (5 questions)
-- ═══════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, allow_calculator
) VALUES
('math-912-001', 'single_choice', 'math', 'algebra', '9-12',
  'Solve: 2x² - 8x = 0',
  '[{"id":"a","label":"x = 0 or x = 2","correct":false},{"id":"b","label":"x = 0 or x = 4","correct":true},{"id":"c","label":"x = 2 or x = 4","correct":false},{"id":"d","label":"x = -4 or x = 0","correct":false}]',
  0.7, 1.7, 0.25, 'apply', 70, 1),

('math-912-002', 'single_choice', 'math', 'algebra', '9-12',
  'What is the slope of the line passing through points (2, 5) and (6, 13)?',
  '[{"id":"a","label":"1","correct":false},{"id":"b","label":"2","correct":true},{"id":"c","label":"3","correct":false},{"id":"d","label":"4","correct":false}]',
  0.5, 1.6, 0.25, 'apply', 60, 1),

('math-912-003', 'single_choice', 'math', 'geometry', '9-12',
  'What is the volume of a cylinder with radius 3 cm and height 10 cm? (Use π ≈ 3.14)',
  '[{"id":"a","label":"94.2 cm³","correct":false},{"id":"b","label":"188.4 cm³","correct":false},{"id":"c","label":"282.6 cm³","correct":true},{"id":"d","label":"565.2 cm³","correct":false}]',
  0.8, 1.7, 0.25, 'apply', 80, 1),

('math-912-004', 'single_choice', 'math', 'data_analysis', '9-12',
  'In a normal distribution, approximately what percentage of data falls within one standard deviation of the mean?',
  '[{"id":"a","label":"50%","correct":false},{"id":"b","label":"68%","correct":true},{"id":"c","label":"95%","correct":false},{"id":"d","label":"99%","correct":false}]',
  1.0, 1.8, 0.25, 'remember', 50, 1),

('math-912-005', 'single_choice', 'math', 'algebra', '9-12',
  'Which function represents exponential growth?',
  '[{"id":"a","label":"f(x) = 2x + 3","correct":false},{"id":"b","label":"f(x) = x²","correct":false},{"id":"c","label":"f(x) = 2^x","correct":true},{"id":"d","label":"f(x) = 1/x","correct":false}]',
  0.6, 1.6, 0.25, 'understand', 55, 1);

-- ═══════════════════════════════════════════════════════════════════════
-- 9-12 SCIENCE (5 questions)
-- ═══════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('science-912-001', 'single_choice', 'science', 'physical_science', '9-12',
  'According to Newton''s Third Law, if object A exerts a force on object B, then:',
  '[{"id":"a","label":"Object B exerts no force","correct":false},{"id":"b","label":"Object B exerts an equal and opposite force on A","correct":true},{"id":"c","label":"Object B exerts a stronger force","correct":false},{"id":"d","label":"Object B exerts a weaker force","correct":false}]',
  0.6, 1.7, 0.25, 'understand', 50, 1),

('science-912-002', 'single_choice', 'science', 'life_science', '9-12',
  'What is the role of mRNA in protein synthesis?',
  '[{"id":"a","label":"Stores genetic information","correct":false},{"id":"b","label":"Carries amino acids","correct":false},{"id":"c","label":"Carries genetic code from DNA to ribosomes","correct":true},{"id":"d","label":"Catalyzes reactions","correct":false}]',
  0.9, 1.8, 0.25, 'understand', 60, 1),

('science-912-003', 'single_choice', 'science', 'earth_space', '9-12',
  'What drives plate tectonics?',
  '[{"id":"a","label":"Ocean currents","correct":false},{"id":"b","label":"Convection in Earth''s mantle","correct":true},{"id":"c","label":"Earth''s rotation","correct":false},{"id":"d","label":"Gravitational pull from the Moon","correct":false}]',
  0.7, 1.7, 0.25, 'understand', 55, 1),

('science-912-004', 'single_choice', 'science', 'scientific_inquiry', '9-12',
  'What is the purpose of a control group in an experiment?',
  '[{"id":"a","label":"To test the hypothesis","correct":false},{"id":"b","label":"To provide a baseline for comparison","correct":true},{"id":"c","label":"To increase sample size","correct":false},{"id":"d","label":"To eliminate variables","correct":false}]',
  0.5, 1.6, 0.25, 'understand', 50, 1),

('science-912-005', 'multi_select', 'science', 'physical_science', '9-12',
  'Which are properties of acids? (Choose all that apply)',
  '[{"id":"a","label":"pH less than 7","correct":true},{"id":"b","label":"Taste bitter","correct":false},{"id":"c","label":"Turn litmus paper red","correct":true},{"id":"d","label":"Feel slippery","correct":false}]',
  0.8, 1.7, 0.0, 'remember', 60, 1);

-- ═══════════════════════════════════════════════════════════════════════
-- 9-12 WRITING (5 questions)
-- ═══════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('writing-912-001', 'single_choice', 'writing', 'grammar', '9-12',
  'Identify the sentence with correct parallel structure:',
  '[{"id":"a","label":"She likes reading, writing, and to paint.","correct":false},{"id":"b","label":"She likes reading, writing, and painting.","correct":true},{"id":"c","label":"She likes to read, writing, and painting.","correct":false},{"id":"d","label":"She likes reading, to write, and painting.","correct":false}]',
  0.6, 1.7, 0.25, 'apply', 50, 1),

('writing-912-002', 'single_choice', 'writing', 'conventions', '9-12',
  'Which sentence correctly uses a semicolon?',
  '[{"id":"a","label":"I have a test tomorrow; I need to study.","correct":true},{"id":"b","label":"I have a test; tomorrow I need to study.","correct":false},{"id":"c","label":"I have; a test tomorrow I need to study.","correct":false},{"id":"d","label":"I have a test tomorrow I need; to study.","correct":false}]',
  0.7, 1.7, 0.25, 'apply', 45, 1),

('writing-912-003', 'single_choice', 'writing', 'organization', '9-12',
  'In academic writing, what is the purpose of a counterargument?',
  '[{"id":"a","label":"To confuse the reader","correct":false},{"id":"b","label":"To acknowledge and refute opposing views","correct":true},{"id":"c","label":"To fill space","correct":false},{"id":"d","label":"To contradict your thesis","correct":false}]',
  0.8, 1.7, 0.25, 'understand', 55, 1),

('writing-912-004', 'single_choice', 'writing', 'development', '9-12',
  'Which provides the strongest evidence in an argumentative essay?',
  '[{"id":"a","label":"Personal opinion","correct":false},{"id":"b","label":"Peer-reviewed research and statistics","correct":true},{"id":"c","label":"Anecdotal stories","correct":false},{"id":"d","label":"General statements","correct":false}]',
  0.6, 1.6, 0.25, 'evaluate', 50, 1),

('writing-912-005', 'constructed_response', 'writing', 'development', '9-12',
  'Write a well-developed paragraph (6-8 sentences) arguing whether technology has improved or harmed interpersonal communication. Include a topic sentence, evidence, and a conclusion.',
  NULL,
  1.0, 1.8, 0.0, 'create', 300, 1);

-- ═══════════════════════════════════════════════════════════════════════
-- 9-12 SEL (5 questions)
-- ═══════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('sel-912-001', 'single_choice', 'sel', 'self_awareness', '9-12',
  'Which demonstrates emotional intelligence?',
  '[{"id":"a","label":"Suppressing all emotions","correct":false},{"id":"b","label":"Recognizing your emotions and understanding their impact","correct":true},{"id":"c","label":"Always expressing emotions immediately","correct":false},{"id":"d","label":"Ignoring how others feel","correct":false}]',
  0.6, 1.7, 0.25, 'understand', 50, 1),

('sel-912-002', 'single_choice', 'sel', 'self_management', '9-12',
  'You''re overwhelmed with college applications, extracurriculars, and part-time work. What''s the best approach?',
  '[{"id":"a","label":"Try to do everything at once","correct":false},{"id":"b","label":"Give up on some commitments","correct":false},{"id":"c","label":"Prioritize tasks, create a schedule, and ask for help when needed","correct":true},{"id":"d","label":"Procrastinate until the last minute","correct":false}]',
  0.7, 1.7, 0.25, 'apply', 65, 1),

('sel-912-003', 'single_choice', 'sel', 'social_awareness', '9-12',
  'What does cultural competence mean?',
  '[{"id":"a","label":"Speaking multiple languages","correct":false},{"id":"b","label":"Understanding and respecting diverse cultural perspectives","correct":true},{"id":"c","label":"Knowing facts about different countries","correct":false},{"id":"d","label":"Traveling internationally","correct":false}]',
  0.8, 1.7, 0.25, 'understand', 55, 1),

('sel-912-004', 'single_choice', 'sel', 'relationship_skills', '9-12',
  'In a group project, one member isn''t contributing. What''s the most effective response?',
  '[{"id":"a","label":"Do their work for them","correct":false},{"id":"b","label":"Complain to others but not address it","correct":false},{"id":"c","label":"Have a private, respectful conversation about expectations","correct":true},{"id":"d","label":"Exclude them from the group","correct":false}]',
  0.9, 1.7, 0.25, 'apply', 70, 1),

('sel-912-005', 'single_choice', 'sel', 'responsible_decision_making', '9-12',
  'When making an important life decision, what should you consider?',
  '[{"id":"a","label":"Only what your friends think","correct":false},{"id":"b","label":"Short-term benefits and immediate gratification","correct":false},{"id":"c","label":"Long-term consequences, personal values, and ethical implications","correct":true},{"id":"d","label":"What''s easiest in the moment","correct":false}]',
  0.8, 1.7, 0.25, 'evaluate', 65, 1);

-- ═══════════════════════════════════════════════════════════════════════
-- SPEECH DOMAIN (5 questions per grade band)
-- Note: Speech questions may have been added in previous migrations
-- Adding complete set here for all grade bands
-- ═══════════════════════════════════════════════════════════════════════

-- K-5 SPEECH (5 questions)
INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('speech-k5-001', 'single_choice', 'speech', 'articulation', 'K-5',
  'Can you say "rabbit" clearly? Which sound is hardest?',
  '[{"id":"a","label":"r sound","correct":true},{"id":"b","label":"a sound","correct":false},{"id":"c","label":"b sound","correct":false},{"id":"d","label":"All sounds are easy","correct":false}]',
  -1.2, 1.4, 0.25, 'apply', 30, 1),

('speech-k5-002', 'single_choice', 'speech', 'fluency_stuttering', 'K-5',
  'When you talk, do you sometimes repeat sounds like "b-b-ball"?',
  '[{"id":"a","label":"Yes, often","correct":true},{"id":"b","label":"Sometimes","correct":true},{"id":"c","label":"Rarely","correct":false},{"id":"d","label":"Never","correct":false}]',
  -0.8, 1.3, 0.25, 'understand', 25, 1),

('speech-k5-003', 'single_choice', 'speech', 'voice', 'K-5',
  'Is your voice loud enough for others to hear you in class?',
  '[{"id":"a","label":"Yes, always","correct":false},{"id":"b","label":"Usually","correct":false},{"id":"c","label":"Sometimes","correct":true},{"id":"d","label":"No, it''s too quiet","correct":true}]',
  -0.6, 1.4, 0.25, 'understand', 20, 1),

('speech-k5-004', 'single_choice', 'speech', 'language_expression', 'K-5',
  'Can you tell a story about what you did yesterday?',
  '[{"id":"a","label":"Yes, with lots of details","correct":false},{"id":"b","label":"Yes, with some details","correct":false},{"id":"c","label":"A little bit","correct":true},{"id":"d","label":"No, it''s hard","correct":true}]',
  -0.4, 1.5, 0.25, 'create', 40, 1),

('speech-k5-005', 'single_choice', 'speech', 'pragmatics', 'K-5',
  'When your friend is talking, what should you do?',
  '[{"id":"a","label":"Look at them and listen","correct":true},{"id":"b","label":"Walk away","correct":false},{"id":"c","label":"Talk over them","correct":false},{"id":"d","label":"Play with toys","correct":false}]',
  -1.0, 1.3, 0.25, 'understand', 25, 1);

-- 6-8 SPEECH (5 questions)
INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('speech-68-001', 'single_choice', 'speech', 'articulation', '6-8',
  'Do you have difficulty pronouncing certain sounds like "r", "s", or "th"?',
  '[{"id":"a","label":"Yes, multiple sounds","correct":true},{"id":"b","label":"Yes, one or two sounds","correct":true},{"id":"c","label":"Occasionally","correct":false},{"id":"d","label":"No difficulties","correct":false}]',
  0.0, 1.5, 0.25, 'understand', 30, 1),

('speech-68-002', 'single_choice', 'speech', 'fluency_stuttering', '6-8',
  'When presenting in class, do you notice yourself repeating words or getting stuck?',
  '[{"id":"a","label":"Yes, frequently","correct":true},{"id":"b","label":"Sometimes","correct":true},{"id":"c","label":"Rarely","correct":false},{"id":"d","label":"Never","correct":false}]',
  0.2, 1.6, 0.25, 'understand', 35, 1),

('speech-68-003', 'single_choice', 'speech', 'voice', '6-8',
  'Does your voice sound hoarse or strained after talking a lot?',
  '[{"id":"a","label":"Yes, often","correct":true},{"id":"b","label":"Sometimes","correct":true},{"id":"c","label":"Rarely","correct":false},{"id":"d","label":"Never","correct":false}]',
  0.1, 1.5, 0.25, 'understand', 30, 1),

('speech-68-004', 'single_choice', 'speech', 'language_expression', '6-8',
  'Can you explain complex ideas clearly to others?',
  '[{"id":"a","label":"Yes, very clearly","correct":false},{"id":"b","label":"Usually well","correct":false},{"id":"c","label":"Sometimes struggle","correct":true},{"id":"d","label":"Very difficult","correct":true}]',
  0.3, 1.6, 0.25, 'evaluate', 45, 1),

('speech-68-005', 'single_choice', 'speech', 'pragmatics', '6-8',
  'In a group conversation, can you tell when it''s your turn to speak?',
  '[{"id":"a","label":"Yes, always","correct":false},{"id":"b","label":"Usually","correct":false},{"id":"c","label":"Sometimes struggle","correct":true},{"id":"d","label":"Find it very difficult","correct":true}]',
  0.2, 1.5, 0.25, 'apply', 40, 1);

-- 9-12 SPEECH (5 questions)
INSERT OR IGNORE INTO baseline_items (
  id, item_type, domain, sub_domain, grade_band,
  stem, options_json, difficulty, discrimination, guessing,
  cognitive_level, estimated_time_seconds, read_aloud_enabled
) VALUES
('speech-912-001', 'single_choice', 'speech', 'articulation', '9-12',
  'Do articulation issues affect your confidence in public speaking or presentations?',
  '[{"id":"a","label":"Yes, significantly","correct":true},{"id":"b","label":"Somewhat","correct":true},{"id":"c","label":"Minimally","correct":false},{"id":"d","label":"Not at all","correct":false}]',
  0.5, 1.7, 0.25, 'evaluate', 40, 1),

('speech-912-002', 'single_choice', 'speech', 'fluency_stuttering', '9-12',
  'Have you developed strategies to manage stuttering or disfluencies?',
  '[{"id":"a","label":"Yes, effective strategies","correct":false},{"id":"b","label":"Some strategies","correct":false},{"id":"c","label":"Few strategies","correct":true},{"id":"d","label":"No strategies yet","correct":true}]',
  0.6, 1.7, 0.25, 'apply', 50, 1),

('speech-912-003', 'single_choice', 'speech', 'voice', '9-12',
  'Can you modulate your voice appropriately for different settings (classroom, presentation, conversation)?',
  '[{"id":"a","label":"Yes, very naturally","correct":false},{"id":"b","label":"Usually well","correct":false},{"id":"c","label":"Sometimes struggle","correct":true},{"id":"d","label":"Find it challenging","correct":true}]',
  0.4, 1.6, 0.25, 'apply', 45, 1),

('speech-912-004', 'single_choice', 'speech', 'language_expression', '9-12',
  'Can you organize and express complex arguments or analyses verbally?',
  '[{"id":"a","label":"Yes, very effectively","correct":false},{"id":"b","label":"Generally well","correct":false},{"id":"c","label":"With some difficulty","correct":true},{"id":"d","label":"Very challenging","correct":true}]',
  0.7, 1.7, 0.25, 'create', 60, 1),

('speech-912-005', 'single_choice', 'speech', 'pragmatics', '9-12',
  'Can you adapt your communication style based on your audience (peers, teachers, professionals)?',
  '[{"id":"a","label":"Yes, very adaptable","correct":false},{"id":"b","label":"Usually adaptable","correct":false},{"id":"c","label":"Sometimes struggle","correct":true},{"id":"d","label":"Find it difficult","correct":true}]',
  0.6, 1.7, 0.25, 'evaluate', 55, 1);

-- ═══════════════════════════════════════════════════════════════════════
-- VERIFICATION AND STATISTICS
-- ═══════════════════════════════════════════════════════════════════════

-- Count items per domain and grade band
SELECT 
  domain,
  grade_band,
  COUNT(*) as item_count,
  ROUND(AVG(difficulty), 2) as avg_difficulty,
  ROUND(AVG(discrimination), 2) as avg_discrimination
FROM baseline_items
GROUP BY domain, grade_band
ORDER BY domain, grade_band;

-- Total count
SELECT 
  COUNT(*) as total_items,
  COUNT(DISTINCT domain) as total_domains,
  COUNT(DISTINCT grade_band) as total_grade_bands,
  COUNT(DISTINCT sub_domain) as total_subdomains
FROM baseline_items;

-- Items by type
SELECT 
  item_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM baseline_items), 1) as percentage
FROM baseline_items
GROUP BY item_type
ORDER BY count DESC;

-- Difficulty distribution
SELECT 
  CASE 
    WHEN difficulty < -1.0 THEN 'Very Easy'
    WHEN difficulty >= -1.0 AND difficulty < 0.0 THEN 'Easy'
    WHEN difficulty >= 0.0 AND difficulty < 1.0 THEN 'Medium'
    WHEN difficulty >= 1.0 THEN 'Hard'
  END as difficulty_level,
  COUNT(*) as count
FROM baseline_items
GROUP BY difficulty_level
ORDER BY MIN(difficulty);

-- Expected result: 90 total items (5 per domain × 6 domains × 3 grade bands)
-- Domains: reading, math, science, writing, sel, speech
-- Grade bands: K-5, 6-8, 9-12
