import { Command } from "@sapphire/framework";
import { lexer } from "marked";
import {
  discordImageToGuilded,
  convertToGuilded,
  announceToGuilded,
} from "../resources/modules/convertToGuilded";

export class AnnounceCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { ...options, preconditions: ["isSupervisorOrAbove"] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName("announce")
        .setDescription("Make an announcement on the group page")
        .addStringOption((option) =>
          option.setName("title").setDescription("Announcement Title").setRequired(true),
        )
        .addStringOption((option) =>
          option.setName("content").setDescription("The contents of the announcement").setRequired(true),
        )
        .addAttachmentOption((option) =>
          option.setName("image").setDescription("An image attachment").setRequired(false),
        ),
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const title = interaction.options.getString("title", true);
    const messageContent = interaction.options.getString("content", true);
    const parsed = lexer(`# ${title}\n${messageContent}`);

    const image = await discordImageToGuilded(interaction.options.getAttachment("image", false));
    const convertedToGuilded = convertToGuilded(parsed, image);

    return interaction.reply({
      content: await announceToGuilded(convertedToGuilded),
      ephemeral: true,
    });
  }
}
