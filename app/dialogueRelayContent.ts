export type RelayChoice = {
  id: string;
  label: string;
  japanese: string;
  romaji: string;
  correct: boolean;
  evaluation: 'BEST' | 'ACCEPTABLE' | 'AWKWARD' | 'RUDE';
  points: number;
  explanation: string;
  example: string;
  reaction: string;
};

export type RelayQuestion = {
  prompt: string;
  coach: string;
  choices: RelayChoice[];
};

export type RelayScene = {
  id: string;
  title: string;
  place: string;
  narration: string;
  etiquette: string;
  sumi: string;
  sumiRomaji: string;
  haru: string;
  haruRomaji: string;
  background: any;
  questions: RelayQuestion[];
};

const good = (id: string, label: string, japanese: string, romaji: string, explanation: string, example: string): RelayChoice => ({
  id, label, japanese, romaji, correct: true, evaluation: 'BEST', points: 3, explanation, example, reaction: 'いいですね。丁寧で、状況に合っています。',
});
const bad = (id: string, label: string, japanese: string, romaji: string, explanation: string, example: string): RelayChoice => ({
  id, label, japanese, romaji, correct: false, evaluation: 'RUDE', points: 0, explanation, example, reaction: '惜しいです。相手と場所に合う言い方を選びましょう。',
});
const middleByScene: Record<string, [string,string,string,string]> = {
  w:['すみません、これはここですか？','Sumimasen, kore wa koko desu ka?','ごみのことは、よく分かりません。','Gomi no koto wa, yoku wakarimasen.'],
  p:['すみません、荷物についてです。','Sumimasen, nimotsu ni tsuite desu.','あとで、またお願いします。','Ato de, mata onegaishimasu.'],
  c:['すみません、少し教えてください。','Sumimasen, sukoshi oshiete kudasai.','ちょっと具合が悪いです。','Chotto guai ga warui desu.'],
  m:['すみません、飲み方を確認したいです。','Sumimasen, nomikata o kakunin shitai desu.','たぶん、分かりました。','Tabun, wakarimashita.'],
  o:['このルールで合っていますか？','Kono ruuru de atte imasu ka?','みんなと同じにします。','Minna to onaji ni shimasu.'],
  r:['ここで脱げばいいですか？','Koko de nugeba ii desu ka?','たぶん、このままで大丈夫です。','Tabun, kono mama de daijoubu desu.'],
  f:['写真は大丈夫でしょうか？','Shashin wa daijoubu deshou ka?','一枚だけ撮りたいです。','Ichimai dake toritai desu.'],
  a:['食材を確認してもいいですか？','Shokuzai o kakunin shite mo ii desu ka?','これはたぶん食べられます。','Kore wa tabun taberaremasu.'],
  k:['落とし物について相談したいです。','Otoshimono ni tsuite soudan shitai desu.','財布がどこかにありません。','Saifu ga dokoka ni arimasen.'],
  e:['係員の指示を確認します。','Kakariin no shiji o kakunin shimasu.','急いで自分で決めます。','Isoide jibun de kimemasu.'],
};
const middle = (correct: RelayChoice): [RelayChoice,RelayChoice] => {
  const x=middleByScene[correct.id[0]] ?? middleByScene.w;
  return [
    {id:`${correct.id}-b`,label:'Polite but broad',japanese:x[0],romaji:x[1],correct:false,evaluation:'ACCEPTABLE',points:2,explanation:'This is polite and may work, but it leaves an important detail for the other person to clarify.',example:correct.example,reaction:'分かりました。もう少し詳しく教えてください。'},
    {id:`${correct.id}-c`,label:'Understandable but vague',japanese:x[2],romaji:x[3],correct:false,evaluation:'AWKWARD',points:1,explanation:'The general meaning may be understood, but the uncertainty makes the next action unclear.',example:correct.example,reaction:'そうですか。もう一度、確認しましょう。'},
  ];
};
const question = (prompt: string, coach: string, correct: RelayChoice, incorrect: RelayChoice, flip = false): RelayQuestion => {
  const [acceptable,awkward]=middle(correct);
  const ordered=flip?[awkward,correct,incorrect,acceptable]:[correct,acceptable,awkward,incorrect];
  return {prompt,coach,choices:ordered};
};

