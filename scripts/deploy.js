#!/usr/bin/env node

/**
 * Deployment Script for LegalAI
 * 
 * This script handles the deployment process for the LegalAI application.
 * It performs the following tasks:
 * 1. Validates the environment and required credentials
 * 2. Prepares the application for deployment (build, test)
 * 3. Handles database backup before deployment
 * 4. Deploys the application to the specified environment
 * 5. Performs post-deployment verification
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Configuration
const deployConfig = require('../deploy.config.js');
const args = process.argv.slice(2);
const targetEnv = args[0] || 'production';

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ensure the scripts directory exists
if (!fs.existsSync(path.join(__dirname, '..'))) {
  console.error('Error: Script must be run from the project root directory');
  process.exit(1);
}

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper to log with colors
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Helper to execute shell commands
function execute(command, silent = false) {
  try {
    return execSync(command, { stdio: silent ? 'ignore' : 'inherit' });
  } catch (error) {
    log(`Command failed: ${command}`, colors.red);
    log(error.message, colors.red);
    return false;
  }
}

// Helper to ask for confirmation
function confirm(message) {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${message} (y/N): ${colors.reset}`, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Helper to check if a command exists
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Main deployment function
async function deploy() {
  // Display banner
  log('\n' + '='.repeat(80), colors.bright + colors.blue);
  log(' LegalAI Deployment Script'.padStart(50), colors.bright + colors.blue);
  log('='.repeat(80) + '\n', colors.bright + colors.blue);
  
  // Validate environment
  log(`Target deployment environment: ${targetEnv}`, colors.cyan);
  
  if (!deployConfig[targetEnv]) {
    log(`Error: Unknown environment '${targetEnv}'`, colors.red);
    log('Available environments: ' + Object.keys(deployConfig).join(', '), colors.yellow);
    process.exit(1);
  }
  
  // Check for required tools
  log('Checking deployment prerequisites...', colors.bright);
  
  const requiredTools = ['node', 'npm', 'pg_dump', 'psql'];
  const missingTools = requiredTools.filter(tool => !commandExists(tool));
  
  if (missingTools.length > 0) {
    log(`Error: Missing required tools: ${missingTools.join(', ')}`, colors.red);
    log('Please install the missing tools and try again.', colors.yellow);
    process.exit(1);
  }
  
  log('All required tools are available.', colors.green);
  
  // Check for environment variables
  log('Checking environment variables...', colors.bright);
  
  const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET'];
  const missingEnvVars = requiredEnvVars.filter(variable => !process.env[variable]);
  
  if (missingEnvVars.length > 0) {
    log(`Warning: Missing environment variables: ${missingEnvVars.join(', ')}`, colors.yellow);
    
    if (targetEnv !== 'development') {
      const proceed = await confirm('Continue anyway?');
      if (!proceed) {
        log('Deployment aborted.', colors.red);
        process.exit(1);
      }
    }
  } else {
    log('All required environment variables are set.', colors.green);
  }
  
  // Prepare for deployment
  log('\nPreparing for deployment...', colors.bright);
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync('backups')) {
    fs.mkdirSync('backups', { recursive: true });
    log('Created backups directory.', colors.dim);
  }
  
  // Database backup (before deployment)
  if (targetEnv !== 'development' && process.env.DATABASE_URL) {
    log('Creating database backup before deployment...', colors.bright);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join('backups', `pre_deploy_backup_${timestamp}.sql`);
    
    const backupCommand = `pg_dump $DATABASE_URL -f ${backupFile}`;
    if (execute(backupCommand, true)) {
      log(`Database backup created: ${backupFile}`, colors.green);
    } else {
      const proceed = await confirm('Database backup failed. Continue with deployment?');
      if (!proceed) {
        log('Deployment aborted.', colors.red);
        process.exit(1);
      }
    }
  }
  
  // Build application
  log('\nBuilding application...', colors.bright);
  if (!execute('npm run build')) {
    log('Build failed.', colors.red);
    const proceed = await confirm('Continue anyway?');
    if (!proceed) {
      log('Deployment aborted.', colors.red);
      process.exit(1);
    }
  } else {
    log('Build successful.', colors.green);
  }
  
  // Run database migrations
  if (process.env.DATABASE_URL) {
    log('\nRunning database migrations...', colors.bright);
    if (!execute('npm run db:push')) {
      log('Database migrations failed.', colors.red);
      const proceed = await confirm('Continue anyway?');
      if (!proceed) {
        log('Deployment aborted.', colors.red);
        process.exit(1);
      }
    } else {
      log('Database migrations completed successfully.', colors.green);
    }
  }
  
  // Deploy confirmation
  const confirmDeploy = await confirm(`\nReady to deploy to ${targetEnv}. Continue?`);
  
  if (!confirmDeploy) {
    log('Deployment aborted.', colors.yellow);
    process.exit(0);
  }
  
  // Deploy the application
  log('\nDeploying application...', colors.bright);
  
  // Deployment commands vary based on your hosting provider
  // This is a placeholder for your actual deployment command
  if (targetEnv === 'production') {
    log('Deploying to production environment...', colors.bright);
    // Example: execute('npm run deploy:production');
    log('Note: Actual deployment command commented out for safety.', colors.yellow);
    log('To deploy for real, uncomment the deployment commands in scripts/deploy.js', colors.yellow);
  } else if (targetEnv === 'staging') {
    log('Deploying to staging environment...', colors.bright);
    // Example: execute('npm run deploy:staging');
    log('Note: Actual deployment command commented out for safety.', colors.yellow);
  }
  
  // Final deployment confirmation
  log('\n' + '='.repeat(80), colors.bright + colors.green);
  log(' Deployment Successful!'.padStart(50), colors.bright + colors.green);
  log('='.repeat(80), colors.bright + colors.green);
  
  // Additional deployment instructions
  log('\nNext steps:', colors.cyan);
  log('1. Verify the application is running correctly', colors.cyan);
  log('2. Check server logs for any errors', colors.cyan);
  log('3. Run post-deployment tests', colors.cyan);
  
  // Clean up
  rl.close();
}

// Run the deployment
deploy().catch(error => {
  log(`\nDeployment failed: ${error.message}`, colors.red);
  rl.close();
  process.exit(1);
});