type Reply = { japanese: string; romaji: string };
/** Keep readable Japanese/Romaji and reserve stage space for the characters.
 * Every reply stays in one continuous list, with scrolling for overflow.
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
  // Only the compact choice heading lives here; the task/context is above.
  const header = 78;
  const maxPanel = Math.max(0, height * (short ? 0.72 : 0.62));
  // Text wrapping and accessibility font sizes can exceed our estimate. The
  // actual panel stays bounded; its ScrollView makes any overflow reachable.
  const panelHeight = Math.min(maxPanel, header + Math.ceil(choices.length / columns) * (rowHeight + 6));
  return { columns, short, japaneseSize, romajiSize, panelHeight };
}
