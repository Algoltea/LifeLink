interface ServerCatalog {
  exact: Record<string, string>;
  patterns: [RegExp, (...parts: string[]) => string][];
}

const SCAM_SIGNS = [
  ["pressure to act fast", "gây áp lực phải hành động nhanh"],
  ["mentions private details", "nhắc đến thông tin riêng tư"],
  ["mentions a payment method", "nhắc đến cách thanh toán"],
  ["contains a link", "có liên kết"],
  ["threats", "đe dọa"],
  ["prize or windfall", "giải thưởng hoặc khoản tiền bất ngờ"],
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
    const localized = signs.map(([, label]) => label).join(", ");
    translations[
      `This message shows ${signs.length} common warning ${signs.length === 1 ? "sign" : "signs"}: ${english}.`
    ] =
      `Tin nhắn này có ${signs.length} dấu hiệu cảnh báo thường gặp: ${localized}.`;
  }

  return translations;
};

/** Vietnamese for the backend's fixed English messages, matched exactly. */
const vi: ServerCatalog = {
  exact: {
    ...scamSummaries(),
    "Action not found.": "Không tìm thấy thao tác.",
    "Added to your calendar.": "Đã thêm vào lịch của quý vị.",
    "An action cannot change into a different kind of action.":
      "Không thể đổi một thao tác thành loại thao tác khác.",
    "An earlier try is still unresolved.":
      "Kết quả của một lần thử trước vẫn chưa được xác định.",
    "Ask for a ride": "Nhờ đưa đón",
    "Ask someone in your trusted circle to take a look.":
      "Nhờ một người trong Nhóm tin cậy xem giúp.",
    "Attempt not found.": "Không tìm thấy lần thử.",
    "Audio playback stopped responding. Please try again.":
      "Việc phát âm thanh không còn phản hồi. Vui lòng thử lại.",
    "Check up to 15 emails at a time.":
      "Vui lòng kiểm tra tối đa 15 email mỗi lần.",
    "Choose between 1 and 600 characters to read.":
      "Vui lòng chọn từ 1 đến 600 ký tự để đọc.",
    "Choose someone from your trusted circle who can be messaged.":
      "Chọn một người trong Nhóm tin cậy có thể nhận tin nhắn.",
    "Cloud AI is not set up. Your local overview is still available.":
      "AI trên đám mây chưa được thiết lập. Quý vị vẫn có thể xem bản tổng quan cục bộ.",
    "Cloud AI suggestions, with supporting quotes checked against each email. Verify details in the original message.":
      "Gợi ý từ AI trên đám mây, với các trích dẫn làm căn cứ đã được đối chiếu với từng email. Vui lòng kiểm tra chi tiết trong tin nhắn gốc.",
    "Confirm the ride": "Xác nhận chuyến đi",
    "Connect Gmail or Outlook on the Connections screen to send email.":
      "Kết nối Gmail hoặc Outlook ở màn hình Kết nối để gửi email.",
    "Contains a link": "Có liên kết",
    "Discord is not set up for this app yet.":
      "Discord chưa được thiết lập cho ứng dụng này.",
    "Discord is not set up for this app.":
      "Discord chưa được thiết lập cho ứng dụng này.",
    "Don't click links or call numbers in the message.":
      "Đừng mở liên kết hoặc gọi số điện thoại trong tin nhắn.",
    "Email, calendar, and Drive connections are not set up for this app yet.":
      "Kết nối email, lịch và Drive chưa được thiết lập cho ứng dụng này.",
    "Enter a nonnegative amount in whole cents, or leave the estimate blank.":
      "Nhập số tiền từ 0 trở lên, tính bằng số nguyên xu, hoặc để trống phần ước tính.",
    "Enter a quantity greater than 0.": "Nhập số lượng lớn hơn 0.",
    "Found it in your mailbox.": "Đã tìm thấy trong hộp thư của quý vị.",
    "Found the event on your calendar.":
      "Đã tìm thấy sự kiện trong lịch của quý vị.",
    "Found the message in the Discord conversation.":
      "Đã tìm thấy tin nhắn trong cuộc trò chuyện Discord.",
    "Found the notes in your Google Drive.":
      "Đã tìm thấy ghi chú trong Google Drive của quý vị.",
    "If it claims to be from a company, call the number on your card, bill, or their official website.":
      "Nếu tin nhắn tự nhận là từ một công ty, hãy gọi số trên thẻ, hóa đơn hoặc trang web chính thức của công ty đó.",
    "It is not in your mailbox, so it did not go through.":
      "Không có trong hộp thư của quý vị, nên việc gửi đã không thành công.",
    "Let family know": "Báo cho gia đình",
    "Links in unexpected messages can lead to fake sign-in pages. Go to the website yourself instead.":
      "Liên kết trong tin nhắn bất ngờ có thể dẫn đến trang đăng nhập giả. Thay vào đó, hãy tự mở trang web.",
    "Mentions a payment method": "Nhắc đến cách thanh toán",
    "Mentions private details": "Nhắc đến thông tin riêng tư",
    "New conversation": "Cuộc trò chuyện mới",
    "No connected mailbox to send from.":
      "Chưa có hộp thư được kết nối để gửi email.",
    "No recent emails to summarize yet.": "Chưa có email gần đây để tóm tắt.",
    "No subject or readable message text, and no action request found. Any images or attachments have not been assessed.":
      "Không tìm thấy tiêu đề, nội dung tin nhắn có thể đọc hoặc yêu cầu hành động. Chưa đánh giá hình ảnh hay tệp đính kèm.",
    "Nobody in your trusted circle can see ride plans, so no update was shared.":
      "Không ai trong Nhóm tin cậy được phép xem kế hoạch chuyến đi, nên không có cập nhật nào được chia sẻ.",
    "Not needed because the ride was declined.":
      "Không cần nữa vì lời nhờ đưa đón đã bị từ chối.",
    "Only a short casual note or shared-file context, with no meaningful subject, reply request, or time-sensitive detail found.":
      "Chỉ có lời nhắn ngắn thông thường hoặc thông tin về tệp được chia sẻ; không tìm thấy tiêu đề đáng chú ý, yêu cầu trả lời hay chi tiết cần xử lý đúng hạn.",
    "Only something that failed can be tried again.":
      "Chỉ có thể thử lại thao tác đã thất bại.",
    "Only the account owner can do this.":
      "Chỉ chủ tài khoản mới có thể làm việc này.",
    "Open emails in pages of 15.":
      "Mở email theo từng trang, mỗi trang 15 email.",
    "Paste the message you would like checked.":
      "Dán tin nhắn quý vị muốn kiểm tra.",
    "Photon accepted the iMessage for delivery under the same approval.":
      "Photon đã tiếp nhận iMessage để chuyển đi theo cùng phê duyệt đó.",
    "Photon confirmed it accepted the earlier iMessage for delivery.":
      "Photon đã xác nhận tiếp nhận iMessage trước đó để chuyển đi.",
    "Please answer the open question first.":
      "Vui lòng trả lời câu hỏi đang chờ trước.",
    "Please check up to 8,000 characters at a time.":
      "Vui lòng kiểm tra tối đa 8.000 ký tự mỗi lần.",
    "Please choose a JPG, PNG, or WebP photo under 6 MB.":
      "Vui lòng chọn ảnh JPG, PNG hoặc WebP dưới 6 MB.",
    "Please choose a photo under 6 MB.": "Vui lòng chọn ảnh dưới 6 MB.",
    "Please choose a shorter section to read aloud.":
      "Vui lòng chọn đoạn ngắn hơn để đọc thành tiếng.",
    "Please choose a time that has not passed yet.":
      "Vui lòng chọn thời điểm chưa qua.",
    "Please choose one of the options shown.":
      "Vui lòng chọn một trong các mục được hiển thị.",
    "Please read a shorter passage at a time.":
      "Vui lòng đọc từng đoạn ngắn hơn.",
    "Please sign in again to continue.": "Vui lòng đăng nhập lại để tiếp tục.",
    "Please sign in again to use read-aloud.":
      "Vui lòng đăng nhập lại để dùng chức năng đọc thành tiếng.",
    "Please sign in again.": "Vui lòng đăng nhập lại.",
    "Please write your reply first.": "Vui lòng viết câu trả lời trước.",
    "Practice emails are reviewed in LifeLink and are never sent to cloud AI.":
      "Email thực hành được xem xét trong LifeLink và không bao giờ gửi đến AI trên đám mây.",
    "Practice mode is on. Turn it off and review this again to do it for real.":
      "Chế độ thực hành đang bật. Tắt chế độ này và xem lại nội dung để thực hiện thật.",
    "Practice: done.": "Thực hành: đã xong.",
    "Practice: no draft was saved in your real mailbox.":
      "Thực hành: không lưu bản nháp nào vào hộp thư thật của quý vị.",
    "Practice: nothing was added to your real calendar.":
      "Thực hành: không thêm gì vào lịch thật của quý vị.",
    "Practice: nothing was saved in your real Google Drive.":
      "Thực hành: không lưu gì vào Google Drive thật của quý vị.",
    "Pressure can make it harder to stop and check. Verify an urgent request through a contact you already know.":
      "Áp lực có thể khiến quý vị khó dừng lại để kiểm tra. Hãy xác minh yêu cầu khẩn cấp qua một liên hệ quý vị đã biết.",
    "Pressure to act fast": "Gây áp lực phải hành động nhanh",
    "Prize or windfall": "Giải thưởng hoặc khoản tiền bất ngờ",
    "Read-aloud is not set up yet.":
      "Chức năng đọc thành tiếng chưa được thiết lập.",
    "Read-aloud is not set up yet. An OpenRouter key is needed.":
      "Chức năng đọc thành tiếng chưa được thiết lập. Cần có khóa OpenRouter.",
    "Read-aloud is unavailable. Please try again.":
      "Chưa thể đọc thành tiếng. Vui lòng thử lại.",
    "Read-aloud needs a short pause. Please try again in a minute.":
      "Chức năng đọc thành tiếng cần tạm nghỉ. Vui lòng thử lại sau một phút.",
    "Read-aloud returned an unexpected audio format. Please try again later.":
      "Chức năng đọc thành tiếng trả về định dạng âm thanh không như dự kiến. Vui lòng thử lại sau.",
    "Read-aloud returned no audio. Please try again.":
      "Chức năng đọc thành tiếng không trả về âm thanh. Vui lòng thử lại.",
    "Read-aloud took too long. Please try again.":
      "Chức năng đọc thành tiếng mất quá nhiều thời gian. Vui lòng thử lại.",
    "Requests for gift cards, transfers, or cryptocurrency deserve a separate check. These payments can be difficult to recover.":
      "Yêu cầu trả bằng thẻ quà tặng, chuyển khoản hoặc tiền mã hóa cần được kiểm tra riêng. Những khoản thanh toán này có thể khó lấy lại.",
    "Save a reminder": "Lưu lời nhắc",
    "Save the reminder": "Lưu lời nhắc",
    "Saved the notes in your Google Drive.":
      "Đã lưu ghi chú trong Google Drive của quý vị.",
    "Sharing changed for someone on this update. Please review who will see it.":
      "Quyền chia sẻ đã thay đổi với một người nhận cập nhật này. Vui lòng xem lại những ai sẽ được xem.",
    "Showing the overview made in LifeLink. Nothing was sent to cloud AI.":
      "Đang hiển thị bản tổng quan được tạo trong LifeLink. Không gửi gì đến AI trên đám mây.",
    "Spectrum has not confirmed whether this message was sent. Check again or confirm when it arrives; it cannot safely be marked as not sent.":
      "Spectrum chưa xác nhận tin nhắn này đã được gửi hay chưa. Vui lòng kiểm tra lại hoặc xác nhận khi tin nhắn đến; chưa thể an tâm đánh dấu là chưa gửi.",
    "Surprise winnings that need a fee first are almost always scams.":
      "Thông báo trúng thưởng bất ngờ yêu cầu nộp phí trước gần như luôn là lừa đảo.",
    "Telegram allows 1024 characters with photos. Shorten the message or send the photos separately.":
      "Telegram cho phép tối đa 1024 ký tự khi gửi kèm ảnh. Vui lòng rút ngắn tin nhắn hoặc gửi ảnh riêng.",
    "Telegram asked LifeLink to slow down. Nothing was sent; try again in a minute.":
      "Telegram yêu cầu LifeLink giảm tốc độ gửi. Chưa gửi gì; vui lòng thử lại sau một phút.",
    "Telegram is not set up for this app yet. Ask whoever set it up to run bun run dev:setup --only=telegram.":
      "Telegram chưa được thiết lập cho ứng dụng này. Nhờ người thiết lập ứng dụng chạy lệnh bun run dev:setup --only=telegram.",
    "Telegram is not set up for this app.":
      "Telegram chưa được thiết lập cho ứng dụng này.",
    "Telegram refused: this person has blocked the bot or never tapped Start. Ask them to open the link again.":
      "Telegram từ chối: người này đã chặn bot hoặc chưa từng nhấn Start (Bắt đầu). Nhờ họ mở lại liên kết.",
    "That Google Drive is no longer connected.":
      "Google Drive đó không còn được kết nối.",
    "That account is no longer connected. Reconnect it on the Connections screen.":
      "Tài khoản đó không còn được kết nối. Vui lòng kết nối lại ở màn hình Kết nối.",
    "That audio was too large. Please read a shorter section.":
      "Âm thanh đó quá lớn. Vui lòng chọn đoạn ngắn hơn để đọc.",
    "That calendar is no longer connected.": "Lịch đó không còn được kết nối.",
    "That could not be found.": "Không tìm thấy nội dung đó.",
    "That email could not be found.": "Không tìm thấy email đó.",
    "That mailbox is no longer connected.":
      "Hộp thư đó không còn được kết nối.",
    "That passage is too long to read at once. Please choose a shorter section.":
      "Đoạn này quá dài để đọc một lần. Vui lòng chọn đoạn ngắn hơn.",
    "That person has no way to be reached yet.":
      "Chưa có cách liên hệ với người đó.",
    "That step could not be found.": "Không tìm thấy bước đó.",
    "That task could not be found.": "Không tìm thấy công việc đó.",
    "The audio could not be loaded. Please try again.":
      "Không tải được âm thanh. Vui lòng thử lại.",
    "The automatic check has not finished. Review this message before deciding.":
      "Kiểm tra tự động chưa hoàn tất. Vui lòng xem lại tin nhắn này trước khi quyết định.",
    "The cloud overview did not finish. The local overview is shown; the provider may have received these emails.":
      "Bản tổng quan trên đám mây chưa hoàn tất. Đang hiển thị bản tổng quan cục bộ; nhà cung cấp có thể đã nhận được các email này.",
    "The cloud-reading limit has been reached. Your local overview is still available.":
      "Đã đạt giới hạn đọc trên đám mây. Quý vị vẫn có thể xem bản tổng quan cục bộ.",
    "The configured read-aloud model is not a verified ElevenLabs model on OpenRouter.":
      "Mô hình được thiết lập để đọc thành tiếng không phải là mô hình ElevenLabs đã được xác minh trên OpenRouter.",
    "The configured read-aloud voice is not supported. Please check the speech settings.":
      "Giọng đọc được thiết lập không được hỗ trợ. Vui lòng kiểm tra cài đặt giọng nói.",
    "The current subject or message asks for a reply or confirmation. Check the details before responding.":
      "Tiêu đề hoặc nội dung hiện tại yêu cầu trả lời hoặc xác nhận. Vui lòng kiểm tra chi tiết trước khi trả lời.",
    "The details changed since you looked. Please review them again.":
      "Chi tiết đã thay đổi kể từ khi quý vị xem. Vui lòng xem lại.",
    "The event is not on your calendar.":
      "Sự kiện này không có trong lịch của quý vị.",
    "The message cannot be empty.": "Tin nhắn không được để trống.",
    "The message contains a concrete event, account action, or timing detail worth reviewing.":
      "Tin nhắn có sự kiện cụ thể, thao tác liên quan đến tài khoản hoặc chi tiết về thời gian đáng xem lại.",
    "The message is not in the Discord conversation, so it did not go through.":
      "Không có tin nhắn trong cuộc trò chuyện Discord, nên việc gửi đã không thành công.",
    "The notes are not in your Google Drive.":
      "Ghi chú không có trong Google Drive của quý vị.",
    "The person you are writing to is no longer in your contacts.":
      "Người quý vị đang viết thư cho không còn trong danh bạ.",
    "The sender address matches someone in your Trusted circle and the message has context worth reviewing. An address match does not verify who sent it.":
      "Địa chỉ người gửi trùng với một người trong Nhóm tin cậy và tin nhắn có nội dung đáng xem lại. Địa chỉ trùng khớp không xác minh được ai đã gửi.",
    "The sender label or address suggests a health, billing, or account-service message. Review it; the sender's identity has not been verified.":
      "Tên hiển thị hoặc địa chỉ người gửi gợi ý rằng đây là tin về sức khỏe, hóa đơn hoặc dịch vụ tài khoản. Vui lòng xem lại; danh tính người gửi chưa được xác minh.",
    "The sender or message looks like a promotion or newsletter, without a concrete action or important subject. It can usually wait if you are not interested.":
      "Người gửi hoặc nội dung có vẻ là quảng cáo hay bản tin, không có hành động cụ thể hoặc chủ đề quan trọng. Thường có thể để sau nếu quý vị không quan tâm.",
    "The subject mentions an appointment, transaction, account notice, or other matter worth reviewing.":
      "Tiêu đề nhắc đến cuộc hẹn, giao dịch, thông báo tài khoản hoặc vấn đề khác đáng xem lại.",
    "There is a subject or substantive message, but no clear reply request. Read it to decide whether it matters to you.":
      "Có tiêu đề hoặc nội dung đáng kể, nhưng không có yêu cầu trả lời rõ ràng. Vui lòng đọc để quyết định nội dung này có quan trọng với quý vị không.",
    "There is nothing to check for this one.":
      "Không có gì cần kiểm tra ở mục này.",
    "These details could not be verified. Please prepare them again.":
      "Không xác minh được những chi tiết này. Vui lòng chuẩn bị lại.",
    "This action is missing its details.": "Thao tác này thiếu chi tiết.",
    "This audio could not be played. Please try again.":
      "Không phát được âm thanh này. Vui lòng thử lại.",
    "This browser cannot play audio. You can still read the text here.":
      "Trình duyệt này không phát được âm thanh. Quý vị vẫn có thể đọc nội dung tại đây.",
    "This can no longer be changed because it has already started.":
      "Việc này đã bắt đầu nên không thể thay đổi nữa.",
    "This changed while you were offline. Please look it over again before approving.":
      "Nội dung đã thay đổi khi quý vị ngoại tuyến. Vui lòng xem lại trước khi phê duyệt.",
    "This check for common warning signs found none in the available text. It cannot verify the sender or prove a message is genuine. Check unexpected requests with someone you trust.":
      "Lần kiểm tra dấu hiệu cảnh báo thường gặp này không tìm thấy dấu hiệu nào trong phần văn bản hiện có. Không thể xác minh người gửi hoặc chứng minh tin nhắn là thật. Vui lòng kiểm tra yêu cầu bất ngờ cùng người quý vị tin cậy.",
    "This check for common warning signs found only advice not to share details or pay in unusual ways. That advice does not prove the message is genuine. Check unexpected requests with someone you trust.":
      "Lần kiểm tra dấu hiệu cảnh báo thường gặp này chỉ tìm thấy lời khuyên không chia sẻ thông tin hoặc thanh toán bằng cách bất thường. Lời khuyên đó không chứng minh tin nhắn là thật. Vui lòng kiểm tra yêu cầu bất ngờ cùng người quý vị tin cậy.",
    "This check has expired.": "Lần kiểm tra này đã hết hạn.",
    "This email is not from a connected mailbox.":
      "Email này không đến từ hộp thư đã kết nối.",
    "This has already started, so it can no longer be cancelled.":
      "Việc này đã bắt đầu nên không thể hủy nữa.",
    "This is already approved.": "Việc này đã được phê duyệt.",
    "This is not waiting for approval.":
      "Việc này không ở trạng thái chờ phê duyệt.",
    "This mentions sensitive details. Do not share passwords, codes, or account details in response to an unexpected message.":
      "Nội dung này nhắc đến thông tin nhạy cảm. Đừng cung cấp mật khẩu, mã hoặc thông tin tài khoản khi trả lời tin nhắn bất ngờ.",
    "This message tells you not to do this. Real companies say this, and scammers copy it too, so check any other requests in it.":
      "Tin nhắn này khuyên quý vị không làm việc đó. Công ty thật cũng nói vậy và kẻ lừa đảo cũng sao chép lời này, nên hãy kiểm tra các yêu cầu khác trong tin nhắn.",
    "This was prepared in practice mode. Please prepare it again now that practice mode is off.":
      "Nội dung này được chuẩn bị ở chế độ thực hành. Chế độ thực hành hiện đã tắt, vui lòng chuẩn bị lại.",
    Threats: "Đe dọa",
    "Threats of arrest or legal trouble are a common scare tactic.":
      "Đe dọa bắt giữ hoặc gây rắc rối pháp lý là cách hù dọa thường gặp.",
    "Today’s read-aloud limit has been reached. Please try again tomorrow.":
      "Đã đạt giới hạn đọc thành tiếng hôm nay. Vui lòng thử lại ngày mai.",
    "Use a whole number for individual items or packages. Choose a weight or volume for a measured amount.":
      "Dùng số nguyên cho từng món hoặc gói. Chọn đơn vị cân nặng hoặc thể tích nếu tính theo lượng đo.",
    "Wait for an answer": "Chờ câu trả lời",
    "Warning signs were found. Check the message before replying, paying, or sharing details.":
      "Đã tìm thấy dấu hiệu cảnh báo. Vui lòng kiểm tra tin nhắn trước khi trả lời, thanh toán hoặc chia sẻ thông tin.",
    "Warns against sharing private details":
      "Cảnh báo không chia sẻ thông tin riêng tư",
    "Warns against threats": "Cảnh báo về các lời đe dọa",
    "Warns against unusual payments": "Cảnh báo về cách thanh toán bất thường",
    "We are not sure the last try failed. Check whether it went through before trying again.":
      "Chưa chắc lần thử vừa rồi đã thất bại. Vui lòng kiểm tra xem việc đó đã thành công chưa trước khi thử lại.",
    "We are still checking this action. Wait for that check to finish.":
      "Vẫn đang kiểm tra thao tác này. Vui lòng chờ kiểm tra hoàn tất.",
    "Which appointment is the ride for?":
      "Quý vị cần đưa đón đến cuộc hẹn nào?",
    "Who would you like to ask?": "Quý vị muốn nhờ ai?",
    "Write a few words or add a photo first.":
      "Vui lòng viết vài lời hoặc thêm ảnh trước.",
    "Write your reply first.": "Vui lòng viết câu trả lời trước.",
    "You are not connected with this person.":
      "Quý vị chưa kết nối với người này.",
    "You cancelled this.": "Quý vị đã hủy việc này.",
    "You offered or asked, and the answer was yes.":
      "Quý vị đã đề nghị hoặc yêu cầu và nhận được câu trả lời đồng ý.",
    "You offered or asked. The answer is not clear yet.":
      "Quý vị đã đề nghị hoặc yêu cầu. Câu trả lời vẫn chưa rõ.",
    "You offered or asked. There is no answer yet.":
      "Quý vị đã đề nghị hoặc yêu cầu. Chưa có câu trả lời.",
    "iMessage is not set up for this app yet. Ask whoever set it up to run bun run dev:setup.":
      "iMessage chưa được thiết lập cho ứng dụng này. Nhờ người thiết lập ứng dụng chạy lệnh bun run dev:setup.",
    "iMessage is not set up for this app.":
      "iMessage chưa được thiết lập cho ứng dụng này.",
  },
  // Match complete templates only; captured names, titles and quotes stay verbatim.
  patterns: [
    [
      /^Read-aloud is unavailable \((?<status>[1-5]\d{2})\)\. Please try again later\.$/u,
      (status) => `Chưa thể đọc thành tiếng (${status}). Vui lòng thử lại sau.`,
    ],
    [/^Ride to (?<title>.+)$/u, (title) => `Chuyến đi đến ${title}`],
    [
      /^Waiting for (?<name>[^“”"\r\n]+) to answer\.$/u,
      (name) => `Đang chờ ${name} trả lời.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) said: “(?<body>[\s\S]*)”$/u,
      (name, body) => `${name} đã nói: “${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) can't drive this time\. You could ask someone else\.$/u,
      (name) =>
        `${name} không thể chở quý vị lần này. Quý vị có thể nhờ người khác.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\.$/u,
      (name) => `Chưa có cách liên hệ với ${name}.`,
    ],
    [
      /^Set up iMessage for (?<name>[^“”"\r\n]+) in Trusted circle, then ask them to text their assigned number first\.$/u,
      (name) =>
        `Thiết lập iMessage cho ${name} trong Nhóm tin cậy, rồi nhờ họ nhắn trước đến số được chỉ định.`,
    ],
    [
      /^Link (?<name>[^“”"\r\n]+)'s Telegram in Trusted circle first: send them their link and ask them to tap Start\.$/u,
      (name) =>
        `Trước tiên, liên kết Telegram của ${name} trong Nhóm tin cậy: gửi liên kết riêng cho họ và nhờ họ nhấn Start (Bắt đầu).`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) replied, but it is not clear yet: “(?<body>[\s\S]*)”$/u,
      (name, body) => `${name} đã trả lời nhưng ý vẫn chưa rõ: “${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\. Add one under Trusted circle\.$/u,
      (name) =>
        `Chưa có cách liên hệ với ${name}. Vui lòng thêm cách liên hệ trong Nhóm tin cậy.`,
    ],
    [
      /^Practice: the message to (?<name>[^“”"\r\n]+) was not really sent\. A practice reply will arrive shortly\.$/u,
      (name) =>
        `Thực hành: tin nhắn cho ${name} chưa được gửi thật. Một phản hồi thực hành sẽ đến trong chốc lát.`,
    ],
    [
      /^Photon accepted the iMessage to (?<name>[^“”"\r\n]+) for delivery\.$/u,
      (name) => `Photon đã tiếp nhận iMessage gửi ${name} để chuyển đi.`,
    ],
    [
      /^Shared with (?<count>\d+) (?:person|people) in your trusted circle\.$/u,
      (count) => `Đã chia sẻ với ${count} người trong Nhóm tin cậy.`,
    ],
    [
      /^Draft saved in your (?<provider>Gmail|Outlook) Drafts folder\. It has not been sent\.$/u,
      (provider) =>
        `Đã lưu bản nháp trong thư mục Bản nháp của ${provider}. Chưa gửi.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked, and the answer was yes\.$/u,
      (name) =>
        `${name} đã đề nghị hoặc yêu cầu và nhận được câu trả lời đồng ý.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. There is no answer yet\.$/u,
      (name) => `${name} đã đề nghị hoặc yêu cầu. Chưa có câu trả lời.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. The answer is not clear yet\.$/u,
      (name) => `${name} đã đề nghị hoặc yêu cầu. Câu trả lời vẫn chưa rõ.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) asked a question you haven't answered yet\.$/u,
      (name) => `${name} đã đặt một câu hỏi mà quý vị chưa trả lời.`,
    ],
    [
      /^Answer (?<name>[^“”"\r\n]+)'s offer, if you'd like to accept it\.$/u,
      (name) => `Trả lời lời đề nghị của ${name} nếu quý vị muốn nhận lời.`,
    ],
    [
      /^In your last (?<messages>\d+) messages? with (?<name>[^“”"\r\n]+), LifeLink found (?<agreements>\d+) agreements? and (?<offers>\d+) offers? or requests? without a clear answer\.$/u,
      (messages, name, agreements, offers) =>
        `Trong ${messages} tin nhắn gần đây nhất giữa quý vị và ${name}, LifeLink tìm thấy ${agreements} thỏa thuận và ${offers} lời đề nghị hoặc yêu cầu chưa có câu trả lời rõ ràng.`,
    ],
  ],
};

export { vi };

export type { ServerCatalog };
