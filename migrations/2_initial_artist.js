var Artist = artifacts.require("./Artist.sol");

module.exports = function(deployer) {
  deployer.deploy(Artist, "0x627306090abab3a6e1400e9345bc60c78a8bef57", "Paul Oostenrijk", "folk");
};
