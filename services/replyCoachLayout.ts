type Reply = { japanese: string; romaji: string };
/** Keep readable Japanese/Romaji and reserve stage space for the characters.
 * Very small screens use explicit choice pages, never hidden/clipped choices.
 */
export function replyCoachLayout(width: number, height: number, choices: Reply[]) {
  const wide = width >= 680;
  const columns = wide ? 2 : 1;
  const short = height < 400;
  const japaneseSize = wide ? 17 : short ? 14 : 15;
  const romajiSize = short ? 10 : 11;
  const copyWidth = Math.max(80, (width - 28 - (wide ? 8 : 0)) / columns - 116);
  const rowHeight = Math.max(50, ...choices.map(choice =>
    Math.ceil([...choice.japanese].length * japaneseSize / copyWidth) * (japaneseSize + 4)
    + Math.ceil(choice.romaji.length * romajiSize * 0.58 / copyWidth) * (romajiSize + 4) + 16));
  const header = short ? 80 : 112;
  const maxPanel = height * (short ? 0.72 : 0.62);
  const rows = Math.max(1, Math.floor((maxPanel - header) / (rowHeight + 6)));
  let perPage = Math.min(Math.max(1, choices.length), rows * columns);
  if (perPage < choices.length) perPage = Math.max(1, Math.floor((maxPanel - header - 34) / (rowHeight + 6))) * columns;
  if (choices.length === 4 && perPage === 3) perPage = 2;
  const pages = Math.max(1, Math.ceil(choices.length / perPage));
  const panelHeight = Math.max(Math.min(maxPanel, height * 0.48), header + Math.ceil(perPage / columns) * (rowHeight + 6) + (pages > 1 ? 34 : 0));
  return { columns, short, japaneseSize, romajiSize, perPage, pages, panelHeight };
}
