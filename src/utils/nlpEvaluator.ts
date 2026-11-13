import { CEFRLevel, EvaluationResultData, WritingTopic } from '../types';
import { generateModelEssay } from './sampleEssayGenerator';

// Common spelling errors dictionary
const COMMON_MISSPELLINGS: Record<string, string> = {
  'beacuse': 'because',
  'becuase': 'because',
  'famouse': 'famous',
  'alot': 'a lot',
  'definately': 'definitely',
  'untill': 'until',
  'recieve': 'receive',
  'seperate': 'separate',
  'enviroment': 'environment',
  'goverment': 'government',
  'tommorow': 'tomorrow',
  'tommorrow': 'tomorrow',
  'writting': 'writing',
  'wich': 'which',
  'thier': 'their',
  'freind': 'friend',
  'truely': 'truly',
  'begining': 'beginning',
  'comunity': 'community',
  'succesful': 'successful',
  'diffrent': 'different',
  'beleive': 'believe',
  'accommodate': 'accommodate',
  'embarass': 'embarrass'
};

interface GrammarIssueRule {
  regex: RegExp;
  errorName: string;
  correction: string;
  explanation: string;
}

const GRAMMAR_RULES: GrammarIssueRule[] = [
  {
    regex: /\b(he|she|it)\s+(live|go|make|want|think|play|work|know|say|take|come|see)\b/i,
    errorName: 'Subject-Verb Agreement',
    correction: 'Add -s/-es for 3rd person singular (e.g. He lives, She goes)',
    explanation: 'Singular subjects (he/she/it) require verbs ending in -s or -es in Present Simple.'
  },
  {
    regex: /\b(was|were)\s+died\b/i,
    errorName: 'Incorrect Passive ("was died")',
    correction: '"died" (die is an intransitive verb; cannot be passive)',
    explanation: '"Die" is intransitive and should not be used in the passive voice. Use "He died" instead.'
  },
  {
    regex: /\b(is|are|am)\s+(happen|occur)\b/i,
    errorName: 'Incorrect Passive ("is happen")',
    correction: '"happens" or "is happening"',
    explanation: '"Happen" does not take passive forms in this context.'
  },
  {
    regex: /\b(we|they|you)\s+was\b/i,
    errorName: 'Plural Subject with Singular Verb ("they was")',
    correction: '"were"',
    explanation: 'Plural pronouns ("we", "they", "you") take "were" in Past Simple.'
  },
  {
    regex: /\b(i|he|she|it)\s+were\s+needed\b/i,
    errorName: 'Passive voice misuse ("were needed")',
    correction: '"needed" or "was needed"',
    explanation: 'Subject and auxiliary verb mismatch in passive construction.'
  },
  {
    regex: /\b(more\s+(better|worse|faster|easier|bigger|smaller|higher))\b/i,
    errorName: 'Double Comparative',
    correction: 'Use either "-er" or "more", not both (e.g., "better" instead of "more better")',
    explanation: 'Comparative adjectives already express comparison, so "more" should not be prefixed.'
  },
  {
    regex: /\b(can|could|should|must|will|would|might|may)\s+to\s+([a-z]+)\b/i,
    errorName: 'Modal Verb with "to"',
    correction: 'Omit "to" after modal verbs (e.g., "can go", not "can to go")',
    explanation: 'Modal verbs are directly followed by the base form of the verb without "to".'
  },
  {
    regex: /\b(can|could|should|must|will|would)\s+([a-z]+ing)\b/i,
    errorName: 'Modal Verb with Gerund (-ing)',
    correction: 'Use the base infinitive form after modal verbs',
    explanation: 'Modal verbs must be followed by bare infinitives, not "-ing" participles.'
  }
];

const CONNECTORS = [
  'however', 'therefore', 'furthermore', 'moreover', 'on the other hand',
  'in addition', 'consequently', 'meanwhile', 'nevertheless', 'firstly',
  'secondly', 'finally', 'in conclusion', 'for instance', 'for example',
  'as a result', 'in contrast', 'although', 'even though', 'despite'
];

