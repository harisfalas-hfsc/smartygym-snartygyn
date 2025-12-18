import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export interface ContentSection {
  type: 'heading' | 'paragraph' | 'bullet';
  content: string;
  level?: 1 | 2 | 3;
}

export const generateWordDocument = async (
  title: string,
  sections: ContentSection[],
  filename: string
) => {
  const children: Paragraph[] = [];
  
  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 48,
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Tagline
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Your Gym Re-imagined. Anywhere, Anytime.",
          italics: true,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    })
  );

  // Content sections
  for (const section of sections) {
    if (section.type === 'heading') {
      const headingLevel = section.level === 1 ? HeadingLevel.HEADING_1 
        : section.level === 2 ? HeadingLevel.HEADING_2 
        : HeadingLevel.HEADING_3;
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.content,
              bold: true,
              size: section.level === 1 ? 32 : section.level === 2 ? 28 : 24,
            }),
          ],
          heading: headingLevel,
          spacing: { before: 400, after: 200 },
        })
      );
    } else if (section.type === 'paragraph') {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.content,
              size: 22,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    } else if (section.type === 'bullet') {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${section.content}`,
              size: 22,
            }),
          ],
          spacing: { after: 100 },
          indent: { left: 720 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};

// Why Invest in SmartyGym content
export const whyInvestContent: ContentSection[] = [
  { type: 'heading', content: '💪 Your Body, Your Greatest Asset', level: 1 },
  { type: 'paragraph', content: 'In a world of endless fitness advice on YouTube, conflicting information on social media, and generic gym memberships that lead nowhere, finding a structured path to real results has never been harder. This research explores why expert-designed, human-crafted fitness programs deliver transformative results—and how SmartyGym provides the ecosystem you need to elevate every aspect of your performance.' },
  
  { type: 'heading', content: '🧠 The Foundation of Human Performance', level: 1 },
  { type: 'paragraph', content: 'Physical fitness isn\'t just about looking good—it\'s the bedrock upon which all other performance is built. Research from the American College of Sports Medicine consistently shows that regular exercise improves cognitive function, emotional regulation, and energy levels across all age groups.' },
  { type: 'paragraph', content: 'According to a Harvard Medical School study, just 20 minutes of moderate exercise can boost brain function for up to 12 hours afterward. The implications for work productivity, parenting patience, and creative pursuits are profound.' },
  { type: 'bullet', content: '23% Increase in cognitive performance' },
  { type: 'bullet', content: '32% Boost in creative problem-solving' },
  { type: 'bullet', content: '40% Improvement in stress resilience' },
  
  { type: 'heading', content: '😊 Exercise & Mental Health', level: 1 },
  { type: 'paragraph', content: 'The National Institute of Mental Health and countless peer-reviewed studies have established that regular physical activity is one of the most effective interventions for mental health—often matching or exceeding the effects of medication for mild to moderate conditions.' },
  
  { type: 'heading', content: '⚡ The Modern Fitness Challenge', level: 1 },
  { type: 'paragraph', content: 'Despite knowing that exercise is beneficial, most people struggle to maintain a consistent routine. The reasons are systemic, not personal failures:' },
  { type: 'bullet', content: 'Information Overload: YouTube, Instagram, TikTok—endless conflicting advice with no coherent philosophy' },
  { type: 'bullet', content: 'Lack of Structure: Random workouts without progressive overload or long-term planning' },
  { type: 'bullet', content: 'Time Scarcity: Work, family, commute—no time for a "real" gym routine' },
  { type: 'bullet', content: 'Accessibility Gaps: Traveling? No equipment? The routine breaks down' },
  
  { type: 'heading', content: '📈 The Science of Consistency', level: 1 },
  { type: 'paragraph', content: 'Research from the Journal of Strength and Conditioning demonstrates that structured programs with progressive overload produce results 3-5x greater than random workouts over a 24-week period.' },
  
  { type: 'heading', content: '🏆 Why Expert-Designed Programs Win', level: 1 },
  { type: 'paragraph', content: 'The RAND Corporation study on fitness program adherence found that programs designed by certified professionals have a 67% long-term adherence rate, compared to just 23% for self-guided approaches.' },
  
  { type: 'heading', content: '🌟 The SmartyGym Ecosystem', level: 1 },
  { type: 'paragraph', content: 'SmartyGym was built to solve the modern fitness challenge. Created by Sports Scientist and CSCS-certified coach Haris Falas with over 20 years of experience, every workout and program is designed with purpose, progression, and real-world constraints in mind.' },
  { type: 'bullet', content: '500+ Expert Workouts: Professionally designed, categorized, and progressive' },
  { type: 'bullet', content: 'Multi-Week Programs: Structured journeys from 4-12 weeks with clear goals' },
  { type: 'bullet', content: 'Smarty Rituals: Daily wellness protocols for morning, midday, and evening' },
  { type: 'bullet', content: 'Smarty Check-ins: Track your readiness, sleep, and recovery' },
  { type: 'bullet', content: 'Smarty Tools: Calculators for 1RM, BMR, macros, and body measurements' },
  
  { type: 'heading', content: '✅ Conclusion', level: 1 },
  { type: 'paragraph', content: 'Investing in SmartyGym means investing in every role you play—employee, parent, friend, athlete, and human being. The research is clear: structured, expert-designed fitness programs deliver results that random approaches simply cannot match.' },
];

// Why Smarty Corporate content
export const whyCorporateContent: ContentSection[] = [
  { type: 'heading', content: '🏢 The Business Case for Wellness', level: 1 },
  { type: 'paragraph', content: 'In today\'s competitive business landscape, forward-thinking companies recognize that their most valuable asset isn\'t technology, infrastructure, or capital—it\'s their people. This comprehensive analysis explores why investing in employee wellness isn\'t just an ethical choice, but a strategic business decision with measurable returns.' },
  
  { type: 'heading', content: '👥 The Human Capital Advantage', level: 1 },
  { type: 'paragraph', content: 'Every successful organization is built on the foundation of its workforce. The skills, creativity, dedication, and energy of employees drive innovation, customer satisfaction, and ultimately, business success.' },
  { type: 'paragraph', content: 'According to Harvard Business Review, companies like Johnson & Johnson have demonstrated that comprehensive wellness programs can yield a return of $2.71 for every dollar spent, with cumulative savings reaching $250 million on healthcare costs over a decade.' },
  
  { type: 'heading', content: '💰 The ROI of Wellness Programs', level: 1 },
  { type: 'bullet', content: '$2.71 Return per $1 spent (Johnson & Johnson)' },
  { type: 'bullet', content: '$250M Saved by J&J over 10 years' },
  { type: 'bullet', content: '25% Reduction in sick leave' },
  
  { type: 'heading', content: '⏰ The Modern Challenge', level: 1 },
  { type: 'paragraph', content: 'We live in unprecedented times. The modern employee faces a complex web of pressures that previous generations never encountered:' },
  { type: 'bullet', content: 'Economic Pressures: Rising costs of living, financial uncertainty, and job market volatility' },
  { type: 'bullet', content: 'Time Scarcity: Long commutes, extended work hours, and always-on digital culture' },
  { type: 'bullet', content: 'Family Responsibilities: Balancing childcare, eldercare, and household duties' },
  { type: 'bullet', content: 'Mental Load: Information overload, decision fatigue, and the pressure to constantly perform' },
  
  { type: 'heading', content: '🌍 Global Workplace Stress Crisis', level: 1 },
  { type: 'paragraph', content: 'According to the Gallup 2024 State of the Global Workplace Report, workplace stress has reached record highs across all regions. Middle East & North Africa leads at 52%, followed by US & Canada at 49%.' },
  
  { type: 'heading', content: '❤️ Health Beyond Work', level: 1 },
  { type: 'paragraph', content: 'When we discuss employee wellness, we must recognize that employees don\'t exist in a vacuum. They are parents, partners, friends, and community members. Their health affects not just their work performance but their entire life ecosystem.' },
  
  { type: 'heading', content: '🔬 The Science of Exercise & Performance', level: 1 },
  { type: 'paragraph', content: 'Research from the American College of Sports Medicine shows that regular physical activity improves cognitive function by up to 23%, reduces anxiety symptoms by 40%, and increases productivity by 21%.' },
  
  { type: 'heading', content: '📊 Forbes Business Case', level: 1 },
  { type: 'paragraph', content: 'Forbes research indicates that employees with access to wellness programs report 28% higher job satisfaction, 32% lower intention to leave, and 41% lower absenteeism rates.' },
  
  { type: 'heading', content: '🎯 Smarty Corporate Plans', level: 1 },
  { type: 'paragraph', content: 'SmartyGym offers four corporate wellness tiers designed for organizations of all sizes:' },
  { type: 'bullet', content: 'Smarty Dynamic (10 users) - €399/year' },
  { type: 'bullet', content: 'Smarty Power (20 users) - €499/year' },
  { type: 'bullet', content: 'Smarty Elite (30 users) - €599/year' },
  { type: 'bullet', content: 'Smarty Enterprise (unlimited) - €699/year' },
  
  { type: 'heading', content: '✅ Conclusion', level: 1 },
  { type: 'paragraph', content: 'Investing in corporate wellness is not an expense—it\'s a strategic investment that pays dividends in productivity, retention, healthcare savings, and company culture. The research is clear: healthy employees build healthy businesses.' },
];

// The SmartyGym Concept content
export const smartyGymConceptContent: ContentSection[] = [
  { type: 'heading', content: '📍 WHO WE ARE', level: 1 },
  { type: 'paragraph', content: 'SmartyGym is your gym re-imagined—anywhere, anytime. We are a comprehensive online fitness platform built on the principle of "100% Human. 0% AI." Every workout, program, and piece of content is designed by real fitness experts, not algorithms.' },
  { type: 'paragraph', content: 'Founded by Sports Scientist Haris Falas (CSCS-certified, 20+ years experience), SmartyGym brings professional fitness coaching to everyone, everywhere.' },
  
  { type: 'heading', content: '👥 WHO IS SMARTYGYM FOR?', level: 1 },
  { type: 'bullet', content: '💼 Busy Adults - Juggling work, life, and fitness goals' },
  { type: 'bullet', content: '👨‍👩‍👧‍👦 Parents - Limited time but unlimited commitment to health' },
  { type: 'bullet', content: '🌱 Beginners - Starting their fitness journey with expert guidance' },
  { type: 'bullet', content: '💪 Intermediate Lifters - Seeking structure and progressive overload' },
  { type: 'bullet', content: '✈️ Travelers - Needing flexible workouts without equipment' },
  { type: 'bullet', content: '🏋️ Gym-Goers - Wanting expert programming for better results' },
  
  { type: 'heading', content: '⚙️ HOW WE WORK', level: 1 },
  { type: 'paragraph', content: 'Our platform is built on intelligent periodization principles:' },
  { type: 'bullet', content: 'Expert-designed, human-crafted content—never auto-generated' },
  { type: 'bullet', content: 'Intelligent sequencing (never two strength days in a row)' },
  { type: 'bullet', content: 'Recovery-aware programming' },
  { type: 'bullet', content: 'Equipment and bodyweight options for every workout' },
  
  { type: 'heading', content: '🎯 WHAT WE OFFER', level: 1 },
  
  { type: 'heading', content: '📚 SMARTY WORKOUTS', level: 2 },
  { type: 'paragraph', content: '500+ expert-designed workouts across 6 categories:' },
  { type: 'bullet', content: '💪 Strength - Build muscle and raw power' },
  { type: 'bullet', content: '❤️ Cardio - Boost cardiovascular endurance' },
  { type: 'bullet', content: '🔥 Metabolic - High-intensity conditioning' },
  { type: 'bullet', content: '🔥 Calorie Burning - Maximize caloric expenditure' },
  { type: 'bullet', content: '🧘 Mobility & Stability - Improve movement quality' },
  { type: 'bullet', content: '🎯 Challenge - Push your limits' },
  { type: 'paragraph', content: 'Workout formats include: CIRCUIT, EMOM, FOR TIME, AMRAP, TABATA, REPS & SETS, and MIX.' },
  
  { type: 'heading', content: '📅 SMARTY PROGRAMS', level: 2 },
  { type: 'paragraph', content: 'Multi-week structured training journeys (4-12 weeks) with clear progression:' },
  { type: 'bullet', content: 'Cardio Endurance' },
  { type: 'bullet', content: 'Functional Strength' },
  { type: 'bullet', content: 'Muscle Hypertrophy' },
  { type: 'bullet', content: 'Weight Loss' },
  { type: 'bullet', content: 'Low Back Pain Relief' },
  { type: 'bullet', content: 'Mobility & Stability' },
  
  { type: 'heading', content: '📝 BLOG & EXPERT ARTICLES', level: 2 },
  { type: 'paragraph', content: 'Research-backed fitness knowledge, nutrition guidance, and training tips from the coach. Science meets practical application.' },
  
  { type: 'heading', content: '🌅 WORKOUT OF THE DAY (WOD)', level: 1 },
  { type: 'paragraph', content: 'Our flagship feature delivering fresh, strategically programmed workouts every single day.' },
  
  { type: 'heading', content: 'WOD Philosophy', level: 2 },
  { type: 'bullet', content: 'Strategic Recovery - Never two strength days back-to-back' },
  { type: 'bullet', content: 'Intelligent Sequencing - 7-day category rotation for balanced training' },
  { type: 'bullet', content: 'Variety - Different formats, difficulties, and equipment options' },
  { type: 'bullet', content: 'Safety, Variety, Results - Guaranteed' },
  
  { type: 'heading', content: 'WOD Structure', level: 2 },
  { type: 'bullet', content: 'Two fresh workouts daily (bodyweight + equipment)' },
  { type: 'bullet', content: 'Generated at midnight, notifications at 7:00 AM' },
  { type: 'bullet', content: 'Difficulty rotation (1-6 stars) ensuring progressive challenge' },
  { type: 'bullet', content: '7-day category cycle: Strength → Cardio → Metabolic → Mobility & Stability → Calorie Burning → Challenge → Rest' },
  
  { type: 'heading', content: '✨ SMARTY RITUALS', level: 1 },
  { type: 'paragraph', content: 'Daily wellness protocols for holistic health (Premium feature):' },
  { type: 'bullet', content: '🌅 Morning Ritual - Start your day with intention' },
  { type: 'bullet', content: '☀️ Midday Ritual - Reset and refocus' },
  { type: 'bullet', content: '🌙 Evening Ritual - Wind down and recover' },
  { type: 'paragraph', content: 'Each ritual includes mindfulness exercises, movement prompts, and wellness tips tailored to the time of day.' },
  
  { type: 'heading', content: '📊 SMARTY CHECK-INS', level: 1 },
  { type: 'paragraph', content: 'Track your daily readiness and wellness metrics:' },
  { type: 'bullet', content: 'Morning Check-in: Sleep quality, energy, mood, soreness' },
  { type: 'bullet', content: 'Night Check-in: Day strain, hydration, protein intake, steps' },
  { type: 'bullet', content: 'Daily Smarty Score calculation for performance insights' },
  { type: 'bullet', content: 'Historical tracking and trend analysis' },
  
  { type: 'heading', content: '🎯 GOALS SYSTEM', level: 1 },
  { type: 'paragraph', content: 'Set and track your fitness goals:' },
  { type: 'bullet', content: 'Weight targets with progress tracking' },
  { type: 'bullet', content: 'Body fat percentage goals' },
  { type: 'bullet', content: 'Muscle mass targets' },
  { type: 'bullet', content: 'Target dates with countdown' },
  { type: 'bullet', content: 'Personalized Monday Motivation reports based on goal progress' },
  
  { type: 'heading', content: '📖 LOGBOOK', level: 1 },
  { type: 'paragraph', content: 'Your complete activity history:' },
  { type: 'bullet', content: 'Calendar view of all completed workouts and activities' },
  { type: 'bullet', content: 'Activity timeline with filtering' },
  { type: 'bullet', content: 'Google Calendar integration for auto-sync' },
  { type: 'bullet', content: 'Progress visualization' },
  
  { type: 'heading', content: '🧮 SMARTY TOOLS', level: 1 },
  { type: 'paragraph', content: 'Professional calculators and tracking:' },
  { type: 'bullet', content: '1RM Calculator - Track strength progress across 13 exercises' },
  { type: 'bullet', content: 'BMR Calculator - Know your basal metabolic rate' },
  { type: 'bullet', content: 'Macro Calculator - Get personalized nutrition targets' },
  { type: 'bullet', content: 'Measurements Tracker - Body weight, fat %, muscle mass' },
  { type: 'bullet', content: 'Progress charts with historical data' },
  
  { type: 'heading', content: '👥 COMMUNITY', level: 1 },
  { type: 'paragraph', content: 'Connect with fellow Smarty members:' },
  { type: 'bullet', content: 'Leaderboards for workouts and programs' },
  { type: 'bullet', content: 'Top 6 competition format' },
  { type: 'bullet', content: 'Ratings and reviews' },
  { type: 'bullet', content: 'Comments and discussions' },
  { type: 'bullet', content: 'Testimonials from real users' },
  
  { type: 'heading', content: '👑 SUBSCRIPTION TIERS', level: 1 },
  { type: 'bullet', content: '🆓 Free - Access to free workouts and basic features' },
  { type: 'bullet', content: '🥇 Gold (€6.99/mo) - Full access to all workouts and programs' },
  { type: 'bullet', content: '💎 Platinum (€59.99/yr) - Everything plus Smarty Rituals, Check-ins, and premium features' },
  
  { type: 'heading', content: '🎯 OUR PROMISE', level: 1 },
  { type: 'paragraph', content: 'SmartyGym promises:' },
  { type: 'bullet', content: '100% Human-crafted content by certified professionals' },
  { type: 'bullet', content: 'Science-backed programming with real results' },
  { type: 'bullet', content: 'Accessible fitness for everyone, everywhere' },
  { type: 'bullet', content: 'Continuous updates with fresh workouts daily' },
  { type: 'bullet', content: 'Expert guidance at an affordable price' },
  
  { type: 'paragraph', content: '' },
  { type: 'paragraph', content: '---' },
  { type: 'paragraph', content: 'SmartyGym — Your Gym Re-imagined. Anywhere, Anytime.' },
  { type: 'paragraph', content: 'www.smartygym.com' },
];
