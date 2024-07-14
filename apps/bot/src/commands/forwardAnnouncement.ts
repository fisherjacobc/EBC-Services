import { Command } from "@sapphire/framework";
import { ApplicationCommandType, MessageContextMenuCommandInteraction } from "discord.js";
import { lexer } from "marked";
import {
  announceToGuilded,
  convertToGuilded,
  discordImageToGuilded,
} from "../resources/modules/convertToGuilded";

export class ForwardAnnouncementCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: "Forward the announcement to Roblox",
      preconditions: ["isDirectorate", "GuildOnly"],
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerContextMenuCommand(
      (builder) => builder.setName("Forward Announcement").setType(ApplicationCommandType.Message),
      {
        idHints: ["1261710985572384790"],
      },
    );
  }

  public override async contextMenuRun(interaction: MessageContextMenuCommandInteraction) {
    const messageContent = interaction.targetMessage.content;
    const regex = /<:[a-zA-Z0-9]+:\d+>/g;
    const messageContentWithoutCustomEmojis = messageContent.replace(regex, "");
    const parsed = lexer(messageContentWithoutCustomEmojis);

    const image = await discordImageToGuilded(interaction.targetMessage.attachments.first());
    const convertedToGuilded = convertToGuilded(parsed, image);

    return interaction.reply({
      content: await announceToGuilded(convertedToGuilded),
      ephemeral: true,
    });
  }
}
