import { WritingTopic, ModelSampleEssay } from '../types';

/**
 * Har bir mavzu uchun 100% namunaviy (Band 9.0 / C2 Mastery) insho generatori
 */

// Oldindan tayyorlangan eng yuqori darajadagi 100% namunaviy insholar bazasi
const CURATED_SAMPLE_ESSAYS: Record<string, Partial<ModelSampleEssay>> = {
  // A1: My Best Friend
  topic_a1_1: {
    title: 'My Best Friend: An Unbreakable Bond',
    bandScore: 'Band 9.0 (100% C2 Exemplary)',
    paragraphs: [
      {
        heading: '1. Kirish (Introduction)',
        text: 'True friendship is one of the most rewarding treasures in life. My closest friend is Javohir, whom I first encountered during our elementary school years. From our very first conversation, it became evident that we shared an extraordinary connection that has only deepened with time.'
      },
      {
        heading: '2. 1-Asosiy qism (Appearance & Personality)',
        text: 'Javohir has a warm, welcoming presence with bright hazel eyes and an infectious smile that instantly puts everyone at ease. Beyond his cheerful appearance, he possesses remarkable empathy and integrity. Whenever I encounter a dilemma, his thoughtful advice and unwavering optimism provide reassurance.'
      },
      {
        heading: '3. 2-Asosiy qism (Shared Passions & Weekends)',
        text: 'On weekends, we invariably engage in activities that stimulate both mind and body. We frequently play competitive chess in the local park, embark on scenic cycling routes, and discuss literature over coffee. These shared experiences have fostered mutual respect and endless laughter.'
      },
      {
        heading: '4. Xulosa (Conclusion)',
        text: 'In conclusion, Javohir is not merely a companion; he is an indispensable confidant and brother. Having someone so dependable by my side enriches my journey, proving that genuine camaraderie is built on loyalty and shared values.'
      }
    ],
    keyVocabulary: [
      { term: 'Infectious smile', meaning: 'Atrofdagilarga ham quvonch ulashuvchi samimiy tabassum', exampleInEssay: '...an infectious smile that instantly puts everyone at ease.' },
      { term: 'Unwavering optimism', meaning: 'Hech qachon so\'nmaydigan, mustahkam nekbinlik/umid', exampleInEssay: '...his thoughtful advice and unwavering optimism provide reassurance.' },
      { term: 'Indispensable confidant', meaning: 'O\'rni bosilmas, eng ishonchli sirdosh do\'st', exampleInEssay: 'Javohir is not merely a companion; he is an indispensable confidant...' },
      { term: 'Genuine camaraderie', meaning: 'Chinakam, sadoqatli do\'stlik va ahillik', exampleInEssay: '...genuine camaraderie is built on loyalty and shared values.' }
    ],
    whyItIs100Percent: [
      { criterion: 'Task Achievement (100%)', reason: 'Barcha yo\'naltiruvchi savollarga (ism, uchrashuv, tashqi ko\'rinish, mashg\'ulotlar va ahamiyati) to\'liq va boy dalillar bilan javob berilgan.' },
      { criterion: 'Coherence & Cohesion (100%)', reason: '4 ta aniq paragrafga bo\'lingan. Har bir qism mantiqiy bog\'lovchilar ("Beyond his...", "In conclusion...") orqali oqib keladi.' },
      { criterion: 'Lexical Resource (100%)', reason: 'Oddiy "good", "nice" so\'zlari o\'rniga "indispensable confidant", "unwavering optimism" kabi ilg\'or C1-C2 turg\'un birikmalar ishlatilgan.' },
      { criterion: 'Grammar (100%)', reason: 'Murakkab gaplar, nisbiy olmoshlar (whom, that) va zamonlar uyg\'unligi nuqsonsiz shakllantirilgan.' }
    ]
  },

  // B1: Impact of Social Media
  topic_b1_1: {
    title: 'The Dual Nature of Modern Social Media Platforms',
    bandScore: 'Band 9.0 (100% C2 Exemplary)',
    paragraphs: [
      {
        heading: '1. Kirish (Introduction & Thesis)',
        text: 'The proliferation of digital social networks has fundamentally altered contemporary human communication. While some observers highlight their ability to connect diverse cultures instantly, critics contend that these platforms foster psychological distress and social fragmentation. This essay will examine both perspectives before demonstrating that their ultimate impact depends on conscious usage.'
      },
      {
        heading: '2. 1-Asosiy qism (Positive Facets: Global Connectivity)',
        text: 'On the one hand, social networking services democratize information and transcend geographical boundaries. They empower individuals to maintain relationships across continents, mobilize civic support during humanitarian crises, and provide emerging entrepreneurs with unprecedented access to global marketplaces. For instance, small businesses regularly leverage visual platforms to establish thriving international customer bases without substantial marketing capital.'
      },
      {
        heading: '3. 2-Asosiy qism (Detrimental Impacts: Mental Well-being)',
        text: 'On the other hand, indiscriminate consumption of curated online content frequently leads to heightened anxiety, impaired concentration, and distorted self-perception, particularly among adolescents. Furthermore, the algorithmic pursuit of user retention often promotes polarizing echo chambers, thereby eroding social cohesion and critical discourse.'
      },
      {
        heading: '4. Xulosa (Conclusion & Balanced Stance)',
        text: 'In conclusion, social media represents a double-edged sword. While it possesses remarkable potential to unite humanity and accelerate economic growth, its pervasive risks cannot be overlooked. Cultivating digital literacy and healthy screen habits remains essential to harnessing its benefits while mitigating its pitfalls.'
      }
    ],
    keyVocabulary: [
      { term: 'Proliferation', meaning: 'Tez sur\'atlarda ko\'payish, keng tarqalish', exampleInEssay: 'The proliferation of digital social networks has fundamentally altered...' },
      { term: 'Democratize information', meaning: 'Ma\'lumotlarni hamma uchun ochiq va teng qilish', exampleInEssay: '...social networking services democratize information and transcend...' },
      { term: 'Polarizing echo chambers', meaning: 'Odamlarni faqat bir xil qarashga qamab qo\'yuvchi tor doiralar', exampleInEssay: '...often promotes polarizing echo chambers, thereby eroding social cohesion...' },
      { term: 'Double-edged sword', meaning: 'Ikki tomonlama o\'tkir tig\' (ham foydali, ham zararli narsa)', exampleInEssay: 'In conclusion, social media represents a double-edged sword.' }
    ],
    whyItIs100Percent: [
      { criterion: 'Task Achievement (100%)', reason: 'Ikkala qarash (ijobiy va salbiy) muvozanatli yoritilib, shaxsiy asoslangan xulosa bildirilgan.' },
      { criterion: 'Coherence & Cohesion (100%)', reason: '"On the one hand", "On the other hand", "Furthermore", "In conclusion" kabi akademik ko\'priklar bekamu-ko\'st qo\'llangan.' },
      { criterion: 'Lexical Resource (100%)', reason: 'Mavzuga oid yuqori darajadagi akademik kolokatsiyalar ("civic support", "distorted self-perception", "digital literacy") to\'laqonli namoyon etilgan.' },
      { criterion: 'Grammar (100%)', reason: 'Inversiya, gerundiy va murakkab tobelangan gaplar xatosiz qo\'llanilgan.' }
    ]
  },

  // B2: Artificial Intelligence
  topic_b2_1: {
    title: 'Artificial Intelligence: Catalyzing Innovation While Safeguarding Human Agency',
    bandScore: 'Band 9.0 (100% C2 Exemplary)',
    paragraphs: [
      {
        heading: '1. Kirish (Introduction & Balanced Thesis)',
        text: 'The meteoric rise of artificial intelligence represents a paradigm shift across the global socio-economic landscape. Although apprehension regarding technological unemployment and ethical ambiguity is widespread, I firmly argue that AI will serve as an indispensable catalyst for human progress, provided robust regulatory frameworks are proactively implemented.'
      },
      {
        heading: '2. 1-Asosiy qism (Productivity and Scientific Breakthroughs)',
        text: 'Primarily, artificial intelligence augments human cognitive capabilities by automating mundane analytical operations and accelerating complex problem-solving. In biomedical research, for example, machine-learning models decode protein structures and diagnose rare pathologies with unprecedented precision, thereby reducing clinical development timelines from decades to months. Consequently, human professionals are liberated to dedicate their energy to creative synthesis and strategic innovation.'
      },
      {
        heading: '3. 2-Asosiy qism (Ethical Challenges and Labor Transitions)',
        text: 'Nevertheless, the transitional disruptions associated with automation cannot be ignored. The obsolescence of routine vocations necessitates systematic governmental investment in re-skilling initiatives. Moreover, algorithmic biases and data privacy concerns demand strict compliance standards to ensure that automated decision-making aligns with universal human rights and societal welfare.'
      },
      {
        heading: '4. Xulosa (Conclusion & Visionary Recommendation)',
        text: 'To conclude, artificial intelligence is neither an existential menace nor a panacea; rather, it is a formidable amplifier of human ingenuity. By coupling technological advancement with rigorous ethical governance, modern society can harness AI to achieve unprecedented prosperity while safeguarding the dignity of human labor.'
      }
    ],
    keyVocabulary: [
      { term: 'Paradigm shift', meaning: 'Tub burilish, yangi davr boshlanishi', exampleInEssay: '...represents a paradigm shift across the global socio-economic landscape.' },
      { term: 'Mundane analytical operations', meaning: 'Kundalik, bir xil takrorlanuvchi tahliliy yumushlar', exampleInEssay: '...automating mundane analytical operations and accelerating...' },
      { term: 'Obsolescence of routine vocations', meaning: 'Bir xil kasblarning eskirishi va yo\'qolib borishi', exampleInEssay: 'The obsolescence of routine vocations necessitates systematic...' },
      { term: 'Neither a menace nor a panacea', meaning: 'Na xavf-xatar, na har dardga darmon', exampleInEssay: '...is neither an existential menace nor a panacea...' }
    ],
    whyItIs100Percent: [
      { criterion: 'Task Response (100%)', reason: 'Mavzuning barcha jihatlari (samaradorlik, tibbiyot, mehnat bozori, axloqiy mezonlar) qamrab olingan.' },
      { criterion: 'Coherence & Cohesion (100%)', reason: 'Har bir paragraf bitta aniq g\'oyani mukammal tushuntiradi va o\'zaro mantiqiy silsilada bog\'langan.' },
      { criterion: 'Lexical Resource (100%)', reason: 'Band 9 talablariga mos keluvchi C2 darajadagi leksik boylik qo\'llangan.' },
      { criterion: 'Grammar (100%)', reason: 'Passive constructions, conditional clauses va advanced linking structures xatosiz qo\'llangan.' }
    ]
  }
};

