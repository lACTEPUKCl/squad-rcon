import EventEmitter from 'events';
import { TChatListeners, TRconResponse } from '../../types';
export declare function chatParser(rconEmitter: EventEmitter, packet: TRconResponse, listeners?: TChatListeners): void;
