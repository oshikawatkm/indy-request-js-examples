const { Agent, Connection, IssueCredential, CredentialDefinition, Credential, Schema, PresentProofV1, Wallet } = require("indy-request-js");


function preperAgents(){
  let alice = new Agent('http', 'localhost', '8031')
  let faber = new Agent('http', 'localhost', '8021')
  return {
    alice,
    faber
  }
}

async function createInvitationProcess(faber){
  let connection = new Connection(faber);
  
  let connectionInvitationResponse = await connection.createInvitation();
  return connectionInvitationResponse;
}

async function receiveInvitationProcess(alice, invitation_id, serviceEndpoint, label, recipientKeys){
  let connection = new Connection(alice);

  // let wallet = new Wallet(alice);
  // let didsResponse = await wallet.did({});
  // let didsResponseJSON = JSON.parse(JSON.stringify(didsResponse));

  let receiveInvitationRequest = {
    "@id": invitation_id,
    label,
    recipientKeys,
    serviceEndpoint
  }
  console.log(receiveInvitationRequest)

  let receiveInvitationResponse = await connection.receiveInvitation({}, receiveInvitationRequest);
  console.log('receiveInvitationResponse: '+JSON.stringify(receiveInvitationResponse));
  return receiveInvitationResponse;
}

async function acceptInvitationProcess(agent, conn_id) {
  let connection = new Connection(agent);
  let acceptInvitationResponse = await connection.acceptInvitation(conn_id, {})
  console.log('acceptInvitationResponse: '+JSON.stringify(acceptInvitationResponse));
  return acceptInvitationResponse;
}

async function acceptRequestProcess(alice, conn_id) {
  let connection = new Connection(alice);
  let acceptRequestResponce = await connection.acceptRequest(conn_id, {});
  return acceptRequestResponce;
}

async function getConnectionList(agent){
  let connection = new Connection(agent);
  connectinList = await connection.getList({});
  return connectinList;
} 

async function main() {
  let connections;
  let agents  = preperAgents();
  let invitationResult = await createInvitationProcess(agents.faber);
  console.log(invitationResult)
  let invitationResultValues = Object.values(invitationResult.result.invitation);
  let fabers_connection_id = invitationResult.result.connection_id;
  let invitation_id = invitationResultValues[1];
  let serviceEndpoint = invitationResult.result.invitation.serviceEndpoint;
  let label = invitationResult.result.invitation.label;
  let recipientKeys = invitationResult.result.invitation.recipientKeys;

  console.log("++++++++++++++++++++++++++++")
  console.log(fabers_connection_id)
  console.log(invitation_id)
  console.log(serviceEndpoint)
  console.log(label)
  console.log(recipientKeys)
  console.log("++++++++++++++++++++++++++++")
  
  receiveInvitationResponse = await receiveInvitationProcess(agents.alice, invitation_id, serviceEndpoint, label, recipientKeys)

  console.log(receiveInvitationResponse.result.connection_id)
  connection_id = receiveInvitationResponse.result.connection_id
  // await acceptInvitationProcess(agents.alice, connection_id);

  // await acceptInvitationProcess(agents.faber, connection_id);

  // await acceptRequestProcess(agents.faber, connection_id);
}

main()

