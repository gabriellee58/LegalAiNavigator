import { CourtProcedureData, ProcedureDataMap } from './types';
import civilProcedureData from './civil-procedure';
import criminalProcedureData from './criminal-procedure';
import { familyCourtData } from './family-court';
import { smallClaimsData } from './small-claims';
import { administrativeData } from './administrative';

// Create a map of all procedure data for easy lookup
export const procedureDataMap: ProcedureDataMap = {
  [civilProcedureData.id]: civilProcedureData,
  [criminalProcedureData.id]: criminalProcedureData,
  [familyCourtData.id]: familyCourtData,
  [smallClaimsData.id]: smallClaimsData,
  [administrativeData.id]: administrativeData,
};

// Debug log to see what IDs are in the map
console.log("Procedure data map keys:", Object.keys(procedureDataMap));
console.log("Family court procedure ID:", familyCourtData.id);
console.log("Small claims procedure ID:", smallClaimsData.id);
console.log("Administrative procedure ID:", administrativeData.id);

/**
 * Get a specific procedure by its ID
 * @param id The procedure ID to look up
 * @returns The procedure data or undefined if not found
 */
export function getProcedureById(id: string): CourtProcedureData | undefined {
  return procedureDataMap[id];
}

/**
 * Get all available court procedures
 * @returns Array of court procedure data
 */
export function getAllProcedures(): CourtProcedureData[] {
  return Object.values(procedureDataMap);
}

/**
 * Get procedures filtered by category
 * @param category The category to filter by
 * @returns Array of court procedures in the specified category
 */
export function getProceduresByCategory(category: string): CourtProcedureData[] {
  return Object.values(procedureDataMap).filter(
    (procedure) => procedure.category && procedure.category.toLowerCase() === category.toLowerCase()
  );
}

export { 
  civilProcedureData, 
  criminalProcedureData, 
  familyCourtData, 
  smallClaimsData, 
  administrativeData 
};