const path = require("path");
require("dotenv").config({path: "./.env"});
const HDWalletProvider = require("@truffle/hdwallet-provider");
AccountIndex = 0;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545,
      network_id: "*",

    },

    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: 1337,
    },

    ganache_local: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "http://127.0.0.1:7545", AccountIndex)
      },
      network_id: 1337,
    },

    goerli_infura: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "https://goerli.infura.io/v3/23b75e0da38548749b5034774cec61c3", AccountIndex)
      },
      network_id: 5,
    },

    ropsten_infura: {
      host: "https://ropsten.infura.io/v3/23b75e0da38548749b5034774cec61c3",
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/23b75e0da38548749b5034774cec61c3", AccountIndex)
      },
      network_id: 3,
    }
},

compilers: {
  solc: {
    version: "0.8.0"
  }
}
};
