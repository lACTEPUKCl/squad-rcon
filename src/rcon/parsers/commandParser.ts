import EventEmitter from 'events';
import { helpers } from './helpers';

export const commandParser = (
  rconEmitter: EventEmitter,
  data: string,
  command: string,
) => {
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
    default:
      break;
  }
};
