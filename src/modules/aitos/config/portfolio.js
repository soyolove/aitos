"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STABLE_COIN = exports.select_portfolio = void 0;
var coin_1 = require("./apt/coin");
exports.select_portfolio = [coin_1.APT, coin_1.USDC, coin_1.AMI, coin_1.PROPS, coin_1.THL];
exports.STABLE_COIN = coin_1.USDC;
