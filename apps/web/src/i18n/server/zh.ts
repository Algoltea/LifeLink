import type { ServerCatalog } from "./es";

const SCAM_SIGNS = [
  ["pressure to act fast", "催促立即行动"],
  ["mentions private details", "提及私人信息"],
  ["mentions a payment method", "提及付款方式"],
  ["contains a link", "包含链接"],
  ["threats", "威胁"],
  ["prize or windfall", "中奖或意外之财"],
] as const;

/** Only translate the ordered combinations emitted by the local scam rules. */
const scamSummaries = (): ServerCatalog["exact"] => {
  const combinations: (typeof SCAM_SIGNS)[number][][] = [[]];

  for (const sign of SCAM_SIGNS) {
    const previousCombinations = [...combinations];

    for (const previous of previousCombinations) {
      combinations.push([...previous, sign]);
    }
  }

  const translations: Record<string, string> = {};

  for (const signs of combinations) {
    if (signs.length === 0) {
      continue;
    }

    const english = signs.map(([label]) => label).join(", ");
    const chinese = signs.map(([, label]) => label).join("、");
    translations[
      `This message shows ${signs.length} common warning ${signs.length === 1 ? "sign" : "signs"}: ${english}.`
    ] = `这条消息有 ${signs.length} 个常见警示信号：${chinese}。`;
  }

  return translations;
};

const SPEECH_ERRORS: ServerCatalog["exact"] = {
  "Audio playback stopped responding. Please try again.":
    "音频播放无响应。请重试。",
  "Choose between 1 and 600 characters to read.":
    "请选择 1 到 600 个字符的文字进行朗读。",
  "Please choose a shorter section to read aloud.":
    "请选择较短的一段进行朗读。",
  "Please read a shorter passage at a time.": "请每次朗读较短的一段。",
  "Please sign in again to use read-aloud.": "请重新登录以使用朗读。",
  "Read-aloud is not set up yet.": "尚未设置朗读功能。",
  "Read-aloud is not set up yet. An OpenRouter key is needed.":
    "尚未设置朗读功能。需要 OpenRouter 密钥。",
  "Read-aloud is unavailable. Please try again.": "朗读暂时不可用。请重试。",
  "Read-aloud needs a short pause. Please try again in a minute.":
    "朗读需要稍作暂停。请一分钟后重试。",
  "Read-aloud returned an unexpected audio format. Please try again later.":
    "朗读返回了意外的音频格式。请稍后重试。",
  "Read-aloud returned no audio. Please try again.": "朗读未返回音频。请重试。",
  "Read-aloud took too long. Please try again.": "朗读等待时间过长。请重试。",
  "That audio was too large. Please read a shorter section.":
    "音频过大。请选择较短的一段进行朗读。",
  "That passage is too long to read at once. Please choose a shorter section.":
    "这段文字太长，无法一次朗读。请选择较短的一段。",
  "The audio could not be loaded. Please try again.": "无法加载音频。请重试。",
  "The configured read-aloud model is not a verified ElevenLabs model on OpenRouter.":
    "配置的朗读模型不是 OpenRouter 上经过验证的 ElevenLabs 模型。",
  "The configured read-aloud voice is not supported. Please check the speech settings.":
    "不支持配置的朗读声音。请检查语音设置。",
  "This audio could not be played. Please try again.":
    "无法播放此音频。请重试。",
  "This browser cannot play audio. You can still read the text here.":
    "此浏览器无法播放音频。您仍可在这里阅读文字。",
  "Today’s read-aloud limit has been reached. Please try again tomorrow.":
    "今天的朗读用量已达上限。请明天再试。",
};

