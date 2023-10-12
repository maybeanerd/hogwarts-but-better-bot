import {
  Client,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  VoiceBasedChannel,
} from 'discord.js';
import { channelIDs } from './shared_assets';

const eventDayOfWeek = 7;
const eventWeekOfMonth = 4;

async function createEventIfNoneExist(bot: Client) {
  const guilds = await bot.guilds.fetch();

  const promises = guilds.map(async (partialGuild) => {
    const entireGuild = await partialGuild.fetch();
    const existingScheduledEvents = await entireGuild.scheduledEvents.fetch();

    if (existingScheduledEvents.size === 0) {
      const voiceChannel = (await entireGuild.channels.fetch(
        channelIDs.eventVoiceChannel,
      )) as VoiceBasedChannel | null;

      if (voiceChannel) {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const eventMonth = dayOfWeek > eventDayOfWeek ? today.getMonth() + 1 : today.getMonth();

        entireGuild.scheduledEvents.create({
          name: 'Stammtisch',
          entityType: GuildScheduledEventEntityType.Voice,
          channel: voiceChannel,
          privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
          scheduledStartTime: new Date(
            today.getFullYear(),
            eventMonth,
            7 * (eventWeekOfMonth - 1) + eventDayOfWeek,
            20,
            0,
            0,
          ),
        });
      }
    }
  });

  await Promise.all(promises);
}

export function handleScheduledEvents(bot: Client) {
  // Check every 10 minutes to make sure there is an event
  setInterval(
    async () => {
      await createEventIfNoneExist(bot);
    },
    1000 * 60 * 10,
  );
}
