import EventEmitter from 'events';
import net from 'net';
import chalk from 'chalk';
import { format } from 'date-fns';

const RconEvents = {
    LIST_TEAMS: 'ListTeams',
    CHAT_MESSAGE: 'CHAT_MESSAGE',
    POSSESSED_ADMIN_CAMERA: 'POSSESSED_ADMIN_CAMERA',
    UNPOSSESSED_ADMIN_CAMERA: 'UNPOSSESSED_ADMIN_CAMERA',
    PLAYER_WARNED: 'PLAYER_WARNED',
    PLAYER_KICKED: 'PLAYER_KICKED',
    PLAYER_BANNED: 'PLAYER_BANNED',
    SQUAD_CREATED: 'SQUAD_CREATED',
    LIST_PLAYERS: 'ListPlayers',
    LIST_SQUADS: 'ListSquads',
    SHOW_CURRENT_MAP: 'ShowCurrentMap',
    SHOW_NEXT_MAP: 'ShowNextMap',
    SHOW_SERVER_INFO: 'ShowServerInfo',
};

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const getTime = () => format(new Date(), 'd LLL HH:mm:ss');
const initLogger = (id, enabled) => ({
    log: (...text) => {
        enabled &&
            console.log(chalk.yellow(`[SquadRcon][${id}][${getTime()}]`), chalk.green(text));
    },
    warn: (...text) => {
        enabled &&
            console.log(chalk.yellow(`[SquadRcon][${id}][${getTime()}]`), chalk.magenta(text));
    },
    error: (...text) => {
        enabled &&
            console.log(chalk.yellow(`[SquadRcon][${id}][${getTime()}]`), chalk.red(text));
    },
});

var ERconResponseType;
(function (ERconResponseType) {
    ERconResponseType[ERconResponseType["SERVERDATA_AUTH"] = 3] = "SERVERDATA_AUTH";
    ERconResponseType[ERconResponseType["SERVERDATA_COMMAND"] = 2] = "SERVERDATA_COMMAND";
    ERconResponseType[ERconResponseType["SERVERDATA_SERVER"] = 1] = "SERVERDATA_SERVER";
    ERconResponseType[ERconResponseType["SERVERDATA_RESPONSE"] = 0] = "SERVERDATA_RESPONSE";
})(ERconResponseType || (ERconResponseType = {}));

