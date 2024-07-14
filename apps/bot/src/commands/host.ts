import { Subcommand } from "@sapphire/plugin-subcommands";
import { casual } from "chrono-node";
import embed from "../resources/templates/embed";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import colors from "../resources/constants/colors";

const customTimeParser = casual.clone();
customTimeParser.refiners.push({
  refine: (context, results) => {
    // If there is no AM/PM (meridiem) specified,
    //  let all time between 0:00 - 06:00 be PM (12.00 - 18.00)
    results.forEach((result) => {
      if (
        !result.start.isCertain("meridiem") &&
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        result.start.get("hour")! >= 0 &&
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        result.start.get("hour")! < 6
      ) {
        result.start.assign("meridiem", 1);
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        result.start.assign("hour", result.start.get("hour")! + 12);
      }
    });
    return results;
  },
});

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
    // interaction.deferReply();

    const { client } = this.container;
    const { options: args } = interaction;

    const host = interaction.user;
    const time = args.getString("time", true);

    const parsedTime = customTimeParser.parseDate(time, {
      timezone: "ET",
    });
    if (!parsedTime)
      return interaction.editReply({
        embeds: [embed.err("Unable to parse date, please try again.")],
      });

    const routeEmbed = new EmbedBuilder()
      .setColor(colors.Blank)
      .setDescription("## Route: Redwater, Virginia")
      .addFields(
        {
          name: ":bust_in_silhouette: Host",
          value: `<@${host.id}>`,
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
        name: `@${host.username}`,
        iconURL: host.displayAvatarURL(),
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
      .setCustomId(`${host.id}@host.post`);
    const cancelButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setLabel("Cancel")
      .setCustomId(`${host.id}@host.cancel`);

    const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(postButton, cancelButton);

    return interaction.reply({
      content: "Please confirm that everything looks correct, then press post.",
      embeds: [routeEmbed],
      components: [buttonsRow],
    });
  }
}
