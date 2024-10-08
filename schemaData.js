// schemaData.js
const currentDate = new Date();
const isoString = currentDate.toISOString();
const schemaData = {
  entityName: "SpectrguardAlertData_test" + isoString,
  description: "Schema for Alert declaration data",
  schemaReadAccess: "PUBLIC",
  dataReadAccess: "PUBLIC",
  dataWriteAccess: "PUBLIC",
  metadataReadAccess: "PUBLIC",
  metadataWriteAccess: "PUBLIC",
  universes: ["668fa6e1a2ee7d2b51716cb3"],
  tags: { BLUE: ["tags"] },
  attributes: [
    {
      name: "disasterNumber",
      nestedName: "disasterNumber",
      type: {
        type: "integer",
      },
      required: true,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "declarationDate",
      nestedName: "declarationDate",
      type: {
        type: "string",
      },
      required: true,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "disasterName",
      nestedName: "disasterName",
      type: {
        type: "string",
      },
      required: true,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "incidentBeginDate",
      nestedName: "incidentBeginDate",
      type: {
        type: "string",
      },
      required: true,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "incidentEndDate",
      nestedName: "incidentEndDate",
      type: {
        type: "string",
      },
      required: true,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "declarationType",
      nestedName: "declarationType",
      type: {
        type: "string",
      },
      required: true,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "stateCode",
      nestedName: "stateCode",
      type: {
        type: "string",
      },
      required: true,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "stateName",
      nestedName: "stateName",
      type: {
        type: "string",
      },
      required: true,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "incidentType",
      nestedName: "incidentType",
      type: {
        type: "string",
      },
      required: true,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "entryDate",
      nestedName: "entryDate",
      type: {
        type: "string",
      },
      required: true,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "updateDate",
      nestedName: "updateDate",
      type: {
        type: "string",
      },
      required: true,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "closeoutDate",
      nestedName: "closeoutDate",
      type: {
        type: "string",
      },
      required: false,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "region",
      nestedName: "region",
      type: {
        type: "integer",
      },
      required: false,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "ihProgramDeclared",
      nestedName: "ihProgramDeclared",
      type: {
        type: "boolean",
      },
      required: false,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "iaProgramDeclared",
      nestedName: "iaProgramDeclared",
      type: {
        type: "boolean",
      },
      required: false,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "paProgramDeclared",
      nestedName: "paProgramDeclared",
      type: {
        type: "boolean",
      },
      required: false,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "hmProgramDeclared",
      nestedName: "hmProgramDeclared",
      type: {
        type: "boolean",
      },
      required: false,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "id",
      nestedName: "id",
      type: {
        type: "string",
      },
      required: true,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "hash",
      nestedName: "hash",
      type: {
        type: "string",
      },
      required: false,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
    {
      name: "lastRefresh",
      nestedName: "lastRefresh",
      type: {
        type: "string",
      },
      required: false,
      reference: false,
      childAttributes: [],
      access: "PUBLIC",
    },
  ],
  primaryKey: ["id"],
  execute: "PUBLIC",
  visibility: "PUBLIC",
};

export default schemaData;
