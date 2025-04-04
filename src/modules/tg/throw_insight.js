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
exports.InvestmentState = void 0;
exports.enableTgInsightModule = enableTgInsightModule;
exports.storeMessageRecord = storeMessageRecord;
var db_1 = require("@/db");
var schema_1 = require("@/db/schema");
var bot_manager_1 = require("./bot_manager");
var drizzle_orm_1 = require("drizzle-orm");
var handle_commands_1 = require("./handle-commands");
var InvestmentState = /** @class */ (function () {
    function InvestmentState() {
        this.state = new Map();
    }
    InvestmentState.prototype.getInsightContent = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var record, error_1;
            var insightId = _b.insightId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_1.db.query.insightStateTable.findFirst({
                                where: (0, drizzle_orm_1.eq)(schema_1.insightStateTable, insightId),
                            })];
                    case 1:
                        record = _c.sent();
                        if (!record) {
                            throw new Error("Insight ".concat(insightId, " not found"));
                        }
                        return [2 /*return*/, record.insight];
                    case 2:
                        error_1 = _c.sent();
                        console.error("Failed to fetch insight:", error_1);
                        throw new Error("Failed to retrieve insight content");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    InvestmentState.prototype.set = function (key, value) {
        this.state.set(key, value);
    };
    InvestmentState.prototype.get = function (key) {
        return this.state.get(key);
    };
    return InvestmentState;
}());
exports.InvestmentState = InvestmentState;
var InvestmentManager = /** @class */ (function () {
    function InvestmentManager(agent) {
        this.offListeners = []; // 存“关闭监听器”的函数
        this.agent = agent;
        this.localState = new InvestmentState();
        this.botManager = bot_manager_1.TelegramBotManager.getInstance();
    }
    InvestmentManager.prototype.init = function () {
        var _this = this;
        // 初始化bot并连接Agent
        var botManager = bot_manager_1.TelegramBotManager.getInstance();
        botManager.initializeBot(this.agent);
        // Register insight commands
        (0, handle_commands_1.registerInsightCommands)(botManager);
        // 注册事件监听
        // const commandHandler = this.agent.sensing.registerListener(
        //   (evt: AgentEvent) => {
        //     if (evt.type === "TELEGRAM_COMMAND") {
        //       this.handleTelegramCommand(evt.payload);
        //     }
        //   }
        // );
        // this.offListeners.push(commandHandler);
        // 新增INSIGHT事件监听
        var insightHandler = this.agent.sensing.registerListener(function (evt) {
            if (evt.type === "UPDATE_INSIGHT_COMPLETE") {
                _this.handleNewInsight(evt.payload);
                // console.log("new insight event listened");
            }
        });
        this.offListeners.push(insightHandler);
        // 设置定时任务
        // this.setupPriceScheduler();
        this.agent.sensing.registerListener(function (evt) {
            if (evt.type === "UPDATE_RATE_EVENT") {
                _this;
            }
        });
    };
    // 模拟事件泵
    // private setupPriceScheduler() {
    //   cron.schedule("*/10 * * * * *", () => {
    //     this.agent.sensing.emitEvent({
    //       type: "UPDATE_INSIGHT_COMPLETE",
    //       description: "Price updated. Now you should update insight.",
    //       payload: {},
    //       timestamp: Date.now(),
    //     });
    //     // console.log("event pump online");
    //     // this.createAutomatedTask({
    //     //   source: "BTC/USD in Binance: $61,234.56",
    //     // });
    //     // this.createAutomatedTask({
    //     //   source: "ETH/USD in Binance: $3,456.78",
    //     // });
    //   });
    // }
    // 任务
    InvestmentManager.prototype.handleNewInsight = function (payload) {
        var _this = this;
        this.agent.taskManager.createTask({
            type: "SEND_INSIGHT_TG",
            descrpition: "Send latest insight to Telegram",
            payload: payload,
            callback: function (payload) { return __awaiter(_this, void 0, void 0, function () {
                var content, success, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            content = "another useless mock market insight!";
                            return [4 /*yield*/, this.botManager.sendMessage(content)];
                        case 1:
                            success = _a.sent();
                            if (!success) return [3 /*break*/, 3];
                            // 3. 存储发送记录
                            return [4 /*yield*/, storeMessageRecord({ content: content })];
                        case 2:
                            // 3. 存储发送记录
                            _a.sent();
                            _a.label = 3;
                        case 3: return [3 /*break*/, 5];
                        case 4:
                            error_2 = _a.sent();
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); },
        });
    };
    InvestmentManager.prototype.createAutomatedTask = function (payload) {
        var _this = this;
        this.agent.taskManager.createTask({
            type: "AUTO_PRICE_UPDATE",
            descrpition: "Automatic price reporting",
            payload: payload,
            callback: function (result) { return __awaiter(_this, void 0, void 0, function () {
                var success;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.botManager.sendMessage(result.source)];
                        case 1:
                            success = _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); },
        });
    };
    InvestmentManager.prototype.handleTelegramCommand = function (payload) {
        if (payload.command === "/coin_price") {
            console.log("/coin_price command");
            this.botManager.sendMessage("mock coin prices");
        }
    };
    return InvestmentManager;
}());
function enableTgInsightModule(agent) {
    var investmentMgr = new InvestmentManager(agent);
    investmentMgr.init();
    console.log("[enableTgInsightModule] Enabled.");
    // 若后续想关闭
    // scheduleMgr.teardown();
}
function storeMessageRecord(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var error_3;
        var content = _b.content;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    // 同时存储 insightId 用于后续追踪
                    return [4 /*yield*/, db_1.db.insert(schema_1.tgMessageTable).values({
                            content: content,
                            status: "sent",
                        })];
                case 1:
                    // 同时存储 insightId 用于后续追踪
                    _c.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _c.sent();
                    console.error("Failed to store record:", error_3);
                    throw new Error("Failed to store insight record");
                case 3: return [2 /*return*/];
            }
        });
    });
}
