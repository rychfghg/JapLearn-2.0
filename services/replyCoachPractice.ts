// Supplementary, untimed examples for the original chapter. Never replace admin-authored content.
export const coachExamples = [
  ['Friends meet at school. Greet them warmly.', 'おはよう！', 'Ohayou!', 'Good morning!', 'いただきます。', 'Itadakimasu.', 'Before eating.', 'A greeting fits meeting friends; itadakimasu belongs before a meal.'],
  ['Ask a station employee where the exit is.', 'すみません、出口はどこですか。', 'Sumimasen, deguchi wa doko desu ka.', 'Excuse me, where is the exit?', '早く教えて。', 'Hayaku oshiete.', 'Tell me quickly.', 'Sumimasen gets attention politely; the question explains what you need.'],
  ['People are leaving a bus. What should you do before boarding?', '降りる人を待ちます。', 'Oriru hito o machimasu.', 'Wait for people getting off.', '押して入ります。', 'Oshite hairimasu.', 'Push inside.', 'Let people leave before you board, just as on a train.'],
  ['Your phone rings in a quiet library. What should you do?', 'マナーモードにします。', 'Manaa moodo ni shimasu.', 'Switch to silent mode.', '大声で話します。', 'Oogoe de hanashimasu.', 'Speak loudly.', 'Silent mode avoids disturbing people in a shared quiet space.'],
  ['You enter a temple courtyard. Choose a respectful action.', '静かに歩きます。', 'Shizuka ni arukimasu.', 'Walk quietly.', '大声で叫びます。', 'Oogoe de sakebimasu.', 'Shout loudly.', 'Quiet behavior shows consideration for the place and other visitors.'],
  ['A bakery clerk says irasshaimase. Choose a suitable action.', '軽く会釈します。', 'Karuku eshaku shimasu.', 'Give a small nod.', 'いらっしゃいませ。', 'Irasshaimase.', 'Welcome to the store.', 'Irasshaimase welcomes customers; you do not need to welcome the clerk back.'],
  ['Hand a ticket to a staff member for checking.', 'お願いします。', 'Onegaishimasu.', 'Please.', '早くして。', 'Hayaku shite.', 'Hurry up.', 'Onegaishimasu politely accompanies a request; hayaku shite sounds demanding here.'],
  ['A restaurant employee asks your party size. There are two of you.', '二人です。', 'Futari desu.', 'Two people.', '三人です。', 'Sannin desu.', 'Three people.', 'Futari desu gives the requested number accurately and politely.'],
  ['Politely order water from a server.', '水をお願いします。', 'Mizu o onegaishimasu.', 'Water, please.', '早く持ってきて。', 'Hayaku motte kite.', 'Bring it quickly.', 'Naming the item and adding onegaishimasu makes the request clear and polite.'],
  ['Breakfast is served, and you have not started eating.', 'いただきます。', 'Itadakimasu.', 'Said before eating.', 'ごちそうさまでした。', 'Gochisousama deshita.', 'Thank you for the meal.', 'Itadakimasu is used before eating; gochisousama deshita comes after.'],
  ['You pause during dinner. Where should you put your chopsticks?', '箸置きに置きます。', 'Hashioki ni okimasu.', 'On the chopstick rest.', 'ご飯に立てます。', 'Gohan ni tatemasu.', 'Upright in the rice.', 'Use the rest; standing chopsticks upright in rice has funeral associations.'],
  ['You have finished dinner at a host family’s home.', 'ごちそうさまでした。', 'Gochisousama deshita.', 'Thank you for the meal.', 'いただきます。', 'Itadakimasu.', 'Said before eating.', 'Thank the people who provided the meal after you finish.'],
  ['Greet your teacher when you arrive at school in the morning.', 'おはようございます。', 'Ohayou gozaimasu.', 'Good morning, politely.', '元気？', 'Genki?', 'You good?', 'Ohayou gozaimasu is a polite morning greeting suitable for your teacher.'],
  ['An unfamiliar adult gives you a souvenir. Thank them.', 'ありがとうございます。', 'Arigatou gozaimasu.', 'Thank you very much.', 'これだけ？', 'Kore dake?', 'Is this all?', 'Express gratitude rather than questioning the amount of the gift.'],
  ['A classmate’s family invites you inside their house.', 'おじゃまします。', 'Ojama shimasu.', 'Excuse me for intruding.', 'ただいま。', 'Tadaima.', 'I’m home.', 'Ojama shimasu is for entering as a guest; tadaima announces your return home.'],
  ['You have removed your shoes at a friend’s entrance.', '靴をそろえます。', 'Kutsu o soroemasu.', 'Arrange the shoes neatly.', '靴を散らかします。', 'Kutsu o chirakashimasu.', 'Leave the shoes scattered.', 'Neat shoes keep the entrance usable and show care for the host’s space.'],
  ['Your host offers you water. Accept it with thanks.', 'ありがとうございます。', 'Arigatou gozaimasu.', 'Thank you very much.', '水。', 'Mizu.', 'Water.', 'Thanking the host acknowledges their effort; naming the drink alone does not.'],
  ['You accidentally knock a host’s book onto the floor.', 'すみません。拾います。', 'Sumimasen. Hiroimasu.', 'I’m sorry. I’ll pick it up.', '本が悪い。', 'Hon ga warui.', 'The book is at fault.', 'Apologize and offer to put things right instead of blaming an object.'],
  ['An older passenger asks you to move your bag.', 'はい、わかりました。', 'Hai, wakarimashita.', 'Yes, understood.', '自分でやって。', 'Jibun de yatte.', 'Do it yourself.', 'A respectful acknowledgment fits a reasonable request from someone you do not know.'],
  ['Thank a friend after studying together and say goodbye.', '今日はありがとう。またね！', 'Kyou wa arigatou. Mata ne!', 'Thanks for today. See you!', 'やっと帰れる。', 'Yatto kaereru.', 'Finally, I can leave.', 'Thanks and a friendly goodbye acknowledge the time you spent together.'],
] as const;

