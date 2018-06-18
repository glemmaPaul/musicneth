'use strict'

const libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const Mplex = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const PeerInfo = require('peer-info')
const PeerId = require('peer-id')
const Railing = require('libp2p-railing')
const KadDHT = require('libp2p-kad-dht')


// Find this list at: https://github.com/ipfs/js-ipfs/blob/master/src/core/runtime/config-nodejs.json
const bootstrapers = [
  '/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
  '/ip4/104.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z',
  '/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
  '/ip4/162.243.248.213/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
  '/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
  '/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
  '/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
  '/ip4/178.62.61.185/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
  '/ip4/104.236.151.122/tcp/4001/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx'
]

class P2PNode extends libp2p {
  constructor (peerInfo, peerBook, options) {

    super(modules, peerInfo, peerBook, options)
  }
}

async function createOrRetrievePeerId() {
  return new Promise((resolve, reject) => {
    const json = require((process.env.P2P_MODE === 'listener') ? './listener.json' : './dialer.json')
    PeerId.createFromJSON(json, (err, id) => {
      if (err) { throw err }
      resolve(id)
      console.log(JSON.stringify(id.toJSON(), null, 2))
    })
  })
}

export async function startNode () {

  const peerId = await createOrRetrievePeerId()

  const modules = {
    transport: [new TCP()],
    connection: {
      muxer: [Mplex],
      crypto: [SECIO]
    },
    discovery: [new Railing({ list: bootstrapers })],
    DHT: KadDHT
  }

  return new Promise((resolve, reject) => {
    PeerInfo.create(peerId, (error, peerInfo) => {
      if (error) {
        throw error
      }

      // you shall add thyself
      peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')

      const node = new libp2p(modules, peerInfo)
      node.start((err) => {
        if (err) {
          throw err
        }

        node.on('peer:discovery', (peer) => {
          console.log('Discovered:', peer.id.toB58String())
          node.dial(peer, () => {})
        })

        node.on('peer:connect', (peer) => {
          console.log('Connection established to:', peer.id.toB58String())
        })

      })

      resolve(node)
    })
  })

}

