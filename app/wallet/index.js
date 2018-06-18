import {debug} from '../config'
import Web3 from 'web3'
import keytar from 'keytar'

export const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));

const SERVICE = 'MusicNeth'


export async function retrieveWallet(username) {
  let wallet;
  var privateKey = await keytar.getPassword(SERVICE, username)

  if (!privateKey) {
    let wallet = web3.eth.accounts.create();
    keytar.setPassword(SERVICE, username, wallet.privateKey)

    return wallet
  }

  return web3.eth.accounts.privateKeyToAccount(privateKey)
}


function storePrivateKey(username, privateKey) {
  keytar.setPassword(SERVICE, username, privateKey)
}
