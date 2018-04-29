pragma solidity ^0.4.19;

import { Artist } from './Artist.sol'


contract Application {

  string public name;
  address public owner;

  Artist[] public artists;

  function Application(string _name) public {
    name = _name;
    owner = msg.sender;
  }

  function createArtist(address owner, string name, string genre) returns (address artistAddress) {
    Artist c = (new Artist(address(self), owner, name, genre));
    return address(c);
  }

}
