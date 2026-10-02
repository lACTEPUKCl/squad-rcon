import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { parsers } from '../lib/index.js';
const eos='a'.repeat(32), epic='b'.repeat(32), steam='76561198000000000';
test('roster preserves Steam and Epic without fabricating Steam identities',()=>{
 const row=(identity,extra='')=>`ID: 4 | Online IDs: EOS: ${eos} ${identity} | Name: Игрок | Team ID: 1 | ${extra}Squad ID: N/A | Is Leader: False | Role: USA_Rifleman_01`;
 const parse=body=>parsers.getListPlayers(new EventEmitter(),body);
 assert.equal(parse(row(`steam: ${steam}`))[0].steamID,steam);
 const p=parse(row(`epic: ${epic}`,'Party ID: #0 | ')+' | Vehicle: Test (Driver)')[0];
 assert.equal(p.steamID,'');assert.equal(p.epicID,epic);assert.equal(p.playerKey,`eos:${eos}`);assert.equal(p.partyID,'0');assert.equal(p.vehicle,'Test (Driver)');assert.equal(p.role,'USA_Rifleman_01');
 assert.equal(parse(`----- Active Players -----\n${row(`steam: ${steam}`)}\n----- Recently Disconnected Players [Max of 15] -----\n${row(`steam: ${steam}`)}`).length,1);
});
test('tickets remain available even for teams with no squads',()=>{
 const emitter=new EventEmitter();let teams;emitter.on('ListTeams',v=>teams=v);
 const squads=parsers.getListSquads(emitter,`Team ID: 1 (First) - Tickets: 100\nID: 2 | Name: Test | Size: 3 | Locked: True | Creator Name: Leader | Creator Online IDs: EOS: ${eos} epic: ${epic}\nTeam ID: 2 (Second) - Tickets: 0`);
 assert.equal(squads[0].creatorSteamID,'');assert.equal(squads[0].creatorEpicID,epic);assert.equal(squads[0].teamTickets,100);
 assert.deepEqual(teams,[{teamID:'1',teamName:'First',tickets:100},{teamID:'2',teamName:'Second',tickets:0}]);
});
test('map metadata never becomes part of the layer',()=>{
 assert.equal(parsers.getCurrentMap(new EventEmitter(),'Current level is Sumari Bala, layer is Sumari_Seed_v1, factions USA WPMC').layer,'Sumari_Seed_v1');
 assert.equal(parsers.getNextMap(new EventEmitter(),'Next level is Skorpo, layer is Skorpo_RAAS_v1, factions RGF+Support AFU+Support').layer,'Skorpo_RAAS_v1');
});
