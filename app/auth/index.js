import { ipcMain } from 'electron'
import { retrieveWallet } from '../wallet'
import { generateKey } from '../key'


function authHandler(opts) {
  return async function(event, name, email, password) {
    let wallet = await retrieveWallet(email, password)
    let key = await generateKey(name, email, password)

    event.sender.send('authenticated', {
      walletAddress: wallet.address
    })
  }
}



export default function attachHandlers(opts) {
  ipcMain.on('authenticate', authHandler(opts))
}
