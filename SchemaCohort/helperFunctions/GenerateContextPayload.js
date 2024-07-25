export function generateContextPayload(
  contextName,
  schemaId,
  universeId,
  keyName
) {
  let temp = "dfsdfsdf";
  return {
    universes: [universeId],
    name: contextName,
    desc: "Test description",
    contextType: "SIMPLECONTEXt",
    tags: {
      BLUE: ["context"],
    },
    dataReadAccess: "PUBLIC",
    metadataReadAccess: "PUBLIC",
    metadataWriteAccess: "PUBLIC",
    visibility: "PUBLIC",
    type: {
      iContextType: "SimpleContext",
      schemaId: schemaId,
      definition: {
        tables: [schemaId],
        rawQuery: `SELECT * FROM t_${schemaId}_t WHERE \`entity.${keyName}\`='${keyName}'`,
      },
    },
  };
}
