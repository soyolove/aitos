"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTradingPrompt = exports.getMarketInsightPrompt = exports.getDefiInsightPrompt = void 0;
var prompt_apt_1 = require("./apt/prompt_apt");
exports.getDefiInsightPrompt = prompt_apt_1.getDefiInsightPrompt_APT;
exports.getMarketInsightPrompt = prompt_apt_1.getMarketInsightPrompt_APT;
exports.getTradingPrompt = prompt_apt_1.getTradingPrompt_APT;
