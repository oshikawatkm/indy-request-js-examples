const { Agent, Connection, IssueCredential, CredentialDefinition, Credential, Schema, PresentProofV1, Wallet } = require("indy-request-js");

async function main(){
  let aliceAgent = new Agent('http', 'localhost', '8021')
  let faberAgent = new Agent('http', 'localhost', '8031')
  
  let connectionWithAlice = new Connection(aliceAgent);
  let connectionWithFaber = new Connection(faberAgent);

  // 1.1 FaberからAliceへConnectionの招待
  let connectionInvitationResponse = await connectionWithAlice.createInvitation({ auto_accept:true, alias: "Hello Alice" });
  let connectionInvitationResponseJSON = JSON.parse(JSON.stringify(connectionInvitationResponse));
  let conn_id = connectionInvitationResponseJSON.result.connection_id;
  let serviceEndpoint = connectionInvitationResponseJSON.result.invitation.serviceEndpoint;
  let recipientKeys = connectionInvitationResponseJSON.result.invitation.recipientKeys;


  // 1.2
  let connectinList = await connectionWithAlice.getList({});
  // console.log('connectinList: '+ JSON.stringify(connectinList));

  let aliceWallet = new Wallet(aliceAgent);
  // let aliceDidCreateResponse = await aliceWallet.didCreate({method: "sov", options: { key_type: "ed25519" }});
  // console.log(aliceDidCreateResponse)

  let aliceDidsResponse = await aliceWallet.did({});
  let aliceDidsResponseJSON = JSON.parse(JSON.stringify(aliceDidsResponse));
  let did = aliceDidsResponseJSON.results[aliceDidsResponseJSON.results.length-1].did;
  let verkey = aliceDidsResponseJSON.results[aliceDidsResponseJSON.results.length-1].verkey;
  let connectionInvitationResponseJSONValues = Object.values(connectionInvitationResponseJSON.result.invitation);
  let id = connectionInvitationResponseJSONValues[1]
  console.log(id)

  
  // let getDidEndpointResponse = await aliceWallet.getDidEndpoint(did);
  // let getDidEndpointResponseJSON = JSON.parse(JSON.stringify(getDidEndpointResponse));
  // let endpoint = getDidEndpointResponseJSON.result.endpoint;
  // console.log(endpoint)

  // let faberWallet = new Wallet(faberAgent);

  // 1.3 
  // let receiveInvitation = {
  //   "@id": id,
  //   "@type": 'did:sov:'+did+";spec/connections/1.0/invitation",
  //   serviceEndpoint,
  //   label: "Faber.Agent",
  //   recipientKeys
  // }
  // console.log(receiveInvitation)
  // let receiveInvitationResponse = connectionWithAlice.receiveInvitation({auto_accept: true}, receiveInvitation);
  // console.log('receiveInvitationResponse: '+ JSON.stringify(receiveInvitationResponse));

  // 1.4 招待の受け入れ
  //    (招待を受け取った側)
  // let acceptInvitationByAliceResponse = await connectionWithFaber.acceptInvitation(conn_id, {});
  // console.log('acceptInvitationByAliceResponse: '+ JSON.stringify(acceptInvitationByAliceResponse));
  // //　　　(招待を送った側)
  // let acceptInvitationByFarberResponse = await connectionWithAlice.acceptInvitation(conn_id, {});
  // console.log('acceptInvitationByFarberResponse: '+JSON.stringify(acceptInvitationByFarberResponse));

  // connectinList = await connectionWithAlice.getList();
  // console.log('connectinList: '+JSON.stringify(connectinList));

  // 2.1 VCスキーマ定義
  let schema = new Schema(aliceAgent);
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
  // let schemaCreateResponse = await schema.create({ conn_id }, schemaCreateRequestBody)
  // console.log('schemaCreateResponse: '+JSON.stringify(schemaCreateResponse));

  // 2.2 スキーマの確認
  let schemaCreatedResponse = await schema.created({});
  console.log('schemaCreatedResponse: '+JSON.stringify(schemaCreatedResponse));
  let schema_id = schemaCreatedResponse.result.schema_ids[0];

  let credntialDefinition = new CredentialDefinition(aliceAgent);
  let credntialDefinitionResponse = await credntialDefinition.created({})
  console.log('credntialDefinitionResponse: '+ JSON.stringify(credntialDefinitionResponse));
  

  // 3.1
  let isuueCredentialByFarber = new IssueCredential(faberAgent);
  let isuueCredentialRequestBody = {
      schema_version: "1.0",
      schema_id: schema_id,
      cred_def_id: schema_id,
      credential_proposal: {
          "@type": 'did:sov:'+did+";spec/connections/1.0/invitation",
          attributes: [
              { name: "name", value: "Alice Jhonson" },
              { name: "timestamp", value: "12345678" },
              { name: "date", value: "2018-09-10" },
              { name: "degree", value: "Maths" },
              { name: "age", value: "24" }
          ]
      },
      auto_remove: true,
      connection_id: conn_id,
      schema_issuer_did: "HJhidodswrsk2n4",
      schema_name: "degree schema",
      trace: false,
      comment: "This is a comment"
  }
  let issueCredentialSendResponse = await isuueCredentialByFarber.send(isuueCredentialRequestBody);
  console.log('issueCredentialResponse: '+JSON.stringify(issueCredentialSendResponse));

  // 4
  let issueCredentialRecordsResponse = await isuueCredentialByFarber.records();
  console.log('issueCredentialRecordsResponse: '+JSON.stringify(issueCredentialRecordsResponse));

  // 5
  let issueCredentialByAlice = new IssueCredential(aliceAgent);
  let recordsStoreResponse = await issueCredentialByAlice.recordsStore(cred_def_id, {});
  console.log('recordsStoreResponse: '+ JSON.stringify(recordsStoreResponse));

  let credential = new Credential(aliceAgent);
  let credentialsResponse = await credential.getList({});
  console.log('credentialsResponse: '+ JSON.stringify(credentialsResponse));


  // Proofの要求
  let ProofRequestBody = {
      comment: "free coment",
      connection_id: "oidva-23vadv-vadv-vda",
      proof_request: {
        name: "Proof Request",
        version: "1.0",
        request_attribute: {
          "0_name_uuid": {
            name: "name",
            restrictions: [{
              cred_def_id: "NHIwvwioefw9vwvlwne:3:IU:2241:default"
            }],
          },
          "0_degree_uuid": {
            name: "degree",
            restrictions: [{
              cred_def_id: "NHIwvwioefw9vwvlwne:3:IU:2241:default"
            }],
          "0_self_attested_things_uuid": {
            name: "self_attested_thing"
          }
        },
        requested_predicates: {
          "0_age_GE_uuid": {
            name: "age",
            p_type: ">=",
            p_value: 18,
            restrictions: [{
              cred_def_id: "NHIwvwioefw9vwvlwne:3:IU:2241:default"
            }]
          }
        }
      }
    }
  };
  let presentProofByFaber = new PresentProofV1(faberAgent);
  let presentProofSendRequestResponse = await presentProofByFaber.sendRequest(presentProofByFaber);
  console.log('presentProofSendRequestResponse: '+ JSON.stringify(presentProofSendRequestResponse));


  let presentProofByAlice = new PresentProofV1(aliceAgent);
  let presentProofSendPresentationResponse = await presentProofByAlice.recordsSendPresentation();
  console.log('presentProofSendPresentationResponse: '+JSON.stringify(presentProofSendPresentationResponse));


  let presentProofRecordResponse = await presentProofByFaber.record(pres_ex_id);
  console.log('presentProofRecordResponse: ' +JSON.stringify(presentProofRecordResponse));
}
main()