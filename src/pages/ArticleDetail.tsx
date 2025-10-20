import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/ShareButtons";
import { Card } from "@/components/ui/card";

interface ArticleContent {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  date: string;
  category: string;
  content: string[];
}

const articles: Record<string, ArticleContent> = {
  "1": {
    id: "1",
    title: "Building Muscle: The Complete Guide",
    excerpt: "Everything you need to know about gaining muscle mass effectively",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800",
    readTime: "8 min read",
    date: "March 15, 2024",
    category: "Fitness",
    content: [
      "Building muscle is a science-backed process that requires dedication, proper nutrition, and consistent training. In this comprehensive guide, we'll explore everything you need to know to maximize your muscle growth potential.",
      "## Understanding Muscle Growth",
      "Muscle hypertrophy occurs when muscle fibers are damaged through resistance training and then repair themselves, becoming larger and stronger. This process requires three key elements: progressive overload, adequate protein intake, and sufficient recovery time.",
      "## Progressive Overload",
      "The principle of progressive overload is fundamental to muscle building. This means gradually increasing the demands on your muscles over time by adding weight, increasing reps, or adjusting volume. Without progressive overload, your muscles have no reason to grow.",
      "## Nutrition for Muscle Growth",
      "To build muscle, you need to consume more calories than you burn, with a focus on protein. Aim for 1.6-2.2 grams of protein per kilogram of body weight daily. Include quality carbohydrates for energy and healthy fats for hormone production.",
      "## Training Split",
      "Consider a balanced training split that allows each muscle group adequate recovery time. Popular options include push-pull-legs, upper-lower splits, or full-body routines 3-4 times per week.",
      "## Recovery is Key",
      "Muscles grow during recovery, not during workouts. Ensure you're getting 7-9 hours of quality sleep, managing stress levels, and allowing 48-72 hours between training the same muscle group.",
      "## Supplements",
      "While not necessary, certain supplements can support muscle growth: creatine monohydrate, whey protein, and vitamin D. Always prioritize whole foods first.",
    ]
  },
  "2": {
    id: "2",
    title: "HIIT vs Steady State Cardio",
    excerpt: "Which cardio method is best for your fitness goals?",
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80&w=800",
    readTime: "6 min read",
    date: "March 12, 2024",
    category: "Fitness",
    content: [
      "The debate between High-Intensity Interval Training (HIIT) and steady-state cardio has been ongoing for years. Both have their place in a well-rounded fitness program, and understanding their differences can help you choose the right approach.",
      "## What is HIIT?",
      "HIIT involves short bursts of intense exercise followed by brief recovery periods. A typical session might include 30 seconds of sprinting followed by 90 seconds of walking, repeated for 15-20 minutes.",
      "## Benefits of HIIT",
      "HIIT is time-efficient and creates an 'afterburn effect' where your body continues burning calories for hours after your workout. It's excellent for fat loss while preserving muscle mass and improving cardiovascular fitness.",
      "## What is Steady State Cardio?",
      "Steady-state cardio involves maintaining a consistent, moderate intensity for an extended period, typically 30-60 minutes. Examples include jogging, cycling, or swimming at a steady pace.",
      "## Benefits of Steady State",
      "Steady-state cardio is less taxing on your body, making it easier to recover from. It's excellent for building an aerobic base, improving endurance, and can be more sustainable for longer periods.",
      "## Which Should You Choose?",
      "The best choice depends on your goals, fitness level, and schedule. HIIT is ideal for fat loss and time efficiency, while steady-state is better for endurance and recovery. Many people benefit from incorporating both into their routine.",
      "## Combining Both Methods",
      "Consider doing HIIT 2-3 times per week and steady-state cardio 1-2 times per week. This combination provides the benefits of both while preventing overtraining.",
    ]
  },
  "3": {
    id: "3",
    title: "Perfect Form: Squat Technique",
    excerpt: "Master the king of all exercises with proper technique",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=800",
    readTime: "7 min read",
    date: "March 10, 2024",
    category: "Fitness",
    content: [
      "The squat is often called the 'king of exercises' for good reason. It builds lower body strength, improves mobility, and engages your core. However, proper form is crucial to maximize benefits and prevent injury.",
      "## Setting Up Your Stance",
      "Stand with feet slightly wider than shoulder-width apart, toes pointed slightly outward at about 15-30 degrees. This allows for better hip mobility and depth.",
      "## The Descent",
      "Initiate the movement by pushing your hips back as if sitting in a chair. Keep your chest up and core engaged. Your knees should track over your toes, not caving inward.",
      "## Depth Matters",
      "Aim to squat until your hip crease is at least parallel to your knees. Going deeper can increase muscle activation, but only if you can maintain proper form and have the mobility.",
      "## The Ascent",
      "Drive through your entire foot, focusing on pushing the floor away. Keep your chest up and maintain a neutral spine throughout the movement. Squeeze your glutes at the top.",
      "## Common Mistakes",
      "Avoid letting your knees cave inward, rounding your lower back, or shifting weight onto your toes. These errors can lead to injury and reduce effectiveness.",
      "## Breathing Technique",
      "Take a deep breath before descending, hold it during the movement, and exhale after reaching the top. This creates intra-abdominal pressure for stability.",
      "## Progression",
      "Start with bodyweight squats to perfect form, then progress to goblet squats, and eventually barbell squats as you build strength and confidence.",
    ]
  },
  "4": {
    id: "4",
    title: "Recovery Strategies for Athletes",
    excerpt: "Optimize your recovery to maximize performance gains",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
    readTime: "9 min read",
    date: "March 8, 2024",
    category: "Fitness",
    content: [
      "Recovery is where progress happens. While training breaks down your body, proper recovery allows it to adapt and become stronger. Understanding and implementing effective recovery strategies is essential for any serious athlete.",
      "## Sleep: The Foundation",
      "Sleep is the most powerful recovery tool available. Aim for 7-9 hours of quality sleep per night. During sleep, your body releases growth hormone, repairs tissues, and consolidates learning.",
      "## Active Recovery",
      "Light activity on rest days promotes blood flow without taxing your system. Consider walking, swimming, or yoga to facilitate recovery without hindering progress.",
      "## Nutrition Timing",
      "Post-workout nutrition is crucial. Consume protein and carbohydrates within 2 hours of training to replenish glycogen stores and support muscle repair.",
      "## Hydration",
      "Proper hydration supports every bodily function, including recovery. Aim for at least 3 liters of water daily, more if you're training intensely or in hot conditions.",
      "## Stress Management",
      "Chronic stress impairs recovery by elevating cortisol levels. Practice stress-reduction techniques like meditation, deep breathing, or spending time in nature.",
      "## Recovery Tools",
      "Foam rolling, massage, and compression garments can enhance recovery. While not magical solutions, they support the recovery process when combined with the fundamentals.",
      "## Deload Weeks",
      "Every 4-6 weeks, reduce training volume by 40-50% to allow complete recovery. This prevents overtraining and often leads to strength gains.",
    ]
  },
  "5": {
    id: "5",
    title: "Mobility Work: Why It Matters",
    excerpt: "Improve movement quality and prevent injuries",
    image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=800",
    readTime: "6 min read",
    date: "March 5, 2024",
    category: "Fitness",
    content: [
      "Mobility is often overlooked in fitness programs, but it's essential for optimal performance, injury prevention, and long-term health. Let's explore why mobility work deserves a place in your routine.",
      "## What is Mobility?",
      "Mobility is the ability to move a joint through its full range of motion with control. It's different from flexibility, which is just passive range of motion.",
      "## Benefits of Mobility Work",
      "Improved mobility leads to better exercise form, reduced injury risk, enhanced athletic performance, and better posture. It also helps address muscle imbalances and movement compensations.",
      "## Key Areas to Focus On",
      "Prioritize the hips, thoracic spine, ankles, and shoulders. These areas are commonly restricted in modern sedentary lifestyles and crucial for most athletic movements.",
      "## Daily Mobility Routine",
      "Spend 10-15 minutes daily on mobility work. Focus on areas that feel tight or are relevant to your training that day. Consistency is more important than duration.",
      "## Dynamic vs Static",
      "Use dynamic mobility exercises before workouts to prepare your body for movement. Save static stretching for after training or dedicated mobility sessions.",
      "## Progressive Approach",
      "Start with basic movements and gradually increase complexity. PAILs and RAILs, CARs (Controlled Articular Rotations), and loaded stretching are advanced techniques to explore.",
      "## Integration with Training",
      "Incorporate mobility work into your warm-up and cooldown. You can also use rest periods between sets for quick mobility drills.",
    ]
  },
  "6": {
    id: "6",
    title: "Meal Prep for Busy People",
    excerpt: "Save time and eat healthy with strategic meal preparation",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800",
    readTime: "8 min read",
    date: "March 14, 2024",
    category: "Nutrition",
    content: [
      "Meal prep is a game-changer for maintaining a healthy diet despite a busy schedule. With proper planning and execution, you can ensure nutritious meals are always available.",
      "## Planning Your Meals",
      "Start by planning your meals for the week. Consider your schedule, calorie needs, and variety. Aim to include protein, vegetables, complex carbs, and healthy fats in each meal.",
      "## Batch Cooking Basics",
      "Choose 2-3 hours on a weekend to prepare the week's meals. Cook proteins in bulk, roast multiple trays of vegetables, and prepare grains or starches in large batches.",
      "## Storage Solutions",
      "Invest in quality meal prep containers. Glass containers are durable and microwave-safe. Label containers with contents and dates to track freshness.",
      "## Protein Options",
      "Chicken breast, ground turkey, fish, tofu, and lean beef are excellent batch-cooking proteins. Season differently to prevent flavor fatigue throughout the week.",
      "## Vegetable Variety",
      "Roast a variety of vegetables at different temperatures. Broccoli, bell peppers, sweet potatoes, and Brussels sprouts all prep well and maintain quality.",
      "## Carbohydrate Sources",
      "Rice, quinoa, pasta, and potatoes can be cooked in bulk and portioned throughout the week. Consider mixing different grains for variety.",
      "## Time-Saving Tips",
      "Use a slow cooker for hands-off cooking, prep ingredients the night before your cooking day, and don't be afraid to buy pre-cut vegetables to save time.",
      "## Keeping It Fresh",
      "Freeze meals you won't eat within 3-4 days. Thaw them the night before in the refrigerator for quick reheating.",
    ]
  },
  "7": {
    id: "7",
    title: "Macro Tracking Made Simple",
    excerpt: "Learn how to track macronutrients effectively",
    image: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&q=80&w=800",
    readTime: "7 min read",
    date: "March 11, 2024",
    category: "Nutrition",
    content: [
      "Tracking macronutrients (protein, carbs, and fats) provides more precision than simple calorie counting. Here's how to get started with macro tracking.",
      "## Understanding Macronutrients",
      "Protein builds and repairs tissue (4 calories per gram), carbohydrates provide energy (4 calories per gram), and fats support hormone production and nutrient absorption (9 calories per gram).",
      "## Calculating Your Macros",
      "Start with your total daily calorie needs. For muscle building, aim for 1.6-2.2g protein per kg bodyweight, 0.8-1g fat per kg, and fill the remaining calories with carbs.",
      "## Choosing a Tracking App",
      "MyFitnessPal, Cronometer, and MacroFactor are popular options. Each has a database of foods and makes logging simple. Consistency in using one app helps build accuracy.",
      "## Weighing vs Estimating",
      "A food scale provides the most accurate measurements. Eyeballing portions is convenient but less precise. Start with weighing to learn proper portions.",
      "## Building Meals Around Macros",
      "Plan your protein source first, add vegetables, then incorporate carbs and fats to meet your targets. This structure simplifies meal planning.",
      "## Handling Restaurants",
      "Use the app's restaurant database for chain restaurants. For independent restaurants, find similar items or estimate based on ingredients. Perfect accuracy isn't always possible.",
      "## Flexibility and Adjustments",
      "Your macros aren't set in stone. Adjust based on progress, energy levels, and performance. A 5-10% variance is normal and acceptable.",
      "## When to Stop Tracking",
      "Once you've developed portion awareness and healthy eating habits, you may not need to track forever. Many people track intermittently to stay on course.",
    ]
  },
  "8": {
    id: "8",
    title: "Pre and Post Workout Nutrition",
    excerpt: "Fuel your workouts and optimize recovery with proper timing",
    image: "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&q=80&w=800",
    readTime: "6 min read",
    date: "March 9, 2024",
    category: "Nutrition",
    content: [
      "What you eat around your workouts can significantly impact your performance and recovery. Let's break down optimal pre and post-workout nutrition strategies.",
      "## Pre-Workout Nutrition Goals",
      "Pre-workout meals should provide energy, prevent hunger, and optimize performance without causing digestive discomfort. Timing and composition matter.",
      "## Timing Your Pre-Workout Meal",
      "Eat a full meal 2-3 hours before training, or a smaller snack 30-60 minutes before. The closer to your workout, the lighter and more easily digestible the meal should be.",
      "## Pre-Workout Meal Composition",
      "Focus on easily digestible carbs for quick energy and moderate protein. Limit fat and fiber close to training as they slow digestion. Examples: banana with peanut butter, oatmeal with protein powder.",
      "## Hydration Before Training",
      "Start your workout well-hydrated. Drink 400-600ml of water 2-3 hours before exercise, and another 200-300ml 10-20 minutes before starting.",
      "## Post-Workout Nutrition Goals",
      "After training, prioritize replenishing glycogen stores and providing protein for muscle repair. The 'anabolic window' is larger than once thought—aim for nutrition within 2 hours.",
      "## Post-Workout Meal Composition",
      "Aim for a 3:1 or 4:1 ratio of carbs to protein. This could be 30-40g protein with 90-120g carbs. Whole food examples: chicken with rice, Greek yogurt with fruit and granola.",
      "## Supplements Around Training",
      "Caffeine pre-workout can enhance performance. Creatine timing doesn't matter much—consistency is key. Protein shakes are convenient but not necessary if you eat whole foods.",
      "## Individual Differences",
      "Everyone's tolerance is different. Experiment to find what works for you. Some perform best fasted, others need substantial pre-workout fuel.",
    ]
  },
  "9": {
    id: "9",
    title: "Healthy Fats: The Complete Guide",
    excerpt: "Understanding the role of fats in your diet",
    image: "https://images.unsplash.com/photo-1447078806655-40579c2520d6?auto=format&fit=crop&q=80&w=800",
    readTime: "7 min read",
    date: "March 6, 2024",
    category: "Nutrition",
    content: [
      "Dietary fat has been misunderstood for decades. Far from being something to avoid, healthy fats are essential for optimal health, hormone production, and even fat loss.",
      "## Why We Need Fat",
      "Fats are essential for hormone production, vitamin absorption (A, D, E, K), brain health, cell membrane integrity, and inflammation control. They're also satiating, helping control appetite.",
      "## Types of Fats",
      "Saturated fats (coconut oil, butter), monounsaturated fats (olive oil, avocados), and polyunsaturated fats (fish, nuts) all play different roles. Trans fats should be avoided.",
      "## Omega-3 Fatty Acids",
      "EPA and DHA from fish are particularly important for brain health, reducing inflammation, and cardiovascular health. Aim for 2-3 servings of fatty fish weekly or consider supplementation.",
      "## Omega-6 Balance",
      "While omega-6 fats are essential, modern diets often contain too many relative to omega-3s. This imbalance can promote inflammation. Focus on whole food sources and balance.",
      "## Best Sources of Healthy Fats",
      "Fatty fish (salmon, mackerel), avocados, nuts (almonds, walnuts), seeds (chia, flax), extra virgin olive oil, and whole eggs are excellent sources.",
      "## How Much Fat to Eat",
      "Aim for 0.8-1g per kg of bodyweight, or 20-35% of total calories. Athletes may need slightly more, especially those in endurance sports.",
      "## Cooking with Fats",
      "Consider smoke points: extra virgin olive oil for low-heat cooking, avocado oil or coconut oil for high-heat. Avoid reusing cooking oils.",
      "## Fat and Performance",
      "While carbs are the primary fuel for high-intensity exercise, fat becomes more important for longer, lower-intensity activities. Endurance athletes can benefit from fat adaptation.",
    ]
  },
  "10": {
    id: "10",
    title: "Hydration: Beyond Water",
    excerpt: "Optimize your hydration strategy for peak performance",
    image: "https://images.unsplash.com/photo-1627308595171-d1b5d67129c4?auto=format&fit=crop&q=80&w=800",
    readTime: "6 min read",
    date: "March 3, 2024",
    category: "Nutrition",
    content: [
      "Proper hydration is crucial for performance, recovery, and overall health. But optimal hydration involves more than just drinking water—electrolytes and timing matter too.",
      "## Why Hydration Matters",
      "Water regulates body temperature, transports nutrients, removes waste, lubricates joints, and enables virtually every bodily function. Even mild dehydration can impair performance and cognition.",
      "## Daily Water Needs",
      "A common guideline is 35ml per kg of bodyweight daily, plus additional fluids to replace sweat losses during exercise. Urine color is a simple indicator—pale yellow is ideal.",
      "## Electrolyte Balance",
      "Sodium, potassium, magnesium, and chloride are electrolytes lost through sweat. During intense or prolonged exercise, replacing these along with water is crucial for performance and preventing cramping.",
      "## Hydration During Exercise",
      "Drink 200-300ml every 15-20 minutes during exercise. For sessions over an hour or in hot conditions, include electrolytes. Sports drinks, coconut water, or electrolyte tablets work well.",
      "## Signs of Dehydration",
      "Thirst, dark urine, fatigue, decreased performance, headaches, and dizziness indicate dehydration. Don't rely on thirst alone—it's a late indicator.",
      "## Overhydration Risks",
      "While rare, drinking excessive water without electrolytes can lead to hyponatremia (low sodium). This is most common in endurance events when people drink too much plain water.",
      "## Hydration Strategy",
      "Start your day with water, drink consistently throughout the day, increase intake around training, and consider your diet's sodium content when planning electrolyte intake.",
      "## Best Hydration Sources",
      "Water is primary, but herbal teas, coconut water, and water-rich foods (fruits, vegetables) contribute. Limit caffeine and alcohol as they can have diuretic effects.",
    ]
  },
  "11": {
    id: "11",
    title: "Managing Stress for Better Health",
    excerpt: "Understanding the mind-body connection in fitness",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
    readTime: "8 min read",
    date: "March 13, 2024",
    category: "Wellness",
    content: [
      "Chronic stress undermines your fitness progress, health, and quality of life. Learning to manage stress effectively is as important as your workout routine.",
      "## The Stress Response",
      "Stress triggers cortisol release, which in short bursts is beneficial. Chronic elevation, however, impairs recovery, promotes fat storage (especially abdominal), and suppresses the immune system.",
      "## How Stress Affects Training",
      "High stress impairs recovery, increases injury risk, disrupts sleep, and can lead to overtraining syndrome. It also affects motivation and consistency with healthy habits.",
      "## Identifying Your Stressors",
      "Keep a stress journal to identify patterns. Common stressors include work, relationships, finances, and paradoxically, overtraining. Awareness is the first step to management.",
      "## Breathing Techniques",
      "Diaphragmatic breathing activates the parasympathetic nervous system, countering stress. Practice box breathing: inhale 4 counts, hold 4, exhale 4, hold 4. Do this for 5-10 minutes daily.",
      "## Meditation and Mindfulness",
      "Even 10 minutes daily of meditation can significantly reduce stress. Apps like Headspace or Calm provide guided sessions. Consistency matters more than duration.",
      "## Physical Activity as Stress Relief",
      "Exercise is a powerful stress reducer, releasing endorphins and providing a mental break. However, balance intensity—overtraining adds stress rather than relieving it.",
      "## Sleep and Stress",
      "Poor sleep increases stress, and stress disrupts sleep—a vicious cycle. Prioritize sleep hygiene: consistent schedule, cool dark room, no screens before bed.",
      "## Social Connection",
      "Strong social bonds are one of the most powerful stress buffers. Make time for relationships, seek support when needed, and consider joining fitness communities.",
      "## Professional Help",
      "If stress feels overwhelming or persistent, consider working with a therapist or counselor. Mental health is as important as physical health.",
    ]
  },
  "12": {
    id: "12",
    title: "Sleep Optimization for Athletes",
    excerpt: "Maximize recovery and performance through better sleep",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800",
    readTime: "9 min read",
    date: "March 7, 2024",
    category: "Wellness",
    content: [
      "Sleep is the most powerful recovery tool available to athletes. During sleep, your body repairs tissues, consolidates learning, and regulates hormones crucial for performance.",
      "## Sleep and Performance",
      "Studies show that extending sleep to 9-10 hours can improve sprint times, shooting accuracy, reaction times, and overall athletic performance. Even one night of poor sleep impairs performance.",
      "## Sleep Stages",
      "Sleep cycles through four stages: N1 (light sleep), N2 (deeper sleep), N3 (deep/slow-wave sleep), and REM sleep. Deep sleep is crucial for physical recovery, while REM supports cognitive function.",
      "## How Much Sleep Do You Need?",
      "Most adults need 7-9 hours, but athletes may benefit from 9-10 hours. Sleep debt accumulates—you can't consistently sleep 5 hours and expect to recover with one long sleep.",
      "## Sleep Hygiene Basics",
      "Maintain a consistent sleep schedule, even on weekends. Keep your bedroom cool (65-68°F), dark, and quiet. Invest in a quality mattress and pillows.",
      "## Pre-Sleep Routine",
      "Establish a wind-down routine 30-60 minutes before bed. This might include light reading, gentle stretching, or meditation. Signal to your body that it's time to sleep.",
      "## Screen Time and Blue Light",
      "Blue light from screens suppresses melatonin production. Avoid screens 1-2 hours before bed, or use blue light blocking glasses if avoidance isn't possible.",
      "## Nutrition and Sleep",
      "Avoid large meals, caffeine, and alcohol close to bedtime. Some people benefit from a small protein-rich snack before bed. Magnesium supplementation may improve sleep quality.",
      "## Training Timing",
      "Intense exercise too close to bedtime can interfere with sleep due to elevated body temperature and arousal. Finish hard workouts at least 3-4 hours before bed.",
      "## Napping Strategy",
      "Short naps (20-30 minutes) can boost performance without affecting nighttime sleep. Longer naps may cause sleep inertia. Time naps early afternoon if needed.",
      "## Tracking Your Sleep",
      "Wearable devices can provide insights into sleep patterns, though they're not perfectly accurate. Subjective quality and how you feel matter more than any metric.",
    ]
  },
  "13": {
    id: "13",
    title: "Building Sustainable Fitness Habits",
    excerpt: "Create lasting change with habit-focused strategies",
    image: "https://images.unsplash.com/photo-1533681904393-9ab6eee7e408?auto=format&fit=crop&q=80&w=800",
    readTime: "7 min read",
    date: "March 4, 2024",
    category: "Wellness",
    content: [
      "Long-term fitness success isn't about motivation—it's about building sustainable habits. Here's how to create lasting behavioral change.",
      "## Understanding Habit Formation",
      "Habits consist of a cue, routine, and reward. Identifying these components helps you build new habits and break unwanted ones. Repetition strengthens neural pathways.",
      "## Start Small",
      "The biggest mistake is doing too much too soon. Start with habits so small they seem trivial—5 push-ups daily, 10-minute walks, drinking one more glass of water.",
      "## Stack Your Habits",
      "Attach new habits to existing ones. 'After I brush my teeth, I'll do 10 squats.' This leverages existing neural pathways to build new ones.",
      "## Environment Design",
      "Make desired behaviors easy and undesired ones difficult. Keep gym clothes by your bed, prep healthy snacks in advance, remove temptation foods from the house.",
      "## Identity-Based Change",
      "Rather than goal-focused ('I want to lose 20 pounds'), focus on identity ('I'm someone who exercises'). Ask yourself: What would a fit person do?",
      "## Tracking and Measurement",
      "What gets measured gets managed. Track your habits with a simple calendar check-off system. Visual progress is motivating.",
      "## Handling Setbacks",
      "Missing once is an accident, missing twice risks becoming a pattern. Never miss twice. One bad meal doesn't ruin progress—abandoning your habits does.",
      "## Social Accountability",
      "Share your goals with others, find a workout partner, or join a fitness community. Social pressure and support significantly increase adherence.",
      "## Progress Over Perfection",
      "Aim for consistency, not perfection. Showing up matters more than optimal performance. A moderate workout completed beats a perfect workout skipped.",
      "## Celebrating Small Wins",
      "Acknowledge progress regularly. The gym isn't just about physical transformation—celebrate increased energy, better sleep, improved mood, and strength gains.",
    ]
  },
  "14": {
    id: "14",
    title: "Injury Prevention Strategies",
    excerpt: "Stay healthy and train consistently with smart prevention",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&q=80&w=800",
    readTime: "8 min read",
    date: "March 2, 2024",
    category: "Wellness",
    content: [
      "The best training program is the one you can stick to consistently. Injuries disrupt progress more than any other factor, making prevention crucial for long-term success.",
      "## Progressive Overload Done Right",
      "Increase training volume by no more than 10% per week. Rushing progression is the leading cause of overuse injuries. Patience pays dividends.",
      "## Warm-Up Protocol",
      "Never skip warm-ups. Spend 5-10 minutes on general movement (light cardio), then 5-10 minutes on specific preparation (dynamic stretches, activation exercises for muscles you'll use).",
      "## Proper Form Above All",
      "Perfect form with lighter weight always beats ego lifting. Video your lifts, work with a coach, and prioritize movement quality. Control the weight—don't let it control you.",
      "## Muscle Balance",
      "Avoid overtraining certain muscle groups while neglecting others. For every push exercise, include a pull. Don't skip leg day. Balanced development prevents injuries.",
      "## Listening to Your Body",
      "Learn the difference between productive discomfort and pain signaling injury. Sharp pain, pain that worsens during activity, or pain that doesn't improve with rest requires attention.",
      "## Recovery Between Sessions",
      "Muscles need 48-72 hours to recover fully. More training isn't always better—strategic rest is crucial. Consider deload weeks every 4-6 weeks.",
      "## Mobility and Flexibility",
      "Regular mobility work maintains joint health and movement quality. Focus on hips, ankles, thoracic spine, and shoulders. Even 10 minutes daily makes a difference.",
      "## Appropriate Footwear",
      "Wear shoes appropriate for your activity. Running shoes for running, flat soles for lifting. Replace worn shoes regularly—they lose cushioning over time.",
      "## Strength Training Basics",
      "Build a base of strength before attempting complex or advanced movements. Master bodyweight exercises before adding load. Develop core stability for all movements.",
      "## When to Seek Help",
      "Don't push through pain. If something doesn't feel right, rest and evaluate. Persistent pain lasting more than a few days warrants professional assessment.",
    ]
  },
  "15": {
    id: "15",
    title: "The Mind-Muscle Connection",
    excerpt: "Enhance your workouts through focused intention",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800",
    readTime: "6 min read",
    date: "March 1, 2024",
    category: "Wellness",
    content: [
      "The mind-muscle connection—the ability to mentally focus on the muscle you're working—can significantly enhance training effectiveness and results.",
      "## What is Mind-Muscle Connection?",
      "It's the conscious, focused attention on the muscle being trained during each rep. Research shows this mental focus can increase muscle activation by up to 22%.",
      "## Why It Matters",
      "Mind-muscle connection ensures you're working the intended muscle, not compensating with others. It improves form, reduces injury risk, and maximizes growth stimulus.",
      "## Developing the Connection",
      "Start with lighter weights. Slow down your reps. Before each set, touch the target muscle and visualize it contracting. Focus on the squeeze at peak contraction.",
      "## Internal vs External Focus",
      "Internal focus (thinking about muscle contraction) is better for hypertrophy. External focus (moving the weight) can be better for strength and power. Both have their place.",
      "## Practical Application",
      "During a bicep curl, don't just move the weight—feel your bicep contract and shorten. Visualize it working. This conscious attention creates stronger neural patterns.",
      "## Common Mistakes",
      "Going too heavy makes it impossible to focus on the muscle—you're just surviving the lift. Rushing through reps prevents mindful attention. Eliminate distractions during training.",
      "## Tempo Training",
      "Slow tempo training (3-4 seconds eccentric, 1 second concentric) naturally enhances mind-muscle connection by requiring sustained focus throughout the rep.",
      "## Pre-Exhaustion Technique",
      "Using isolation exercises before compounds can enhance mind-muscle connection during the compound by pre-fatiguing the target muscle.",
      "## Visualization Before Training",
      "Spend 2-3 minutes before your workout visualizing perfect execution of your exercises. This mental rehearsal primes neural pathways and enhances focus.",
      "## Progress Tracking",
      "Keep notes on how well you felt the target muscle during each exercise. Over time, you'll identify which movements give you the best connection.",
    ]
  },
};

