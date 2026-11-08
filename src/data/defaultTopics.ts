import { WritingTopic, CEFRLevel } from '../types';

export const DEFAULT_TOPICS: WritingTopic[] = [
  // --- A1 LEVEL: REAL-LIFE FOUNDATIONAL TOPICS ---
  {
    id: 'topic_a1_1',
    level: 'A1',
    title: 'My Best Friend and Why We Get Along',
    prompt: 'Write about your closest friend. Describe what they look like, what hobbies you enjoy together, and why your friendship is special.',
    guidingQuestions: [
      'What is your friend\'s name and how did you first meet?',
      'What do they look like and what kind of personality do they have?',
      'What activities do you like doing together on weekends?',
      'Why is this person important in your life?'
    ],
    recommendedWords: { min: 60, max: 100 },
    timeLimitMinutes: 12
  },
  {
    id: 'topic_a1_2',
    level: 'A1',
    title: 'A Typical Day in My Life',
    prompt: 'Describe your daily routine from the moment you wake up in the morning until you go to sleep at night.',
    guidingQuestions: [
      'What time do you wake up and what do you eat for breakfast?',
      'Where do you go during the day (work, school, home)?',
      'What do you usually do in the evening to relax?',
      'What is your favorite moment of the entire day?'
    ],
    recommendedWords: { min: 60, max: 100 },
    timeLimitMinutes: 12
  },
  {
    id: 'topic_a1_3',
    level: 'A1',
    title: 'My Favorite Comfort Food',
    prompt: 'Write about your favorite meal or dish. Explain why you love it and who usually cooks it for you.',
    guidingQuestions: [
      'What is the name of your favorite food and what are its ingredients?',
      'When do you usually eat this dish and on what occasions?',
      'Does it remind you of your childhood or family?',
      'Can you cook this food yourself?'
    ],
    recommendedWords: { min: 60, max: 100 },
    timeLimitMinutes: 12
  },
  {
    id: 'topic_a1_4',
    level: 'A1',
    title: 'My Hometown and Its Charm',
    prompt: 'Describe the city or village where you grew up. Mention the weather, the people, and your favorite spot.',
    guidingQuestions: [
      'Where is your hometown located and what is it known for?',
      'What do people in your town usually do for fun?',
      'What is your favorite place to visit there and why?',
      'Would you like to live there in the future or move away?'
    ],
    recommendedWords: { min: 70, max: 110 },
    timeLimitMinutes: 14
  },

  // --- A2 LEVEL: VIVID EXPERIENCES & HABITS ---
  {
    id: 'topic_a2_1',
    level: 'A2',
    title: 'An Unforgettable Holiday Trip',
    prompt: 'Describe a holiday or journey you took in the past. Explain where you traveled, what happened, and why you remember it so well.',
    guidingQuestions: [
      'Where did you go and who accompanied you on this trip?',
      'What transport did you use and what was the journey like?',
      'What interesting or unexpected event happened during the trip?',
      'Why will you always remember this experience?'
    ],
    recommendedWords: { min: 90, max: 140 },
    timeLimitMinutes: 18
  },
  {
    id: 'topic_a2_2',
    level: 'A2',
    title: 'Fast Food vs Homemade Cooking',
    prompt: 'Many young people consume fast food regularly instead of cooking at home. Compare both habits and state your preference.',
    guidingQuestions: [
      'Why is fast food so popular among teenagers and busy workers?',
      'What are the health benefits of preparing meals at home?',
      'How much money do people typically waste on takeout?',
      'Which option do you personally prefer on a busy day?'
    ],
    recommendedWords: { min: 100, max: 150 },
    timeLimitMinutes: 20
  },
  {
    id: 'topic_a2_3',
    level: 'A2',
    title: 'My Favorite Hobby and Stress Relief',
    prompt: 'Explain what hobby or leisure sport you enjoy practicing. Describe how you learned it and how it helps you relieve stress.',
    guidingQuestions: [
      'What hobby do you do and when did you start practicing it?',
      'What tools, equipment, or space do you need for it?',
      'How do you feel when you are engaged in this activity?',
      'How does having a hobby improve your overall lifestyle?'
    ],
    recommendedWords: { min: 90, max: 140 },
    timeLimitMinutes: 18
  },
  {
    id: 'topic_a2_4',
    level: 'A2',
    title: 'A Person Who Inspires Me Everyday',
    prompt: 'Write about a real person (a parent, teacher, friend, or public figure) whom you deeply admire. Explain what makes them special.',
    guidingQuestions: [
      'Who is this inspirational person and what is their background?',
      'What positive qualities or habits do they demonstrate?',
      'What major obstacle or hardship have they overcome?',
      'What important life lesson have you learned from them?'
    ],
    recommendedWords: { min: 100, max: 150 },
    timeLimitMinutes: 20
  },

  // --- B1 LEVEL: THOUGHT-PROVOKING EVERYDAY ISSUES ---
  {
    id: 'topic_b1_1',
    level: 'B1',
    title: 'Can Money Really Buy True Happiness?',
    prompt: 'Some argue that wealth is the foundation of happiness, while others believe health, loved ones, and inner peace matter much more. Discuss your views.',
    guidingQuestions: [
      'In what practical ways does financial security reduce daily stress?',
      'What essential things in life can money never truly purchase?',
      'Why do some wealthy individuals suffer from deep loneliness or depression?',
      'What is your personal philosophy on the relationship between wealth and happiness?'
    ],
    recommendedWords: { min: 150, max: 220 },
    timeLimitMinutes: 25
  },
  {
    id: 'topic_b1_2',
    level: 'B1',
    title: 'Should Homework Be Banned in Schools?',
    prompt: 'Many students feel overwhelmed by excessive evening assignments. Examine whether schools should abolish traditional homework.',
    guidingQuestions: [
      'What benefits does homework provide for retaining classroom lessons?',
      'How does heavy homework burden students\' mental health and family time?',
      'Are there alternative ways for teachers to verify understanding?',
      'What would be a reasonable middle ground for educational institutions?'
    ],
    recommendedWords: { min: 150, max: 220 },
    timeLimitMinutes: 25
  },
  {
    id: 'topic_b1_3',
    level: 'B1',
    title: 'Life in a Busy Metropolis vs a Quiet Village',
    prompt: 'Compare living in an energetic modern city with living in a peaceful rural village. Where would you prefer to raise your family?',
    guidingQuestions: [
      'What unique opportunities for career and culture exist in large cities?',
      'What health and environmental benefits does rural countryside offer?',
      'What are the greatest frustrations of both lifestyles?',
      'Which living environment aligns best with your personal long-term goals?'
    ],
    recommendedWords: { min: 160, max: 230 },
    timeLimitMinutes: 25
  },
  {
    id: 'topic_b1_4',
    level: 'B1',
    title: 'Why Do Most People Abandon Their New Year Resolutions?',
    prompt: 'Millions of people make resolutions every January to exercise, save money, or study harder, yet give up within weeks. Analyze why this happens.',
    guidingQuestions: [
      'What psychological factors cause people to set unrealistic expectations?',
      'How does lack of daily discipline sabotage long-term aspirations?',
      'What practical strategies (e.g. habit tracking, accountability) actually work?',
      'Share an example of a goal you successfully maintained over time.'
    ],
    recommendedWords: { min: 150, max: 220 },
    timeLimitMinutes: 25
  },
  {
    id: 'topic_b1_5',
    level: 'B1',
    title: 'Online Shopping vs Physical Malls',
    prompt: 'E-commerce has transformed retail across the globe. Evaluate the benefits and drawbacks of shopping via apps compared to visiting traditional shops.',
    guidingQuestions: [
      'What conveniences make online shopping the top choice for consumers?',
      'What risks exist regarding product quality, returns, and impulse buying?',
      'Will physical retail shopping malls ever completely disappear?',
      'What is your personal shopping habit and how do you protect your budget?'
    ],
    recommendedWords: { min: 150, max: 220 },
    timeLimitMinutes: 25
  },

  // --- B2 LEVEL: DEEP SOCIAL & MODERN LIFESTYLE DEBATES ---
  {
    id: 'topic_b2_1',
    level: 'B2',
    title: 'The Psychological Impact of Infinite Social Media Scrolling',
    prompt: 'Short-form video apps and social networks dominate modern free time. Critically evaluate whether these algorithms harm attention spans and real-life connections.',
    guidingQuestions: [
      'How do dopamine feedback loops keep users hooked on their screens for hours?',
      'What negative impacts on teenage self-esteem and social anxiety have been observed?',
      'Can digital networking ever replace genuine face-to-face conversations?',
      'What concrete digital detox habits should individuals adopt?'
    ],
    recommendedWords: { min: 200, max: 280 },
    timeLimitMinutes: 30
  },
  {
    id: 'topic_b2_2',
    level: 'B2',
    title: 'Remote Work vs Office Life: Mental Health and Productivity',
    prompt: 'Following the global shift towards working from home, many companies are demanding return-to-office mandates. Discuss both sides and state your position.',
    guidingQuestions: [
      'How does eliminating daily commutes enhance personal wellbeing and family life?',
      'In what ways do remote workers struggle with isolation and boundary blurring between work and rest?',
      'Is in-person collaboration genuinely superior for corporate innovation?',
      'What represents the optimal hybrid model for 21st-century workers?'
    ],
    recommendedWords: { min: 220, max: 300 },
    timeLimitMinutes: 32
  },
  {
    id: 'topic_b2_3',
    level: 'B2',
    title: 'Street Animals and Our Moral Duty to Protect Them',
    prompt: 'In many cities, stray cats and dogs suffer from hunger, cruelty, and disease. Analyze what responsibilities municipalities and citizens have to resolve this crisis.',
    guidingQuestions: [
      'What systemic problems cause pet abandonment and uncontrolled street animal populations?',
      'How can spaying/neutering and ethical shelters offer humane solutions?',
      'What role should community volunteers and school education programs play?',
      'What strict legal punishments should be enforced against animal cruelty?'
    ],
    recommendedWords: { min: 200, max: 280 },
    timeLimitMinutes: 30
  },
  {
    id: 'topic_b2_4',
    level: 'B2',
    title: 'Solo Travel vs Traveling with Friends',
    prompt: 'Traveling alone tests independence and self-reliance, whereas traveling with friends fosters shared memories. Weigh the advantages of both approaches.',
    guidingQuestions: [
      'What personal growth and confidence come from navigating unfamiliar countries alone?',
      'What safety concerns and moments of solitude can challenge solo travelers?',
      'How does traveling in a group strengthen or strain interpersonal relationships?',
      'Which travel style offers greater value for self-discovery and why?'
    ],
    recommendedWords: { min: 210, max: 290 },
    timeLimitMinutes: 30
  },
  {
    id: 'topic_b2_5',
    level: 'B2',
    title: 'Video Games: Artistic Storytelling or Addictive Waste of Time?',
    prompt: 'Gaming is one of the highest-grossing entertainment industries. Discuss whether gaming promotes problem-solving and camaraderie, or fuels sedentary addiction.',
    guidingQuestions: [
      'How have modern video games evolved into complex narrative art forms?',
      'What cognitive skills (hand-eye coordination, strategic thinking) can games develop?',
      'What severe dangers arise when gaming replaces physical fitness and real responsibilities?',
      'Where lies the line between healthy recreational gaming and behavioral disorder?'
    ],
    recommendedWords: { min: 210, max: 290 },
    timeLimitMinutes: 30
  },

  // --- C1 LEVEL: ADVANCED CRITICAL PHILOSOPHICAL & GLOBAL ARGUMENTS ---
  {
    id: 'topic_c1_1',
    level: 'C1',
    title: 'Artificial Intelligence and the Future of Human Labor',
    prompt: 'As generative neural networks automate white-collar reasoning and cognitive tasks, fears of widespread structural unemployment are mounting. Critically evaluate whether AI will liberate or marginalize human workers.',
    guidingQuestions: [
      'How are knowledge workers and creative professionals coping with algorithmic disruption?',
      'Will new employment sectors naturally emerge fast enough to offset mass obsolescence?',
      'What ethical mechanisms should governments establish to redistribute AI-generated wealth?',
      'How must global educational curricula transform to teach uniquely human capabilities?'
    ],
    recommendedWords: { min: 280, max: 400 },
    timeLimitMinutes: 40
  },
  {
    id: 'topic_c1_2',
    level: 'C1',
    title: 'Economic Growth vs Environmental Preservation',
    prompt: 'Industrial expansion fuels national wealth and poverty alleviation, yet accelerates catastrophic ecological degradation. Debate whether perpetual economic growth can ever truly be reconciled with planetary sustainability.',
    guidingQuestions: [
      'Can clean energy innovations and circular economy models fully decouple growth from emissions?',
      'How should historic emissions by developed countries inform burdens placed on emerging economies?',
      'What radical reductions in consumerism and material throughput are modern populations willing to accept?',
      'What structural paradigm must international climate policy adopt to avert ecological collapse?'
    ],
    recommendedWords: { min: 300, max: 420 },
    timeLimitMinutes: 40
  },
  {
    id: 'topic_c1_3',
    level: 'C1',
    title: 'The Tyranny of Modern Beauty Standards in the Algorithmic Age',
    prompt: 'Facial filters, cosmetic surgery normalization, and influencer culture have amplified body dissatisfaction to unprecedented levels. Analyze the sociological and commercial drivers behind this phenomenon.',
    guidingQuestions: [
      'How do recommendation algorithms commodify physical insecurity for financial profit?',
      'In what ways has the boundary between authentic reality and curated digital facade collapsed?',
      'What demographic groups suffer the most severe psychological repercussions?',
      'Can grassroots body-neutrality movements counter multi-billion-dollar beauty conglomerates?'
    ],
    recommendedWords: { min: 280, max: 400 },
    timeLimitMinutes: 40
  },
  {
    id: 'topic_c1_4',
    level: 'C1',
    title: 'Universal Basic Income: Utopian Fantasy or Modern Necessity?',
    prompt: 'With technological disruption threatening labor stability, advocates propose guaranteeing every citizen an unconditional baseline income. Evaluate the economic viability and philosophical implications of Universal Basic Income (UBI).',
    guidingQuestions: [
      'Would guaranteed income empower individuals to pursue creative endeavors, or disincentivize ambition?',
      'What fiscal mechanisms (wealth taxes, automation levies) could realistically finance universal dividends?',
      'How would UBI fundamentally transform the social contract between the state and the citizenry?',
      'What empirical insights have emerging pilot studies provided regarding public health and employment?'
    ],
    recommendedWords: { min: 300, max: 420 },
    timeLimitMinutes: 40
  }
];

