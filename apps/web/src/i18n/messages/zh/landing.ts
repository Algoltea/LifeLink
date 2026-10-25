import type { Messages } from "../en";

const landing: Messages["landing"] = {
  everydayHelp: {
    displaySettings: [
      { label: "文字大小", value: "较大" },
      { label: "朗读回复", value: "开 · 较慢" },
      { label: "减少动画", value: "开" },
      { label: "对比度", value: "更强" },
      { label: "通话字幕", value: "开" },
    ],
    intro:
      "给家人发消息、管理预约和提醒，处处都有大字和朗读。任何要发送的内容，仍然会等您确认。",
    messages: {
      description:
        "通过 iMessage、电子邮件、Discord 或 Telegram 给家人写信。“帮我理解”会解释您收到的消息，并提供几条回复供您选择。",
      imageAlt:
        "玛丽·卡萨特《信》：一位身穿蓝色花纹裙的女子在书桌前封好一封信。",
      imageCaption: "玛丽·卡萨特，《信》，1890–91 年。",
      title: "给家人的消息",
    },
    read: {
      description:
        "更大的文字、更强的对比度、字幕和更慢的朗读声音。随时可以用说话代替打字。您的设置在每个页面都有效。",
      imageAlt:
        "爱德华·马奈《读书的女人》：一位身穿深色外套、头戴帽子的女子在户外阅读画报。",
      imageCaption: "爱德华·马奈，《读书的女人》，1880–82 年。",
      title: "阅读、收听或说话",
    },
    reminder: {
      approve: "批准提醒",
      changeTime: "更改时间",
      title: "新提醒",
      version: "第 1 版",
      what: "给 Ana 打电话",
      when: "11 月 1 日星期日 · 上午 11:00",
      youSaid: "您说：“提醒我星期日给 Ana 打电话。”",
    },
    reminders: {
      description:
        "“今天”先显示需要您处理的事，然后是预约和提醒。说出要记住的事，LifeLink 会记下来，等您批准。",
      title: "预约和提醒",
    },
    tab: "日常帮助",
    thread: {
      helpMeUnderstand: "帮我理解",
      reply: "当然！9:45 去你家接你？我可能会带上 Max。",
      sent: "上午 9:05 已发送 · 第 2 版",
      sentMessage: "Sam 你好，10 月 27 日星期二能开车送我去 Patel 医生那里吗？",
    },
    title: "LifeLink 能帮您做什么",
    today: {
      comingUp: "即将到来",
      confirmPickup: "确认 Sam 9:45 来接您",
      greeting: "下午好，Ruth",
      review: "查看",
      rows: [
        { detail: "提醒 · 今天", time: "晚上 8:00", title: "晚间服药" },
        { detail: "尚未确认", time: "上午 9:45", title: "Sam 来接您" },
        {
          detail: "10 月 27 日星期二",
          time: "上午 10:30",
          title: "Patel 医生",
        },
      ],
      waiting: "等您处理",
    },
  },
  features: {
    hint: "示例。滚动页面或指向某一行，即可在这里看到 LifeLink 的对应部分。",
    items: {
      circle: {
        name: "信任圈",
        summary:
          "用邀请码邀请某人，选择对方能看到什么、能看多久，并可随时停止分享。",
      },
      connections: {
        name: "连接",
        summary: "每个账号都清楚说明哪些功能可用、哪些还没准备好、哪些不提供。",
      },
      documents: {
        name: "文档",
        summary: "您的 Google 云端硬盘文件，每个都有预览。",
      },
      email: {
        name: "电子邮件",
        summary: "标出看起来像诈骗的邮件，并起草绝不会自行发送的回复。",
      },
      family: {
        name: "家人视图",
        summary: "家人看到的页面：只显示您分享的内容，附有照片和回复的地方。",
      },
      groceries: {
        name: "购物",
        summary: "带预算和价格估算的购物清单，可以复制或打印带去商店。",
      },
      help: {
        name: "我喜欢的帮助方式",
        summary: "简短或详细的回答，一次一步，使用您选择的语言。",
      },
      recap: {
        name: "对话回顾",
        summary: "把已经说定的事和只是提议的事分开，并建议下一步。",
      },
      today: {
        name: "今天",
        summary: "先显示需要您处理的事，然后是预约、天气和您选的三条新闻标题。",
      },
    },
    titleLine1: "它还能",
    titleLine2: "做这些",
  },
  footer: {
    credits: {
      afterLicense: "，维基共享资源。界面示例使用的是示例数据。",
      byAuthor: "，作者 RedKnight7，",
      morse: "。莫尔斯电键与记录器，1876 年：公有领域，维基共享资源。",
      paintings:
        "玛丽·卡萨特《信》；爱德华·马奈《读书的女人》；克劳德·莫奈《普尔维尔的悬崖漫步》和《睡莲池》；让-雅克·德·布瓦修《老人与读书的男孩》：公有领域（CC0），",
      telegram: "1959 年西联电报",
    },
    getStarted: "开始使用",
    label: "页脚",
    links: {
      everydayHelp: "日常帮助",
      howItWorks: "使用方式",
      language: "语言",
      ourPromise: "我们的承诺",
      questions: "常见问题",
      scamCheck: "诈骗检查",
    },
    pictures: "图片",
    signIn: "登录",
    solitaire: "纸牌接龙",
    tagline: "帮您处理日常消息。您不同意，什么都不会发送。",
  },
  hero: {
    getStarted: "开始使用",
    imageAlt:
      "克劳德·莫奈《普尔维尔的悬崖漫步》：两个人站在开满鲜花的悬崖上，下方是明亮的大海和帆船。",
    imageCaption: "克劳德·莫奈，《普尔维尔的悬崖漫步》，1882 年。",
    intro:
      "LifeLink 帮您给家人写信、记住预约，并检查看起来可疑的短信或信件。每条消息您都会完整读过，再决定是否批准。",
    seeHowItWorks: "看看如何使用",
    titleLine1: "您不同意，",
    titleLine2: "什么都不会发送。",
  },
  howItWorks: {
    done: "完成",
    exampleTimes: "示例时间",
    imageAlt:
      "莫尔斯电键、继电器和记录器的版画，标有指示器、继电器、电键和线路电池。",
    imageCaption: "莫尔斯电键与记录器，为《大众科学月刊》所刻，1876 年。",
    intro:
      "这是一次请人接送的完整过程。每一步都用简单的话说明，让您随时知道哪些事已经发生，哪些还没有。",
    result: "您批准了两次。没有发送其他任何内容。",
    slipTitle: "去 Patel 医生那里",
    timeline: [
      {
        heading: "星期一上午",
        steps: [
          { label: "您请人接送", time: "上午 9:02" },
          { label: "LifeLink 写好消息", time: "上午 9:02" },
          {
            decision: true,
            label: "您改了一个词，批准第 2 版",
            time: "上午 9:05",
          },
          { label: "通过 iMessage 发给 Sam", time: "上午 9:05" },
        ],
      },
      {
        heading: "星期一下午",
        steps: [
          { label: "Sam 回复：“没问题，9:45？”", time: "下午 1:40" },
          { decision: true, label: "您确认接送时间", time: "下午 1:52" },
        ],
      },
      {
        heading: "10 月 27 日星期二",
        steps: [
          { label: "提醒：Sam 9:45 到", time: "上午 9:15" },
          { label: "Patel 医生的预约", time: "上午 10:30" },
        ],
      },
    ],
    titleLine1: "您提出请求后",
    titleLine2: "会发生什么",
  },
  language: {
    intro:
      "选择本页面的语言。创建账号时，LifeLink 会保留这个选择。如果您已有账号，登录后会使用您在账号中选择的语言。",
    title: "语言",
  },
  messageSlip: {
    approve: "批准并发送",
    message:
      "Sam 你好，10 月 27 日星期二能开车送我去 Patel 医生那里吗？我需要上午 10:30 前到。谢谢！Ruth",
    notSent: "尚未发送",
    sent: "上午 9:05 已发送。没有发送其他任何内容。",
    showAgain: "再看一次",
    to: "发给 Sam Rivera · iMessage",
    version: "第 2 版",
  },
  nav: {
    howItWorks: "使用方式",
    language: "语言",
    questions: "常见问题",
    scamCheck: "诈骗检查",
    signIn: "登录",
  },
  previews: {
    approveAndSend: "批准并发送",
    circle: {
      appointments: "预约",
      code: "一次性邀请码",
      notShared: "未分享",
      note: "至 12 月 31 日",
      rides: "接送",
      scamAlerts: "诈骗提醒",
      shared: "已分享",
      stop: "立即停止分享",
      title: "已与 Sam Rivera 分享",
    },
    connections: {
      add: "添加已批准的预约",
      footnote: "每个连接只列出它真正能做的事。",
      notReady: "尚未准备好",
      note: "已连接",
      see: "查看即将到来的活动",
      works: "可用",
    },
    documents: {
      files: [
        { date: "10 月 12 日", name: "Medicare 摘要.pdf" },
        { date: "9 月 30 日", name: "Ana 的汤谱" },
        { date: "9 月 14 日", name: "花园照片" },
      ],
      footnote: "选择文件即可预览。可在 Google 云端硬盘中修改或分享。",
      title: "文档",
    },
    email: {
      anaSubject: "星期日一起吃午饭？带上相册！",
      draftBody: "星期日太好了。我会带上相册。12:30 可以吗？爱你的 Ruth",
      draftTitle: "回复 Ana · 草稿，未发送",
      note: "3 封新邮件",
      parcelSender: "包裹快递服务",
      parcelSubject: "需要操作：您的包裹被扣留",
      scamWarning: "这看起来像诈骗：它要求通过链接付款。",
      title: "电子邮件",
    },
    family: {
      footnote: "Sam 可以阅读和回复。Sam 不能替 Ruth 发送、批准或花钱。",
      nextAppointment: "下一个预约",
      note: "Sam 看到的内容",
      photos: "花园里的 2 张新照片",
      replyLabel: "回复 Ruth",
      replyText: "星期二 9:45 见！",
      title: "Ruth 的近况",
      when: "Patel 医生，星期二上午 10:30",
    },
    groceries: {
      copy: "复制清单",
      items: [
        { label: "燕麦奶，2 盒", value: "$7.98" },
        { label: "全麦面包", value: "$4.49" },
        { label: "苹果，6 个", value: "$5.20" },
        { label: "为 Ana 来访准备的煮汤食材", value: "$18.40" },
      ],
      note: "预算 $80，已用 $62",
      print: "打印",
      title: "每周采购",
    },
    help: {
      answers: "回答",
      language: "帮助语言",
      noteLabel: "私人备注",
      noteText: "我打电话听不清楚。请先建议发短信。",
      on: "开",
      oneStep: "一次一步",
      short: "简短",
      title: "我喜欢的帮助方式",
    },
    recap: {
      agreed: "已说定",
      agreedText: "Sam 星期二送您，9:45 来接。",
      nextStep: "建议的下一步",
      nextStepText: "星期一晚上提醒我。",
      offered: "只是提议",
      offeredText: "Sam 可能会带上 Max。",
      review: "查看提醒",
      title: "回顾",
    },
    today: {
      goodNews: "好消息，由您挑选",
      headlines: [
        "图书馆延长星期日开放时间",
        "志愿者修复镇上的玫瑰园",
        "夏季渡轮恢复运营",
      ],
      note: "星期一",
      pickup: "确认 Sam 9:45 来接您",
      title: "早上好，Ruth",
      waiting: "等您处理",
      weather: "天气",
      weatherValue: "58°F，小雨",
    },
  },
  promise: {
    howSharingWorks: "分享如何运作",
    leftImageAlt: "一幅蚀刻版画：一位老人坐在小桌旁读书，膝上坐着一个小男孩。",
    leftImageCaption: "让-雅克·德·布瓦修，《老人与读书的男孩》，1770 年。",
    promises: [
      "没有经过您阅读和批准的内容，我们绝不会发送。如果消息在您批准后有改动，我们会再问您一次。",
      "家人可以亲近您，而不必替您做主。您可以选择信任的人能看到什么，比如预约或接送，以及能看多久。他们永远不能替您发送、批准或花钱。",
      "只是练习时，我们会明说。出了问题时，我们会告诉您发生了什么、没有丢失任何东西，以及下一步该怎么做。",
      "而且我们绝不会告诉您某条消息是安全的。我们会指出危险信号，由您自己做决定。",
    ],
    rightImageAlt:
      "一封 1959 年的西联电报，用大写字母打字，盖有印章并附手写批注。",
    rightImageCaption: "一封西联电报，1959 年。每个字都很重要，还要有人签收。",
    sharing: "随时可以在信任圈中更改或停止分享。",
    signature: "日常帮助。由您决定。",
    tab: "我们的承诺",
    title: "LifeLink 绝不会做的事",
  },
  questions: {
    imageAlt: "克劳德·莫奈《睡莲池》：一座绿色小桥横跨在开满睡莲的池塘上。",
    imageCaption: "克劳德·莫奈，《睡莲池》，1900 年。",
    intro: "大家最常问的问题，答案都在这一页。",
    items: [
      {
        answer:
          "示例家人、邮件和一个预约，让您可以把所有功能都试一遍。不会发送任何真实内容，每个结果都标有“练习”。",
        question: "什么是练习模式？",
      },
      {
        answer: "可以。说出您的需要，LifeLink 还能按您选择的速度朗读回复。",
        question: "我可以用说话代替打字吗？",
      },
      {
        answer:
          "不能。他们只能看到您分享的内容，永远不能替您发送、批准或花钱。",
        question: "家人可以替我操作吗？",
      },
      {
        answer:
          "Gmail、Outlook 和 Google 日历，还有 iMessage、Discord 和 Telegram。每个都会清楚显示哪些可用、哪些还不行。",
        question: "我可以连接哪些账号？",
      },
      {
        answer:
          "不会。它保存您的清单、估算费用和预算，然后让您复制或打印清单，自己去购物。",
        question: "LifeLink 会帮我下单买菜吗？",
      },
      {
        answer:
          "它会成为一个新版本，LifeLink 会请您先批准这个版本，然后才会发送。",
        question: "如果我修改了消息怎么办？",
      },
      {
        answer:
          "不一样。已发送、已回复和已确认是不同的步骤，LifeLink 会用文字告诉您现在在哪一步。",
        question: "“已发送”等于“已说定”吗？",
      },
      {
        answer:
          "它会指出危险信号和更安全的下一步。它从不保证某条消息是安全的。",
        question: "它能告诉我某条消息是安全的吗？",
      },
      {
        answer: "纸牌接龙可以，游戏会保存在这台设备上。消息需要联网。",
        question: "没有网络也能用吗？",
      },
      {
        answer: "您会看到发生了什么、没有丢失任何东西，以及下一步该怎么做。",
        question: "如果出了问题怎么办？",
      },
    ],
    tab: "常见问题",
    title: "常见问题",
  },
  scamCheck: {
    beCareful: "请小心这条消息。",
    checkMessage: "检查一条消息",
    example: "示例",
    examples: {
      call: {
        label: "一通电话",
        nextStep: "挂断电话，用您已有的号码打给孙子。",
        received: "来电者说您的孙子遇到麻烦，今天就需要汇钱。",
        signs: [
          "急着要钱。",
          "要求您对这通电话保密。",
          "要求用礼品卡或电汇付款。",
        ],
      },
      email: {
        label: "一封邮件",
        nextStep: "拨打您银行卡背面印的号码联系银行。不要回复这封邮件。",
        received: "您的银行账户已被锁定。请今天确认您的信息，以免账户被关闭。",
        signs: [
          "威胁要关闭您的账户。",
          "要求您确认私人信息。",
          "发件人地址与您的银行不符。",
        ],
      },
      letter: {
        label: "一封信",
        nextStep: "付款或寄出任何东西前，先自己查一查这家颁奖公司。",
        received: "您赢得了 $5,000。请寄 $40 手续费来领取奖金。",
        signs: [
          "必须先付钱才能收到东西。",
          "您并没有参加过抽奖。",
          "无法查证是谁寄来的。",
        ],
      },
      text: {
        label: "一条短信",
        nextStep: "自己打开快递公司的应用或网站。不要点这个链接。",
        received:
          "您的包裹正在等待。请在 30 分钟内支付 $1.99 重新派送费：parcel-redeliver.co/pay",
        signs: [
          "催您赶快：30 分钟内付款。",
          "要求通过链接付款。",
          "这个链接不是快递公司的官方网站。",
        ],
      },
    },
    intro:
      "粘贴短信、选择邮件、给信件拍照，或用免提检查一通电话。LifeLink 会指出危险信号，并建议安全的下一步。它从不告诉您某条消息是安全的。",
    kinds: "可检查的消息类型",
    panelTitle: "诈骗检查",
    saferStep: "更安全的下一步",
    tab: "诈骗检查",
    title: "不确定某条消息是不是真的？",
    whatItLooksFor: "它会检查什么",
  },
  solitaire: {
    boardDescription: "一局正在进行的克朗代克纸牌接龙。黑桃 8 移到红心 9 上。",
    controls: ["撤销", "提示", "新游戏"],
    intro:
      "克朗代克纸牌接龙，牌面大而清晰。点按一张牌即可移动，也可以用键盘玩。撤销和提示随时一按即用，游戏会保存在这台设备上，没有网络也可以玩。",
    noAccount: "无需账号。",
    play: "玩纸牌接龙",
    saved: "游戏已保存在这台设备上",
    titleLine1: "安安静静",
    titleLine2: "玩一局纸牌接龙",
  },
  start: {
    alreadyHaveOne: "您将创建一个账号。已经有账号了？",
    defaultRequest: "Sam 星期二能送我去看病吗？",
    intro:
      "告诉 LifeLink 您需要什么，然后在发送前完整阅读消息。想先看看？您可以用示例消息试一试。",
    myFamily: "我自己的家人",
    request: "您的请求",
    sampleFamily: "示例家人",
    seeDraft: "查看草稿",
    signIn: "登录",
    titleLine1: "从一个",
    titleLine2: "请求开始",
    tryWith: "试用对象",
    whatHelp: "您需要什么帮助？",
  },
};

export { landing };