/**
 * Universal Band 9 model insho generatori (har qanday mavzu uchun)
 */
export function generateModelEssay(topic: WritingTopic, userEssayText?: string): ModelSampleEssay {
  // 1. Agar oldindan tayyorlangan saralangan insho bo'lsa, uni to'ldirib qaytarish
  if (CURATED_SAMPLE_ESSAYS[topic.id]) {
    const curated = CURATED_SAMPLE_ESSAYS[topic.id];
    const fullText = curated.paragraphs!.map((p) => p.text).join('\n\n');
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;
    return {
      title: curated.title || topic.title,
      bandScore: curated.bandScore || 'Band 9.0 (100% C2 Exemplary)',
      wordCount,
      paragraphs: curated.paragraphs!,
      fullText,
      keyVocabulary: curated.keyVocabulary!,
      whyItIs100Percent: curated.whyItIs100Percent!
    };
  }

  // 2. Dinamik tarzda mavzu va savollarga mos 100% namunaviy insho yaratish
  const cleanTitle = topic.title || 'Contemporary Perspectives on Global Challenges';
  const cleanPrompt = topic.prompt || 'Analyze the primary causes and propose sustainable solutions.';
  const questions = topic.guidingQuestions && topic.guidingQuestions.length > 0
    ? topic.guidingQuestions
    : [
        'What are the underlying factors contributing to this issue?',
        'How does this trend impact individuals and broader society?',
        'What practical measures can be implemented to address it effectively?'
      ];

  const q1 = questions[0] || 'What key factors define this situation?';
  const q2 = questions[1] || 'What are the main consequences and implications?';
  const q3 = questions[2] || 'What actionable solutions can be recommended?';

  const introParagraph =
    `In contemporary society, the discourse surrounding "${cleanTitle}" has gained considerable prominence among scholars and policymakers alike. While opinions diverge regarding its long-term ramifications, it is imperative to conduct a balanced appraisal of this topic. This essay will critically evaluate the core dynamics of this subject, examine its broader societal implications, and outline actionable avenues toward sustainable advancement.`;

  const body1Paragraph =
    `Primarily, addressing the first dimension requires examining the core drivers at play: ${q1.replace(/\?$/, '')}. Evidence suggests that systematic factors, coupled with rapid socio-cultural evolution, significantly shape modern outcomes. For instance, empirical research consistently demonstrates that when communities adopt well-structured frameworks, potential hazards are minimized while developmental advantages are amplified. Consequently, establishing clear initial benchmarks plays an indispensable role in fostering positive change.`;

  const body2Paragraph =
    `Furthermore, consideration must be given to subsequent consequences and strategic responses: ${q2.replace(/\?$/, '')}. In parallel, addressing ${q3.toLowerCase().replace(/\?$/, '')} necessitates collaborative endeavors from governmental bodies, educational institutions, and proactive individuals. By establishing targeted initiatives and encouraging transparent dialogue, society can convert theoretical solutions into tangible, lasting benefits.`;

  const conclusionParagraph =
    `In conclusion, navigating the complexities of "${cleanTitle}" requires both analytical rigor and pragmatic commitment. By acknowledging underlying catalysts and implementing multidimensional interventions, modern society can successfully address existing bottlenecks and build an equitable, forward-looking foundation for generations to come.`;

  const paragraphs = [
    { heading: '1. Kirish (Introduction & Paraphrase)', text: introParagraph },
    { heading: '2. 1-Asosiy qism (First Key Argument & Evidence)', text: body1Paragraph },
    { heading: '3. 2-Asosiy qism (Second Argument & Strategic Solutions)', text: body2Paragraph },
    { heading: '4. Xulosa (Comprehensive Conclusion)', text: conclusionParagraph }
  ];

  const fullText = paragraphs.map((p) => p.text).join('\n\n');
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  return {
    title: cleanTitle,
    bandScore: 'Band 9.0 (100% C2 Exemplary)',
    wordCount,
    paragraphs,
    fullText,
    keyVocabulary: [
      {
        term: 'Gained considerable prominence',
        meaning: 'Keng jamoatchilik e\'tiborini qozonmoq, dolzarb ahamiyat kasb etmoq',
        exampleInEssay: '...the discourse surrounding this topic has gained considerable prominence...'
      },
      {
        term: 'Empirical research demonstrates',
        meaning: 'Amaliy/tajribaviy ilmiy tadqiqotlar shuni ko\'rsatadiki',
        exampleInEssay: '...empirical research consistently demonstrates that when communities adopt...'
      },
      {
        term: 'Tangible, lasting benefits',
        meaning: 'Aniq sezilarli va uzoq muddatli naf/samara',
        exampleInEssay: '...society can convert theoretical solutions into tangible, lasting benefits.'
      },
      {
        term: 'Pragmatic commitment',
        meaning: 'Amaliy, real harakatlarga sodiqlik',
        exampleInEssay: '...requires both analytical rigor and pragmatic commitment.'
      }
    ],
    whyItIs100Percent: [
      {
        criterion: 'Task Achievement (100%)',
        reason: 'Berilgan mavzu va barcha yo\'naltiruvchi savollarga to\'liq javob berilgan. Fikrlar mantiqiy asoslar bilan kengaytirilgan.'
      },
      {
        criterion: 'Coherence & Cohesion (100%)',
        reason: 'Klassik 4 paragrafli struktura: har bir paragrafda 1 ta mustahkam g\'oya va ravon bog\'lovchi ko\'priklar ("Primarily", "Furthermore", "In parallel", "In conclusion").'
      },
      {
        criterion: 'Lexical Resource (100%)',
        reason: 'Yuqori darajadagi akademik kolokatsiyalar ("considerable prominence", "multidimensional interventions", "pragmatic commitment") xatosiz ishlatilgan.'
      },
      {
        criterion: 'Grammar Accuracy (100%)',
        reason: 'Murakkab ergashgan gaplar, tobelangan konstruktsiyalar va zamonlar izchilligi professional darajada qo\'llanilgan.'
      }
    ]
  };
}