export function autoGenerateQuestions(topicTitle: string): string[] {
  return [
    `What are the historical roots and primary real-world factors surrounding "${topicTitle}"?`,
    `What are the distinct advantages and unavoidable drawbacks associated with this issue?`,
    `How does this phenomenon directly impact individual lifestyles, mental wellbeing, and society?`,
    `What practical solutions, long-term compromises, or future developments do you predict?`
  ];
}

// Sensible topic validation: allows natural topics like "My home", "Family", "Friends"
// while strictly blocking spam/keyboard smashing like "aaaaaaaa" or "asdfghjk"
export function isValidTopicTitle(title: string): { isValid: boolean; reason?: string } {
  const trimmed = title.trim();

  if (trimmed.length < 2) {
    return { isValid: false, reason: "Mavzu nomi kamida 2 ta harfdan iborat bo'lishi kerak!" };
  }

  // Check for repeated spam characters like "aaaaaaa" or "zzzzz"
  if (/(.)\1{3,}/i.test(trimmed)) {
    return { isValid: false, reason: "Mavzuda takroriy bema'ni harflar aniqlandi!" };
  }

  const words = trimmed.split(/\s+/).filter(w => w.length > 0);

  // Check for consonant keyboard smashing (e.g. "sdfghjk" with 5+ consonants and no vowels)
  for (const word of words) {
    if (word.length >= 5 && !/[aeiouy]/i.test(word)) {
      return { isValid: false, reason: "Bema'ni so'zlar aniqlandi. Haqiqiy inglizcha so'zlardan foydalaning!" };
    }
  }

  return { isValid: true };
}
