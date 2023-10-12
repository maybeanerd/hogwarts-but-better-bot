import {
  Client,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  VoiceBasedChannel,
} from 'discord.js';
import { channelIDs } from './shared_assets';

// Zero based offsets
const eventDayOfWeek = 6; // sunday
const eventWeekOfMonth = 3; // 4th week of the month

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
        // TODO figure out this date logic, its most likely wrong
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
            // TODO fix this since this is definitely wrong
            7 * eventWeekOfMonth + eventDayOfWeek,
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
