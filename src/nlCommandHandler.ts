import { Message } from 'discord.js';
import { findMember } from './bamands';
import { transferredPoints } from './database/allModels';
import { hogwartsHouse } from './types/enums';

const getHouseOfUser: botCommand = {
  name: 'getHouseOfUser',
  dev: true,
  hide: false,
  main(bot, msg) {
    const start = Date.now();
    if (msg.member.roles.cache.find((r) => r.name === 'Ravenclaw')) {
      console.info('The function was called and the User ID is $(user.id)'); // Wieso wird das hier nicht richtig ausgeklammer? Ich dachet TypeScript macht das
    }
  },
};

export async function handle(msg: Message) {
  console.log('got into natural language handler');
  const args = msg.content.split(' ');
  console.log('args: ', args);
  if (args.length < 4 || args[1].toLowerCase() !== 'punkte') {
    return null;
  }
  const amount = Number(args[0]);
  console.log('amount:', amount);
  if (!amount) {
    return msg.reply('invalid amount.');
  }
  if (amount % 10 !== 0) {
    msg.reply(
      'Invalid amount of points supplied, only multiples of 10 allowed.',
    );
  }
  const addition: boolean = args[2].toLowerCase() === 'für';
  console.log('addition?:', addition);

  if (!addition) {
    if (
      !(args[2].toLowerCase() === 'abzug' && args[3].toLowerCase() === 'für')
    ) {
      return msg.reply('i cant tell what youre trying to do tbh.');
    }
  }
  console.log('still addition?:', addition);

  const mentionedUser = addition ? args[3] : args[4];
  console.log('mentioned user:', mentionedUser);

  const mentionedUserId = await findMember(msg.guild!, mentionedUser);
  console.log('userID found:', mentionedUserId);
  if (!mentionedUserId) {
    return msg.reply('found no user of that name, bruh.');
  }

  // do something with our info
  transferredPoints.upsert({
    giver_id: msg.member!.id,
    receiver_id: mentionedUserId,
    amount: addition ? amount : amount * -1,
    date: new Date(),
    house: hogwartsHouse.Slytherin,
    // house: getHogwartsHouse(mentionedUserId), // TODO
    season: 1,
  });

  return msg.reply('done.');
}