export function getCoachExample(chapterTitle: string, nodeId: string) {
  if (chapterTitle !== 'A Day of First Impressions') return null;
  const match = /^decision-(\d+)$/.exec(nodeId);
  return match ? coachExamples[Number(match[1]) - 1] ?? null : null;
}

const partners = ['Sumi and Haru · friends', 'Station employee', 'Other passengers', 'Other passengers', 'Other temple visitors', 'Shop clerk', 'Checkout clerk', 'Restaurant staff', 'Restaurant server', 'Dining companions', 'Dining companions', 'Restaurant staff / host', 'Teacher', 'Host family', 'Host family', 'Host family', 'Host family', 'Host family', 'Older neighbor', 'Sumi and Haru · friends'];
export function getCoachPartner(chapterTitle: string, nodeId: string) {
  if (chapterTitle !== 'A Day of First Impressions') return null;
  const match = /^decision-(\d+)$/.exec(nodeId);
  return match ? partners[Number(match[1]) - 1] ?? null : null;
}

export function getCoachExplanation(answer?: { evaluation: string; explanation: string; culturalNote: string; selectedText: string; bestResponse: string }) {
  if (!answer) return '';
  // Preserve specific instructor-authored explanations. Replace only the stock generic feedback.
  const generic = ['This is the most natural and context-appropriate response.', 'This works, although another response sounds more natural here.', 'The words are valid Japanese, but they do not match this moment.', 'This can make the listener uncomfortable because it is dismissive or disrespectful.'];
  if (!generic.includes(answer.explanation) || !answer.culturalNote) return answer.explanation;
  return answer.evaluation === 'BEST' || answer.evaluation === 'ACCEPTABLE'
    ? answer.culturalNote
    : `Your reply means “${answer.selectedText}”. ${answer.culturalNote}`;
}

// Walk incoming story edges, not array positions: published chapters may be reordered.
export function getCoachContext<T extends { id: string; type: string; nextNodeId?: string; title?: string; speaker?: string }>(nodes: T[], decisionId: string) {
  const dialogue: T[] = [];
  const visited = new Set<string>([decisionId]);
  let cursor = decisionId;
  let scene: T | undefined;
  while (visited.size <= nodes.length) {
    const previous = nodes.find(node => node.nextNodeId === cursor && !visited.has(node.id));
    if (!previous || previous.type === 'CHOICE' || previous.type === 'REACTION') break;
    visited.add(previous.id);
    if (previous.type === 'NARRATION') { scene = previous; break; }
    if (previous.type === 'DIALOGUE') dialogue.unshift(previous);
    cursor = previous.id;
  }
  return { scene, dialogue };
}
