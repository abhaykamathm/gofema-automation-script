export function generateCohortPayload(cohortName, schemaId, universeiD) {
  return {
    name: cohortName,
    desc: cohortName,
    readAccess: "PUBLIC",
    schemaId: schemaId,
    definition: {
      rawQuery: `SELECT * FROM t_${schemaId}_t`,
      tables: [schemaId],
    },
    universes: [universeiD],
    tags: {
      RED: ["Test", "Cohorts"],
    },
  };
}
