import {debug} from '../config'
import {Wallet} from 'ethers'


export async function retrieveWallet(username, password) {
  return new Promise(async (resolve, reject) => {
    Wallet.fromBrainWallet(username, password).then(function(wallet) {
        resolve(wallet.address)
    });
  })
}
