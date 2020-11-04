import { Message } from 'discord.js';
import { findMember } from './bamands';
import { transferredPoints } from './database/allModels';
import { hogwartsHouses } from './shared_assets';

async function getHouseOfUser(memberID: string, msg: Message) {
  const member = await msg.guild?.members.fetch(memberID);
  if (!member) {
    return null;
  }
  const role = member.roles.cache.find((r) => hogwartsHouses.has(r.id));
  if (!role) {
    return null;
  }
  return hogwartsHouses.get(role.id) || null;
}

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

  const userHouse = await getHouseOfUser(mentionedUserId, msg);
  if (!userHouse) {
    return msg.reply('the user doesn\'t seem to have a house.');
  }

  // do something with our info
  transferredPoints.upsert({
    giver_id: msg.member!.id,
    receiver_id: mentionedUserId,
    amount: addition ? amount : amount * -1,
    date: new Date(),
    house: userHouse,
    season: 1,
  });

  return msg.reply('done.');
}
