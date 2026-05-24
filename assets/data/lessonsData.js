const lessonsData = [
  {
    id: 1,
    title: "Introduction to Japanese Writing Systems",
    pages: [
      {
        title: "Overview of Writing Systems",
        sections: [
          {
            content: "The Japanese language, spoken by over 128 million people, is primarily written using a combination of three scripts: Hiragana, Katakana, and Kanji."
          },
          {
            title: "What is Kana?",
            content: "Kana represents syllabic sounds and consists of two categories: Hiragana and Katakana.",
          },
          {
            title: "Hiragana",
            content: "Hiragana is used for native Japanese words and grammatical elements.",
            imageUrl: "https://files.tofugu.com/articles/japanese/2016-04-05-hiragana-chart/hiragana-origins-chart-sample.jpg"
          },
          {
            title: "Katakana",
            content: "Katakana is used for foreign words, loanwords, and scientific terms.",
            imageUrl: "https://files.tofugu.com/articles/japanese/2017-07-13-katakana-chart/wikipedia-katatkana-chart.jpg"
          },
          {
            title: "Kanji",
            content: "Kanji are characters borrowed from Chinese, used for most nouns, verbs, adjectives, and adverbs.",
            imageUrl: "https://example.com/kanji.png"
          }
        ]
      },
      {
        title: "Introduction to Hiragana Characters",
        sections: [
          {
            title: "Hiragana Characters",
            content: "Now let's dive deeper into Hiragana and start with some basic characters.",
            imageUrl: "https://files.tofugu.com/articles/japanese/2016-04-05-hiragana-chart/hiragana-full-chart.jpg"
          },
          {
            title: "Hiragana Practice",
            content: "Practice writing the characters with proper stroke order to master Hiragana."
          }
        ]
      },
      {
        title: "Play Hiragana Game",
        game: "LessonKanaGame",
        gameData: {
          characters: [
            { kana: 'あ', roman: 'a' },
            { kana: 'い', roman: 'i' },
          ],
          instructions: "Match each kana with its corresponding romaji."
        }
      }
    ]
  }
];

export default lessonsData;
