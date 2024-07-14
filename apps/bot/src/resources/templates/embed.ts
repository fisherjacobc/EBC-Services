import { EmbedBuilder } from "discord.js";
import colors from "../constants/colors";
import emojis from "../constants/emojis";

const defaultBlankEmbed = new EmbedBuilder().setColor(colors.Blank);

export default {
  information: (body: string): EmbedBuilder =>
    defaultBlankEmbed.setDescription(`${emojis.fleetpoint.InfoGradient} ${body}`),

  notification: (body: string): EmbedBuilder =>
    defaultBlankEmbed.setDescription(`${emojis.fleetpoint.BellGradient} ${body}`),

  loading: (body: string): EmbedBuilder =>
    defaultBlankEmbed.setDescription(`${emojis.fleetpoint.Loading} ${body}`),

  success: (body: string): EmbedBuilder =>
    defaultBlankEmbed.setDescription(`${emojis.fleetpoint.CheckmarkGradient} ${body}`),

  err: (body: string): EmbedBuilder =>
    defaultBlankEmbed.setDescription(`${emojis.fleetpoint.XMarkRed} ${body}`),
};
