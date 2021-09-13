const { Agent, Connection, IssueCredential, CredentialDefinition, Credential, Schema, PresentProofV1 } = require("indy-request-js");

async function main(){
  let aliceAgent = new Agent('http', 'localhost', '8031')
  let faberAgent = new Agent('http', 'localhost', '8021')
  
  let connectionWithAlice = new Connection(aliceAgent);
  let connectionWithFaber = new Connection(faberAgent);

  // 1.1 FaberからAliceへConnectionの招待
  let connectionInvitationResponse = await connectionWithAlice.createInvitation({ alias: "Hello Alice" });
  console.log('connectionInvitationResponse: ' + connectionInvitationResponse)
  let conn_id = connectionInvitationResponse.connection_id;

  // 1.2
  let connectinList = await connectionWithAlice.getList();
  console.log('connectinList: '+connectinList);

  // 1.3
  let receiveInvitation = {
    comment: "Hello Faber",
    credential_proposal: {
      "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/credential-preview",
      attributes: [
        {
          "name": "favourite_drink",
          "mime-type": "image/jpeg",
          "value": "martini"
        }
      ]
    }
  }
  let receiveInvitationResponse = connectionWithAlice.receiveInvitation({}, receiveInvitation);
  console.log('receiveInvitationResponse: '+receiveInvitationResponse)

  // 1.4 招待の受け入れ
  //    (招待を受け取った側)
  let acceptInvitationByAliceResponse = await connectionWithFaber.acceptInvitation(conn_id, {});
  console.log('acceptInvitationByAliceResponse: '+acceptInvitationByAliceResponse);
  //　　　(招待を送った側)
  let acceptInvitationByFarberResponse = await connectionWithAlice.acceptInvitation(conn_id, {});
  console.log('acceptInvitationByFarberResponse: '+acceptInvitationByFarberResponse);

  let connectinList = await connectionWithAlice.getList();
  console.log('connectinList: '+connectinList);

  // 2.1 VCスキーマ定義
  let schema = new Schema(faberAgent);
  let schemaCreateRequestBody = {
      attribute: [
      "name",
      "timestamp",
      "date",
      "degree",
      "age"
      ],
      schema_name: "degree",
      schema_version: "1.0"
  };
  let schemaCreateResponse = await schema.create({ conn_id}, schemaCreateRequestBody)
  console.log('schemaCreateResponse: '+schemaCreateResponse);

  // 2.2 スキーマの確認
  let schemaCreatedResponse = await schema.created()
  console.log('schemaCreatedResponse: '+schemaCreatedResponse);

  let credntialDefinition = new CredentialDefinition();
  let credntialDefinitionResponse = await credntialDefinition.created()
  console.log('credntialDefinitionResponse: '+ credntialDefinitionResponse);
  let cred_def_id = credntialDefinitionResponse.cred_def_id;

  let schema_id = credntialDefinitionResponse.schema_ids[0];

  // 3.1
  let isuueCredentialByFarber = new IssueCredential(faberAgent);
  let isuueCredentialRequestBody = {
      schema_version: "1.0",
      schema_id: schema_id,
      cred_def_id: cred_def_id,
      credential_proposal: {
          "@type": "",
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
  let issueCredentialResponse = await isuueCredentialByFarber.send(isuueCredentialRequestBody);
  console.log('issueCredentialResponse: '+issueCredentialResponse);

  // 4
  let issueCredentialResponse = await isuueCredentialByFarber.records();
  console.log(issueCredentialResponse);

  // 5
  let issueCredentialByAlice = new IssueCredential(aliceAgent);
  let recordsStoreResponse = await issueCredentialByAlice.recordsStore(cred_def_id, {});
  console.log('recordsStoreResponse: '+ recordsStoreResponse);

  let credential = new Credential(aliceAgent);
  let credentialsResponse = await credential.getList({});
  console.log('credentialsResponse: '+ credentialsResponse);


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
  console.log('presentProofSendRequestResponse: '+presentProofSendRequestResponse);


  let presentProofByAlice = new PresentProofV1(aliceAgent);
  let presentProofSendPresentationResponse = await presentProofByAlice.recordsSendPresentation();
  console.log(presentProofSendPresentationResponse);


  let presentProofRecordResponse = await presentProofByFaber.record(pres_ex_id);
  console.log(presentProofRecordResponse);
}
main()