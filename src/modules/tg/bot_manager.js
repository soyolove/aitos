"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramBotManager = void 0;
// src/modules/telegram/bot-manager.ts
var node_telegram_bot_api_1 = require("node-telegram-bot-api");
var TelegramBotManager = /** @class */ (function () {
    function TelegramBotManager() {
        this.bot = null;
        this.commandHandlers = [];
        this.token = process.env.TELEGRAM_TOKEN;
        this.chatId = process.env.USER_CHAT_ID;
        this.validateConfig();
    }
    TelegramBotManager.getInstance = function () {
        if (!TelegramBotManager.instance) {
            TelegramBotManager.instance = new TelegramBotManager();
        }
        return TelegramBotManager.instance;
    };
    TelegramBotManager.prototype.validateConfig = function () {
        if (!this.token || !this.chatId) {
            throw new Error("Missing Telegram config. Required ENV vars: TELEGRAM_TOKEN, USER_CHAT_ID");
        }
    };
    TelegramBotManager.prototype.initializeBot = function (agent) {
        if (!this.bot) {
            this.bot = new node_telegram_bot_api_1.default(this.token, {
                polling: true,
            });
            this.registerSystemListeners(agent);
            this.registerDefaultCommands(agent);
            this.registerCommandHandler(agent);
        }
        return this.bot;
    };
    TelegramBotManager.prototype.registerSystemListeners = function (agent) {
        agent.sensing.registerListener(function (evt) {
            // Handle agent events here
            console.log("Agent event received:", evt);
        });
    };
    TelegramBotManager.prototype.emitSystemEvents = function (agent) {
        agent.sensing.emitEvent({
            type: "TELEGRAM_REQUEST",
            description: "User requests from telegram, agent should respond.",
            payload: {},
            timestamp: Date.now(),
        });
    };
    // Register default commands
    TelegramBotManager.prototype.registerDefaultCommands = function (agent) {
        var _this = this;
        // Register help command
        this.registerCommand({
            command: "help",
            description: "Show available commands",
            handler: function (msg) { return __awaiter(_this, void 0, void 0, function () {
                var helpText;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            helpText = this.generateHelpText();
                            return [4 /*yield*/, this.bot.sendMessage(msg.chat.id, helpText)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); },
        });
        this.registerCommand({
            command: "echo",
            description: "Repeats the message you sent",
            handler: function (msg, args) { return __awaiter(_this, void 0, void 0, function () {
                var usageMessage, reply;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            usageMessage = args || "Empty message";
                            return [4 /*yield*/, agent.thinking.response({
                                    input: usageMessage,
                                    model: "large",
                                    platform: "qwen",
                                    systemPrompt: "You are a professional crypto assistant.",
                                })];
                        case 1:
                            reply = _a.sent();
                            return [4 /*yield*/, this.bot.sendMessage(msg.chat.id, reply)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); },
        });
    };
    // Register command handler to process incoming messages
    TelegramBotManager.prototype.registerCommandHandler = function (agent) {
        var _this = this;
        if (!this.bot)
            return;
        // Process all incoming messages
        this.bot.on("message", function (msg) { return __awaiter(_this, void 0, void 0, function () {
            var _a, commandText, args, commandName_1, handler, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(msg.text && msg.text.startsWith("/"))) return [3 /*break*/, 12];
                        _a = msg.text.slice(1).split(" "), commandText = _a[0], args = _a.slice(1);
                        commandName_1 = commandText.toLowerCase();
                        handler = this.commandHandlers.find(function (h) { return h.command === commandName_1; });
                        if (!handler) return [3 /*break*/, 9];
                        console.log("[Telegram] Executing command: ".concat(commandName_1));
                        this.emitSystemEvents(agent);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 8]);
                        return [4 /*yield*/, handler.handler(msg, args.join(" "))];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 3:
                        error_1 = _b.sent();
                        console.error("[Telegram] Error executing command ".concat(commandName_1, ":"), error_1);
                        if (!(error_1 instanceof Error)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.bot.sendMessage(msg.chat.id, "Error executing command: ".concat(error_1.message))];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.bot.sendMessage(msg.chat.id, "Error executing command: An unknown error occurred")];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 11];
                    case 9: 
                    // Unknown command
                    return [4 /*yield*/, this.bot.sendMessage(msg.chat.id, "Unknown command: ".concat(commandName_1, ". Use /help to see available commands."))];
                    case 10:
                        // Unknown command
                        _b.sent();
                        _b.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        // Handle regular messages
                        console.log("[Telegram] Received message: ".concat(msg.text));
                        _b.label = 13;
                    case 13: return [2 /*return*/];
                }
            });
        }); });
    };
    // Register a new command
    TelegramBotManager.prototype.registerCommand = function (handler) {
        this.commandHandlers.push(handler);
        console.log("[Telegram] Registered command: ".concat(handler.command));
    };
    // Generate help text from registered commands
    TelegramBotManager.prototype.generateHelpText = function () {
        var helpText = "🤖 <b>Available Commands</b>\n\n";
        this.commandHandlers.forEach(function (handler) {
            helpText += "/".concat(handler.command, " - ").concat(handler.description, "\n");
        });
        return helpText;
    };
    TelegramBotManager.prototype.sendMessage = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.bot) {
                            throw new Error("Telegram bot not initialized");
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.bot.sendMessage(this.chatId, content)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_2 = _a.sent();
                        console.error("[Telegram] Message send failed:", error_2);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return TelegramBotManager;
}());
exports.TelegramBotManager = TelegramBotManager;
