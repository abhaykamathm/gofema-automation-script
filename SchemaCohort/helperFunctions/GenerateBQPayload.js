export function generateBQPayload(schemaId, schemaName, universeId, keyName) {
  return {
    universes: [universeId],
    name: schemaName,
    desc: "Yearwise Tourisme_Department Revenue",
    definition: `SELECT  \`entity.${keyName}\` AS ${keyName} FROM t_${schemaId}_t`,
    aqDefinitionRequest: {
      tables: [schemaId],
    },
    startTime: "2024-04-01T22:29:00.000Z",
    endTime: "2027-09-27T11:04:48.188Z",
    timeZone: "Asia/Kolkata",
    frequency: "0 0 * * * ?",
    type: "SCHEDULED",
    dataStoreType: "OVERRIDE",
    execute: "ORGANIZATION",
    tags: {
      RED: ["DEAD", "HEAD"],
    },
  };
}
