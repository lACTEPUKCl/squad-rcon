import EventEmitter from 'events';

declare const RconEvents: {
    LIST_TEAMS: string;
    CHAT_MESSAGE: string;
    POSSESSED_ADMIN_CAMERA: string;
    UNPOSSESSED_ADMIN_CAMERA: string;
    PLAYER_WARNED: string;
    PLAYER_KICKED: string;
    PLAYER_BANNED: string;
    SQUAD_CREATED: string;
    LIST_PLAYERS: string;
    LIST_SQUADS: string;
    SHOW_CURRENT_MAP: string;
    SHOW_NEXT_MAP: string;
    SHOW_SERVER_INFO: string;
};

type TRconOptions = {
    id: number;
    host: string;
    port: number;
    password: string;
    pingDelay?: number;
    autoReconnect?: boolean;
    autoReconnectDelay?: number;
    logEnabled?: boolean;
    chatListeners?: TChatListeners;
};
type TChatListeners = {
    onChatMessage?: (data: TChatMessage) => void;
    onPlayerWarned?: (data: TPlayerWarned) => void;
    onPlayerKicked?: (data: TPlayerKicked) => void;
    onPlayerBanned?: (data: TPlayerBanned) => void;
    onSquadCreated?: (data: TSquadCreated) => void;
    onPossessedAdminCamera?: (data: TPossessedAdminCamera) => void;
    onUnPossessedAdminCamera?: (data: TUnPossessedAdminCamera) => void;
};
type TRconResponse = {
    id: number;
    type: ERconResponseType;
    size: number;
    body: string;
};
type TPlayer = {
    playerKey?: string;
    partyID?: string | null;
    vehicle?: string | null;
    epicID?: string | null;
    playerID: string;
    eosID: string;
    steamID: string;
    name: string;
    teamID: string;
    squadID: string | null;
    isLeader: boolean;
    role: string;
};
type TSquad = {
    teamTickets?: number | null;
    creatorEpicID?: string | null;
    squadID: string;
    squadName: string;
    size: string;
    locked: string;
    creatorName: string;
    creatorEOSID: string;
    creatorSteamID: string;
    teamID: string | null;
    teamName: string | null;
};
type TChatMessage = {
    raw: string;
    chat: string;
    eosID: string;
    steamID: string;
    name: string;
    message: string;
    time: Date;
};
type TPossessedAdminCamera = {
    raw: string;
    eosID: string;
    steamID: string;
    name: string;
    time: Date;
};
type TUnPossessedAdminCamera = {
    raw: string;
    eosID: string;
    steamID: string;
    name: string;
    time: Date;
};
type TPlayerWarned = {
    raw: string;
    reason: string;
    name: string;
    time: Date;
};
type TPlayerKicked = {
    raw: string;
    playerID: string;
    eosID: string;
    steamID: string;
    name: string;
    time: Date;
};
type TSquadCreated = {
    raw: string;
    name: string;
    eosID: string;
    steamID: string;
    squadID: string;
    squadName: string;
    teamName: string;
    time: Date;
};
type TPlayerBanned = {
    raw: string;
    playerID: string;
    steamID: string;
    name: string;
    interval: string;
    time: Date;
};
type TMap = {
    level: string | null;
    layer: string | null;
};
type TServerInfo = {
    serverName: string;
    maxPlayers: number;
    publicQueueLimit: number;
    reserveSlots: number;
    playerCount: number;
    a2sPlayerCount: number;
    publicQueue: number;
    reserveQueue: number;
    currentLayer: string;
    nextLayer: string;
    teamOne: string;
    teamTwo: string;
    matchTimeout: number;
    matchStartTime: number;
    gameVersion: string;
};
type TResponseTaskQueue = (response: string) => void;
declare enum ERconResponseType {
    SERVERDATA_AUTH = 3,
    SERVERDATA_COMMAND = 2,
    SERVERDATA_SERVER = 1,
    SERVERDATA_RESPONSE = 0
}
type TTeam = {
    teamID: string;
    teamName: string;
    tickets: number | null;
};

declare class Rcon extends EventEmitter {
    readonly id: number;
    private client?;
    private readonly host;
    private readonly port;
    private readonly password;
    private readonly pingDelay?;
    private readonly autoReconnect?;
    private readonly autoReconnectDelay?;
    private readonly chatListeners?;
    private readonly soh;
    private readonly logger;
    private commandId;
    private responseBody;
    private connected;
    private lastDataBuffer;
    private timerPing?;
    private responseTaskQueue;
    private lastCommands;
    constructor(options: TRconOptions);
    init(): Promise<unknown>;
    close(): Promise<unknown>;
    execute(command: string): Promise<string>;
    getListPlayers(): Promise<TPlayer[]>;
    getListSquads(): Promise<TSquad[]>;
    getCurrentMap(): Promise<TMap>;
    getNextMap(): Promise<TMap>;
    getServerInfo(): Promise<TServerInfo | undefined>;
    private connect;
    private reconnect;
    private onData;
    private onResponse;
    private onConnected;
    private onAuth;
    private onCloseConnection;
    private onErrorConnection;
    private encode;
    private decode;
    private badPacket;
    private ping;
}

declare const helpers: {
    getListTeams: (emitter: EventEmitter, body: string) => {
        teamID: string;
        teamName: string;
        tickets: number | null;
    }[];
    getListPlayers: (emitter: EventEmitter, body: string) => TPlayer[];
    getListSquads: (emitter: EventEmitter, body: string) => TSquad[];
    getCurrentMap: (rconEmitter: EventEmitter, body: string) => TMap;
    getNextMap: (rconEmitter: EventEmitter, body: string) => TMap;
    getServerInfo: (rconEmitter: EventEmitter, body: string) => TServerInfo | undefined;
};

export { ERconResponseType, Rcon, RconEvents, helpers as parsers };
export type { TChatListeners, TChatMessage, TMap, TPlayer, TPlayerBanned, TPlayerKicked, TPlayerWarned, TPossessedAdminCamera, TRconOptions, TRconResponse, TResponseTaskQueue, TServerInfo, TSquad, TSquadCreated, TTeam, TUnPossessedAdminCamera };
