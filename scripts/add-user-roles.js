import pg from 'pg';
const { Pool } = pg;

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addUserRoles() {
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    console.log('Adding role column to users table...');
    
    // Check if role column already exists
    const checkColumnExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    
    if (checkColumnExists.rows.length === 0) {
      // Add role column to users table
      await client.query(`
        ALTER TABLE users
        ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
      `);
      console.log('Role column added to users table');
      
      // Create roles table
      await client.query(`
        CREATE TABLE IF NOT EXISTS roles (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          permissions JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('Roles table created');
      
      // Insert default roles
      const roles = [
        {
          name: 'admin',
          description: 'System administrator with full access',
          permissions: JSON.stringify({
            canManageUsers: true,
            canManageContent: true,
            canManageSystem: true,
            canAccessAdminPanel: true
          })
        },
        {
          name: 'moderator',
          description: 'Content moderator with limited administrative access',
          permissions: JSON.stringify({
            canManageUsers: false,
            canManageContent: true,
            canManageSystem: false,
            canAccessAdminPanel: true
          })
        },
        {
          name: 'user',
          description: 'Standard user with basic access',
          permissions: JSON.stringify({
            canManageUsers: false,
            canManageContent: false,
            canManageSystem: false,
            canAccessAdminPanel: false
          })
        }
      ];
      
      for (const role of roles) {
        await client.query(
          `INSERT INTO roles (name, description, permissions) 
           VALUES ($1, $2, $3)
           ON CONFLICT (name) DO NOTHING`,
          [role.name, role.description, role.permissions]
        );
      }
      console.log('Default roles inserted');
      
      // Make the first user an admin
      await client.query(`
        UPDATE users
        SET role = 'admin'
        WHERE id = 1
      `);
      console.log('Admin role assigned to first user');
    } else {
      console.log('Role column already exists, skipping migration');
    }
    
    // Create or update user_role_permissions view for easy access to permissions
    await client.query(`
      CREATE OR REPLACE VIEW user_role_permissions AS
      SELECT u.id as user_id, u.username, u.role, r.permissions
      FROM users u
      LEFT JOIN roles r ON u.role = r.name
    `);
    console.log('User role permissions view created');

    // Create password reset tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Password reset tokens table created');
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Successfully added role-based access control to the database.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding role-based access control:', error);
  } finally {
    client.release();
  }
}

// Run the function
addUserRoles().catch(console.error);