pragma solidity ^0.4.19;

import { Artist } from './Artist.sol';


contract Application {

  string public name;
  address public owner;

  Artist[] public artists;

  function Application(string _name) public {
    name = _name;
    owner = msg.sender;
  }

  function createArtist(address _owner, string _name, string _genre) public returns (address artistAddress) {
    Artist c = (new Artist(_owner, _name, _genre));
    return address(c);
  }

}