export const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = articles[id || "1"];

  if (!article) {
    return (
      <>
        <Helmet>
          <title>Article Not Found - Smarty Gym</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <Button onClick={() => navigate("/community")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Community
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.image,
    "datePublished": new Date(article.date).toISOString(),
    "dateModified": new Date(article.date).toISOString(),
    "author": {
      "@type": "Organization",
      "name": "Smarty Gym"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Smarty Gym",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/smarty-gym-logo.png`
      }
    },
    "articleSection": article.category,
    "wordCount": article.content.join(" ").split(" ").length
  };

  return (
    <>
      <Helmet>
        <title>{article.title} - Smarty Gym Blog</title>
        <meta name="description" content={article.excerpt} />
        <meta name="keywords" content={`${article.category}, fitness, workout, training, health, ${article.title.toLowerCase()}`} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content={article.image} />
        <meta property="og:site_name" content="Smarty Gym" />
        <meta property="article:published_time" content={new Date(article.date).toISOString()} />
        <meta property="article:section" content={article.category} />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
        <meta name="twitter:image" content={article.image} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={window.location.href} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <article className="min-h-screen bg-gradient-to-b from-background to-accent/20">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/community")}
          className="mb-6"
          aria-label="Back to Community page"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back to Community
        </Button>

        {/* Article Header */}
        <header className="max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              {article.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <time>{article.readTime}</time>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <time dateTime={new Date(article.date).toISOString()}>{article.date}</time>
              </div>
            </div>
          </div>

          {/* Article Image */}
          <figure className="aspect-video mb-8 rounded-lg overflow-hidden">
            <img
              src={article.image}
              alt={`${article.title} - Comprehensive guide featuring ${article.category.toLowerCase()} strategies and expert advice`}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </figure>

          {/* Share Button */}
          <nav className="mb-8" aria-label="Article actions">
            <ShareButtons
              title={article.title}
              url={window.location.href}
            />
          </nav>
        </header>

        {/* Article Content */}
        <main className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {article.content.map((paragraph, index) => {
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                return (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </Card>

          {/* Bottom CTA */}
          <aside className="mt-12 text-center">
            <Card className="p-8 bg-primary/5">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Transform Your Fitness Journey?
              </h2>
              <p className="text-muted-foreground mb-6">
                Get personalized workout plans, nutrition guidance, and expert support
              </p>
              <Button size="lg" onClick={() => navigate("/auth")} aria-label="Start your free trial with Smarty Gym">
                Start Your Free Trial
              </Button>
            </Card>
          </aside>
        </main>
      </div>
      </article>
    </>
  );
};
