import {web3} from './index'
import TrackInterace from 'static/contracts/Track.json'

var Track = new web3.eth.Contract(TrackInterace, null, {
    gasPrice: '20000000000'
});

export async function createTrack(file, artistAddress, name, price) {

}

export async function announceNode(trackAddress) {

}
