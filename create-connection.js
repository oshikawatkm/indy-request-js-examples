const { Agent, Connection, IssueCredential, CredentialDefinition, Credential, Schema, PresentProofV1, Wallet } = require("indy-request-js");




function preperAgents(){
  let aliceAgent = new Agent('http', 'localhost', '8021')
  let faberAgent = new Agent('http', 'localhost', '8031')
  return {
    aliceAgent,
    faberAgent
  }
}

async function createConnectionProcess(alice, faber){
  let connectionWithAlice = new Connection(alice);
  let connectionWithFaber = new Connection(faber);
  
  let connectionInvitationResponse = await connectionWithAlice.createInvitation({ auto_accept:true, alias: "Hello Alice" });
  let connectionInvitationResponseJSON = JSON.parse(JSON.stringify(connectionInvitationResponse));
  let serviceEndpoint = connectionInvitationResponseJSON.result.invitation.serviceEndpoint;
  let recipientKeys = connectionInvitationResponseJSON.result.invitation.recipientKeys;

  let aliceWallet = new Wallet(alice);
  let aliceDidsResponse = await aliceWallet.did({});
  let aliceDidsResponseJSON = JSON.parse(JSON.stringify(aliceDidsResponse));
  let did = aliceDidsResponseJSON.results[aliceDidsResponseJSON.results.length-1].did;
  let verkey = aliceDidsResponseJSON.results[aliceDidsResponseJSON.results.length-1].verkey;
  let connectionInvitationResponseJSONValues = Object.values(connectionInvitationResponseJSON.result.invitation);
  let id = connectionInvitationResponseJSONValues[1]
  console.log(id)

  let receiveInvitation = {
    "@id": id,
    "@type": 'did:sov:'+did+";spec/connections/1.0/invitation",
    serviceEndpoint,
    label: "Faber.Agent",
    recipientKeys
  }
  console.log(receiveInvitation)

  let receiveInvitationResponse = connectionWithAlice.receiveInvitation({auto_accept: true}, receiveInvitation);
  console.log('receiveInvitationResponse: '+ JSON.stringify(receiveInvitationResponse));
}


let agents  = preperAgents();
createConnectionProcess(agents.aliceAgent, agents.faberAgent);



