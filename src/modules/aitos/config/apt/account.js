"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.panoraClient = exports.aptosClient = exports.account = void 0;
var ts_sdk_1 = require("@aptos-labs/ts-sdk");
var swap_sdk_1 = require("@panoraexchange/swap-sdk");
var dotenv = require("dotenv");
dotenv.config();
exports.account = ts_sdk_1.Account.fromDerivationPath({
    mnemonic: process.env.APTS_WORDS || "",
    path: "m/44'/637'/0'/0'/0'",
    scheme: ts_sdk_1.SigningSchemeInput.Ed25519,
});
var config = {
    apiKey: "a4^KV_EaTf4MW#ZdvgGKX#HUD^3IFEAOV_kzpIE^3BQGA8pDnrkT7JcIy#HNlLGi",
};
var aptosConfig = new ts_sdk_1.AptosConfig({ network: ts_sdk_1.Network.MAINNET });
exports.aptosClient = new ts_sdk_1.Aptos(aptosConfig);
exports.panoraClient = new swap_sdk_1.default(config);
//   console.log(account.accountAddress.toString());
