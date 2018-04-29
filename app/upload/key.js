import openpgp from 'openpgp'

openpgp.initWorker({ path:'openpgp.worker.js' })


export async function generateKey(name, username, password) {
  var options = {
      userIds: [{ name: name, email: `${username}@musicneth.com` }], // multiple user IDs
      curve: "ed25519",                                          // RSA key size
      passphrase: password
  };


  return openpgp.generateKey(options)
}
