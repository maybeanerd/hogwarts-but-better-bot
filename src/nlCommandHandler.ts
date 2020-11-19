import Discord, { Message } from 'discord.js';
import { findMember } from './bamands';
import { transferredPoints } from './database/allModels';
import { hogwartsHouses } from './shared_assets';

async function getHouseOfUser(member: Discord.GuildMember) {
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
  const args = msg.content.split(' ').filter((arg) => arg !== '');
  console.log('args: ', args);
  if (args.length < 4 || args[1].toLowerCase() !== 'punkte') {
    return null;
  }
  const amount = Number(args[0]);
  if (!amount) {
    return msg.reply('invalid amount.');
  }
  if (amount % 10 !== 0) {
    return msg.reply(
      'Invalid amount of points supplied, only multiples of 10 allowed.',
    );
  }
  const addition: boolean = args[2].toLowerCase() === 'für';
  if (!addition) {
    if (
      !(args[2].toLowerCase() === 'abzug' && args[3].toLowerCase() === 'für')
    ) {
      return msg.reply('I cant tell what youre trying to do tbh.');
    }
  }
  const mentionedUser = addition ? args[3] : args[4];
  const { user, error } = await findMember(msg.guild!, mentionedUser);

  if (error) {
    return msg.reply(`Found no user of that name, bruh.\n${error}`);
  }
  const userHouse = await getHouseOfUser(user!);
  if (!userHouse) {
    return msg.reply(`${user!.displayName} doesn't seem to have a house.`);
  }

  // do something with our info
  transferredPoints.upsert({
    giver_id: msg.member!.id,
    receiver_id: user!.id,
    amount: addition ? amount : amount * -1,
    date: new Date(),
    house: userHouse,
    season: 1,
  });

  return msg.reply('done.');
}