const neighborhood = require('../assets/img/background/dialogue-relay-neighborhood.png');
const clinic = require('../assets/img/background/dialogue-relay-clinic.png');
const ryokan = require('../assets/img/background/dialogue-relay-ryokan.png');

export const RELAY_SCENES: RelayScene[] = [
  {
    id: 'waste', title: 'Sort It Right', place: 'Neighborhood collection point', background: neighborhood,
    narration: 'It is collection morning. Sumi and Haru help a new neighbor read the signs before the truck arrives.',
    etiquette: 'Waste rules differ by municipality. Check the local category, collection day, and designated bag instead of guessing.',
    sumi: 'このびんは、今日出してもいいですか？', sumiRomaji: 'Kono bin wa, kyou dashite mo ii desu ka?', haru: '看板には「燃えるごみ」と書いてあります。', haruRomaji: 'Kanban ni wa "moeru gomi" to kaite arimasu.',
    questions: [
      question('The bottle does not match today’s category. What should you say?', 'Prevent a sorting mistake without sounding harsh.', good('w1a','Stop and check the schedule','今日はびんの日ではありません。確認しましょう。','Kyou wa bin no hi dewa arimasen. Kakunin shimashou.','This politely explains the mismatch and proposes checking together.','今日は燃えるごみの日です。びんは水曜日です。'), bad('w1b','Leave it anyway','たぶん大丈夫です。ここに置きましょう。','Tabun daijoubu desu. Koko ni okimashou.','Leaving incorrectly sorted waste can inconvenience neighbors and collection staff.','掲示を確認して、正しい日に出しましょう。')),
      question('A neighbor shows you the designated bag. How do you respond?', 'Thank them and confirm you understood.', good('w2a','Thank and confirm','ありがとうございます。この袋を使います。','Arigatou gozaimasu. Kono fukuro o tsukaimasu.','The response acknowledges the help and confirms the action.','教えてくださって、ありがとうございます。'), bad('w2b','Dismiss the advice','袋は何でもいいです。','Fukuro wa nandemo ii desu.','This dismisses a local rule and sounds careless.','指定の袋を使います。'), true),
      question('The sign is difficult to read. What is the best request?', 'Ask for clarification rather than pretending to understand.', good('w3a','Ask politely','すみません、この漢字を教えていただけますか？','Sumimasen, kono kanji o oshiete itadakemasu ka?','This is a respectful request for help.','すみません、これは何曜日ですか？'), bad('w3b','Guess silently','分かりました。','Wakarimashita.','Saying you understand when you do not can create a preventable mistake.','分からないときは、確認しても大丈夫です。')),
    ],
  },
  {
    id: 'parcel', title: 'Missed Delivery', place: 'Apartment entrance', background: neighborhood,
    narration: 'A delivery notice is in the mailbox. The driver is still nearby, but Haru is unsure how to request another delivery.',
    etiquette: 'A short apology plus a clear request keeps service interactions smooth. Provide a practical time window.',
    sumi: '不在票がありますね。再配達をお願いできます。', sumiRomaji: 'Fuzaihyou ga arimasu ne. Saihaitatsu o onegai dekimasu.', haru: '電話で何と言えばいいでしょうか？', haruRomaji: 'Denwa de nan to ieba ii deshou ka?',
    questions: [
      question('How should Haru begin the call?', 'Identify the purpose clearly and politely.', good('p1a','Request redelivery','不在票を見ました。再配達をお願いできますか？','Fuzaihyou o mimashita. Saihaitatsu o onegai dekimasu ka?','The driver immediately understands the reason for the call.','今日の午後、再配達をお願いできますか？'), bad('p1b','Give no context','荷物。今日。','Nimotsu. Kyou.','Fragments can sound abrupt and do not clearly explain the request.','不在票について、お電話しました。'), true),
      question('The driver proposes 7 p.m. What is a clear reply?', 'Confirm both availability and thanks.', good('p2a','Confirm the time','はい、七時に家にいます。ありがとうございます。','Hai, shichiji ni ie ni imasu. Arigatou gozaimasu.','This confirms someone will receive the parcel and closes courteously.','七時でお願いします。'), bad('p2b','Stay vague','たぶんいます。','Tabun imasu.','A vague answer may cause another missed delivery.','七時に受け取れます。')),
    ],
  },
  {
    id: 'clinic', title: 'At the Clinic', place: 'Local clinic reception', background: clinic,
    narration: 'Sumi accompanies Haru to a clinic. The waiting room is quiet and the receptionist needs concise information.',
    etiquette: 'At reception, state the symptom, when it began, and whether you have an appointment. Keep your phone quiet.',
    sumi: '受付では、症状を短く伝えましょう。', sumiRomaji: 'Uketsuke de wa, shoujou o mijikaku tsutaemashou.', haru: '昨日から、のどが痛いです。', haruRomaji: 'Kinou kara, nodo ga itai desu.',
    questions: [
      question('The receptionist asks what is wrong. Which answer helps most?', 'Give a symptom and a useful time reference.', good('c1a','Describe the symptom','昨日から、のどが痛いです。','Kinou kara, nodo ga itai desu.','This gives the staff actionable information.','今朝から熱があります。'), bad('c1b','Give no useful detail','ちょっとだめです。','Chotto dame desu.','This is too vague for reception staff to understand the problem.','どこが痛いか、いつからかを伝えましょう。')),
      question('You do not understand a form. What should you do?', 'Ask before writing incorrect information.', good('c2a','Ask for help','すみません、ここは何を書きますか？','Sumimasen, koko wa nani o kakimasu ka?','This politely requests specific guidance.','この言葉の意味を教えてください。'), bad('c2b','Fill it randomly','適当に書きます。','Tekitou ni kakimasu.','Incorrect medical information can cause confusion.','分からない項目は受付で確認しましょう。'), true),
      question('Your phone rings in the waiting room. What is appropriate?', 'Protect the quiet shared space.', good('c3a','Silence it','すみません。マナーモードにします。','Sumimasen. Manaamoodo ni shimasu.','Silencing the phone respects patients and staff.','電話は外でかけます。'), bad('c3b','Take a loud call','ここで大きな声で話します。','Koko de ookina koe de hanashimasu.','A loud call disturbs a medical waiting area.','待合室では静かにしましょう。')),
    ],
  },
  {
    id: 'pharmacy', title: 'Medicine Check', place: 'Community pharmacy', background: clinic,
    narration: 'At the pharmacy counter, Sumi reminds Haru to confirm how and when to take the medicine.',
    etiquette: 'Do not guess dosage instructions. Repeat key details back and mention allergies or other medicines.',
    sumi: '薬の飲み方を確認しましょう。', sumiRomaji: 'Kusuri no nomikata o kakunin shimashou.', haru: '食後ですか、食前ですか？', haruRomaji: 'Shokugo desu ka, shokuzen desu ka?',
    questions: [
      question('You missed the dosage explanation. What should you ask?', 'Request repetition and specify what you need.', good('m1a','Ask again slowly','すみません、もう一度ゆっくりお願いします。','Sumimasen, mou ichido yukkuri onegaishimasu.','This is clear, polite, and safer than guessing.','一日に何回ですか？'), bad('m1b','Pretend to understand','はい、全部分かりました。','Hai, zenbu wakarimashita.','Pretending to understand medicine instructions can be unsafe.','大切な説明は必ず確認しましょう。')),
      question('The pharmacist asks about allergies. Which response is useful?', 'Answer directly; add detail if you know it.', good('m2a','Answer clearly','はい、ペニシリンのアレルギーがあります。','Hai, penishirin no arerugii ga arimasu.','This gives medically relevant information directly.','アレルギーはありません。'), bad('m2b','Avoid answering','それは言いたくないです。','Sore wa iitakunai desu.','Withholding relevant allergy information can affect safe dispensing.','分かる範囲で正確に伝えましょう。'), true),
    ],
  },
  {
    id: 'onsen', title: 'Onsen Basics', place: 'Ryokan bath entrance', background: ryokan,
    narration: 'Sumi and Haru arrive at a hot spring. A sign explains washing, towels, and the shared bath.',
    etiquette: 'Wash before entering the bath. Keep the small towel out of the bathwater and follow posted facility rules.',
    sumi: 'まず、体を洗ってから入りましょう。', sumiRomaji: 'Mazu, karada o aratte kara hairimashou.', haru: 'タオルは湯船に入れませんね。', haruRomaji: 'Taoru wa yubune ni iremasen ne.',
    questions: [
      question('What should happen before entering the shared bath?', 'Choose the action that keeps the water clean.', good('o1a','Wash first','先に体を洗います。','Saki ni karada o araimasu.','Washing first is a core shared-bath custom.','かけ湯をしてから入ります。'), bad('o1b','Enter immediately','すぐ湯船に入ります。','Sugu yubune ni hairimasu.','Entering without washing disregards shared-bath hygiene.','先に洗い場を使いましょう。')),
      question('Where should the small towel stay?', 'Keep it out of the bathwater.', good('o2a','Outside the water','タオルは湯船の外に置きます。','Taoru wa yubune no soto ni okimasu.','This keeps the shared water clean.','頭の上に置く人もいます。'), bad('o2b','Inside the bath','タオルをお湯に入れます。','Taoru o oyu ni iremasu.','Towels should not be dipped in the shared bath.','施設の掲示も確認しましょう。'), true),
    ],
  },
  {
    id: 'ryokan', title: 'Shoes and Slippers', place: 'Traditional ryokan corridor', background: ryokan,
    narration: 'At the genkan, the floor level changes. Sumi points out where outdoor shoes end and indoor slippers begin.',
    etiquette: 'Remove outdoor shoes at the entrance. Slipper rules can change at tatami rooms and toilets, so watch the floor and signs.',
    sumi: 'ここで靴を脱ぎます。', sumiRomaji: 'Koko de kutsu o nugimasu.', haru: '畳の部屋では、スリッパも脱ぎますね。', haruRomaji: 'Tatami no heya de wa, surippa mo nugimasu ne.',
    questions: [
      question('What do you do at the raised entrance?', 'Follow the indoor/outdoor boundary.', good('r1a','Remove shoes','ここで靴を脱ぎます。','Koko de kutsu o nugimasu.','This respects the clean indoor area.','靴をそろえて置きます。'), bad('r1b','Walk in with shoes','靴のまま入ります。','Kutsu no mama hairimasu.','Outdoor shoes should not cross into the clean indoor space.','入口の段差を確認しましょう。')),
      question('You reach a tatami room wearing slippers. What now?', 'Tatami is normally entered without slippers.', good('r2a','Remove slippers','畳の前でスリッパを脱ぎます。','Tatami no mae de surippa o nugimasu.','This follows common tatami-room etiquette.','スリッパをそろえて置きます。'), bad('r2b','Keep them on','スリッパで畳を歩きます。','Surippa de tatami o arukimasu.','Slippers can soil or damage tatami.','部屋ごとの案内も確認しましょう。'), true),
    ],
  },
  {
    id: 'photo', title: 'Ask Before Photos', place: 'Quiet temple street', background: neighborhood,
    narration: 'Haru wants a photo of a craftsperson and a small shop interior. Sumi pauses before the camera comes out.',
    etiquette: 'Ask before photographing people or private interiors. Respect no-photo signs and accept refusal immediately.',
    sumi: '写真を撮る前に、聞きましょう。', sumiRomaji: 'Shashin o toru mae ni, kikimashou.', haru: '人の顔も写りますね。', haruRomaji: 'Hito no kao mo utsurimasu ne.',
    questions: [
      question('How do you request a photo?', 'Ask permission before raising the camera.', good('f1a','Ask permission','すみません、写真を撮ってもいいですか？','Sumimasen, shashin o totte mo ii desu ka?','This gives the person a real choice.','店内の写真は大丈夫ですか？'), bad('f1b','Photograph silently','何も言わずに撮ります。','Nani mo iwazu ni torimasu.','Photographing people without permission can be intrusive.','撮影禁止の表示も確認しましょう。')),
      question('The shopkeeper says photography is not allowed. What next?', 'Accept the boundary courteously.', good('f2a','Accept and thank','分かりました。ありがとうございます。','Wakarimashita. Arigatou gozaimasu.','This respects the decision without pressure.','失礼しました。'), bad('f2b','Argue','一枚だけだから、いいでしょう。','Ichimai dake dakara, ii deshou.','Pressuring after refusal is disrespectful.','断られたら、すぐカメラをしまいましょう。'), true),
    ],
  },
  {
    id: 'allergy', title: 'Food Allergy', place: 'Small restaurant', background: clinic,
    narration: 'A menu looks delicious, but Haru has a serious allergy. Sumi helps ask precise questions before ordering.',
    etiquette: 'State the allergen clearly and confirm ingredients. If staff cannot guarantee safety, choose another dish or restaurant.',
    sumi: '注文する前に、アレルギーを伝えましょう。', sumiRomaji: 'Chuumon suru mae ni, arerugii o tsutaemashou.', haru: '私はえびが食べられません。', haruRomaji: 'Watashi wa ebi ga taberaremasen.',
    questions: [
      question('How do you state a shrimp allergy?', 'Be direct and specific.', good('a1a','State the allergy','えびのアレルギーがあります。','Ebi no arerugii ga arimasu.','This clearly identifies a health concern.','えびが入っていますか？'), bad('a1b','Say only dislike','えびはあまり好きじゃないです。','Ebi wa amari suki janai desu.','A preference does not communicate the medical risk.','アレルギーだとはっきり伝えましょう。')),
      question('Staff are unsure whether the sauce contains shrimp. What is safest?', 'Do not rely on a guess for a serious allergy.', good('a2a','Choose another item','では、別の料理にします。','Dewa, betsu no ryouri ni shimasu.','Choosing an item with clear ingredients reduces risk.','確認できる料理をお願いします。'), bad('a2b','Risk it','たぶん大丈夫です。食べます。','Tabun daijoubu desu. Tabemasu.','Uncertainty is not safe when an allergy is serious.','安全を優先しましょう。'), true),
      question('The chef confirms a safe dish. How do you respond?', 'Acknowledge the extra care.', good('a3a','Thank the staff','確認してくださって、ありがとうございます。','Kakunin shite kudasatte, arigatou gozaimasu.','This politely recognizes the staff’s effort.','こちらをお願いします。'), bad('a3b','Say nothing','早く持ってきてください。','Hayaku motte kite kudasai.','This sounds demanding after the staff provided careful help.','お礼を伝えて注文しましょう。')),
    ],
  },
  {
    id: 'koban', title: 'Lost Property', place: 'Neighborhood kōban', background: neighborhood,
    narration: 'Haru cannot find a wallet. Sumi leads the way to a nearby police box and helps organize the details.',
    etiquette: 'At a kōban, explain what was lost, where and when you last saw it, and distinguishing details.',
    sumi: '交番で、落とし物について相談できます。', sumiRomaji: 'Kouban de, otoshimono ni tsuite soudan dekimasu.', haru: '黒い財布をなくしました。', haruRomaji: 'Kuroi saifu o nakushimashita.',
    questions: [
      question('How should Haru open the report?', 'State the lost item clearly.', good('k1a','Report the item','すみません、財布をなくしました。','Sumimasen, saifu o nakushimashita.','This immediately states why help is needed.','落とし物について相談したいです。'), bad('k1b','Be unclear','困っています。','Komatte imasu.','This shows distress but not what assistance is needed.','何をなくしたか伝えましょう。')),
      question('The officer asks where it was last seen. Which answer helps?', 'Give a location and time.', good('k2a','Give details','午後三時ごろ、駅で使いました。','Gogo sanji goro, eki de tsukaimashita.','Time and place help narrow the search.','電車に乗る前に見ました。'), bad('k2b','Give no detail','どこか分かりません。以上です。','Dokoka wakarimasen. Ijou desu.','Ending without sharing any known detail limits the search.','分かる範囲で時間や場所を伝えましょう。'), true),
      question('How do you describe the wallet?', 'Mention color and identifying contents.', good('k3a','Describe it','黒くて、中に学生証があります。','Kurokute, naka ni gakuseishou ga arimasu.','Distinctive details help confirm ownership.','小さい黒い財布です。'), bad('k3b','Use only “normal”','普通の財布です。','Futsuu no saifu desu.','“Normal” does not distinguish it from other items.','色、形、中身を伝えましょう。')),
    ],
  },
  {
    id: 'quake', title: 'Earthquake Response', place: 'Public building evacuation area', background: ryokan,
    narration: 'The floor begins to shake. Sumi and Haru follow staff instructions instead of rushing toward the exit.',
    etiquette: 'Protect yourself first, avoid elevators, follow official instructions, and move calmly once it is safe.',
    sumi: 'まず、頭を守ってください。', sumiRomaji: 'Mazu, atama o mamotte kudasai.', haru: '揺れが止まるまで、ここにいます。', haruRomaji: 'Yure ga tomaru made, koko ni imasu.',
    questions: [
      question('What is the immediate priority during shaking?', 'Protect yourself from falling objects.', good('e1a','Protect your head','頭を守って、低くなります。','Atama o mamotte, hikuku narimasu.','This prioritizes immediate physical safety.','丈夫な机の下に入ります。'), bad('e1b','Run outside at once','すぐ外へ走ります。','Sugu soto e hashirimasu.','Rushing during strong shaking can expose you to falling glass and objects.','揺れが収まってから避難します。')),
      question('The elevator doors open after the shaking. What should you choose?', 'Use the marked evacuation route.', good('e2a','Use stairs','エレベーターではなく、階段を使います。','Erebeetaa dewa naku, kaidan o tsukaimasu.','Elevators may stop or become unsafe after an earthquake.','係員の指示に従います。'), bad('e2b','Use elevator','早いので、エレベーターを使います。','Hayai node, erebeetaa o tsukaimasu.','Speed is not the priority when elevators may fail.','非常口の表示を確認しましょう。'), true),
      question('A staff member gives an evacuation instruction you missed. What do you say?', 'Ask for a clear repeat rather than separating from the group.', good('e3a','Ask for repetition','すみません、もう一度ゆっくりお願いします。','Sumimasen, mou ichido yukkuri onegaishimasu.','This keeps communication clear in a safety-critical moment.','どこへ行けばいいですか？'), bad('e3b','Walk away alone','分からないので、一人で行きます。','Wakaranai node, hitori de ikimasu.','Leaving alone can separate you from official guidance.','分からないときは係員に確認しましょう。')),
    ],
  },
];

