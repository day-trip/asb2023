function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _asyncToGenerator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
var __generator = this && this.__generator || function(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return(g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g);
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
};
import express from "express";
import pg from "pg";
import { Configuration, OpenAIApi } from "openai";
import cors from "cors";
import _ from "lodash";
import Filter from "bad-words";
import { DateTime } from "luxon";
import dotenv from "dotenv";
dotenv.config();
var Pool = pg.Pool;
var app = express();
var pool = new Pool({
    user: process.env.DB_USER,
    host: "ec2-18-209-224-242.compute-1.amazonaws.com",
    database: "postgres",
    password: process.env.DB_PSWD,
    port: 5432
});
var configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY
});
var openai = new OpenAIApi(configuration);
app.use(express.text({
    type: "*/*"
}));
app.use(cors({
    origin: "*"
}));
var filter = new Filter();
app.post("/message", function() {
    var _ref = _asyncToGenerator(function(req, res) {
        var client, json, body, embeddingResponse, _embeddingResponse_data_data, embedding, result, conversations, moderationResponse, moderation, e;
        return __generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    console.log(req.body);
                    return [
                        4,
                        pool.connect()
                    ];
                case 1:
                    client = _state.sent();
                    _state.label = 2;
                case 2:
                    _state.trys.push([
                        2,
                        10,
                        11,
                        12
                    ]);
                    json = JSON.parse(req.body);
                    body = json.body;
                    return [
                        4,
                        openai.createEmbedding({
                            model: "text-embedding-ada-002",
                            input: body.replace(/\n/g, " ")
                        })
                    ];
                case 3:
                    embeddingResponse = _state.sent();
                    _embeddingResponse_data_data = _slicedToArray(embeddingResponse.data.data, 1), embedding = _embeddingResponse_data_data[0].embedding;
                    return [
                        4,
                        client.query("select * from match_messages($1, $2, $3, $4);", [
                            "[" + embedding.toString() + "]",
                            0.725,
                            3,
                            json.session
                        ])
                    ];
                case 4:
                    result = _state.sent();
                    return [
                        4,
                        Promise.all(result.rows.filter(function(tag, index, array) {
                            return array.findIndex(function(t) {
                                return t.session === tag.session;
                            }) == index;
                        }).map(function() {
                            var _ref = _asyncToGenerator(function(cv) {
                                var cr;
                                return __generator(this, function(_state) {
                                    switch(_state.label){
                                        case 0:
                                            console.log(cv);
                                            return [
                                                4,
                                                client.query("select * from messages where session = $1 order by index", [
                                                    cv.session
                                                ])
                                            ];
                                        case 1:
                                            cr = _state.sent();
                                            return [
                                                2,
                                                cr.rows.length > 0 ? "".concat(json.user === cv.user ? "Your current user's" : "Some other user's", " previous messages to you at ").concat(DateTime.fromSeconds(Number.parseInt(cv.timestamp)).toFormat("MMMM dd, yyyy - hh:mm"), ')\n"""\n') + cr.rows.map(function(row) {
                                                    return row.content.trim();
                                                }).join("\n---\n") + '\n"""' : undefined
                                            ];
                                    }
                                });
                            });
                            return function(cv) {
                                return _ref.apply(this, arguments);
                            };
                        }()))
                    ];
                case 5:
                    conversations = _state.sent().filter(function(cv) {
                        return cv !== undefined;
                    });
                    return [
                        4,
                        openai.createModeration({
                            input: body.replace(/\n/g, " ")
                        })
                    ];
                case 6:
                    moderationResponse = _state.sent();
                    moderation = moderationResponse.data.results[0];
                    if (!!(moderation.flagged || Object.values(moderation.categories).includes(true) || filter.isProfane(body))) return [
                        3,
                        8
                    ];
                    return [
                        4,
                        client.query('insert into messages (content, embedding, session, index, "user", timestamp) values ($1, $2, $3, $4, $5, $6);', [
                            body,
                            "[" + embedding.toString() + "]",
                            json.session,
                            json.index,
                            json.user,
                            Math.floor(DateTime.now().toSeconds())
                        ])
                    ];
                case 7:
                    _state.sent();
                    return [
                        3,
                        9
                    ];
                case 8:
                    console.warn("Flagged " + JSON.stringify(moderation));
                    _state.label = 9;
                case 9:
                    console.log(conversations.join("\n#####\n"));
                    res.status(200).send(JSON.stringify({
                        context: conversations.join("\n#####\n")
                    }));
                    return [
                        3,
                        12
                    ];
                case 10:
                    e = _state.sent();
                    console.error(e);
                    res.status(500).send(JSON.stringify(e));
                    return [
                        3,
                        12
                    ];
                case 11:
                    client.release();
                    return [
                        7
                    ];
                case 12:
                    return [
                        2
                    ];
            }
        });
    });
    return function(req, res) {
        return _ref.apply(this, arguments);
    };
}());
app.post("/new", function() {
    var _ref = _asyncToGenerator(function(req, res) {
        var json, client, result, grouped, context, nameResponse, name, e;
        return __generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    console.log(req.body);
                    json = JSON.parse(req.body);
                    return [
                        4,
                        pool.connect()
                    ];
                case 1:
                    client = _state.sent();
                    _state.label = 2;
                case 2:
                    _state.trys.push([
                        2,
                        5,
                        6,
                        7
                    ]);
                    return [
                        4,
                        client.query('select content, session, index from messages where "user" = $1 order by "timestamp" limit 20', [
                            json.user
                        ])
                    ];
                case 3:
                    result = _state.sent();
                    grouped = _.mapValues(_.groupBy(result.rows, "session"), function(clist) {
                        return clist.map(function(car) {
                            return car.content;
                        });
                    });
                    console.log(grouped);
                    context = Object.values(grouped).map(function(session) {
                        return '"""\n' + session.join("\n-----\n") + '\n"""';
                    }).join("\n#####\n");
                    return [
                        4,
                        openai.createChatCompletion({
                            model: "gpt-3.5-turbo",
                            messages: [
                                {
                                    role: "user",
                                    content: 'The following is a list of messages sent to you by a user. Try to identity the user\'s name based on the messages. Return the result in JSON as name: <#name#>. Reply with just the JSON and NOTHING ELSE. If you could not determine the name, or I failed to provide the messages, set the value of the name field in the JSON to "unknown". AGAIN, if you reply with ANYTHING that is not valid JSON, the app WILL FAIL.\n\n'.concat(context)
                                }
                            ],
                            user: json.user
                        })
                    ];
                case 4:
                    nameResponse = _state.sent();
                    name = nameResponse.data.choices[0].message.content;
                    console.log(name);
                    res.status(200).send(JSON.stringify({
                        context: context,
                        name: JSON.parse(name).name
                    }));
                    return [
                        3,
                        7
                    ];
                case 5:
                    e = _state.sent();
                    console.error(e);
                    res.status(500).send(JSON.stringify(e));
                    return [
                        3,
                        7
                    ];
                case 6:
                    client.release();
                    return [
                        7
                    ];
                case 7:
                    return [
                        2
                    ];
            }
        });
    });
    return function(req, res) {
        return _ref.apply(this, arguments);
    };
}());
app.listen(4000, function() {
    console.log("Server app listening on port 4000!");
});

