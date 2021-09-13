const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const { Wallet } = require('../wallet/wallet');

dotenv.config({ path: './config/config.env' });

async function main() {
  let wallet = new Wallet();
  let keyType = "ed25519"
  await wallet.createDid(keyType);
  
  let didList = await wallet.getDids();
  let did = didList.result[didList.result.length -1].did;
  console.log(did)
  await wallet.createPublicKey(did);
  console.log(pubkey)

  let pubkeyList = await wallet.getPublicKeys();
  console.log(pubkeyList)
}

main();