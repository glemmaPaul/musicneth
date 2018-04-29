var Artist = artifacts.require("./Artist.sol");

module.exports = function(deployer) {
  deployer.deploy(Artist, "Paul Oostenrijk", "folk");
};
