import { ApplicationCommandRegistries, SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import { config as dotenv } from "dotenv";
import Config from "./#config";
dotenv();

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN: string;

      GUILDED_REQUEST_URL: string;
      GUILDED_HEADERS: string;
    }
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    isDirectorate: never;
    isGoverningBoard: never;
  }
}

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
  loadMessageCommandListeners: true,
});

ApplicationCommandRegistries.setDefaultGuildIds([Config.guildId])
client.login(process.env.DISCORD_TOKEN);