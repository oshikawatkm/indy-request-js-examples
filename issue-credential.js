const { Agent, Connection, IssueCredentialV2, CredentialDefinition, Credential, Schema, PresentProofV1, Wallet } = require("indy-request-js");

function preperAgents(){
  let alice = new Agent('http', 'localhost', '8031')
  let faber = new Agent('http', 'localhost', '8021')
  return {
    alice,
    faber
  }
}

async function defineSchema(faber, conn_id) {
  let schema = new Schema(faber);
  let schemaCreateRequestBody = {
    attributes: [
      "name",
      "timestamp",
      "date",
      "degree",
      "age",
      "score"
    ],
    schema_name: "original",
    schema_version: "1.0"
  };
  let schemaCreateResponse = await schema.create({}, schemaCreateRequestBody)
  console.log('schemaCreateResponse: '+JSON.stringify(schemaCreateResponse));
}

async function credentialDefinitionProcess(alice, schema_id) {
  let credentialDefinition = new CredentialDefinition(alice);
  let requestBody = {
    revocation_registry_size: 1000,
    schema_id,
    support_revocation: true,
    tag: "original"
  };
  let credentialDefinitionResponse = await credentialDefinition.create(requestBody);
  console.log('credentialDefinitionResponse: '+JSON.stringify(credentialDefinitionResponse));
}

async function getCredentialDefinitionProcess(faber, schema_id) {
  let credentialDefinition = new CredentialDefinition(faber);
  let getCredentialDefinitionResponse = await credentialDefinition.created({schema_id});
  console.log('getCredentialDefinitionResponse: '+JSON.stringify(getCredentialDefinitionResponse));
  return getCredentialDefinitionResponse.results;
}

async function getSchemaProcess(faber){
  let schema = new Schema(faber);
  let getSchemaResponse = await schema.created({});
  console.log('getSchemaResponse: '+JSON.stringify(getSchemaResponse));
  return getSchemaResponse;
}

async function isuueCredentialProcess(alice, faber, cred_def_id, schema_id){

  let faberWallet = new Wallet(faber);
  let faberDidsResponse = await faberWallet.did({});
  let faberDidsResponseJSON = JSON.parse(JSON.stringify(faberDidsResponse));
  let faberDid = faberDidsResponseJSON.results[0].did;

  let aliceWallet = new Wallet(alice);
  let aliceDidsResponse = await aliceWallet.did({});
  let aliceDidsResponseJSON = JSON.parse(JSON.stringify(aliceDidsResponse));
  let aliceDid = aliceDidsResponseJSON.results[0].did;

  let isuueCredentialByFarber = new IssueCredentialV2(faber);
  let isuueCredentialRequestBody = {
    auto_remove: true,
    trace: false,
    connection_id: "62e1f909-07cf-4bd6-889e-debe6f2ccd5f",
    comment: "This is a comment",
    credential_preview: {
      "@type": "did/sov/"+aliceDid+";spec/issue-credential/2.0/credential-preview",
      attributes: [
        { name: "name", value: "Alice Smith" },
        { name: "timestamp", value: "1234567890" },
        { name: "date", value: "2018-09-10" },
        { name: "degree", value: "Maths" },
        { name: "age", value: "24" },
        { name: "score", value: "A" },
      ]
    },
    filter: {
      indy: {
        cred_def_id,
        schema_id,
        issuer_did: faberDid,
        schema_version: "1.0",
        schema_issuer_did: faberDid,
        schema_name: "original",
      }
    },
  }
  console.log(isuueCredentialRequestBody)
  let issueCredentialSendResponse = await isuueCredentialByFarber.send(isuueCredentialRequestBody);
  console.log('issueCredentialResponse: '+JSON.stringify(issueCredentialSendResponse));
}

async function getIssueCredentialProcess(alice){
  let isuueCredential = new IssueCredentialV2(alice);
  let isuueCredentialRecordsResponse = await isuueCredential.records({});
  // console.log('isuueCredentialRecordsResponse'+ JSON.stringify(isuueCredentialRecordsResponse))
  return isuueCredentialRecordsResponse.results;
}

async function storeCredentialProcess(alice, cred_ex_id){
  let isuueCredential = new IssueCredentialV2(alice);
  let isuueCredentialRecordsResponse = await isuueCredential.recordsStore(cred_ex_id, {});
  console.log('isuueCredentialRecordsResponse'+ JSON.stringify(isuueCredentialRecordsResponse))
}

async function getConnectionList(agent){
  let connection = new Connection(agent);
  connectinList = await connection.getList({});
  return connectinList;
} 

async function main() {
  let agents = preperAgents();
  let connections = await getConnectionList(agents.faber);
  let connection = connections.results[0]
  await defineSchema(agents.faber, connection.connection_id);
  let schemas = await getSchemaProcess(agents.faber);
  let schema_id = schemas.result.schema_ids[0];
  console.log(schema_id)
  await credentialDefinitionProcess(agents.faber, schema_id);
  let credentialsDifinition = await getCredentialDefinitionProcess(agents.faber, schema_id);
  let cred_def_id = credentialsDifinition.credential_definition_ids[0];
  console.log(cred_def_id)
  await isuueCredentialProcess(agents.alice, agents.faber, cred_def_id, schema_id);
  let issuedCredential = await getIssueCredentialProcess(agents.faber);
  console.log(issuedCredential)
  let credential_exchange_id = issuedCredential[0].credential_exchange_id;
  console.log(credential_exchange_id)
  await storeCredentialProcess(agents.alice, credential_exchange_id);
};
main()