export interface ChineseRoomRule {
    input: string;           // Chinese characters (input)
    pattern: string;         // Pattern description for the rule book
    output: string;          // Response in Chinese
    meaning: string;         // What it actually means (hidden initially)
    category: string;        // Type of conversation  
}

export const chineseRoomRules: ChineseRoomRule[] = [
    {
        input: '你好',
        pattern: 'Two characters with radicals 亻and 女',
        output: '你好！很高兴见到你。',
        meaning: 'Hello! → Hello! Nice to meet you.',
        category: 'greeting'
    },
    {
        input: '你叫什么名字？',
        pattern: 'Seven characters ending with question mark radical 什么',
        output: '我是一个人工智能助手。',
        meaning: 'What is your name? → I am an AI assistant.',
        category: 'identity'
    },
    {
        input: '天气怎么样？',
        pattern: 'Five characters with 天 radical and question marker',
        output: '今天天气很好，阳光明媚。',
        meaning: 'How is the weather? → The weather is nice today, sunny and bright.',
        category: 'smalltalk'
    },
    {
        input: '你能帮我吗？',
        pattern: 'Six characters with 帮 radical and question marker吗',
        output: '当然可以！我很乐意帮助你。',
        meaning: 'Can you help me? → Of course! I\'d be happy to help you.',
        category: 'request'
    },
    {
        input: '这是什么？',
        pattern: 'Four characters with demonstrative 这 and query 什么',
        output: '这是一个学习系统。',
        meaning: 'What is this? → This is a learning system.',
        category: 'question'
    },
    {
        input: '谢谢你',
        pattern: 'Three characters with gratitude radical 谢谢',
        output: '不客气！',
        meaning: 'Thank you → You\'re welcome!',
        category: 'courtesy'
    },
    {
        input: '我爱你',
        pattern: 'Three characters with heart radical 爱',
        output: '我也很关心你。',
        meaning: 'I love you → I care about you too.',
        category: 'emotion'
    },
    {
        input: '再见',
        pattern: 'Two characters indicating farewell 再见',
        output: '再见！祝你有美好的一天。',
        meaning: 'Goodbye → Goodbye! Have a nice day.',
        category: 'farewell'
    },
];
