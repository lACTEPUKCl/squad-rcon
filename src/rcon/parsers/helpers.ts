import EventEmitter from 'events';
import { RconEvents } from '../../events';
import { TMap, TPlayer, TServerInfo, TSquad } from '../../types';

const ids = (text: string) => ({
  eosID: text.match(/\bEOS:\s*([a-f0-9]{32})\b/i)?.[1] || '',
  steamID: text.match(/\bsteam:\s*(\d{17})\b/i)?.[1] || '',
  epicID: text.match(/\bepic:\s*([a-f0-9]{32})\b/i)?.[1] || null,
});
const getListPlayers = (
  emitter: EventEmitter,
  body: string,
): TPlayer[] => {
  const players: TPlayer[] = [];
  for (const line of body
    .split('----- Recently Disconnected Players')[0]
    .split('\n')) {
    const match = line.match(
      /^ID: (\d+) \| Online IDs: (.+?) \| Name: (.+?) \| Team ID: (\d+) \| (?:Party ID: ([^|]+) \| )?Squad ID: (\d+|N\/A) \| Is Leader: (True|False) \| Role: ([^|\r\n]*)(?:\| Vehicle: ([^\r\n]*))?/,
    );
    if (!match) continue;
    const identity = ids(match[2]);
    if (!identity.steamID && !identity.eosID) continue;
    players.push({
      playerID: match[1],
      ...identity,
      playerKey: identity.steamID
        ? `steam:${identity.steamID}`
        : `eos:${identity.eosID}`,
      name: match[3],
      teamID: match[4],
      partyID:
        match[5] && match[5].trim() !== 'N/A'
          ? match[5].trim().replace(/^#/, '')
          : null,
      squadID: match[6] === 'N/A' ? null : match[6],
      isLeader: match[7] === 'True',
      role: match[8].trim(),
      vehicle:
        match[9] && match[9].trim() !== 'N/A'
          ? match[9].trim()
          : null,
    });
  }
  emitter.emit(RconEvents.LIST_PLAYERS, players);
  return players;
};
const getListTeams = (emitter: EventEmitter, body: string) => {
  const teams = [];
  for (const line of body.split('\n')) {
    const m = line.match(
      /^Team ID: (\d+) \((.+)\)(?: - Tickets: (-?\d+))?\s*$/,
    );
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
const getListSquads = (
  emitter: EventEmitter,
  body: string,
): TSquad[] => {
  const squads: TSquad[] = [];
  let teamID: string | null = null,
    teamName: string | null = null,
    teamTickets: number | null = null;
  for (const line of body.split('\n')) {
    const side = line.match(
      /^Team ID: (\d+) \((.+)\)(?: - Tickets: (-?\d+))?\s*$/,
    );
    if (side) {
      teamID = side[1];
      teamName = side[2];
      teamTickets = side[3] === undefined ? null : Number(side[3]);
      continue;
    }
    const m = line.match(
      /^ID: (\d+) \| Name: (.+?) \| Size: (\d+) \| Locked: (True|False) \| Creator Name: (.+?) \| Creator Online IDs: (.+)$/,
    );
    if (!m) continue;
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

const getCurrentMap = (rconEmitter: EventEmitter, body: string) => {
  const match = body.match(
    /^Current level is ([^,\r\n]*), layer is ([^,\r\n]*)/,
  );
  let data: TMap = {
    level: null,
    layer: null,
  };

  if (match) {
    data = { level: match[1], layer: match[2] };
  }

  rconEmitter.emit(RconEvents.SHOW_CURRENT_MAP, data);
  return data;
};

const getNextMap = (rconEmitter: EventEmitter, body: string) => {
  const match = body.match(
    /^Next level is ([^,\r\n]*), layer is ([^,\r\n]*)/,
  );
  let data: TMap = {
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

const getServerInfo = (rconEmitter: EventEmitter, body: string) => {
  try {
    const res = body && body.length && JSON.parse(body);
    const data: TServerInfo = {
      serverName: res?.ServerName_s || '',
      maxPlayers: parseInt(res?.MaxPlayers || 0),
      publicQueueLimit: parseInt(res?.PublicQueueLimit_I || 0),
      reserveSlots: parseInt(res?.PlayerReserveCount_I || 0),
      playerCount: parseInt(res?.PlayerCount_I || 0),
      a2sPlayerCount: parseInt(res?.PlayerCount_I || 0),
      publicQueue: parseInt(res?.PublicQueue_I || 0),
      reserveQueue: parseInt(res?.ReservedQueue_I || 0),
      currentLayer: res?.MapName_s || '',
      nextLayer: res?.NextLayer_s || '',
      teamOne:
        res?.TeamOne_s?.replace(
          new RegExp(res?.MapName_s, 'i'),
          '',
        ) || '',
      teamTwo:
        res?.TeamTwo_s?.replace(
          new RegExp(res?.MapName_s, 'i'),
          '',
        ) || '',
      matchTimeout: parseInt(res?.MatchTimeout_d || 0),
      matchStartTime: parseInt(res?.PLAYTIME_I || 0),
      gameVersion: res?.GameVersion_s || '',
    };

    rconEmitter.emit(RconEvents.SHOW_SERVER_INFO, data);

    return data;
  } catch {}
};

export const helpers = {
  getListTeams,
  getListPlayers,
  getListSquads,
  getCurrentMap,
  getNextMap,
  getServerInfo,
};