export const RELAY_TOTAL_RESPONSES = RELAY_SCENES.reduce((sum, scene) => sum + scene.questions.length, 0);

export const RELAY_TRIVIA: Record<string, string[]> = {
  waste: [
    'Collection days and sorting categories are set locally, so the rules can change when you move to another city or ward.',
    'Rinsing containers and following the designated bag rules helps collection workers process recyclable waste correctly.',
  ],
  parcel: [
    'A missed-delivery notice is called a fuzaihyou. It normally includes ways to request redelivery by phone or online.',
    'Giving a time when someone will definitely be home prevents another failed delivery attempt.',
  ],
  clinic: [
    'At reception, saying when a symptom began is often more useful than only saying that you feel unwell.',
    'Japanese waiting rooms are shared quiet spaces; silence the phone and take necessary calls outside.',
  ],
  pharmacy: [
    'Shokugo means after a meal and shokuzen means before a meal. Ask again whenever the timing is unclear.',
    'Medicine safety and conversational politeness are separate: accurate allergy information matters more than pretending to understand.',
  ],
  onsen: [
    'The washing area is used before the shared bath. The bath itself is for soaking, not washing.',
    'Rules about towels, tattoos, hair, and swimwear can differ by facility, so posted guidance takes priority.',
  ],
  ryokan: [
    'The raised entrance marks the transition from outdoor shoes to the clean indoor floor.',
    'Toilet slippers are normally kept inside the toilet area and should not be worn back into the hallway.',
  ],
  photo: [
    'Permission to enter a place does not automatically mean permission to photograph its people or interior.',
    'When someone declines a photo, accepting immediately is more respectful than explaining why you only want one picture.',
  ],
  allergy: [
    'Saying arerugii clearly communicates a health risk; saying you merely dislike an ingredient may not.',
    'Cross-contact can still be possible even when an ingredient is not listed, so uncertainty should be treated seriously.',
  ],
  koban: [
    'A kōban is a neighborhood police box where people can ask directions and report lost property.',
    'Time, place, color, shape, and identifying contents make a lost-item report much easier to match.',
  ],
  quake: [
    'During strong shaking, protect your head and stay away from falling glass before attempting to evacuate.',
    'After the shaking, follow official instructions and marked stairs; elevators may stop or become unsafe.',
  ],
};
