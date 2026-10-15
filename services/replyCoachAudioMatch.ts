export type RecordedLine = { id: string; text: string; character: string };
export function matchingRecordedLine(lines: RecordedLine[], id: string, japanese: string, character: string) {
  const matches = (line: RecordedLine) => line.text.trim() === japanese.trim() && line.character === character.toUpperCase();
  return lines.find(line => line.id === id && matches(line)) ?? lines.find(matches);
}