function chatParser(rconEmitter, packet, listeners) {
    var _a, _b, _c, _d, _e, _f, _g;
    const { body } = packet;
    const matchChat = body.match(/\[(ChatAll|ChatTeam|ChatSquad|ChatAdmin)] \[Online IDs:EOS: ([0-9a-f]{32}) steam: (\d{17})\] (.+?) : (.*)/);
    if (matchChat) {
        const data = {
            raw: body,
            chat: matchChat[1],
            eosID: matchChat[2],
            steamID: matchChat[3],
            name: matchChat[4],
            message: matchChat[5],
            time: new Date(),
        };
        rconEmitter.emit(RconEvents.CHAT_MESSAGE, data);
        (_a = listeners === null || listeners === void 0 ? void 0 : listeners.onChatMessage) === null || _a === void 0 ? void 0 : _a.call(listeners, data);
        return;
    }
    const matchPossessedAdminCam = body.match(/\[Online Ids:EOS: ([0-9a-f]{32}) steam: (\d{17})\] (.+) has possessed admin camera\./);
    if (matchPossessedAdminCam) {
        const data = {
            raw: body,
            eosID: matchPossessedAdminCam[1],
            steamID: matchPossessedAdminCam[2],
            name: matchPossessedAdminCam[3],
            time: new Date(),
        };
        rconEmitter.emit(RconEvents.POSSESSED_ADMIN_CAMERA, data);
        (_b = listeners === null || listeners === void 0 ? void 0 : listeners.onPossessedAdminCamera) === null || _b === void 0 ? void 0 : _b.call(listeners, data);
        return;
    }
    const matchUnpossessedAdminCam = body.match(/\[Online IDs:EOS: ([0-9a-f]{32}) steam: (\d{17})\] (.+) has unpossessed admin camera\./);
    if (matchUnpossessedAdminCam) {
        const data = {
            raw: body,
            eosID: matchUnpossessedAdminCam[1],
            steamID: matchUnpossessedAdminCam[2],
            name: matchUnpossessedAdminCam[3],
            time: new Date(),
        };
        rconEmitter.emit(RconEvents.UNPOSSESSED_ADMIN_CAMERA, data);
        (_c = listeners === null || listeners === void 0 ? void 0 : listeners.onUnPossessedAdminCamera) === null || _c === void 0 ? void 0 : _c.call(listeners, data);
        return;
    }
    const matchWarn = body.match(/Remote admin has warned player (.*)\. Message was "(.*)"/);
    if (matchWarn) {
        const data = {
            raw: body,
            name: matchWarn[1],
            reason: matchWarn[2],
            time: new Date(),
        };
        rconEmitter.emit(RconEvents.PLAYER_WARNED, data);
        (_d = listeners === null || listeners === void 0 ? void 0 : listeners.onPlayerWarned) === null || _d === void 0 ? void 0 : _d.call(listeners, data);
        return;
    }
    const matchKick = body.match(/Kicked player ([0-9]+)\. \[Online IDs= EOS: ([0-9a-f]{32}) steam: (\d{17})] (.*)/);
    if (matchKick) {
        const data = {
            raw: body,
            playerID: matchKick[1],
            eosID: matchKick[2],
            steamID: matchKick[3],
            name: matchKick[4],
            time: new Date(),
        };
        rconEmitter.emit(RconEvents.PLAYER_KICKED, data);
        (_e = listeners === null || listeners === void 0 ? void 0 : listeners.onPlayerKicked) === null || _e === void 0 ? void 0 : _e.call(listeners, data);
        return;
    }
    const matchBan = body.match(/Banned player ([0-9]+)\. \[steamid=(.*?)\] (.*) for interval (.*)/);
    if (matchBan) {
        const data = {
            raw: body,
            playerID: matchBan[1],
            steamID: matchBan[2],
            name: matchBan[3],
            interval: matchBan[4],
            time: new Date(),
        };
        rconEmitter.emit(RconEvents.PLAYER_BANNED, data);
        (_f = listeners === null || listeners === void 0 ? void 0 : listeners.onPlayerBanned) === null || _f === void 0 ? void 0 : _f.call(listeners, data);
        return;
    }
    const matchSqCreated = body.match(/(.+) \(Online IDs: EOS: ([0-9a-f]{32}) steam: (\d{17})\) has created Squad (\d+) \(Squad Name: (.+)\) on (.+)/);
    if (matchSqCreated) {
        const data = {
            raw: body,
            name: matchSqCreated[1],
            eosID: matchSqCreated[2],
            steamID: matchSqCreated[3],
            squadID: matchSqCreated[4],
            squadName: matchSqCreated[5],
            teamName: matchSqCreated[6],
            time: new Date(),
        };
        rconEmitter.emit(RconEvents.SQUAD_CREATED, data);
        (_g = listeners === null || listeners === void 0 ? void 0 : listeners.onSquadCreated) === null || _g === void 0 ? void 0 : _g.call(listeners, data);
        return;
    }
}

