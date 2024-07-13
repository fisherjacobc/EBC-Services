import { Events, Listener } from "@sapphire/framework";
import { Message, MessageFlags } from "discord.js";
import { lexer } from "marked";
import { discordImageToGuilded, convertToGuilded, announceToGuilded } from "../modules/convertToGuilded";

export class CrosspostedListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.MessageUpdate,
      once: true,
    });
  }

  public async run(message: Message) {
    console.log(message);
    if (!message.flags.has(MessageFlags.Crossposted)) return;

    const messageContent = message.content;
    const regex = /<:[a-zA-Z0-9]+:\d+>/g;
    const messageContentWithoutCustomEmojis = messageContent.replace(regex, "");
    const parsed = lexer(messageContentWithoutCustomEmojis);

    const image = await discordImageToGuilded(message.attachments.first());
    const convertedToGuilded = convertToGuilded(parsed, image);

    await announceToGuilded(convertedToGuilded);
  }
}
