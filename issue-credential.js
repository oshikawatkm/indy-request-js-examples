const { Agent, Connection, IssueCredential, CredentialDefinition, Credential, Schema, PresentProofV1, Wallet } = require("indy-request-js");

const conn_id = "bbc0d0b3-d5d8-40b8-be8d-2579131dd591"

function preperAgents(){
  let aliceAgent = new Agent('http', 'localhost', '8031')
  let faberAgent = new Agent('http', 'localhost', '8021')
  return {
    aliceAgent,
    faberAgent
  }
}

async function defineSchema(faber) {
  let schema = new Schema(faber);
  let schemaCreateRequestBody = {
    attributes: [
      "name",
      "timestamp",
      "date",
      "degree",
      "age"
    ],
    schema_name: "original",
    schema_version: "1.0"
  };
  let schemaCreateResponse = await schema.create({ conn_id }, schemaCreateRequestBody)
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

async function getSchemaIdProcess(alice, faber){
  let schema = new Schema(faber);
  let getSchemaResponse = await schema.created({});
  console.log('getSchemaResponse: '+JSON.stringify(getSchemaResponse));
  let schema_id = getSchemaResponse.result.schema_ids[1];
  return schema_id;
}

async function isuueCredentialProcess(alice, faber, cred_def_id, schema_id){

  let faberWallet = new Wallet(faber);
  let faberDidsResponse = await faberWallet.did({});
  let faberDidsResponseJSON = JSON.parse(JSON.stringify(faberDidsResponse));
  let faberDid = faberDidsResponseJSON.results[0].did;
  console.log(faberDid);

  let aliceWallet = new Wallet(alice);
  let aliceDidsResponse = await aliceWallet.did({});
  let aliceDidsResponseJSON = JSON.parse(JSON.stringify(aliceDidsResponse));
  let aliceDid = aliceDidsResponseJSON.results[0].did;
  console.log(aliceDid);


  let isuueCredentialByFarber = new IssueCredential(faber);
  console.log(cred_def_id);
  let isuueCredentialRequestBody = {
    schema_version: "1.0",
    schema_id,
    cred_def_id,
    credential_proposal: {
      "@type": "did/sov/"+aliceDid+";spec/issue-credential/1.0/credential-preview",
      attributes: [
        { name: "name", value: "Alice Smith" },
        { name: "timestamp", value: "1234567890" },
        { name: "date", value: "2018-09-10" },
        { name: "degree", value: "Maths" },
        { name: "age", value: "24" }
      ]
    },
    issuer_did: faberDid,
    auto_remove: true,
    trace: false,
    connection_id: conn_id,
    schema_issuer_did: faberDid,
    schema_name: "original",
    comment: "This is a comment"
  }
  console.log(isuueCredentialRequestBody)
  let issueCredentialSendResponse = await isuueCredentialByFarber.send(isuueCredentialRequestBody);
  console.log('issueCredentialResponse: '+JSON.stringify(issueCredentialSendResponse));
}

async function getIssueCredentialProcess(alice){
  let isuueCredential = new IssueCredential(alice);
  let isuueCredentialRecordsResponse = await isuueCredential.records({});
  // console.log('isuueCredentialRecordsResponse'+ JSON.stringify(isuueCredentialRecordsResponse))
  return isuueCredentialRecordsResponse.results;
}

async function storeCredentialProcess(alice, cred_ex_id){
  let isuueCredential = new IssueCredential(alice);
  let isuueCredentialRecordsResponse = await isuueCredential.recordsStore(cred_ex_id, {});
  console.log('isuueCredentialRecordsResponse'+ JSON.stringify(isuueCredentialRecordsResponse))
}

async function main() {
  let agents = preperAgents();
  // defineSchema(agents.faberAgent);
  let schema_id = await getSchemaIdProcess(agents.aliceAgent, agents.faberAgent);
  // credentialDefinitionProcess(agents.faberAgent, schema_id);
  let credentialsDifinition = await getCredentialDefinitionProcess(agents.faberAgent, schema_id);
  let cred_def_id = credentialsDifinition.credential_definition_ids[0];
  // await isuueCredentialProcess(agents.aliceAgent, agents.faberAgent, cred_def_id, schema_id);
  let issuedCredential = await getIssueCredentialProcess(agents.aliceAgent);
  console.log(issuedCredential.length)
  let credential_exchange_id = issuedCredential[0].credential_exchange_id;
  console.log(credential_exchange_id)
  await storeCredentialProcess(agents.aliceAgent, credential_exchange_id);
};
main()