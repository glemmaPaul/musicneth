import { ipcMain } from 'electron'
import { retrieveWallet } from '../wallet'
import { generateKey } from '../upload/key'


function authHandler(opts) {
  return async function(event, name, email, password) {
    let address = await retrieveWallet(email, password)
    let key = await generateKey(name, email, password)


    event.sender.send('authenticated', {
      walletAddress: address
    })
  }
}



export default function attachHandlers(opts) {
  ipcMain.on('authenticate', authHandler(opts))
}