/** Simplified Chinese for fixed English server messages; captures stay verbatim. */
const zh: ServerCatalog = {
  exact: {
    ...scamSummaries(),
    ...SPEECH_ERRORS,
    "Action not found.": "找不到此操作。",
    "Added to your calendar.": "已添加到您的日历。",
    "An action cannot change into a different kind of action.":
      "操作不能更改为另一种类型。",
    "An earlier try is still unresolved.": "较早一次尝试的结果仍未确定。",
    "Ask for a ride": "请人接送",
    "Ask someone in your trusted circle to take a look.":
      "请信任圈中的人帮忙看看。",
    "Attempt not found.": "找不到此次尝试。",
    "Check up to 15 emails at a time.": "每次最多检查 15 封邮件。",
    "Choose someone from your trusted circle who can be messaged.":
      "请从信任圈中选择可以接收消息的人。",
    "Cloud AI is not set up. Your local overview is still available.":
      "尚未设置云端 AI。您仍可查看本地概览。",
    "Cloud AI suggestions, with supporting quotes checked against each email. Verify details in the original message.":
      "云端 AI 提供的建议，所引用的依据已逐封与邮件核对。请在原始消息中核实详情。",
    "Confirm the ride": "确认接送",
    "Connect Gmail or Outlook on the Connections screen to send email.":
      "请在连接页面连接 Gmail 或 Outlook，以发送邮件。",
    "Contains a link": "包含链接",
    "Discord is not set up for this app yet.": "此应用尚未设置 Discord。",
    "Discord is not set up for this app.": "此应用未设置 Discord。",
    "Don't click links or call numbers in the message.":
      "请勿点击消息中的链接或拨打其中的号码。",
    "Email, calendar, and Drive connections are not set up for this app yet.":
      "此应用尚未设置邮件、日历和 Drive 连接。",
    "Enter a nonnegative amount in whole cents, or leave the estimate blank.":
      "请输入零或正数金额，以整美分为单位；也可以将估价留空。",
    "Enter a quantity greater than 0.": "请输入大于 0 的数量。",
    "Found it in your mailbox.": "已在您的邮箱中找到。",
    "Found the event on your calendar.": "已在您的日历中找到此活动。",
    "Found the message in the Discord conversation.":
      "已在 Discord 对话中找到此消息。",
    "Found the notes in your Google Drive.":
      "已在您的 Google Drive 中找到笔记。",
    "If it claims to be from a company, call the number on your card, bill, or their official website.":
      "如果对方自称来自某家公司，请拨打您的卡片、账单或该公司官方网站上的号码。",
    "It is not in your mailbox, so it did not go through.":
      "您的邮箱中没有此内容，因此未成功发送。",
    "Let family know": "告知家人",
    "Links in unexpected messages can lead to fake sign-in pages. Go to the website yourself instead.":
      "意料之外的消息中的链接可能通向假冒登录页面。请自行打开该网站。",
    "Mentions a payment method": "提及付款方式",
    "Mentions private details": "提及私人信息",
    "New conversation": "新对话",
    "No connected mailbox to send from.": "没有已连接的邮箱可供发送。",
    "No recent emails to summarize yet.": "尚无近期邮件可供生成摘要。",
    "No subject or readable message text, and no action request found. Any images or attachments have not been assessed.":
      "没有找到主题、可读的消息文字或行动要求。图片和附件尚未评估。",
    "Nobody in your trusted circle can see ride plans, so no update was shared.":
      "信任圈中没有人获准查看接送计划，因此没有分享近况。",
    "Not needed because the ride was declined.":
      "接送请求已被婉拒，因此无需进行。",
    "Only a short casual note or shared-file context, with no meaningful subject, reply request, or time-sensitive detail found.":
      "只发现简短的日常留言或共享文件说明，没有重要主题、回复要求或有时限的细节。",
    "Only something that failed can be tried again.":
      "只有失败的操作才能重试。",
    "Only the account owner can do this.": "只有账号本人可以这样做。",
    "Open emails in pages of 15.": "请每页打开 15 封邮件。",
    "Paste the message you would like checked.": "请粘贴您想检查的消息。",
    "Photon accepted the iMessage for delivery under the same approval.":
      "Photon 已依据同一次批准接受此 iMessage，以安排发送。",
    "Photon confirmed it accepted the earlier iMessage for delivery.":
      "Photon 已确认接受了先前的 iMessage，以安排发送。",
    "Please answer the open question first.": "请先回答待答的问题。",
    "Please check up to 8,000 characters at a time.":
      "每次最多检查 8,000 个字符。",
    "Please choose a JPG, PNG, or WebP photo under 6 MB.":
      "请选择小于 6 MB 的 JPG、PNG 或 WebP 照片。",
    "Please choose a photo under 6 MB.": "请选择小于 6 MB 的照片。",
    "Please choose a time that has not passed yet.": "请选择尚未过去的时间。",
    "Please choose one of the options shown.": "请从显示的选项中选择一项。",
    "Please sign in again to continue.": "请重新登录以继续。",
    "Please sign in again.": "请重新登录。",
    "Please write your reply first.": "请先写下您的回复。",
    "Practice emails are reviewed in LifeLink and are never sent to cloud AI.":
      "练习邮件在 LifeLink 内检查，绝不会发送给云端 AI。",
    "Practice mode is on. Turn it off and review this again to do it for real.":
      "练习模式已开启。如需实际执行，请关闭练习模式并重新核对。",
    "Practice: done.": "练习：已完成。",
    "Practice: no draft was saved in your real mailbox.":
      "练习：没有在您的真实邮箱中保存草稿。",
    "Practice: nothing was added to your real calendar.":
      "练习：没有向您的真实日历添加任何内容。",
    "Practice: nothing was saved in your real Google Drive.":
      "练习：没有在您的真实 Google Drive 中保存任何内容。",
    "Practice: the reply was not really sent.": "练习：回复并未实际发送。",
    "Pressure can make it harder to stop and check. Verify an urgent request through a contact you already know.":
      "催促可能让人难以停下来核实。对于紧急请求，请通过您原本就认识的联系人核实。",
    "Pressure to act fast": "催促立即行动",
    "Prize or windfall": "中奖或意外之财",
    "Requests for gift cards, transfers, or cryptocurrency deserve a separate check. These payments can be difficult to recover.":
      "要求提供礼品卡、转账或支付加密货币时，应另外核实。这些付款可能难以追回。",
    "Save a reminder": "保存提醒",
    "Save the reminder": "保存提醒",
    "Saved the notes in your Google Drive.":
      "已将笔记保存到您的 Google Drive。",
    "Sharing changed for someone on this update. Please review who will see it.":
      "这条近况涉及某人的分享权限已更改。请核对谁能看到。",
    "Showing the overview made in LifeLink. Nothing was sent to cloud AI.":
      "显示的是在 LifeLink 内生成的概览。没有向云端 AI 发送任何内容。",
    "Spectrum has not confirmed whether this message was sent. Check again or confirm when it arrives; it cannot safely be marked as not sent.":
      "Spectrum 尚未确认此消息是否已发送。请重新检查，或在送达后确认；目前不能可靠地将它标记为未发送。",
    "Surprise winnings that need a fee first are almost always scams.":
      "意外中奖却要求先付费的情况，几乎总是诈骗。",
    "Telegram allows 1024 characters with photos. Shorten the message or send the photos separately.":
      "Telegram 照片附带的文字最多为 1024 个字符。请缩短消息，或单独发送照片。",
    "Telegram asked LifeLink to slow down. Nothing was sent; try again in a minute.":
      "Telegram 要求 LifeLink 放慢发送速度。没有发送任何内容；请一分钟后重试。",
    "Telegram is not set up for this app yet. Ask whoever set it up to run bun run dev:setup --only=telegram.":
      "此应用尚未设置 Telegram。请设置应用的人运行 bun run dev:setup --only=telegram。",
    "Telegram is not set up for this app.": "此应用未设置 Telegram。",
    "Telegram refused: this person has blocked the bot or never tapped Start. Ask them to open the link again.":
      "Telegram 拒绝发送：此人屏蔽了机器人，或尚未点击“开始”。请对方重新打开链接。",
    "That Google Drive is no longer connected.": "该 Google Drive 已断开连接。",
    "That account is no longer connected. Reconnect it on the Connections screen.":
      "该账号已断开连接。请在连接页面重新连接。",
    "That calendar is no longer connected.": "该日历已断开连接。",
    "That could not be found.": "找不到此内容。",
    "That email could not be found.": "找不到这封邮件。",
    "That mailbox is no longer connected.": "该邮箱已断开连接。",
    "That person has no way to be reached yet.": "尚无此人的联系方式。",
    "That step could not be found.": "找不到此步骤。",
    "That task could not be found.": "找不到此任务。",
    "The automatic check has not finished. Review this message before deciding.":
      "自动检查尚未完成。做决定前，请先查看并核对这条消息。",
    "The cloud overview did not finish. The local overview is shown; the provider may have received these emails.":
      "云端概览未能完成。现显示本地概览；服务提供方可能已收到这些邮件。",
    "The cloud-reading limit has been reached. Your local overview is still available.":
      "云端解读次数已达上限。您仍可查看本地概览。",
    "The current subject or message asks for a reply or confirmation. Check the details before responding.":
      "当前主题或消息要求回复或确认。回复前请核对详情。",
    "The details changed since you looked. Please review them again.":
      "您查看后，详情发生了变化。请重新核对。",
    "The event is not on your calendar.": "您的日历中没有此活动。",
    "The message cannot be empty.": "消息不能为空。",
    "The message contains a concrete event, account action, or timing detail worth reviewing.":
      "消息中包含值得查看的具体活动、账号操作或时间细节。",
    "The message is not in the Discord conversation, so it did not go through.":
      "Discord 对话中没有此消息，因此未成功发送。",
    "The notes are not in your Google Drive.":
      "您的 Google Drive 中没有这些笔记。",
    "The person you are writing to is no longer in your contacts.":
      "您要写信的人已不在联系人中。",
    "The sender address matches someone in your Trusted circle and the message has context worth reviewing. An address match does not verify who sent it.":
      "发件人地址与信任圈中的某人匹配，消息内容值得查看。地址匹配并不能核实发送者身份。",
    "The sender label or address suggests a health, billing, or account-service message. Review it; the sender's identity has not been verified.":
      "发件人名称或地址显示，这可能是与健康、账单或账号服务有关的消息。请查看；发送者身份尚未核实。",
    "The sender or message looks like a promotion or newsletter, without a concrete action or important subject. It can usually wait if you are not interested.":
      "发件人或消息看起来像促销或资讯邮件，没有具体行动要求或重要主题。如果您不感兴趣，通常可以稍后再看。",
    "The subject mentions an appointment, transaction, account notice, or other matter worth reviewing.":
      "主题提到了预约、交易、账号通知或其他值得查看的事项。",
    "There is a subject or substantive message, but no clear reply request. Read it to decide whether it matters to you.":
      "有主题或实质内容，但没有明确的回复要求。请阅读后判断是否与您有关。",
    "There is nothing to check for this one.": "此项没有可检查的内容。",
    "These details could not be verified. Please prepare them again.":
      "无法核实这些详情。请重新准备。",
    "This action is missing its details.": "此操作缺少详情。",
    "This can no longer be changed because it has already started.":
      "此操作已经开始，无法再更改。",
    "This changed while you were offline. Please look it over again before approving.":
      "您离线期间，此内容发生了变化。批准前请重新核对。",
    "This check for common warning signs found none in the available text. It cannot verify the sender or prove a message is genuine. Check unexpected requests with someone you trust.":
      "此次检查未在可用文字中发现常见警示信号。它无法核实发送者身份或证明消息真实。对于意料之外的请求，请向您信任的人核实。",
    "This check for common warning signs found only advice not to share details or pay in unusual ways. That advice does not prove the message is genuine. Check unexpected requests with someone you trust.":
      "此次检查只发现了提醒您不要提供信息或使用异常方式付款的建议。这些建议不能证明消息真实。对于意料之外的请求，请向您信任的人核实。",
    "This check has expired.": "此次检查已过期。",
    "This email is not from a connected mailbox.":
      "此邮件并非来自已连接的邮箱。",
    "This has already started, so it can no longer be cancelled.":
      "此操作已经开始，无法再取消。",
    "This is already approved.": "此项已经批准。",
    "This is not waiting for approval.": "此项并非正在等待批准。",
    "This mentions sensitive details. Do not share passwords, codes, or account details in response to an unexpected message.":
      "这里提到了敏感信息。请勿在回复意料之外的消息时提供密码、验证码或账号资料。",
    "This message tells you not to do this. Real companies say this, and scammers copy it too, so check any other requests in it.":
      "这条消息提醒您不要这样做。正规公司会这样提醒，骗子也会模仿，因此请核实其中的其他要求。",
    "This was prepared in practice mode. Please prepare it again now that practice mode is off.":
      "此内容是在练习模式下准备的。现在练习模式已关闭，请重新准备。",
    Threats: "威胁",
    "Threats of arrest or legal trouble are a common scare tactic.":
      "以逮捕或法律麻烦相威胁，是常见的恐吓手法。",
    "Use a whole number for individual items or packages. Choose a weight or volume for a measured amount.":
      "单件或整包物品请使用整数。按量购买时，请选择重量或容量单位。",
    "Wait for an answer": "等待答复",
    "Warning signs were found. Check the message before replying, paying, or sharing details.":
      "发现了警示信号。回复、付款或提供信息前，请先核实这条消息。",
    "Warns against sharing private details": "提醒不要提供私人信息",
    "Warns against threats": "提醒警惕威胁",
    "Warns against unusual payments": "提醒警惕异常付款方式",
    "We are not sure the last try failed. Check whether it went through before trying again.":
      "我们不确定上一次尝试是否失败。重试前，请先核实是否已成功。",
    "We are still checking this action. Wait for that check to finish.":
      "我们仍在检查此操作。请等待检查完成。",
    "Which appointment is the ride for?": "您需要接送去参加哪项预约？",
    "Who would you like to ask?": "您想请谁帮忙？",
    "Write a few words or add a photo first.": "请先写几句话或添加照片。",
    "Write your reply first.": "请先写下您的回复。",
    "You are not connected with this person.": "您尚未与此人建立连接。",
    "You cancelled this.": "您已取消此项。",
    "You offered or asked, and the answer was yes.":
      "您提出了建议或请求，并得到了肯定答复。",
    "You offered or asked. The answer is not clear yet.":
      "您提出了建议或请求。答复尚不明确。",
    "You offered or asked. There is no answer yet.":
      "您提出了建议或请求。尚未收到答复。",
    "iMessage is not set up for this app yet. Ask whoever set it up to run bun run dev:setup.":
      "此应用尚未设置 iMessage。请设置应用的人运行 bun run dev:setup。",
    "iMessage is not set up for this app.": "此应用未设置 iMessage。",
  },
  // Match complete templates only; preserve quote boundaries and every capture.
  patterns: [
    [
      /^Read-aloud is unavailable \((?<status>[1-5]\d{2})\)\. Please try again later\.$/u,
      (status) => `朗读暂时不可用（${status}）。请稍后重试。`,
    ],
    [/^Ride to (?<title>.+)$/u, (title) => `接送前往 ${title}`],
    [
      /^Waiting for (?<name>[^“”"\r\n]+) to answer\.$/u,
      (name) => `正在等待 ${name} 答复。`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) said: “(?<body>[\s\S]*)”$/u,
      (name, body) => `${name} 说：“${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) can't drive this time\. You could ask someone else\.$/u,
      (name) => `${name} 这次无法接送。您可以请其他人帮忙。`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\.$/u,
      (name) => `尚无 ${name} 的联系方式。`,
    ],
    [
      /^Set up iMessage for (?<name>[^“”"\r\n]+) in Trusted circle, then ask them to text their assigned number first\.$/u,
      (name) =>
        `请在信任圈中为 ${name} 设置 iMessage，再请对方先向分配的号码发消息。`,
    ],
    [
      /^Link (?<name>[^“”"\r\n]+)'s Telegram in Trusted circle first: send them their link and ask them to tap Start\.$/u,
      (name) =>
        `请先在信任圈中关联 ${name} 的 Telegram：将链接发给对方，并请对方点击“开始”。`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) replied, but it is not clear yet: “(?<body>[\s\S]*)”$/u,
      (name, body) => `${name} 已回复，但意思尚不明确：“${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\. Add one under Trusted circle\.$/u,
      (name) => `尚无 ${name} 的联系方式。请在信任圈中添加。`,
    ],
    [
      /^Practice: the message to (?<name>[^“”"\r\n]+) was not really sent\. A practice reply will arrive shortly\.$/u,
      (name) => `练习：发给 ${name} 的消息并未实际发送。稍后会收到练习回复。`,
    ],
    [
      /^Photon accepted the iMessage to (?<name>[^“”"\r\n]+) for delivery\.$/u,
      (name) => `Photon 已接受发给 ${name} 的 iMessage，以安排发送。`,
    ],
    [
      /^Shared with (?<count>\d+) (?:person|people) in your trusted circle\.$/u,
      (count) => `已与信任圈中的 ${count} 人分享。`,
    ],
    [/^Reply sent to (?<to>[^“”"\r\n]+)\.$/u, (to) => `已向 ${to} 发送回复。`],
    [
      /^Draft saved in your (?<provider>Gmail|Outlook) Drafts folder\. It has not been sent\.$/u,
      (provider) => `草稿已保存到您的 ${provider} 草稿文件夹。尚未发送。`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked, and the answer was yes\.$/u,
      (name) => `${name} 提出了建议或请求，并得到了肯定答复。`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. There is no answer yet\.$/u,
      (name) => `${name} 提出了建议或请求。尚未收到答复。`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. The answer is not clear yet\.$/u,
      (name) => `${name} 提出了建议或请求。答复尚不明确。`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) asked a question you haven't answered yet\.$/u,
      (name) => `${name} 提出了一个您尚未回答的问题。`,
    ],
    [
      /^Answer (?<name>[^“”"\r\n]+)'s offer, if you'd like to accept it\.$/u,
      (name) => `如果您愿意接受 ${name} 的提议，请回复对方。`,
    ],
    [
      /^In your last (?<messages>\d+) messages? with (?<name>[^“”"\r\n]+), LifeLink found (?<agreements>\d+) agreements? and (?<offers>\d+) offers? or requests? without a clear answer\.$/u,
      (messages, name, agreements, offers) =>
        `在您与 ${name} 最近的 ${messages} 条消息中，LifeLink 找到了 ${agreements} 项已达成的约定，以及 ${offers} 项尚未得到明确答复的提议或请求。`,
    ],
  ],
};

export { zh };
