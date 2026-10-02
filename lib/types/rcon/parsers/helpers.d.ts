import EventEmitter from 'events';
import { TMap, TPlayer, TServerInfo, TSquad } from '../../types';
export declare const helpers: {
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
