import { ClientUser, GuildMember } from 'discord.js';
import { hogwartsHouse } from './types/enums';

export const PREFIX = 'hbbb';
export const { TOKEN } = process.env;
export const DETAILED_LOGGING = false;
export const DELETE_COMMANDS = false;
export const COLOR = 0x351c75;
export const SUCCESS_COLOR = 0x00ff00;
export const ERROR_COLOR = 0x0000ff;
export const INFO_COLOR = 0x0000ff;
export const SIGN = 'Hausbot - created by T0TProduction#0001 and h31nd5#0315';

export const channelIDs = {
  punktetracker: '781622087801634816',
  errorchannel: '781597906100158504',
};

let bot_user: ClientUser;
export function setUser(usr: ClientUser) {
  bot_user = usr;
}
export function user() {
  return bot_user;
}

export const hogwartsHouses = new Map([
  ['slytherin', hogwartsHouse.Slytherin],
  ['gryffindor', hogwartsHouse.Gryffindor],
  ['hufflepuff', hogwartsHouse.Hufflepuff],
  ['ravenclaw', hogwartsHouse.Ravenclaw],
]);

export const productionMode = process.env.NODE_ENV !== 'development';

export function isAdmin(usr: GuildMember | null) {
  return (
    usr
    && usr.roles.cache.find((role) => role.name.toLowerCase() === 'hauslehrer:in')
  );
}
