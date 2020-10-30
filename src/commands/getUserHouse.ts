import { accessLevel } from '../types/enums';

export const getHouseOfUser: botCommand = {
  name: 'getHouseOfUser',
  dev: true,
  hide: false,
  main(bot, msg) {
    const start = Date.now();
    // if (msg.member.roles.has(user.id))
    // }
    if(msg.member.roles.cache.find(r => r.name === "Admin")) {
      // Your code
      console.info('The function was called and the User ID is $(user.id)') // Wieso wird das hier nicht richtig ausgeklammer? Ich dachet TypeScript macht das 
    }}; // Was macht eslint hier?
  }

// Wo kann ich jetzt den code rein tun damit ich ihn easy auführen kann
// Welche Rollen gibt es alles noch?
// Gibt es eine bessere Möglichkeit um die Rolle rauszufinden? Selber einfach nochmal googlen und nachschauen, nicht dass ich das unnötig kompliziert mache