const ids = (text) => {
    var _a, _b, _c;
    return ({
        eosID: ((_a = text.match(/\bEOS:\s*([a-f0-9]{32})\b/i)) === null || _a === void 0 ? void 0 : _a[1]) || '',
        steamID: ((_b = text.match(/\bsteam:\s*(\d{17})\b/i)) === null || _b === void 0 ? void 0 : _b[1]) || '',
        epicID: ((_c = text.match(/\bepic:\s*([a-f0-9]{32})\b/i)) === null || _c === void 0 ? void 0 : _c[1]) || null,
    });
};
const getListPlayers = (emitter, body) => {
    const players = [];
    for (const line of body
        .split('----- Recently Disconnected Players')[0]
        .split('\n')) {
        const match = line.match(/^ID: (\d+) \| Online IDs: (.+?) \| Name: (.+?) \| Team ID: (\d+) \| (?:Party ID: ([^|]+) \| )?Squad ID: (\d+|N\/A) \| Is Leader: (True|False) \| Role: ([^|\r\n]*)(?:\| Vehicle: ([^\r\n]*))?/);
        if (!match)
            continue;
        const identity = ids(match[2]);
        if (!identity.steamID && !identity.eosID)
            continue;
        players.push(Object.assign(Object.assign({ playerID: match[1] }, identity), { playerKey: identity.steamID
                ? `steam:${identity.steamID}`
                : `eos:${identity.eosID}`, name: match[3], teamID: match[4], partyID: match[5] && match[5].trim() !== 'N/A'
                ? match[5].trim().replace(/^#/, '')
                : null, squadID: match[6] === 'N/A' ? null : match[6], isLeader: match[7] === 'True', role: match[8].trim(), vehicle: match[9] && match[9].trim() !== 'N/A'
                ? match[9].trim()
                : null }));
    }
    emitter.emit(RconEvents.LIST_PLAYERS, players);
    return players;
};
const getListTeams = (emitter, body) => {
    const teams = [];
    for (const line of body.split('\n')) {
        const m = line.match(/^Team ID: (\d+) \((.+)\)(?: - Tickets: (-?\d+))?\s*$/);
        if (m)
            teams.push({
                teamID: m[1],
                teamName: m[2],
                tickets: m[3] === undefined ? null : Number(m[3]),
            });
    }
    emitter.emit(RconEvents.LIST_TEAMS, teams);
    return teams;
};
const getListSquads = (emitter, body) => {
    const squads = [];
    let teamID = null, teamName = null, teamTickets = null;
    for (const line of body.split('\n')) {
        const side = line.match(/^Team ID: (\d+) \((.+)\)(?: - Tickets: (-?\d+))?\s*$/);
        if (side) {
            teamID = side[1];
            teamName = side[2];
            teamTickets = side[3] === undefined ? null : Number(side[3]);
            continue;
        }
        const m = line.match(/^ID: (\d+) \| Name: (.+?) \| Size: (\d+) \| Locked: (True|False) \| Creator Name: (.+?) \| Creator Online IDs: (.+)$/);
        if (!m)
            continue;
        const id = ids(m[6]);
        squads.push({
            squadID: m[1],
            squadName: m[2],
            size: m[3],
            locked: m[4],
            creatorName: m[5],
            creatorEOSID: id.eosID,
            creatorSteamID: id.steamID,
            creatorEpicID: id.epicID,
            teamID,
            teamName,
            teamTickets,
        });
    }
    emitter.emit(RconEvents.LIST_SQUADS, squads);
    getListTeams(emitter, body);
    return squads;
};
const getCurrentMap = (rconEmitter, body) => {
    const match = body.match(/^Current level is ([^,\r\n]*), layer is ([^,\r\n]*)/);
    let data = {
        level: null,
        layer: null,
    };
    if (match) {
        data = { level: match[1], layer: match[2] };
    }
    rconEmitter.emit(RconEvents.SHOW_CURRENT_MAP, data);
    return data;
};
const getNextMap = (rconEmitter, body) => {
    const match = body.match(/^Next level is ([^,\r\n]*), layer is ([^,\r\n]*)/);
    let data = {
        level: null,
        layer: null,
    };
    if (match) {
        data = {
            level: match[1] !== '' ? match[1] : null,
            layer: match[2] !== 'To be voted' ? match[2] : null,
        };
    }
    rconEmitter.emit(RconEvents.SHOW_NEXT_MAP, data);
    return data;
};
const getServerInfo = (rconEmitter, body) => {
    var _a, _b;
    try {
        const res = body && body.length && JSON.parse(body);
        const data = {
            serverName: (res === null || res === void 0 ? void 0 : res.ServerName_s) || '',
            maxPlayers: parseInt((res === null || res === void 0 ? void 0 : res.MaxPlayers) || 0),
            publicQueueLimit: parseInt((res === null || res === void 0 ? void 0 : res.PublicQueueLimit_I) || 0),
            reserveSlots: parseInt((res === null || res === void 0 ? void 0 : res.PlayerReserveCount_I) || 0),
            playerCount: parseInt((res === null || res === void 0 ? void 0 : res.PlayerCount_I) || 0),
            a2sPlayerCount: parseInt((res === null || res === void 0 ? void 0 : res.PlayerCount_I) || 0),
            publicQueue: parseInt((res === null || res === void 0 ? void 0 : res.PublicQueue_I) || 0),
            reserveQueue: parseInt((res === null || res === void 0 ? void 0 : res.ReservedQueue_I) || 0),
            currentLayer: (res === null || res === void 0 ? void 0 : res.MapName_s) || '',
            nextLayer: (res === null || res === void 0 ? void 0 : res.NextLayer_s) || '',
            teamOne: ((_a = res === null || res === void 0 ? void 0 : res.TeamOne_s) === null || _a === void 0 ? void 0 : _a.replace(new RegExp(res === null || res === void 0 ? void 0 : res.MapName_s, 'i'), '')) || '',
            teamTwo: ((_b = res === null || res === void 0 ? void 0 : res.TeamTwo_s) === null || _b === void 0 ? void 0 : _b.replace(new RegExp(res === null || res === void 0 ? void 0 : res.MapName_s, 'i'), '')) || '',
            matchTimeout: parseInt((res === null || res === void 0 ? void 0 : res.MatchTimeout_d) || 0),
            matchStartTime: parseInt((res === null || res === void 0 ? void 0 : res.PLAYTIME_I) || 0),
            gameVersion: (res === null || res === void 0 ? void 0 : res.GameVersion_s) || '',
        };
        rconEmitter.emit(RconEvents.SHOW_SERVER_INFO, data);
        return data;
    }
    catch (_c) { }
};
const helpers = {
    getListTeams,
    getListPlayers,
    getListSquads,
    getCurrentMap,
    getNextMap,
    getServerInfo,
};

const commandParser = (rconEmitter, data, command) => {
    switch (command) {
        case 'ListPlayers':
            helpers.getListPlayers(rconEmitter, data);
            break;
        case 'ListSquads':
            helpers.getListSquads(rconEmitter, data);
            break;
        case 'ShowCurrentMap':
            helpers.getCurrentMap(rconEmitter, data);
            break;
        case 'ShowNextMap':
            helpers.getNextMap(rconEmitter, data);
            break;
        case 'ShowServerInfo':
            helpers.getServerInfo(rconEmitter, data);
            break;
    }
};

const EMPTY_PACKET_ID = 100;
const AUTH_PACKET_ID = 101;
class Rcon extends EventEmitter {
    constructor(options) {
        super();
        this.soh = {
            size: 7,
            id: 0,
            type: ERconResponseType.SERVERDATA_RESPONSE,
            body: '',
        };
        this.commandId = 0;
        this.responseBody = '';
        this.connected = false;
        this.lastDataBuffer = Buffer.alloc(0);
        this.responseTaskQueue = [];
        this.lastCommands = [];
        this.encode = (type, id, body) => {
            const size = Buffer.byteLength(body) + 14;
            const buf = Buffer.alloc(size);
            buf.writeInt32LE(size - 4, 0);
            buf.writeInt32LE(id, 4);
            buf.writeInt32LE(type, 8);
            buf.write(body, 12, size - 2, 'utf-8');
            buf.writeInt16LE(0, size - 2);
            return buf;
        };
        for (const option of ['id', 'host', 'port', 'password'])
            if (!(option in options))
                throw new Error(`${option} required!`);
        const { id, host, port, password, pingDelay, autoReconnect = true, autoReconnectDelay = 10000, logEnabled, } = options;
        this.id = id;
        this.host = host;
        this.port = port;
        this.password = password;
        this.pingDelay = pingDelay;
        this.autoReconnect = autoReconnect;
        this.autoReconnectDelay = autoReconnectDelay;
        this.chatListeners = this.chatListeners;
        this.logger = initLogger(id, typeof logEnabled === 'undefined' ? true : logEnabled);
    }
    init() {
        return new Promise((res, rej) => {
            this.once('connected', () => res(true));
            this.once('close', () => rej('Connection error'));
            this.connect();
        });
    }
    close() {
        return new Promise((res) => {
            var _a;
            this.once('close', () => res(true));
            (_a = this.client) === null || _a === void 0 ? void 0 : _a.end();
        });
    }
    execute(command) {
        return new Promise((resolve, reject) => {
            var _a, _b;
            this.lastCommands.push(command);
            this.responseTaskQueue.push((response) => {
                if (!this.connected) {
                    reject();
                }
                resolve(response);
            });
            this.commandId = this.commandId >= 80 ? 1 : this.commandId + 1;
            (_a = this.client) === null || _a === void 0 ? void 0 : _a.write(this.encode(ERconResponseType.SERVERDATA_COMMAND, this.commandId, command));
            (_b = this.client) === null || _b === void 0 ? void 0 : _b.write(this.encode(ERconResponseType.SERVERDATA_COMMAND, EMPTY_PACKET_ID, ''));
        });
    }
    getListPlayers() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.execute('ListPlayers');
            return helpers.getListPlayers(this, response);
        });
    }
    getListSquads() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.execute('ListSquads');
            return helpers.getListSquads(this, response);
        });
    }
    getCurrentMap() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.execute('ShowCurrentMap');
            return helpers.getCurrentMap(this, response);
        });
    }
    getNextMap() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.execute('ShowNextMap');
            return helpers.getNextMap(this, response);
        });
    }
    getServerInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.execute('ShowServerInfo');
            return helpers.getServerInfo(this, response);
        });
    }
    connect() {
        this.lastCommands = [];
        this.responseTaskQueue = [];
        this.client = net.createConnection({
            host: this.host,
            port: this.port,
            noDelay: true,
        });
        this.logger.log('Connecting');
        this.client.on('data', (data) => {
            this.onData(data);
        });
        this.client.on('close', () => {
            this.onCloseConnection();
        });
        this.client.on('error', (error) => {
            this.onErrorConnection(error);
        });
        this.client.once('ready', () => {
            this.onAuth();
        });
    }
    reconnect() {
        this.connected = false;
        if (this.autoReconnect && !this.connected) {
            setTimeout(() => {
                var _a;
                (_a = this.client) === null || _a === void 0 ? void 0 : _a.end();
                this.logger.log('Reconnecting');
                this.connect();
            }, this.autoReconnectDelay);
        }
        clearInterval(this.timerPing);
    }
    onData(data) {
        this.lastDataBuffer = Buffer.concat([this.lastDataBuffer, data], this.lastDataBuffer.byteLength + data.byteLength);
        while (this.lastDataBuffer.byteLength >= 7) {
            const packet = this.decode();
            if (!packet)
                break;
            if (packet.type === ERconResponseType.SERVERDATA_RESPONSE)
                this.onResponse(packet);
            else if (packet.type === ERconResponseType.SERVERDATA_SERVER) {
                chatParser(this, packet, this.chatListeners);
                this.emit('data', packet);
            }
            else if (packet.type === ERconResponseType.SERVERDATA_COMMAND) {
                if (packet.id === AUTH_PACKET_ID) {
                    this.logger.log('Authorization successful');
                    this.onConnected();
                }
                else if (packet.id === -1) {
                    this.logger.error('Authorization failed');
                    this.reconnect();
                }
            }
        }
    }
    onResponse(packet) {
        var _a;
        if (packet.body === '') {
            commandParser(this, this.responseBody, this.lastCommands[0]);
            this.lastCommands.shift();
            (_a = this.responseTaskQueue.shift()) === null || _a === void 0 ? void 0 : _a(this.responseBody);
            this.responseBody = '';
        }
        else if (!packet.body.includes('')) {
            this.responseBody = this.responseBody += packet.body;
        }
        else
            this.badPacket();
    }
    onConnected() {
        if (!this.connected) {
            this.connected = true;
            this.emit('connected');
            this.timerPing = setInterval(() => {
                this.ping();
            }, this.pingDelay || 60000 * 2);
        }
    }
    onAuth() {
        var _a;
        this.logger.log('Authorization in progress');
        (_a = this.client) === null || _a === void 0 ? void 0 : _a.write(this.encode(ERconResponseType.SERVERDATA_AUTH, AUTH_PACKET_ID, this.password));
    }
    onCloseConnection() {
        this.emit('close');
        this.logger.error('Connection close');
        this.reconnect();
    }
    onErrorConnection(error) {
        this.emit('err', error);
        this.logger.error('Connection error');
    }
    decode() {
        if (this.lastDataBuffer[0] === 0 &&
            this.lastDataBuffer[1] === 1 &&
            this.lastDataBuffer[2] === 0 &&
            this.lastDataBuffer[3] === 0 &&
            this.lastDataBuffer[4] === 0 &&
            this.lastDataBuffer[5] === 0 &&
            this.lastDataBuffer[6] === 0) {
            this.lastDataBuffer = this.lastDataBuffer.subarray(7);
            return this.soh;
        }
        const bufSize = this.lastDataBuffer.readInt32LE(0);
        if (bufSize > 8192 || bufSize < 10) {
            this.badPacket();
            return null;
        }
        else if (bufSize <= this.lastDataBuffer.byteLength - 4) {
            const bufId = this.lastDataBuffer.readInt32LE(4);
            const bufType = this.lastDataBuffer.readInt32LE(8);
            if (this.lastDataBuffer[bufSize + 2] !== 0 ||
                this.lastDataBuffer[bufSize + 3] !== 0 ||
                bufId < 0 ||
                bufType < 0 ||
                bufType > 5) {
                this.badPacket();
                return null;
            }
            else {
                const response = {
                    size: bufSize,
                    id: bufId,
                    type: bufType,
                    body: this.lastDataBuffer.toString('utf8', 12, bufSize + 2),
                };
                this.lastDataBuffer = this.lastDataBuffer.subarray(bufSize + 4);
                return response;
            }
        }
        else
            return null;
    }
    badPacket() {
        this.logger.error('Bad packet');
        this.lastDataBuffer = Buffer.alloc(0);
        return null;
    }
    ping() {
        this.logger.log('Ping connection');
        this.execute('PING_CONNECTION');
    }
}

export { ERconResponseType, Rcon, RconEvents, helpers as parsers };
