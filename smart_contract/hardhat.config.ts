import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";
import "dotenv/config";


export default defineConfig({

  plugins: [
    hardhatToolboxMochaEthersPlugin
  ],


  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: {
          evmVersion: "paris"
        }
      },
      production: {
        version: "0.8.28",
        settings: {
          evmVersion: "paris",
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },


  networks: {

    besu: {
      type: "http",
      chainType: "l1",
      url: "http://localhost:8545",
      accounts: [
        configVariable("BESU_PRIVATE_KEY")
      ],
    },

  },
});