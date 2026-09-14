export interface InterviewQuestionDefinition {
  index: number;
  id: string;
  category: string;
  title: string;
  prompt: string;
  placeholder: string;
  explanation: string;
  clinicalPurpose: string;
  suggestedFollowUps: string[];
}

export const INTERVIEW_24_TOPICS: InterviewQuestionDefinition[] = [
  {
    index: 1,
    id: 'client_info',
    category: 'Identity & Communication',
    title: 'Client Information and Preferred Name',
    prompt: 'What name and pronouns do you prefer we use during our sessions and in our notes?',
    placeholder: 'Preferred name, pronouns, and any communication preferences...',
    explanation: 'Establishes personal respect, rapport, and verifies identity and comfort.',
    clinicalPurpose: 'Person-centered engagement and cultural humility.',
    suggestedFollowUps: ['Are there specific situations where you prefer different communication?']
  },
  {
    index: 2,
    id: 'reason_seeking_support',
    category: 'Presenting Situation',
    title: 'Reason for Seeking Support',
    prompt: 'What brings you to Hope Community Support today, and what made now the right time to reach out?',
    placeholder: 'Core reason, recent triggering events, or transitions...',
    explanation: 'Identifies the client’s presenting concern in their own authentic voice.',
    clinicalPurpose: 'Establishes initial therapeutic alliance and chief presenting focus.',
    suggestedFollowUps: ['How long has this been impacting your daily life?']
  },
  {
    index: 3,
    id: 'wellness_goals',
    category: 'Aspirations',
    title: 'Wellness Goals',
    prompt: 'Looking ahead, what positive changes would you most like to see in your life or relationships?',
    placeholder: 'Short-term and long-term personal objectives...',
    explanation: 'Invites client-defined benchmarks rather than clinician-imposed agendas.',
    clinicalPurpose: 'Goal-directed wellness programming and baseline definition.',
    suggestedFollowUps: ['If our work together is successful, what would be different in 6 months?']
  },
  {
    index: 4,
    id: 'current_concerns',
    category: 'Presenting Situation',
    title: 'Current Concerns',
    prompt: 'What are the most challenging thoughts, feelings, or situations you are navigating day-to-day?',
    placeholder: 'Emotional, behavioral, or situational challenges...',
    explanation: 'Explores the breadth and frequency of symptoms or life pressures.',
    clinicalPurpose: 'Assessment of current functional impairment and distress levels.',
    suggestedFollowUps: ['Which of these concerns feels most urgent to address first?']
  },
  {
    index: 5,
    id: 'health_wellness_history',
    category: 'History',
    title: 'Relevant Health and Wellness History',
    prompt: 'Are there past physical health conditions, hospitalizations, or chronic conditions relevant to your well-being?',
    placeholder: 'Relevant health background, surgeries, chronic illnesses...',
    explanation: 'Integrates whole-person physical and emotional health context.',
    clinicalPurpose: 'Biopsychosocial context and somatic interaction identification.',
    suggestedFollowUps: ['How does your physical health interact with your mood?']
  },
  {
    index: 6,
    id: 'current_professional_care',
    category: 'Care Coordination',
    title: 'Current Professional Care',
    prompt: 'Are you currently working with a primary doctor, psychiatrist, physical therapist, or other provider?',
    placeholder: 'Physicians, specialists, care teams, or peer groups...',
    explanation: 'Coordinates holistic care and ensures non-duplication of services.',
    clinicalPurpose: 'Collaborative care planning with client consent.',
    suggestedFollowUps: ['Would you like us to coordinate care with any of your existing providers?']
  },
  {
    index: 7,
    id: 'voluntarily_disclosed_medications',
    category: 'Health Factors',
    title: 'Voluntarily Disclosed Medications',
    prompt: 'What prescription medications, over-the-counter supplements, or natural remedies do you regularly take?',
    placeholder: 'Medications, dosages if known, supplements (voluntary)...',
    explanation: 'Safety check for contraindications or side-effect impact on mood and energy.',
    clinicalPurpose: 'Non-diagnostic medical awareness and coordination flag.',
    suggestedFollowUps: ['Have you experienced any changes in your regimen recently?']
  },
  {
    index: 8,
    id: 'allergies_sensitivities',
    category: 'Health Factors',
    title: 'Allergies, Sensitivities, and Restrictions',
    prompt: 'Do you have any food allergies, environmental sensitivities, sensory sensitivities, or physical restrictions?',
    placeholder: 'Allergies, sensory preferences, mobility accommodations...',
    explanation: 'Ensures safe facility, in-home, or session accommodations.',
    clinicalPurpose: 'Environmental safety and trauma-informed sensory comfort.',
    suggestedFollowUps: ['Are there lighting, sound, or seating accommodations that help you feel at ease?']
  },
  {
    index: 9,
    id: 'nutrition_hydration',
    category: 'Lifestyle & Somatics',
    title: 'Nutrition and Hydration',
    prompt: 'How would you describe your typical eating and water intake patterns throughout the day?',
    placeholder: 'Meal regularity, appetite changes, hydration habits...',
    explanation: 'Understands nutritional foundations that influence neurobiology and mood stability.',
    clinicalPurpose: 'Foundational lifestyle wellness evaluation.',
    suggestedFollowUps: ['Do you notice your mood shifting when meals are skipped?']
  },
  {
    index: 10,
    id: 'physical_activity_mobility',
    category: 'Lifestyle & Somatics',
    title: 'Physical Activity and Mobility',
    prompt: 'What forms of movement, walking, stretching, or physical activities do you currently enjoy or engage in?',
    placeholder: 'Daily movement, recreational activities, physical limitations...',
    explanation: 'Assesses mobility, somatic outlets, and energetic balance.',
    clinicalPurpose: 'Activity scheduling and somatic intervention design.',
    suggestedFollowUps: ['What physical activities used to bring you joy in the past?']
  },
  {
    index: 11,
    id: 'sleep_recovery',
    category: 'Lifestyle & Somatics',
    title: 'Sleep and Recovery',
    prompt: 'How is your sleep quality, including falling asleep, staying asleep, and feeling rested when you wake?',
    placeholder: 'Sleep schedule, nighttime awakenings, morning energy levels...',
    explanation: 'Sleep is a primary barometer and influencer of psychological resilience.',
    clinicalPurpose: 'Sleep hygiene evaluation and circadian rhythm support.',
    suggestedFollowUps: ['Do racing thoughts or physical discomfort interfere with sleep?']
  },
  {
    index: 12,
    id: 'stress_emotional_wellbeing',
    category: 'Emotional Health',
    title: 'Stress and Emotional Well-being',
    prompt: 'When stress feels high, how does it typically show up in your thoughts, body, and emotions?',
    placeholder: 'Stress reactions, emotional triggers, somatic tension...',
    explanation: 'Explores emotional regulation patterns and somatic stress markers.',
    clinicalPurpose: 'Coping skills assessment and self-regulation baseline.',
    suggestedFollowUps: ['What is the first sign that tells you stress is building up?']
  },
  {
    index: 13,
    id: 'environment_family_social',
    category: 'Social & Ecology',
    title: 'Family, Social, School, Work, and Home Environment',
    prompt: 'How would you describe the atmosphere and stability in your home, work, school, and close relationships?',
    placeholder: 'Living arrangement, family dynamics, workplace atmosphere...',
    explanation: 'Maps the environmental system and interpersonal stressors.',
    clinicalPurpose: 'Systemic evaluation and relational resource identification.',
    suggestedFollowUps: ['Do you have a safe, quiet space at home where you can decompress?']
  },
  {
    index: 14,
    id: 'habits_routines',
    category: 'Daily Living',
    title: 'Habits and Routines',
    prompt: 'What does an average morning or evening routine look like for you, including daily habits you rely on?',
    placeholder: 'Daily routines, screen time, substance use, predictable rhythms...',
    explanation: 'Examines daily predictability and behavioral momentum.',
    clinicalPurpose: 'Behavioral activation and routine stabilization.',
    suggestedFollowUps: ['Which routines currently feel most grounding for you?']
  },
  {
    index: 15,
    id: 'strengths_support_systems',
    category: 'Resilience',
    title: 'Strengths and Support Systems',
    prompt: 'Who in your life can you turn to for honest conversation or support, and what personal strengths help you persevere?',
    placeholder: 'Friends, mentors, family members, inner strengths, values...',
    explanation: 'Strengths-based inquiry cultivating agency and social scaffolding.',
    clinicalPurpose: 'Protective factor reinforcement and support activation.',
    suggestedFollowUps: ['What do your friends or family appreciate most about you?']
  },
  {
    index: 16,
    id: 'cultural_preferences',
    category: 'Cultural Identity',
    title: 'Cultural, Religious, Language, and Personal Preferences',
    prompt: 'Are there cultural traditions, spiritual practices, or language preferences that are important to your identity?',
    placeholder: 'Spiritual beliefs, cultural values, community affiliations...',
    explanation: 'Honors intersecting cultural identities and community context.',
    clinicalPurpose: 'Culturally responsive care and respectful therapeutic alignment.',
    suggestedFollowUps: ['How can we best honor your traditions and values in our work?']
  },
  {
    index: 17,
    id: 'previous_strategies_results',
    category: 'History',
    title: 'Previous Strategies and Results',
    prompt: 'What strategies, therapies, self-help books, or personal practices have you tried before, and what worked or did not work?',
    placeholder: 'Prior counseling, apps, coping mechanisms, outcomes...',
    explanation: 'Prevents prescribing previously ineffective interventions and builds on past successes.',
    clinicalPurpose: 'Efficiency and collaborative intervention tailoring.',
    suggestedFollowUps: ['What specifically made certain approaches feel helpful or unhelpful?']
  },
  {
    index: 18,
    id: 'barriers_challenges',
    category: 'Obstacles',
    title: 'Barriers and Obstacles',
    prompt: 'What obstacles or friction points have made it harder to maintain your well-being or show up for appointments?',
    placeholder: 'Emotional hurdles, fatigue, self-doubt, family demands...',
    explanation: 'Proactively identifies headwinds to participation.',
    clinicalPurpose: 'Relapse prevention and empathetic problem-solving.',
    suggestedFollowUps: ['When motivation dips, what usually helps you re-engage?']
  },
  {
    index: 19,
    id: 'resources_transport_tech',
    category: 'Practical Factors',
    title: 'Time, Transportation, Technology, and Resources',
    prompt: 'Do you have reliable internet, phone access, transportation to our office, and schedule flexibility?',
    placeholder: 'Transit access, device capability, privacy for video calls...',
    explanation: 'Practical access equity ensuring the service modality is sustainable.',
    clinicalPurpose: 'Social determinants of health and structural feasibility check.',
    suggestedFollowUps: ['Would telephone or in-home visits remove travel friction for you?']
  },
  {
    index: 20,
    id: 'measures_of_success',
    category: 'Aspirations',
    title: 'Client-Defined Measures of Success',
    prompt: 'In your own words, what would tell you that you are making real progress over the coming weeks?',
    placeholder: 'Concrete signs: more laughter, calmer mornings, fewer arguments...',
    explanation: 'Anchors progress measurement to client self-determination.',
    clinicalPurpose: 'Client-centered outcome metrics for wellness program.',
    suggestedFollowUps: ['What would someone who cares about you notice when you are doing better?']
  },
  {
    index: 21,
    id: 'safety_referral_indicators',
    category: 'Safety & Safeguarding',
    title: 'Safety and Referral Indicators',
    prompt: 'Do you currently experience thoughts of despair, self-harm, or feeling unsafe, and do you have a trusted safe person?',
    placeholder: 'Safety indicators, emergency comfort contacts, safety plan...',
    explanation: 'Universal safety assessment; triggers immediate safeguarding workflow if flagged.',
    clinicalPurpose: 'Immediate crisis response, risk stratification, and duty of care.',
    suggestedFollowUps: ['Have you ever created a personal safety plan before?']
  },
  {
    index: 22,
    id: 'preferred_activities',
    category: 'Engagement',
    title: 'Preferred Activities and Interests',
    prompt: 'What creative hobbies, crafts, music, books, or leisure activities help you recharge and feel like yourself?',
    placeholder: 'Art, reading, gardening, cooking, music, nature...',
    explanation: 'Leverages authentic interests for behavioral activation assignments.',
    clinicalPurpose: 'Pleasure scheduling and intrinsic motivation enhancement.',
    suggestedFollowUps: ['Can we integrate any of these into your weekly wellness program?']
  },
  {
    index: 23,
    id: 'agreed_next_steps',
    category: 'Action Plan',
    title: 'Agreed Next Steps',
    prompt: 'Between now and our next session, what is one realistic step you feel ready to take?',
    placeholder: 'One specific, achievable action item for this week...',
    explanation: 'Cultivates immediate self-efficacy and mutual accountability.',
    clinicalPurpose: 'Micro-goal commitment and program staging.',
    suggestedFollowUps: ['What might get in the way of this step, and how can we navigate that?']
  },
  {
    index: 24,
    id: 'followup_availability',
    category: 'Scheduling & Continuity',
    title: 'Follow-Up Availability and Preferences',
    prompt: 'What days of the week, times, and session modality work best for your recurring appointments?',
    placeholder: 'Days, preferred time windows, modality preference...',
    explanation: 'Finalizes practical scheduling and continuity of care.',
    clinicalPurpose: 'Treatment retention and consistent therapeutic cadence.',
    suggestedFollowUps: ['Would you like automatic appointment reminders by SMS or email?']
  }
];
