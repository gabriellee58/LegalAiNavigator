/**
 * Quick script to fix data structure issues in the court procedure files
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Process all procedure files
const procedureFiles = [
  '../client/src/data/court-procedures/family-court.ts',
  '../client/src/data/court-procedures/small-claims.ts',
  '../client/src/data/court-procedures/administrative.ts',
];

procedureFiles.forEach(fixProcedureFile);

function fixProcedureFile(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`File does not exist: ${fullPath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Fix applicability string to string array
  content = content.replace(
    /applicability: "([^"]+)"/g,
    (match, p1) => `applicability: ["${p1}"]`
  );
  
  // Fix timeframe to timeline
  content = content.replace(
    /timeframe: "(.*?)"/g,
    (match, timeframe) => {
      // Parse timeframe to extract days (simple cases only)
      let minDays = 7;
      let maxDays = 30;
      
      // Try to extract ranges like "1-4 weeks"
      const weekRangeMatch = timeframe.match(/(\d+)-(\d+)\s*weeks?/i);
      if (weekRangeMatch) {
        minDays = parseInt(weekRangeMatch[1]) * 7;
        maxDays = parseInt(weekRangeMatch[2]) * 7;
      }
      
      // Try to extract ranges like "1-3 months"
      const monthRangeMatch = timeframe.match(/(\d+)-(\d+)\s*months?/i);
      if (monthRangeMatch) {
        minDays = parseInt(monthRangeMatch[1]) * 30;
        maxDays = parseInt(monthRangeMatch[2]) * 30;
      }
      
      // If it's a single day timeframe
      const dayMatch = timeframe.match(/(\d+)\s*days?/i);
      if (dayMatch) {
        minDays = parseInt(dayMatch[1]);
        maxDays = parseInt(dayMatch[1]);
      }
      
      return `timeline: {
        minDays: ${minDays},
        maxDays: ${maxDays},
        description: "${timeframe}"
      }`;
    }
  );
  
  // Fix any other string format issues
  
  fs.writeFileSync(fullPath, content);
  console.log(`Fixed: ${filePath}`);
}