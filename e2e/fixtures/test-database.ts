import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const testDb = createClient(supabaseUrl, supabaseServiceKey);

export interface TestUser {
  email: string;
  password: string;
  tier: 'guest' | 'subscriber' | 'premium-gold' | 'premium-platinum' | 'admin';
}

export const TEST_USERS: TestUser[] = [
  { email: 'free@test.com', password: 'Test123!', tier: 'subscriber' },
  { email: 'premium-gold@test.com', password: 'Test123!', tier: 'premium-gold' },
  { email: 'premium-platinum@test.com', password: 'Test123!', tier: 'premium-platinum' },
  { email: 'admin@test.com', password: 'AdminTest123!', tier: 'admin' },
];

export async function seedTestUsers() {
  console.log('Seeding test users...');
  
  for (const testUser of TEST_USERS) {
    // Create user account
    const { data: authData, error: authError } = await testDb.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
    });

    if (authError && !authError.message.includes('already registered')) {
      console.error(`Error creating user ${testUser.email}:`, authError);
      continue;
    }

    const userId = authData?.user?.id;
    if (!userId) continue;

    // Add subscription for premium users
    if (testUser.tier === 'premium-gold' || testUser.tier === 'premium-platinum') {
      const planType = testUser.tier === 'premium-gold' ? 'gold' : 'platinum';
      
      await testDb
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          plan_type: planType,
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
    }

    // Add admin role
    if (testUser.tier === 'admin') {
      await testDb
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'admin',
        });
    }
  }
  
  console.log('Test users seeded successfully');
}

export async function seedTestWorkouts() {
  console.log('Seeding test workouts...');
  
  const testWorkouts = [
    {
      id: 'test-free-workout-1',
      name: 'Test Free Workout',
      type: 'strength',
      category: 'strength',
      description: 'A test free workout for E2E testing',
      is_premium: false,
      is_standalone_purchase: false,
      duration: '30 min',
      equipment: 'bodyweight',
      difficulty: 'beginner',
      difficulty_stars: 2,
    },
    {
      id: 'test-premium-workout-1',
      name: 'Test Premium Workout',
      type: 'strength',
      category: 'strength',
      description: 'A test premium workout with standalone purchase option',
      is_premium: true,
      is_standalone_purchase: true,
      price: 29.99,
      duration: '45 min',
      equipment: 'equipment',
      difficulty: 'intermediate',
      difficulty_stars: 3,
    },
    {
      id: 'test-premium-workout-2',
      name: 'Test Premium Members Only',
      type: 'cardio',
      category: 'calorie-burning',
      description: 'A test premium workout without standalone purchase',
      is_premium: true,
      is_standalone_purchase: false,
      duration: '45 min',
      equipment: 'bodyweight',
      difficulty: 'advanced',
      difficulty_stars: 4,
    },
  ];

  for (const workout of testWorkouts) {
    await testDb.from('admin_workouts').upsert(workout);
  }
  
  console.log('Test workouts seeded successfully');
}

export async function seedTestPrograms() {
  console.log('Seeding test programs...');
  
  const testPrograms = [
    {
      id: 'test-free-program-1',
      name: 'Test Free Program',
      category: 'FUNCTIONAL STRENGTH',
      description: 'A test free program for E2E testing',
      is_premium: false,
      is_standalone_purchase: false,
      weeks: 4,
      days_per_week: 3,
      duration: '4 weeks',
      equipment: 'bodyweight',
      difficulty: 'beginner',
      difficulty_stars: 2,
    },
    {
      id: 'test-premium-program-1',
      name: 'Test Premium Program',
      category: 'MUSCLE HYPERTROPHY',
      description: 'A test premium program with standalone purchase',
      is_premium: true,
      is_standalone_purchase: true,
      price: 49.99,
      weeks: 6,
      days_per_week: 4,
      duration: '6 weeks',
      equipment: 'equipment',
      difficulty: 'intermediate',
      difficulty_stars: 3,
    },
  ];

  for (const program of testPrograms) {
    await testDb.from('admin_training_programs').upsert(program);
  }
  
  console.log('Test programs seeded successfully');
}

export async function cleanupTestData() {
  console.log('Cleaning up test data...');
  
  // Delete test workouts
  await testDb.from('admin_workouts').delete().ilike('id', 'test-%');
  
  // Delete test programs
  await testDb.from('admin_training_programs').delete().ilike('id', 'test-%');
  
  // Delete test users (optional - might want to keep them)
  // for (const testUser of TEST_USERS) {
  //   const { data: user } = await testDb.auth.admin.listUsers();
  //   const userToDelete = user?.users.find(u => u.email === testUser.email);
  //   if (userToDelete) {
  //     await testDb.auth.admin.deleteUser(userToDelete.id);
  //   }
  // }
  
  console.log('Test data cleaned up successfully');
}
