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
export const SIGN = 'Hausbot - created by T0TProduction#0001 for Hogwarts but better';

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

export const channelIDs = productionMode
  ? {
    pointtracker: '785162601007939645',
    errorchannel: '785162879556911144',
    logchannel: '785162879556911144',
  }
  : {
    pointtracker: '781622087801634816',
    errorchannel: '781597906100158504',
    logchannel: '781597906100158504',
  };

export function isAdmin(usr: GuildMember | null) {
  return (
    usr
    && usr.roles.cache.find((role) => role.name.toLowerCase() === 'hauslehrer:in')
  );
}
