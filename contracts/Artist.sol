pragma solidity ^0.4.19;


contract Artist {

  string public name;
  string public genre;
  address public owner;

  function Artist(address _owner, string _name, string _genre) public {
    name = _name;
    genre = _genre;
    owner = _owner;
  }

}
