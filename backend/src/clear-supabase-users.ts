import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

async function clearSupabaseUsers() {
  console.log('🔐 Clearing Supabase Auth users...');

  // Initialize Supabase client
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    // List all users
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    console.log(`Found ${users.users.length} users to delete`);

    // Delete each user
    for (const user of users.users) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error(`Error deleting user ${user.email}:`, deleteError);
      } else {
        console.log(`✅ Deleted user: ${user.email}`);
      }
    }

    console.log('✅ All Supabase Auth users cleared');
  } catch (error) {
    console.error('❌ Error clearing Supabase users:', error);
  }
}

clearSupabaseUsers();