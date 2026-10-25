interface ServerCatalog {
  exact: Record<string, string>;
  patterns: [RegExp, (...parts: string[]) => string][];
}

const SCAM_SIGNS = [
  ["pressure to act fast", "서두르라는 압박"],
  ["mentions private details", "개인정보 언급"],
  ["mentions a payment method", "결제 수단 언급"],
  ["contains a link", "링크 포함"],
  ["threats", "위협"],
  ["prize or windfall", "경품이나 뜻밖의 돈"],
] as const;

/** Only the combinations emitted by scam.ts; arbitrary lists are not translated. */
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
    const korean = signs.map(([, label]) => label).join(", ");
    translations[
      `This message shows ${signs.length} common warning ${signs.length === 1 ? "sign" : "signs"}: ${english}.`
    ] = `이 메시지에는 흔한 위험 신호 ${signs.length}개가 있습니다: ${korean}.`;
  }

  return translations;
};

/** Korean for the backend's fixed English messages, matched exactly. */
const ko: ServerCatalog = {
  exact: {
    ...scamSummaries(),
    "Action not found.": "작업을 찾지 못했습니다.",
    "Added to your calendar.": "캘린더에 추가했습니다.",
    "An action cannot change into a different kind of action.":
      "작업을 다른 종류의 작업으로 바꿀 수는 없습니다.",
    "An earlier try is still unresolved.":
      "이전 시도의 결과가 아직 확인되지 않았습니다.",
    "Ask for a ride": "차편 부탁하기",
    "Ask someone in your trusted circle to take a look.":
      "믿을 수 있는 사람들에 있는 분께 함께 살펴봐 달라고 요청해 주세요.",
    "Attempt not found.": "시도 기록을 찾지 못했습니다.",
    "Audio playback stopped responding. Please try again.":
      "음성 재생이 응답하지 않습니다. 다시 시도해 주세요.",
    "Check up to 15 emails at a time.":
      "한 번에 이메일을 최대 15개까지 확인해 주세요.",
    "Choose between 1 and 600 characters to read.":
      "읽을 내용을 1자에서 600자 사이로 선택해 주세요.",
    "Choose someone from your trusted circle who can be messaged.":
      "믿을 수 있는 사람들에서 메시지를 보낼 수 있는 분을 선택해 주세요.",
    "Cloud AI is not set up. Your local overview is still available.":
      "클라우드 AI가 설정되지 않았습니다. 로컬 요약은 계속 이용하실 수 있습니다.",
    "Cloud AI suggestions, with supporting quotes checked against each email. Verify details in the original message.":
      "각 이메일과 근거 인용문을 대조한 클라우드 AI 제안입니다. 자세한 내용은 원본 메시지에서 확인해 주세요.",
    "Confirm the ride": "차편 확정",
    "Connect Gmail or Outlook on the Connections screen to send email.":
      "이메일을 보내시려면 연결 화면에서 Gmail 또는 Outlook을 연결해 주세요.",
    "Contains a link": "링크 포함",
    "Discord is not set up for this app yet.":
      "이 앱에는 Discord가 아직 설정되지 않았습니다.",
    "Discord is not set up for this app.":
      "이 앱에는 Discord가 설정되지 않았습니다.",
    "Don't click links or call numbers in the message.":
      "메시지의 링크를 누르거나 적힌 번호로 전화하지 마세요.",
    "Email, calendar, and Drive connections are not set up for this app yet.":
      "이 앱의 이메일, 캘린더, Drive 연결은 아직 설정되지 않았습니다.",
    "Enter a nonnegative amount in whole cents, or leave the estimate blank.":
      "0 이상의 금액을 센트 단위의 정수로 입력하시거나 예상 비용을 비워 두세요.",
    "Enter a quantity greater than 0.": "0보다 큰 수량을 입력해 주세요.",
    "Found it in your mailbox.": "메일함에서 찾았습니다.",
    "Found the event on your calendar.": "캘린더에서 일정을 찾았습니다.",
    "Found the message in the Discord conversation.":
      "Discord 대화에서 메시지를 찾았습니다.",
    "Found the notes in your Google Drive.":
      "Google Drive에서 메모를 찾았습니다.",
    "If it claims to be from a company, call the number on your card, bill, or their official website.":
      "회사에서 보냈다고 한다면 카드, 청구서 또는 공식 웹사이트에 나온 번호로 전화해 주세요.",
    "It is not in your mailbox, so it did not go through.":
      "메일함에 없으므로 전송되지 않았습니다.",
    "Let family know": "가족에게 알리기",
    "Links in unexpected messages can lead to fake sign-in pages. Go to the website yourself instead.":
      "예상하지 못한 메시지의 링크는 가짜 로그인 화면으로 연결될 수 있습니다. 대신 웹사이트에 직접 접속해 주세요.",
    "Mentions a payment method": "결제 수단 언급",
    "Mentions private details": "개인정보 언급",
    "New conversation": "새 대화",
    "No connected mailbox to send from.":
      "보낼 때 사용할 연결된 메일함이 없습니다.",
    "No recent emails to summarize yet.": "아직 요약할 최근 이메일이 없습니다.",
    "No subject or readable message text, and no action request found. Any images or attachments have not been assessed.":
      "제목이나 읽을 수 있는 본문, 행동을 요청하는 내용을 찾지 못했습니다. 이미지나 첨부파일은 평가하지 않았습니다.",
    "Nobody in your trusted circle can see ride plans, so no update was shared.":
      "믿을 수 있는 사람들 중 차편 계획을 볼 수 있는 사람이 없어 새 소식을 공유하지 않았습니다.",
    "Not needed because the ride was declined.":
      "차편 요청이 거절되어 필요하지 않습니다.",
    "Only a short casual note or shared-file context, with no meaningful subject, reply request, or time-sensitive detail found.":
      "짧은 일상 메모나 공유 파일에 관한 내용만 있으며, 중요한 제목, 답장 요청 또는 기한에 맞춰 처리할 내용은 찾지 못했습니다.",
    "Only something that failed can be tried again.":
      "실패한 작업만 다시 시도할 수 있습니다.",
    "Only the account owner can do this.": "계정 소유자만 할 수 있습니다.",
    "Open emails in pages of 15.": "한 페이지에 이메일 15개씩 열어 주세요.",
    "Paste the message you would like checked.":
      "확인하고 싶은 메시지를 붙여넣어 주세요.",
    "Photon accepted the iMessage for delivery under the same approval.":
      "Photon이 같은 승인에 따라 iMessage 전송 요청을 접수했습니다.",
    "Photon confirmed it accepted the earlier iMessage for delivery.":
      "Photon이 이전 iMessage 전송 요청을 접수했음을 확인했습니다.",
    "Please answer the open question first.":
      "먼저 답변을 기다리는 질문에 답해 주세요.",
    "Please check up to 8,000 characters at a time.":
      "한 번에 최대 8,000자까지 확인해 주세요.",
    "Please choose a JPG, PNG, or WebP photo under 6 MB.":
      "6 MB 미만의 JPG, PNG 또는 WebP 사진을 선택해 주세요.",
    "Please choose a photo under 6 MB.": "6 MB 미만의 사진을 선택해 주세요.",
    "Please choose a shorter section to read aloud.":
      "소리 내어 읽을 부분을 더 짧게 선택해 주세요.",
    "Please choose a time that has not passed yet.":
      "아직 지나지 않은 시간을 선택해 주세요.",
    "Please choose one of the options shown.":
      "표시된 항목 중 하나를 선택해 주세요.",
    "Please read a shorter passage at a time.":
      "한 번에 더 짧은 글을 읽도록 해 주세요.",
    "Please sign in again to continue.": "계속하시려면 다시 로그인해 주세요.",
    "Please sign in again to use read-aloud.":
      "소리 내어 읽기를 사용하시려면 다시 로그인해 주세요.",
    "Please sign in again.": "다시 로그인해 주세요.",
    "Please write your reply first.": "먼저 답장을 적어 주세요.",
    "Practice emails are reviewed in LifeLink and are never sent to cloud AI.":
      "연습용 이메일은 LifeLink 안에서 검토하며 클라우드 AI에 보내지 않습니다.",
    "Practice mode is on. Turn it off and review this again to do it for real.":
      "연습 모드가 켜져 있습니다. 실제로 실행하시려면 끄신 뒤 다시 검토해 주세요.",
    "Practice: done.": "연습: 완료되었습니다.",
    "Practice: no draft was saved in your real mailbox.":
      "연습: 실제 메일함에는 초안을 저장하지 않았습니다.",
    "Practice: nothing was added to your real calendar.":
      "연습: 실제 캘린더에는 아무것도 추가하지 않았습니다.",
    "Practice: nothing was saved in your real Google Drive.":
      "연습: 실제 Google Drive에는 아무것도 저장하지 않았습니다.",
    "Practice: the reply was not really sent.":
      "연습: 답장을 실제로 보내지 않았습니다.",
    "Pressure can make it harder to stop and check. Verify an urgent request through a contact you already know.":
      "압박을 받으면 멈춰서 확인하기 어려울 수 있습니다. 급한 요청은 이미 알고 계신 연락처를 통해 확인해 주세요.",
    "Pressure to act fast": "서두르라는 압박",
    "Prize or windfall": "경품이나 뜻밖의 돈",
    "Read-aloud is not set up yet.":
      "소리 내어 읽기가 아직 설정되지 않았습니다.",
    "Read-aloud is not set up yet. An OpenRouter key is needed.":
      "소리 내어 읽기가 아직 설정되지 않았습니다. OpenRouter 키가 필요합니다.",
    "Read-aloud is unavailable. Please try again.":
      "소리 내어 읽기를 사용할 수 없습니다. 다시 시도해 주세요.",
    "Read-aloud needs a short pause. Please try again in a minute.":
      "소리 내어 읽기에 잠시 휴식이 필요합니다. 1분 후에 다시 시도해 주세요.",
    "Read-aloud returned an unexpected audio format. Please try again later.":
      "소리 내어 읽기에서 예상하지 못한 음성 형식을 받았습니다. 나중에 다시 시도해 주세요.",
    "Read-aloud returned no audio. Please try again.":
      "소리 내어 읽기에서 음성을 받지 못했습니다. 다시 시도해 주세요.",
    "Read-aloud took too long. Please try again.":
      "소리 내어 읽기에 시간이 너무 오래 걸렸습니다. 다시 시도해 주세요.",
    "Requests for gift cards, transfers, or cryptocurrency deserve a separate check. These payments can be difficult to recover.":
      "기프트카드, 송금 또는 가상화폐를 요구한다면 별도로 확인해 주세요. 이런 방식으로 지불한 돈은 되찾기 어려울 수 있습니다.",
    "Save a reminder": "알림 저장",
    "Save the reminder": "알림 저장",
    "Saved the notes in your Google Drive.":
      "Google Drive에 메모를 저장했습니다.",
    "Sharing changed for someone on this update. Please review who will see it.":
      "이 새 소식을 받는 사람의 공유 권한이 바뀌었습니다. 누가 볼 수 있는지 다시 검토해 주세요.",
    "Showing the overview made in LifeLink. Nothing was sent to cloud AI.":
      "LifeLink에서 만든 요약을 보여드립니다. 클라우드 AI에 보낸 내용은 없습니다.",
    "Spectrum has not confirmed whether this message was sent. Check again or confirm when it arrives; it cannot safely be marked as not sent.":
      "Spectrum이 이 메시지를 보냈는지 확인해 주지 않았습니다. 다시 확인하시거나 도착하면 알려 주세요. 보내지 않았다고 안전하게 표시할 수는 없습니다.",
    "Surprise winnings that need a fee first are almost always scams.":
      "먼저 비용을 내야 받는 뜻밖의 당첨금은 거의 항상 사기입니다.",
    "Telegram allows 1024 characters with photos. Shorten the message or send the photos separately.":
      "Telegram에서는 사진과 함께 최대 1024자까지 보낼 수 있습니다. 메시지를 줄이시거나 사진을 따로 보내 주세요.",
    "Telegram asked LifeLink to slow down. Nothing was sent; try again in a minute.":
      "Telegram이 LifeLink에 전송 속도를 늦춰 달라고 요청했습니다. 보낸 내용은 없습니다. 1분 후에 다시 시도해 주세요.",
    "Telegram is not set up for this app yet. Ask whoever set it up to run bun run dev:setup --only=telegram.":
      "이 앱에는 Telegram이 아직 설정되지 않았습니다. 설정한 분께 bun run dev:setup --only=telegram 명령을 실행해 달라고 요청해 주세요.",
    "Telegram is not set up for this app.":
      "이 앱에는 Telegram이 설정되지 않았습니다.",
    "Telegram refused: this person has blocked the bot or never tapped Start. Ask them to open the link again.":
      "Telegram이 전송을 거절했습니다. 상대방이 봇을 차단했거나 시작을 누르지 않았습니다. 링크를 다시 열어 달라고 요청해 주세요.",
    "That Google Drive is no longer connected.":
      "해당 Google Drive는 더 이상 연결되어 있지 않습니다.",
    "That account is no longer connected. Reconnect it on the Connections screen.":
      "해당 계정은 더 이상 연결되어 있지 않습니다. 연결 화면에서 다시 연결해 주세요.",
    "That audio was too large. Please read a shorter section.":
      "음성 파일이 너무 컸습니다. 읽을 부분을 더 짧게 선택해 주세요.",
    "That calendar is no longer connected.":
      "해당 캘린더는 더 이상 연결되어 있지 않습니다.",
    "That could not be found.": "찾지 못했습니다.",
    "That email could not be found.": "해당 이메일을 찾지 못했습니다.",
    "That mailbox is no longer connected.":
      "해당 메일함은 더 이상 연결되어 있지 않습니다.",
    "That passage is too long to read at once. Please choose a shorter section.":
      "한 번에 읽기에는 글이 너무 깁니다. 더 짧은 부분을 선택해 주세요.",
    "That person has no way to be reached yet.":
      "아직 그 사람에게 연락할 방법이 없습니다.",
    "That step could not be found.": "해당 단계를 찾지 못했습니다.",
    "That task could not be found.": "해당 작업을 찾지 못했습니다.",
    "The audio could not be loaded. Please try again.":
      "음성을 불러오지 못했습니다. 다시 시도해 주세요.",
    "The automatic check has not finished. Review this message before deciding.":
      "자동 확인이 끝나지 않았습니다. 결정하시기 전에 이 메시지를 검토해 주세요.",
    "The cloud overview did not finish. The local overview is shown; the provider may have received these emails.":
      "클라우드 요약을 마치지 못했습니다. 로컬 요약을 보여드립니다. 제공업체가 이미 이 이메일들을 받았을 수 있습니다.",
    "The cloud-reading limit has been reached. Your local overview is still available.":
      "클라우드 읽기 이용 한도에 도달했습니다. 로컬 요약은 계속 이용하실 수 있습니다.",
    "The configured read-aloud model is not a verified ElevenLabs model on OpenRouter.":
      "소리 내어 읽기에 설정된 모델은 OpenRouter에서 확인된 ElevenLabs 모델이 아닙니다.",
    "The configured read-aloud voice is not supported. Please check the speech settings.":
      "설정된 읽기 목소리는 지원되지 않습니다. 음성 설정을 확인해 주세요.",
    "The current subject or message asks for a reply or confirmation. Check the details before responding.":
      "현재 제목이나 메시지에 답장 또는 확인을 요청하는 내용이 있습니다. 응답하시기 전에 자세히 살펴봐 주세요.",
    "The details changed since you looked. Please review them again.":
      "보신 뒤 내용이 바뀌었습니다. 다시 검토해 주세요.",
    "The event is not on your calendar.": "캘린더에 해당 일정이 없습니다.",
    "The message cannot be empty.": "메시지 내용을 비워 둘 수 없습니다.",
    "The message contains a concrete event, account action, or timing detail worth reviewing.":
      "메시지에 살펴보시면 좋을 구체적인 일정, 계정 관련 작업 또는 시간 정보가 있습니다.",
    "The message is not in the Discord conversation, so it did not go through.":
      "Discord 대화에 메시지가 없으므로 전송되지 않았습니다.",
    "The notes are not in your Google Drive.":
      "Google Drive에 해당 메모가 없습니다.",
    "The person you are writing to is no longer in your contacts.":
      "받는 사람이 더 이상 연락처에 없습니다.",
    "The sender address matches someone in your Trusted circle and the message has context worth reviewing. An address match does not verify who sent it.":
      "보낸 주소가 믿을 수 있는 사람들에 있는 주소와 일치하며, 메시지에 살펴보시면 좋을 내용이 있습니다. 주소가 일치해도 누가 보냈는지 확인된 것은 아닙니다.",
    "The sender label or address suggests a health, billing, or account-service message. Review it; the sender's identity has not been verified.":
      "보낸 사람의 표시 이름이나 주소로 보아 건강, 청구 또는 계정 서비스에 관한 메시지일 수 있습니다. 살펴봐 주세요. 보낸 사람의 신원은 확인되지 않았습니다.",
    "The sender or message looks like a promotion or newsletter, without a concrete action or important subject. It can usually wait if you are not interested.":
      "보낸 사람이나 내용으로 보아 홍보물 또는 소식지 같으며, 구체적인 행동 요청이나 중요한 제목은 없습니다. 관심이 없으시면 대체로 나중에 보셔도 됩니다.",
    "The subject mentions an appointment, transaction, account notice, or other matter worth reviewing.":
      "제목에 약속, 거래, 계정 안내 또는 그 밖에 살펴보시면 좋을 내용이 언급되어 있습니다.",
    "There is a subject or substantive message, but no clear reply request. Read it to decide whether it matters to you.":
      "제목이나 실질적인 내용은 있지만 뚜렷한 답장 요청은 없습니다. 읽어 보시고 중요한 내용인지 판단해 주세요.",
    "There is nothing to check for this one.":
      "이 항목에는 확인할 내용이 없습니다.",
    "These details could not be verified. Please prepare them again.":
      "이 내용을 확인하지 못했습니다. 다시 준비해 주세요.",
    "This action is missing its details.": "이 작업의 세부 내용이 없습니다.",
    "This audio could not be played. Please try again.":
      "이 음성을 재생하지 못했습니다. 다시 시도해 주세요.",
    "This browser cannot play audio. You can still read the text here.":
      "이 브라우저에서는 음성을 재생할 수 없습니다. 글은 여기서 계속 읽으실 수 있습니다.",
    "This can no longer be changed because it has already started.":
      "이미 시작되어 더 이상 바꿀 수 없습니다.",
    "This changed while you were offline. Please look it over again before approving.":
      "인터넷에 연결되지 않은 동안 내용이 바뀌었습니다. 승인하시기 전에 다시 살펴봐 주세요.",
    "This check for common warning signs found none in the available text. It cannot verify the sender or prove a message is genuine. Check unexpected requests with someone you trust.":
      "읽을 수 있는 글에서 흔한 위험 신호를 찾지 못했습니다. 보낸 사람의 신원을 확인하거나 메시지가 진짜임을 증명할 수는 없습니다. 예상하지 못한 요청은 믿을 수 있는 사람과 함께 확인해 주세요.",
    "This check for common warning signs found only advice not to share details or pay in unusual ways. That advice does not prove the message is genuine. Check unexpected requests with someone you trust.":
      "흔한 위험 신호를 살펴본 결과, 정보를 알려주거나 특이한 방식으로 결제하지 말라는 조언만 찾았습니다. 이 조언이 메시지가 진짜임을 증명하지는 않습니다. 예상하지 못한 요청은 믿을 수 있는 사람과 함께 확인해 주세요.",
    "This check has expired.": "이 확인은 만료되었습니다.",
    "This email is not from a connected mailbox.":
      "연결된 메일함에서 가져온 이메일이 아닙니다.",
    "This has already started, so it can no longer be cancelled.":
      "이미 시작되어 더 이상 취소할 수 없습니다.",
    "This is already approved.": "이미 승인되었습니다.",
    "This is not waiting for approval.": "승인을 기다리는 상태가 아닙니다.",
    "This mentions sensitive details. Do not share passwords, codes, or account details in response to an unexpected message.":
      "민감한 정보가 언급되어 있습니다. 예상하지 못한 메시지에 응답하며 비밀번호, 인증 코드 또는 계정 정보를 알려주지 마세요.",
    "This message tells you not to do this. Real companies say this, and scammers copy it too, so check any other requests in it.":
      "메시지는 이 행동을 하지 말라고 안내합니다. 실제 회사도 이런 안내를 하지만 사기범도 따라 쓸 수 있으니 다른 요청 내용도 확인해 주세요.",
    "This was prepared in practice mode. Please prepare it again now that practice mode is off.":
      "연습 모드에서 준비한 내용입니다. 지금은 연습 모드가 꺼져 있으니 다시 준비해 주세요.",
    Threats: "위협",
    "Threats of arrest or legal trouble are a common scare tactic.":
      "체포나 법적 문제를 들먹이는 것은 흔히 쓰이는 겁주기 수법입니다.",
    "Today’s read-aloud limit has been reached. Please try again tomorrow.":
      "오늘의 소리 내어 읽기 이용 한도에 도달했습니다. 내일 다시 시도해 주세요.",
    "Use a whole number for individual items or packages. Choose a weight or volume for a measured amount.":
      "낱개나 포장은 정수로 입력해 주세요. 계량한 양은 무게나 부피 단위를 선택해 주세요.",
    "Wait for an answer": "답변 기다리기",
    "Warning signs were found. Check the message before replying, paying, or sharing details.":
      "위험 신호를 찾았습니다. 답장하거나, 돈을 내거나, 정보를 알려주시기 전에 메시지를 확인해 주세요.",
    "Warns against sharing private details":
      "개인정보를 알려주지 말라고 경고함",
    "Warns against threats": "위협을 경계하라고 경고함",
    "Warns against unusual payments": "특이한 결제 방식을 경계하라고 경고함",
    "We are not sure the last try failed. Check whether it went through before trying again.":
      "지난 시도가 실패했는지 확실하지 않습니다. 다시 시도하시기 전에 처리되었는지 확인해 주세요.",
    "We are still checking this action. Wait for that check to finish.":
      "아직 이 작업을 확인하고 있습니다. 확인이 끝날 때까지 기다려 주세요.",
    "Which appointment is the ride for?": "어느 약속에 가실 차편인가요?",
    "Who would you like to ask?": "누구에게 부탁하시겠어요?",
    "Write a few words or add a photo first.":
      "먼저 글을 조금 적으시거나 사진을 추가해 주세요.",
    "Write your reply first.": "먼저 답장을 적어 주세요.",
    "You are not connected with this person.":
      "이 사람과 연결되어 있지 않습니다.",
    "You cancelled this.": "취소하셨습니다.",
    "You offered or asked, and the answer was yes.":
      "제안하거나 요청하셨고, 상대방이 승낙했습니다.",
    "You offered or asked. The answer is not clear yet.":
      "제안하거나 요청하셨습니다. 아직 답변의 뜻이 분명하지 않습니다.",
    "You offered or asked. There is no answer yet.":
      "제안하거나 요청하셨습니다. 아직 답변이 없습니다.",
    "iMessage is not set up for this app yet. Ask whoever set it up to run bun run dev:setup.":
      "이 앱에는 iMessage가 아직 설정되지 않았습니다. 설정한 분께 bun run dev:setup 명령을 실행해 달라고 요청해 주세요.",
    "iMessage is not set up for this app.":
      "이 앱에는 iMessage가 설정되지 않았습니다.",
  },
  // Match complete templates only; captured names, titles and quotes stay verbatim.
  patterns: [
    [
      /^Read-aloud is unavailable \((?<status>[1-5]\d{2})\)\. Please try again later\.$/u,
      (status) =>
        `소리 내어 읽기를 사용할 수 없습니다 (${status}). 나중에 다시 시도해 주세요.`,
    ],
    [/^Ride to (?<title>.+)$/u, (title) => `약속까지의 차편: ${title}`],
    [
      /^Waiting for (?<name>[^“”"\r\n]+) to answer\.$/u,
      (name) => `${name}의 답변을 기다리고 있습니다.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) said: “(?<body>[\s\S]*)”$/u,
      (name, body) => `${name}의 말: “${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) can't drive this time\. You could ask someone else\.$/u,
      (name) =>
        `${name}에게 이번 차편은 어려운 상황입니다. 다른 분께 부탁하셔도 됩니다.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\.$/u,
      (name) => `아직 ${name}에게 연락할 방법이 없습니다.`,
    ],
    [
      /^Set up iMessage for (?<name>[^“”"\r\n]+) in Trusted circle, then ask them to text their assigned number first\.$/u,
      (name) =>
        `믿을 수 있는 사람들에서 ${name}의 iMessage를 설정한 뒤 배정된 번호로 먼저 문자를 보내 달라고 요청해 주세요.`,
    ],
    [
      /^Link (?<name>[^“”"\r\n]+)'s Telegram in Trusted circle first: send them their link and ask them to tap Start\.$/u,
      (name) =>
        `먼저 믿을 수 있는 사람들에서 ${name}의 Telegram을 연결해 주세요. 전용 링크를 보내고 시작을 눌러 달라고 요청해 주세요.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) replied, but it is not clear yet: “(?<body>[\s\S]*)”$/u,
      (name, body) =>
        `${name}에게 답장이 왔지만 뜻이 아직 분명하지 않습니다: “${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\. Add one under Trusted circle\.$/u,
      (name) =>
        `아직 ${name}에게 연락할 방법이 없습니다. 믿을 수 있는 사람들에서 추가해 주세요.`,
    ],
    [
      /^Practice: the message to (?<name>[^“”"\r\n]+) was not really sent\. A practice reply will arrive shortly\.$/u,
      (name) =>
        `연습: ${name}에게 메시지를 실제로 보내지 않았습니다. 곧 연습용 답장이 도착합니다.`,
    ],
    [
      /^Photon accepted the iMessage to (?<name>[^“”"\r\n]+) for delivery\.$/u,
      (name) => `Photon이 ${name}에게 보낼 iMessage 전송 요청을 접수했습니다.`,
    ],
    [
      /^Shared with (?<count>\d+) (?:person|people) in your trusted circle\.$/u,
      (count) => `믿을 수 있는 사람들 중 ${count}명에게 공유했습니다.`,
    ],
    [
      /^Reply sent to (?<to>[^“”"\r\n]+)\.$/u,
      (to) => `${to}에게 답장을 보냈습니다.`,
    ],
    [
      /^Draft saved in your (?<provider>Gmail|Outlook) Drafts folder\. It has not been sent\.$/u,
      (provider) =>
        `${provider}의 임시보관함에 초안을 저장했습니다. 보내지 않았습니다.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked, and the answer was yes\.$/u,
      (name) => `${name}의 제안이나 요청에 상대방이 승낙했습니다.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. There is no answer yet\.$/u,
      (name) => `${name}의 제안이나 요청에 아직 답변이 없습니다.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. The answer is not clear yet\.$/u,
      (name) =>
        `${name}의 제안이나 요청에 대한 답변의 뜻이 아직 분명하지 않습니다.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) asked a question you haven't answered yet\.$/u,
      (name) => `${name}의 질문에 아직 답하지 않으셨습니다.`,
    ],
    [
      /^Answer (?<name>[^“”"\r\n]+)'s offer, if you'd like to accept it\.$/u,
      (name) => `${name}의 제안을 받아들이고 싶으시면 답해 주세요.`,
    ],
    [
      /^In your last (?<messages>\d+) messages? with (?<name>[^“”"\r\n]+), LifeLink found (?<agreements>\d+) agreements? and (?<offers>\d+) offers? or requests? without a clear answer\.$/u,
      (messages, name, agreements, offers) =>
        `${name} 님과 주고받은 최근 메시지 ${messages}개에서 LifeLink가 합의 ${agreements}건과 명확한 답변이 없는 제안 또는 요청 ${offers}건을 찾았습니다.`,
    ],
  ],
};

export { ko };

export type { ServerCatalog };
