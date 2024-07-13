import { Precondition } from "@sapphire/framework";
import type { Message, CommandInteraction, ContextMenuCommandInteraction, GuildMember } from "discord.js";
import Config from "../#config";

export class IsGoverningBoardPrecondition extends Precondition {
  public override async messageRun(message: Message) {
    // for Message Commands
    return this.checkPermission(message.member as GuildMember);
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    // for Slash Commands
    return this.checkPermission(interaction.member as GuildMember);
  }

  public override async contextMenuRun(
    interaction: ContextMenuCommandInteraction
  ) {
    // for Context Menu Command
    return this.checkPermission(interaction.member as GuildMember);
  }

  private async checkPermission(member: GuildMember) {
    return member.roles.cache.has(Config.roleIds.governingBoard) ? this.ok() : this.error({ message: "You aren't part of the Directorate" })
  }
}