const SIMPLE_CONNECTORS = ['and', 'but', 'so', 'because', 'or'];

export function analyzeEssay(
  essayText: string,
  topic: WritingTopic,
  timeSpentSeconds: number
): EvaluationResultData {
  const cleanText = essayText.trim();
  const words = cleanText.length > 0 ? cleanText.split(/\s+/).filter(w => w.length > 0) : [];
  const wordCount = words.length;

  const sentences = cleanText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  const sentenceCount = sentences.length || 1;

  const paragraphs = cleanText
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  const paragraphCount = paragraphs.length;

  const targetMin = topic.recommendedWords.min;
  const targetMax = topic.recommendedWords.max;

  // STRICT WORD COUNT PENALTIES:
  // If the word count is too short, we must strictly cap the scores!
  const isExtremelyShort = wordCount < 30;
  const isCriticallyUnderlength = wordCount < targetMin * 0.5;
  const isUnderlength = wordCount < targetMin * 0.8;

  // 1. Task Achievement Analysis
  let taskScore = 3;
  let taskSummary = '';

  if (isExtremelyShort) {
    taskScore = 1;
    taskSummary = `Juda qisqa matn (${wordCount}/${targetMin} so'z). Mavzu ochilmagan va topshiriq talablariga umuman javob bermaydi.`;
  } else if (isCriticallyUnderlength) {
    taskScore = 1;
    taskSummary = `Your essay is significantly under the minimum length requirement (${wordCount}/${targetMin} words). The prompt was barely addressed and lacks necessary supporting points.`;
  } else if (isUnderlength) {
    taskScore = 2;
    taskSummary = `The essay addressed parts of the prompt, but at ${wordCount} words it falls short of the target (${targetMin}-${targetMax} words), leaving key ideas underdeveloped.`;
  } else if (wordCount <= targetMax * 1.25) {
    taskScore = 4;
    taskSummary = `You addressed the prompt effectively with ${wordCount} words, satisfying the target length and covering the required arguments clearly.`;
    if (paragraphCount >= 3 && sentences.length >= 8) {
      taskScore = 5;
      taskSummary = `Outstanding task fulfillment! All prompt points were thoroughly addressed with balanced argumentation, robust examples, and a well-proportioned structure.`;
    }
  } else {
    taskScore = 3;
    taskSummary = `You addressed the prompt, but the essay exceeded the optimal length (${wordCount} words), with some repetitive details that dilute the central thesis.`;
  }

  // 2. Organization Analysis
  let orgScore = 3;
  let orgSummary = '';
  if (isExtremelyShort) {
    orgScore = 1;
    orgSummary = 'Matn hajmi yetarli bo\'lmagani sababli mantiqiy tuzilma, paragraflar yoki kirish/xulosa mavjud emas.';
  } else if (paragraphCount < 2) {
    orgScore = 2;
    orgSummary = 'Your essay is written as a single block of text without paragraph breaks. Separate your writing into an introduction, body paragraphs, and a clear conclusion.';
  } else if (paragraphCount >= 3 && paragraphCount <= 5) {
    orgScore = 4;
    orgSummary = 'There is clear organization with an identifiable beginning, body arguments, and conclusion. Ideas follow a coherent, logical sequence.';
    if (sentenceCount / paragraphCount >= 3 && !isUnderlength) {
      orgScore = 5;
      orgSummary = 'Exemplary structural organization. Each paragraph has a well-defined topic sentence and flows logically into the next with cohesive transitions.';
    }
  } else {
    orgScore = 3;
    orgSummary = 'There is basic organization with a beginning, middle, and end, but some ideas jump around and could be grouped more systematically.';
  }

  // 3. Grammar Analysis
  const grammarErrors: { original: string; correction: string; explanation: string }[] = [];
  GRAMMAR_RULES.forEach(rule => {
    const match = cleanText.match(rule.regex);
    if (match) {
      grammarErrors.push({
        original: match[0],
        correction: rule.correction,
        explanation: rule.explanation
      });
    }
  });

  let grammarScore = 4;
  let grammarSummary = '';

  if (isExtremelyShort) {
    // If only a few words were written, grammar cannot be 5/5 because sample is too small!
    grammarScore = 1;
    grammarSummary = `Matn hajmi juda kam (${wordCount} ta so'z). Grammatik darajangizni to'liq tekshirish uchun ko'proq gap yozishingiz shart.`;
  } else if (isCriticallyUnderlength) {
    grammarScore = Math.min(2, 5 - grammarErrors.length);
    grammarSummary = `Matn hajmi yetarli emasligi sababli grammatik diapazon cheklangan.`;
  } else if (grammarErrors.length >= 3) {
    grammarScore = 2;
    const errorQuotes = grammarErrors.slice(0, 3).map(e => `'${e.original}'`).join(', ');
    grammarSummary = `There are frequent errors in basic tenses and structures, such as ${errorQuotes}. However, the overall meaning is still understandable.`;
  } else if (grammarErrors.length > 0) {
    grammarScore = 3;
    const errorQuotes = grammarErrors.map(e => `'${e.original}'`).join(', ');
    grammarSummary = `There are occasional grammatical slips, such as ${errorQuotes}. Working on tense consistency will boost your precision.`;
  } else {
    grammarScore = isUnderlength ? 3 : 5;
    grammarSummary = 'Strong grammatical control with accurate tense choices, consistent subject-verb agreements, and high sentence accuracy throughout.';
  }

  // 4. Vocabulary Analysis
  const lowerWords = words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')).filter(w => w.length > 3);
  const freqMap: Record<string, number> = {};
  lowerWords.forEach(w => {
    freqMap[w] = (freqMap[w] || 0) + 1;
  });

  const repeatedTerms = Object.entries(freqMap)
    .filter(([word, count]) => count >= 4 && !['that', 'with', 'have', 'from', 'this', 'they', 'will', 'your', 'about'].includes(word))
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  const spellingMistakes: { original: string; correction: string }[] = [];
  lowerWords.forEach(w => {
    if (COMMON_MISSPELLINGS[w]) {
      spellingMistakes.push({ original: w, correction: COMMON_MISSPELLINGS[w] });
    }
  });

  let vocabScore = 3;
  let vocabSummary = '';
  const spellingQuotes = spellingMistakes.map(s => `'${s.original}'`).join(' and ');
  const repQuotes = repeatedTerms.slice(0, 2).map(r => `'${r}'`).join(' and ');

  if (isExtremelyShort) {
    vocabScore = 1;
    vocabSummary = `Lug'at boyligini baholash uchun so'zlar soni o'ta kam (${wordCount} ta so'z).`;
  } else if (isCriticallyUnderlength) {
    vocabScore = 2;
    vocabSummary = `Matn qisqaligi sababli lug'at boyligi va sinonimlar ko'lami yetarli darajada namoyon bo'lmadi.`;
  } else if (spellingMistakes.length > 0 && repeatedTerms.length > 0) {
    vocabScore = 2;
    vocabSummary = `You used a limited range of basic words and repeated terms like ${repQuotes}. There are also spelling errors like ${spellingQuotes}.`;
  } else if (spellingMistakes.length > 0) {
    vocabScore = 3;
    vocabSummary = `Vocabulary range is adequate for communication, but spelling errors such as ${spellingQuotes} require attention.`;
  } else if (repeatedTerms.length > 0) {
    vocabScore = 3;
    vocabSummary = `Good vocabulary variety, but you frequently repeated terms like ${repQuotes}. Try employing synonyms to enrich lexical density.`;
  } else {
    vocabScore = 4;
    vocabSummary = 'Rich vocabulary suited to the topic with natural phrasing, accurate spellings, and good lexical variation.';
    if (wordCount >= targetMin) vocabScore = 5;
  }

  // 5. Structure & Cohesion Analysis
  const lowerText = cleanText.toLowerCase();
  const foundConnectors = CONNECTORS.filter(c => lowerText.includes(c));
  const foundSimpleConnectors = SIMPLE_CONNECTORS.filter(c => lowerText.includes(c));

  let structScore = 3;
  let structSummary = '';

  if (isExtremelyShort) {
    structScore = 1;
    structSummary = `Gaplar va bog'lovchi vositalar soni yetarli emas. Matn juda qisqa.`;
  } else if (isCriticallyUnderlength) {
    structScore = 2;
    structSummary = `Bog'lovchilar va murakkab gap qurilmalari yetishmaydi.`;
  } else if (foundConnectors.length >= 3) {
    structScore = 5;
    structSummary = `Excellent use of sophisticated linking devices such as "${foundConnectors.slice(0, 3).join('", "')}". Sentences have varied lengths and complex clauses.`;
  } else if (foundConnectors.length >= 1) {
    structScore = 4;
    structSummary = `Good sentence variety. You successfully incorporated cohesive transitions like "${foundConnectors.join('", "')}" to guide the reader.`;
  } else {
    structScore = 3;
    const usedSimple = foundSimpleConnectors.slice(0, 3).map(s => `'${s}'`).join(', ');
    structSummary = `You attempted to use connecting words like ${usedSimple || "'and', 'but', 'so'"}, but sentences feel somewhat disconnected. Use more varied academic transitional phrases.`;
  }

  // Calculate overall score (strict penalization for short text)
  let avgScore = (taskScore + orgScore + grammarScore + vocabScore + structScore) / 5;

  if (isExtremelyShort) {
    avgScore = 1.0; // Strictly 1/5 if < 30 words
  } else if (isCriticallyUnderlength) {
    avgScore = Math.min(2.0, avgScore); // Max 2.0 if < 50% of required words
  } else if (isUnderlength) {
    avgScore = Math.min(2.8, avgScore); // Max 2.8 if under 80%
  }

  const overallScore = Math.round(avgScore * 10) / 10;

  // Determine CEFR level achieved
  let cefrLevel: CEFRLevel = 'A1';
  if (overallScore <= 1.5) cefrLevel = 'A1';
  else if (overallScore <= 2.4) cefrLevel = 'A2';
  else if (overallScore <= 3.4) cefrLevel = 'B1';
  else if (overallScore <= 4.2) cefrLevel = 'B2';
  else cefrLevel = 'C1';

  // Calculate coins earned (drastically penalized if underlength)
  let coins = 0;
  if (isExtremelyShort) {
    coins = 5; // minimal pity coin
  } else if (isCriticallyUnderlength) {
    coins = 15;
  } else {
    coins = Math.round(overallScore * 15) + 15;
    if (wordCount >= targetMin && wordCount <= targetMax) {
      coins += 25; // Bonus for adhering to target words!
    }
  }

  return {
    id: 'eval_' + Date.now(),
    topicTitle: topic.title,
    essayText: cleanText,
    wordCount,
    targetWordCount: { min: targetMin, max: targetMax },
    timeSpentSeconds,
    overallScore,
    cefrLevel,
    coinsEarned: coins,
    topicPrompt: topic.prompt,
    criteria: {
      taskAchievement: {
        name: 'Task Achievement',
        score: taskScore as any,
        maxScore: 5,
        icon: 'FileCheck',
        color: '#ea4335',
        summary: taskSummary,
        suggestions: [
          `Ensure you write between ${targetMin} and ${targetMax} words.`,
          'Check that every guiding question from the prompt is explicitly answered.',
          'Support every general claim with a specific example or explanation.'
        ],
        guidelines: [
          {
            rule: "Savolning barcha shartlarini to'liq ochib berish",
            explanation: "Mavzuda keltirilgan har bir savolga (guiding question) shoshilmasdan, asosli va to'liq javob yozing. Hech bir jihat e'tibordan chetda qolmasligi shart.",
            example: "Agar mavzuda afzallik va kamchiliklar so'ralsa, ikkala tomonni ham muvozanatli yoritib, o'z aniq xulosangizni bildiring."
          },
          {
            rule: "So'zlar soni talabiga qat'iy rioya qilish",
            explanation: `Belgilangan minimal chegaradan (${targetMin} so'z) kam yozmang. Optimal diapazon: ${targetMin} - ${targetMax} ta so'z.`,
            example: "So'zlar soni yetarli bo'lmaganda, inshoning boshqa jihatlari a'lo bo'lsa ham yakuniy ball cheklanadi."
          },
          {
            rule: "Har bir fikrni aniq misol (illustration) bilan quvvatlash",
            explanation: "Quruq gaplardan qochib, 'For instance', 'A prime example of this is' kabi jumlalar yordamida hayotiy yoki ilmiy dalil keltiring.",
            example: "'Social media improves communication. For instance, international students can instantly connect with their families.'"
          }
        ]
      },
      organization: {
        name: 'Organization',
        score: orgScore as any,
        maxScore: 5,
        icon: 'BookOpen',
        color: '#f59e0b',
        summary: orgSummary,
        suggestions: [
          'Use clear 3-4 paragraph layout: Introduction, Body Paragraphs, and Conclusion.',
          'Start each body paragraph with a clear topic sentence.',
          'Ensure the conclusion summarizes your main points without introducing new arguments.'
        ],
        guidelines: [
          {
            rule: "4 Paragrafli oltin struktura qoidasi",
            explanation: "Inshoni mantiqiy bloklarga ajrating: 1. Kirish (Paraphrase + Thesis) • 2. 1-Asosiy paragraf • 3. 2-Asosiy paragraf • 4. Xulosa.",
            example: "Matnni hech qachon bitta yaxlit (single block) holida yozmang. Paragraflar orasida 1 qator bo'sh joy qoldiring."
          },
          {
            rule: "Mavzu jumlasi (Topic Sentence) bilan boshlash",
            explanation: "Har bir asosiy paragrafning ilk gapi ushbu qism nima haqida ekanini darhol ko'rsatishi lozim.",
            example: "'The most notable advantage of online education is its unparalleled scheduling flexibility.'"
          },
          {
            rule: "Paragraflar va gaplar orasida bog'lovchilar zanjiri",
            explanation: "Fikrlar uzilib qolmasligi uchun akademik o'tish so'zlaridan unumli foydalaning.",
            example: "'Firstly', 'Furthermore', 'On the other hand', 'Consequently', 'To summarize'."
          }
        ]
      },
      grammar: {
        name: 'Grammar',
        score: grammarScore as any,
        maxScore: 5,
        icon: 'GraduationCap',
        color: '#22c55e',
        summary: grammarSummary,
        specificErrors: grammarErrors.map(e => `${e.original} -> ${e.correction}`),
        suggestions: [
          'Review 3rd person singular "-s/-es" in Present Simple.',
          'Check irregular past tense forms.',
          'Avoid double comparatives (say "better", not "more better").'
        ],
        guidelines: [
          {
            rule: "Zamonlar uyg'unligi va izchilligi (Tense Consistency)",
            explanation: "Umumiy haqiqatlar uchun Present Simple, o'tmishdagi voqealar uchun Past Simple ishlatiladi. Bitta gap ichida asossiz zamon o'zgartirmang.",
            example: "'He studied hard and passed the exam' (To'g'ri) • 'He studied hard and passes the exam' (Xato)."
          },
          {
            rule: "Murakkab gap turlaridan foydalanish (Complex & Compound)",
            explanation: "Faqat oddiy gaplar bilan chegaralanmay, 'Although', 'Whereas', 'Since', 'Because' bilan qo'shma gaplar yasang.",
            example: "'Although technology accelerates efficiency, overdependence on automation may undermine critical thinking.'"
          },
          {
            rule: "Ega va kesimning son jihatdan mosligi (Subject-Verb Agreement)",
            explanation: "Birlikdagi ega bilan birlikdagi fe'l, ko'plikdagi ega bilan ko'plikdagi fe'l mos kelishi shart.",
            example: "'The group of scientists has published...' ('have' emas). 'Everybody knows...' ('know' emas)."
          }
        ],
        examples: grammarErrors
      },
      vocabulary: {
        name: 'Vocabulary',
        score: vocabScore as any,
        maxScore: 5,
        icon: 'Smile',
        color: '#0ea5e9',
        summary: vocabSummary,
        specificErrors: spellingMistakes.map(s => `${s.original} -> ${s.correction}`),
        suggestions: [
          'Replace frequently repeated words with contextually appropriate synonyms.',
          'Double check spellings of common academic words.',
          'Use topic-specific collocations and idioms where appropriate.'
        ],
        guidelines: [
          {
            rule: "So'z takroridan qochish va akademik sinonimlar qo'llash",
            explanation: "Bitta so'zni (masalan, 'important', 'good', 'bad') qayta-qayta ishlatmang. Ularning o'rniga sinonimlardan foydalaning.",
            example: "'important' -> 'crucial', 'vital', 'imperative' • 'problem' -> 'obstacle', 'predicament', 'dilemma'."
          },
          {
            rule: "Turg'un so'z birikmalari (Collocations)",
            explanation: "Ingliz tilida tabiiy yangraydigan so'z juftliklaridan foydalanish ballni darhol 7.0 - 9.0 oralig'iga ko'taradi.",
            example: "'play an indispensable role', 'exert a profound influence', 'pose a grave threat', 'raise awareness'."
          },
          {
            rule: "Imlo (Spelling) xatolarini tekshirish",
            explanation: "Yozib bo'lgach, ko'p yanglishiladigan so'zlarni qayta tekshirib chiqing.",
            example: "'government' (n harfi bor), 'environment', 'definitely', 'successful', 'necessary'."
          }
        ]
      },
      structure: {
        name: 'Structure',
        score: structScore as any,
        maxScore: 5,
        icon: 'FileText',
        color: '#1e293b',
        summary: structSummary,
        suggestions: [
          'Incorporate formal transition words like "Furthermore", "However", and "Consequently".',
          'Combine simple sentences using relative clauses (which, who, that).',
          'Vary sentence lengths to create a dynamic, engaging rhythm.'
        ],
        guidelines: [
          {
            rule: "Gap uzunligi va ohangi balansi (Sentence Variety)",
            explanation: "Qisqa urg'uli gaplar (10-14 so'z) va murakkab kengaytirilgan gaplar (20-26 so'z) uyg'unligi inshoni ifodali qiladi.",
            example: "Hamma gap bir xil uzunlikda bo'lsa, insho zerikarli va mexanik ko'rinadi."
          },
          {
            rule: "Punktuatsiya va tinish belgilari intizomi",
            explanation: "Kirish so'zlari ('However,', 'Therefore,', 'In contrast,') dan keyin har doim vergul qo'yilishi shart.",
            example: "'Consequently, governments must allocate sufficient funds to public healthcare.'"
          },
          {
            rule: "Akademik uslub: Qisqartmalardan voz kechish",
            explanation: "Rasmiy va imtihon insholarida og'zaki tildagi qisqartmalarni aslo ishlatmang.",
            example: "'don't' emas 'do not' • 'can't' emas 'cannot' • 'it's' emas 'it is' • 'gonna/wanna' umuman mumkin emas."
          }
        ]
      }
    },
    sampleEssay: generateModelEssay(topic, cleanText),
    timestamp: new Date().toISOString()
  };
}
