pragma solidity ^0.4.19;

import { Artist } from "./Artist.sol";


/**
 * Track contract, deployed per track
 */
contract Track {

  event DownloadRequestCreated(address payer, address seeder);

  Artist[] public artists;
  string public infoHash;

  uint price;

  struct Node {
    string host;
    uint latitude;
    uint longitude;
    uint gasPrice;
    uint votes;
    bool online;
  }

  mapping(address => Node) public nodes;

  struct DownloadRequest {
    bool completed;
    uint gasPrice;
    string publicKey;
    string clientHost;
    address seederAddress;
  }

  mapping(address => DownloadRequest) public downloadRequests;
  mapping(address => address) public notFriends;

  function Track(address[] artistAddresses, string _infoHash, uint _price) public {
    require(artistAddresses.length > 0);

    bool artistDeployed = false;

    for (uint i=0; i < artistAddresses.length; i++) {
      Artist _artist = Artist(artistAddresses[i]);

      artists.push(_artist);
      if (address(_artist.owner) == msg.sender) {
        artistDeployed = true;
        break;
      }
    }

    require(artistDeployed);

    price = _price;
    infoHash = _infoHash;

    // Make sure download request is not needed anymore
    downloadRequests[msg.sender] = DownloadRequest(true, 0, "", "", msg.sender);
  }

  function requestDownload (address payer, address hostWallet, string publicKey, string clientHost) public {
    require(msg.sender == payer); // Only payer of download

    // check if payer has requested download before
    if (!downloadRequests[payer].completed) {
      // Previous download never completed, before requesting new download the request has to be voted upon
      revert();
    }

    require(!nodes[hostWallet].online);

    downloadRequests[payer] = DownloadRequest(false, nodes[hostWallet].gasPrice, publicKey, clientHost, hostWallet);

    emit DownloadRequestCreated(payer, hostWallet);
  }

  function endDownloadRequest (address payer, bool completed, uint points) public {
    require(msg.sender == payer);
    assert(points <= 100);

    require(!downloadRequests[payer].completed);

    downloadRequests[payer].completed = completed;

    if (!completed) {
      nodes[downloadRequests[payer].seederAddress].votes -= points;
      notFriends[payer] = downloadRequests[payer].seederAddress;
    }
    else {
      nodes[downloadRequests[payer].seederAddress].votes += points;
    }
  }

  function isActiveNode(address wallet) public constant returns(bool isIndeed) {
    return bytes(nodes[wallet].host).length != 0;
  }

  function isOnlineNode(address wallet) public constant returns(bool isIndeed) {
    return nodes[wallet].online;
  }

  function registerNode(address rewardsWallet, string host, uint latitude, uint longitude, uint gasPrice) public {
    require(msg.sender == rewardsWallet);
    require(downloadRequests[rewardsWallet].completed);

    // Update node object with new info
    nodes[rewardsWallet] = Node({
      host: host,
      latitude: latitude,
      longitude: longitude,
      gasPrice: gasPrice,
      votes: nodes[rewardsWallet].votes,
      online: true
    });
  }

  function announceNode (address rewardsWallet) public {
    require(msg.sender == rewardsWallet);
    assert(!isActiveNode(rewardsWallet)); // Cannot announce Node without host

    nodes[rewardsWallet].online = true;
  }

  function denounceNode (address rewardsWallet) public {
    require(msg.sender == rewardsWallet);
    assert(isOnlineNode(rewardsWallet)); // Cannot denounce node that was offline

    nodes[rewardsWallet].online = false;
  }

}
