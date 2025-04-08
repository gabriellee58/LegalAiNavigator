#!/usr/bin/env node

/**
 * Environment Check Script for LegalAI
 * 
 * This script inspects the current environment and checks:
 * 1. Required environment variables
 * 2. Database connection
 * 3. API service availability
 * 4. File system permissions
 * 
 * It's designed to be run before or during deployment to ensure that
 * all necessary configuration is in place.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables from .env file if available
if (fs.existsSync('.env')) {
  dotenv.config();
  console.log('Loaded environment variables from .env file');
}

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Helper for colored output
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Main check function
async function checkEnvironment() {
  let errors = 0;
  let warnings = 0;
  
  log('\n=== LegalAI Environment Check ===\n', colors.bright + colors.blue);
  
  // Check Node.js version
  log('📌 Node.js environment:', colors.bright);
  const nodeVersion = process.version;
  log(`   Node.js version: ${nodeVersion}`);
  
  if (!nodeVersion.startsWith('v18.') && !nodeVersion.startsWith('v20.')) {
    log('   ⚠️  Warning: Recommended Node.js version is 18.x or 20.x LTS', colors.yellow);
    warnings++;
  } else {
    log('   ✅ Node.js version is compatible', colors.green);
  }
  
  // Check required environment variables
  log('\n📌 Environment variables:', colors.bright);
  const requiredVars = [
    'DATABASE_URL',
    'SESSION_SECRET',
  ];
  
  const recommendedVars = [
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
  ];
  
  let missingRequired = 0;
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      log(`   ❌ Missing required variable: ${varName}`, colors.red);
      missingRequired++;
      errors++;
    } else {
      log(`   ✅ ${varName} is set`, colors.green);
    }
  });
  
  let missingRecommended = 0;
  recommendedVars.forEach(varName => {
    if (!process.env[varName]) {
      log(`   ⚠️  Missing recommended variable: ${varName}`, colors.yellow);
      missingRecommended++;
      warnings++;
    } else {
      log(`   ✅ ${varName} is set`, colors.green);
    }
  });
  
  // Check database connection
  log('\n📌 Database connection:', colors.bright);
  
  if (process.env.DATABASE_URL) {
    try {
      // Use ping-style query to check DB connection
      execSync('npx drizzle-kit ping', { stdio: 'ignore' });
      log('   ✅ Successfully connected to the database', colors.green);
    } catch (error) {
      log('   ❌ Failed to connect to the database', colors.red);
      log(`      Error: ${error.message.split('\n')[0]}`, colors.dim);
      errors++;
    }
  } else {
    log('   ⚠️  Skipped database check (DATABASE_URL not set)', colors.yellow);
  }
  
  // Check file system permissions
  log('\n📌 File system permissions:', colors.bright);
  
  const dirsToCheck = [
    '.',
    './logs',
    './backups',
  ];
  
  dirsToCheck.forEach(dir => {
    // Make sure directory exists
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        log(`   ✅ Created directory: ${dir}`, colors.green);
      } catch (error) {
        log(`   ❌ Failed to create directory: ${dir}`, colors.red);
        errors++;
        return;
      }
    }
    
    // Check write permissions
    try {
      const testFile = path.join(dir, '.permission-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      log(`   ✅ Write permission OK for ${dir}`, colors.green);
    } catch (error) {
      log(`   ❌ No write permission for ${dir}`, colors.red);
      errors++;
    }
  });
  
  // Check for required tools
  log('\n📌 Required tools:', colors.bright);
  
  const requiredTools = [
    'pg_dump',  // For database backups
    'psql',     // For database operations
  ];
  
  requiredTools.forEach(tool => {
    try {
      execSync(`which ${tool}`, { stdio: 'ignore' });
      log(`   ✅ ${tool} is available`, colors.green);
    } catch (error) {
      log(`   ⚠️  ${tool} is not installed`, colors.yellow);
      warnings++;
    }
  });
  
  // Summary
  log('\n=== Environment Check Summary ===', colors.bright + colors.blue);
  
  if (errors === 0 && warnings === 0) {
    log('\n✅ All checks passed! Environment is ready.', colors.green + colors.bright);
  } else {
    if (errors > 0) {
      log(`\n❌ Found ${errors} error${errors === 1 ? '' : 's'} that must be fixed.`, colors.red + colors.bright);
    }
    
    if (warnings > 0) {
      log(`\n⚠️  Found ${warnings} warning${warnings === 1 ? '' : 's'} to consider.`, colors.yellow + colors.bright);
    }
  }
  
  return errors === 0;
}

// Run the checks
checkEnvironment()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(error => {
    log(`\nCheck failed with an error: ${error.message}`, colors.red);
    process.exit(1);
  });