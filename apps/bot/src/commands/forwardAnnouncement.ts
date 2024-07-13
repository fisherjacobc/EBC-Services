import { Command } from '@sapphire/framework';
import { ApplicationCommandType, MessageContextMenuCommandInteraction } from 'discord.js';
import { lexer } from 'marked';

export class ForwardAnnouncementCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Forward the announcement to Roblox',
      preconditions: ["isDirectorate", "GuildOnly"],
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerContextMenuCommand((builder) =>
      builder
        .setName("Forward Announcement")
        .setType(ApplicationCommandType.Message)
    , {
        idHints: ["1261710985572384790"]
    });
  }

  public override contextMenuRun(interaction: MessageContextMenuCommandInteraction) {
    const messageContent = interaction.targetMessage.content;
    const regex = /<:[a-zA-Z0-9]+:\d+>/g;
    const messageContentWithoutCustomEmojis = messageContent.replace(regex, '');

    return interaction.reply({ 
      content: `\`\`\`json\n${JSON.stringify(lexer(messageContent))}\n\`\`\``, 
      ephemeral: true
    })
  }
}