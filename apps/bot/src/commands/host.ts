import { Subcommand } from "@sapphire/plugin-subcommands";
import { parseDate } from "chrono-node";
import bloxlinkGuild from "@codiium/bloxlink-api/guild";
import embed from "../resources/templates/embed";
import Config from "../#config";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import colors from "../resources/constants/colors";

export class HostCommand extends Subcommand {
  public constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
    super(context, {
      ...options,
      name: "host",
      subcommands: [
        {
          name: "route",
          chatInputRun: "hostRoute",
        },
        {
          name: "training",
          chatInputRun: "hostTraining",
        },
      ],
    });
  }

  registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName("host")
        .setDescription("Host command") // Needed even though base command isn't displayed to end user
        .addSubcommand((command) =>
          command
            .setName("route")
            .setDescription("Host a route")
            .addStringOption((option) =>
              option
                .setName("time")
                .setDescription("The time this will be hosted (can be relative or exact time)")
                .setRequired(true),
            )
            .addStringOption((option) =>
              option.setName("notes").setDescription("(Optional) Notes for the Route").setRequired(false),
            )
            .addUserOption((option) =>
              option.setName("co-host").setDescription("(Optional) Route Co-Host").setRequired(false),
            ),
        )
        .addSubcommand((command) =>
          command
            .setName("training")
            .setDescription("Host a training")
            .addStringOption((option) =>
              option
                .setName("time")
                .setDescription("The time this will be hosted (can be relative or exact time)")
                .setRequired(true),
            )
            .addStringOption((option) =>
              option.setName("notes").setDescription("(Optional) Notes for the Route").setRequired(false),
            )
            .addUserOption((option) =>
              option.setName("co-host").setDescription("(Optional) Training Co-Host").setRequired(false),
            ),
        ),
    );
  }

  public async hostRoute(interaction: Subcommand.ChatInputCommandInteraction) {
    interaction.deferReply();
    const { client } = this.container;
    const { options: args } = interaction;

    const host = interaction.user;
    const time = args.getString("time", true);

    const parsedTime = parseDate(time, {
      timezone: "ET",
    });
    if (!parsedTime)
      return interaction.editReply({
        embeds: [embed.err("Unable to parse date, please try again.")],
      });

    let bloxlinkUser: string;
    try {
      bloxlinkUser = (await bloxlinkGuild.DiscordToRoblox(Config.guildId, host.id)).robloxID;
    } catch (error) {
      return interaction.editReply({
        embeds: [embed.err("You aren't linked with Bloxlink! Link your account, and then try again")],
      });
    }

    const routeEmbed = new EmbedBuilder()
      .setColor(colors.Blank)
      .setDescription("## Route: Redwater, Virginia")
      .addFields(
        {
          name: ":bust_in_silhouette: Host",
          value: `<@${interaction.user.id}>`,
          inline: true,
        },
        {
          name: ":bust_in_silhouette: Co-Host",
          value: args.getUser("cohost", false) ? `<@${args.getUser("cohost", false)?.id}>` : "N/A",
          inline: true,
        },
        {
          name: ":clock3: Time",
          value: `**<t:${parsedTime.getTime() / 1000}> (<t:${parsedTime.getTime() / 1000}:R>)**`,
        },
        {
          name: ":pencil: Notes",
          value: args.getString("notes") || "No notes provided",
        },
        {
          name: ":globe_with_meridians: Link",
          value: "https://www.roblox.com/games/12254854680/Redwater-Virginia",
        },
      )
      .setAuthor({
        name: `@${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      // biome-ignore lint/style/noNonNullAssertion: client exists
      .setThumbnail(client.user!.displayAvatarURL())
      .setFooter({
        // biome-ignore lint/style/noNonNullAssertion: client exists
        text: client.user!.username,
        // biome-ignore lint/style/noNonNullAssertion: client exists
        iconURL: client.user!.displayAvatarURL(),
      })
      .setTimestamp();

    const postButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("Post")
      .setCustomId(`${interaction.user.id}@host.post`);
    const cancelButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setLabel("Cancel")
      .setCustomId(`${interaction.user.id}@host.cancel`);

    const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(postButton, cancelButton);

    return interaction.editReply({
      content: "Please confirm that everything looks correct, then press post.",
      embeds: [routeEmbed],
      components: [buttonsRow],
    });
  }
}
