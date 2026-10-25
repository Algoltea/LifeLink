import type { Messages } from "../en";

const landing: Messages["landing"] = {
  everydayHelp: {
    displaySettings: [
      { label: "Cỡ chữ", value: "Lớn hơn" },
      { label: "Đọc to câu trả lời", value: "Bật · chậm hơn" },
      { label: "Giảm chuyển động", value: "Bật" },
      { label: "Độ tương phản", value: "Mạnh hơn" },
      { label: "Phụ đề khi gọi", value: "Bật" },
    ],
    intro:
      "Tin nhắn cho gia đình, lịch hẹn và lời nhắc, với chữ lớn và đọc to ở mọi nơi. Mọi thứ sắp được gửi vẫn chờ quý vị quyết định.",
    messages: {
      description:
        "Viết cho gia đình qua iMessage, email, Discord hoặc Telegram. “Giúp tôi hiểu” giải thích tin nhắn quý vị nhận được và gợi ý câu trả lời để quý vị chọn.",
      imageAlt:
        "Mary Cassatt, Lá thư: một người phụ nữ mặc váy hoa văn xanh dán phong bì lá thư bên bàn viết.",
      imageCaption: "Mary Cassatt, Lá thư, 1890–91.",
      title: "Tin nhắn cho gia đình",
    },
    read: {
      description:
        "Chữ lớn hơn, tương phản mạnh hơn, phụ đề và giọng đọc chậm hơn. Nói thay vì gõ bất cứ khi nào quý vị muốn. Cài đặt của quý vị áp dụng trên mọi màn hình.",
      imageAlt:
        "Édouard Manet, Người phụ nữ đọc sách: một người phụ nữ mặc áo khoác và đội mũ tối màu đọc tạp chí có tranh ngoài trời.",
      imageCaption: "Édouard Manet, Người phụ nữ đọc sách, 1880–82.",
      title: "Đọc, nghe hoặc nói",
    },
    reminder: {
      approve: "Duyệt lời nhắc",
      changeTime: "Đổi giờ",
      title: "Lời nhắc mới",
      version: "Phiên bản 1",
      what: "Gọi cho Ana",
      when: "Chủ nhật, 1 tháng 11 · 11:00 sáng",
      youSaid: "Quý vị nói: “Nhắc tôi gọi cho Ana vào Chủ nhật.”",
    },
    reminders: {
      description:
        "Hôm nay mở đầu bằng việc cần quý vị trước, sau đó là lịch hẹn và lời nhắc. Hãy nói điều cần nhớ và LifeLink sẽ ghi lại để quý vị duyệt.",
      title: "Lịch hẹn và lời nhắc",
    },
    tab: "Trợ giúp hằng ngày",
    thread: {
      helpMeUnderstand: "Giúp tôi hiểu",
      reply: "Được chứ! 9:45 ở nhà nhé? Có thể mình dẫn Max theo.",
      sent: "Đã gửi 9:05 sáng · phiên bản 2",
      sentMessage:
        "Chào Sam, thứ Ba ngày 27 tháng 10 cháu chở cô đến bác sĩ Patel được không?",
    },
    title: "LifeLink giúp được gì",
    today: {
      comingUp: "Sắp tới",
      confirmPickup: "Xác nhận Sam đón lúc 9:45",
      greeting: "Chào buổi chiều, Ruth",
      review: "Xem lại",
      rows: [
        {
          detail: "Lời nhắc · hôm nay",
          time: "8:00 tối",
          title: "Thuốc buổi tối",
        },
        {
          detail: "Chưa xác nhận",
          time: "9:45 sáng",
          title: "Sam đến đón quý vị",
        },
        { detail: "Thứ Ba, 27/10", time: "10:30 sáng", title: "Bác sĩ Patel" },
      ],
      waiting: "Đang chờ quý vị",
    },
  },
  features: {
    hint: "Ví dụ. Cuộn hoặc trỏ vào một dòng để xem phần đó của LifeLink tại đây.",
    items: {
      circle: {
        name: "Nhóm tin cậy",
        summary:
          "Mời ai đó bằng mã, chọn những gì họ được xem và trong bao lâu, và ngừng chia sẻ bất cứ lúc nào.",
      },
      connections: {
        name: "Kết nối",
        summary:
          "Mỗi tài khoản nói rõ điều gì hoạt động, điều gì chưa sẵn sàng và điều gì không có.",
      },
      documents: {
        name: "Tài liệu",
        summary: "Các tệp Google Drive của quý vị, mỗi tệp có bản xem trước.",
      },
      email: {
        name: "Email",
        summary:
          "Đánh dấu các email trông giống lừa đảo và soạn sẵn thư trả lời không bao giờ tự gửi đi.",
      },
      family: {
        name: "Trang gia đình",
        summary:
          "Trang gia đình quý vị nhìn thấy: chỉ những gì quý vị chia sẻ, có ảnh và chỗ để trả lời.",
      },
      groceries: {
        name: "Đi chợ",
        summary:
          "Danh sách kèm ngân sách và ước tính chi phí, sẵn sàng để sao chép hoặc in khi đi mua.",
      },
      help: {
        name: "Cách tôi muốn được giúp",
        summary:
          "Câu trả lời ngắn hoặc chi tiết, từng bước một, bằng ngôn ngữ quý vị chọn.",
      },
      recap: {
        name: "Tóm tắt cuộc trò chuyện",
        summary:
          "Tách điều đã thống nhất khỏi điều chỉ mới được đề nghị, và gợi ý bước tiếp theo.",
      },
      today: {
        name: "Hôm nay",
        summary:
          "Việc cần quý vị trước, rồi lịch hẹn, thời tiết và ba tin tức quý vị chọn.",
      },
    },
    titleLine1: "Mọi việc khác",
    titleLine2: "nó làm được",
  },
  footer: {
    credits: {
      afterLicense:
        ", Wikimedia Commons. Các ví dụ giao diện dùng dữ liệu mẫu.",
      byAuthor: "của RedKnight7,",
      morse:
        ". Khóa và máy ghi Morse, 1876: phạm vi công cộng, Wikimedia Commons.",
      paintings:
        "Mary Cassatt, Lá thư; Édouard Manet, Người phụ nữ đọc sách; Claude Monet, Dạo bước trên vách đá ở Pourville và Ao hoa súng; Jean-Jacques de Boissieu, Ông lão đọc sách cùng cậu bé: phạm vi công cộng (CC0),",
      telegram: "Bức điện tín Western Union năm 1959",
    },
    getStarted: "Bắt đầu",
    label: "Chân trang",
    links: {
      everydayHelp: "Trợ giúp hằng ngày",
      howItWorks: "Cách hoạt động",
      language: "Ngôn ngữ",
      ourPromise: "Lời hứa của chúng tôi",
      questions: "Câu hỏi",
      scamCheck: "Kiểm tra lừa đảo",
    },
    pictures: "Hình ảnh",
    signIn: "Đăng nhập",
    solitaire: "Solitaire",
    tagline:
      "Giúp với tin nhắn hằng ngày. Không có gì được gửi cho đến khi quý vị đồng ý.",
  },
  hero: {
    getStarted: "Bắt đầu",
    imageAlt:
      "Claude Monet, Dạo bước trên vách đá ở Pourville: hai người trên vách đá đầy hoa, nhìn ra biển sáng với những chiếc thuyền buồm.",
    imageCaption: "Claude Monet, Dạo bước trên vách đá ở Pourville, 1882.",
    intro:
      "LifeLink giúp quý vị viết cho gia đình, theo dõi lịch hẹn và kiểm tra tin nhắn hoặc thư có vẻ đáng ngờ. Quý vị đọc trọn vẹn từng tin nhắn trước khi duyệt.",
    seeHowItWorks: "Xem cách hoạt động",
    titleLine1: "Không có gì được gửi",
    titleLine2: "cho đến khi quý vị đồng ý.",
  },
  howItWorks: {
    done: "Xong",
    exampleTimes: "Giờ ví dụ",
    imageAlt:
      "Bản khắc khóa Morse, rơ-le và máy ghi, có ghi chú Đèn báo, Rơ-le, Khóa và Pin đường dây.",
    imageCaption:
      "Khóa và máy ghi Morse, khắc cho tạp chí Popular Science Monthly, 1876.",
    intro:
      "Đây là một lần nhờ chở đi, từ đầu đến cuối. Mỗi bước được gọi tên bằng lời đơn giản, để quý vị luôn biết điều gì đã xảy ra và điều gì chưa.",
    result: "Quý vị đã duyệt hai lần. Không có gì khác được gửi.",
    slipTitle: "Đi đến bác sĩ Patel",
    timeline: [
      {
        heading: "Sáng thứ Hai",
        steps: [
          { label: "Quý vị nhờ chở đi", time: "9:02 sáng" },
          { label: "LifeLink viết tin nhắn", time: "9:02 sáng" },
          {
            decision: true,
            label: "Quý vị sửa một chữ và duyệt phiên bản 2",
            time: "9:05 sáng",
          },
          { label: "Đã gửi cho Sam qua iMessage", time: "9:05 sáng" },
        ],
      },
      {
        heading: "Chiều thứ Hai",
        steps: [
          { label: "Sam trả lời: “Được chứ, 9:45 nhé?”", time: "1:40 chiều" },
          {
            decision: true,
            label: "Quý vị xác nhận giờ đón",
            time: "1:52 chiều",
          },
        ],
      },
      {
        heading: "Thứ Ba, 27 tháng 10",
        steps: [
          { label: "Nhắc: Sam đến lúc 9:45", time: "9:15 sáng" },
          { label: "Hẹn với bác sĩ Patel", time: "10:30 sáng" },
        ],
      },
    ],
    titleLine1: "Điều gì xảy ra",
    titleLine2: "sau khi quý vị nhờ",
  },
  language: {
    intro:
      "Chọn ngôn ngữ cho trang này. Khi quý vị tạo tài khoản, LifeLink sẽ giữ lựa chọn này. Nếu quý vị đã có tài khoản, khi đăng nhập sẽ dùng ngôn ngữ đã chọn trong tài khoản.",
    title: "Ngôn ngữ",
  },
  messageSlip: {
    approve: "Duyệt và gửi",
    message:
      "Chào Sam, thứ Ba ngày 27 tháng 10 cháu chở cô đến bác sĩ Patel được không? Cô cần có mặt lúc 10:30 sáng. Cảm ơn cháu! Ruth",
    notSent: "Chưa gửi",
    sent: "Đã gửi 9:05 sáng. Không có gì khác được gửi.",
    showAgain: "Xem lại lần nữa",
    to: "Gửi Sam Rivera · iMessage",
    version: "Phiên bản 2",
  },
  nav: {
    howItWorks: "Cách hoạt động",
    language: "Ngôn ngữ",
    questions: "Câu hỏi",
    scamCheck: "Kiểm tra lừa đảo",
    signIn: "Đăng nhập",
  },
  previews: {
    approveAndSend: "Duyệt và gửi",
    circle: {
      appointments: "Lịch hẹn",
      code: "Mã mời dùng một lần",
      notShared: "Không chia sẻ",
      note: "Đến 31 tháng 12",
      rides: "Đưa đón",
      scamAlerts: "Cảnh báo lừa đảo",
      shared: "Đã chia sẻ",
      stop: "Ngừng chia sẻ ngay",
      title: "Đã chia sẻ với Sam Rivera",
    },
    connections: {
      add: "Thêm lịch hẹn đã duyệt",
      footnote: "Mỗi kết nối chỉ liệt kê những gì nó thực sự làm được.",
      notReady: "Chưa sẵn sàng",
      note: "Đã kết nối",
      see: "Xem các sự kiện sắp tới",
      works: "Hoạt động",
    },
    documents: {
      files: [
        { date: "12/10", name: "Tóm tắt Medicare.pdf" },
        { date: "30/9", name: "Công thức súp của Ana" },
        { date: "14/9", name: "Ảnh khu vườn" },
      ],
      footnote:
        "Chọn một tệp để xem trước. Sửa hoặc chia sẻ trong Google Drive.",
      title: "Tài liệu",
    },
    email: {
      anaSubject: "Chủ nhật ăn trưa nhé? Mang theo album ảnh nha!",
      draftBody:
        "Chủ nhật thì tuyệt quá. Cô sẽ mang album. 12:30 được không cháu? Thương, Ruth",
      draftTitle: "Trả lời Ana · bản nháp, chưa gửi",
      note: "3 thư mới",
      parcelSender: "Dịch vụ giao bưu kiện",
      parcelSubject: "Cần xử lý: bưu kiện của quý vị đang bị giữ",
      scamWarning:
        "Thư này trông giống lừa đảo: nó yêu cầu thanh toán qua một đường liên kết.",
      title: "Email",
    },
    family: {
      footnote:
        "Sam có thể đọc và trả lời. Sam không thể gửi, duyệt hay chi tiêu thay Ruth.",
      nextAppointment: "Lịch hẹn tiếp theo",
      note: "Những gì Sam thấy",
      photos: "2 ảnh mới từ khu vườn",
      replyLabel: "Trả lời Ruth",
      replyText: "Hẹn gặp thứ Ba lúc 9:45 nhé!",
      title: "Tin tức của Ruth",
      when: "Bác sĩ Patel, thứ Ba lúc 10:30 sáng",
    },
    groceries: {
      copy: "Sao chép danh sách",
      items: [
        { label: "Sữa yến mạch, 2", value: "$7.98" },
        { label: "Bánh mì nguyên cám", value: "$4.49" },
        { label: "Táo, 6", value: "$5.20" },
        { label: "Nguyên liệu nấu súp khi Ana đến chơi", value: "$18.40" },
      ],
      note: "$62 trên ngân sách $80",
      print: "In",
      title: "Đi chợ trong tuần",
    },
    help: {
      answers: "Câu trả lời",
      language: "Ngôn ngữ trợ giúp",
      noteLabel: "Ghi chú riêng",
      noteText: "Tôi nghe điện thoại không rõ. Hãy gợi ý nhắn tin trước.",
      on: "Bật",
      oneStep: "Từng bước một",
      short: "Ngắn",
      title: "Cách tôi muốn được giúp",
    },
    recap: {
      agreed: "Đã thống nhất",
      agreedText: "Sam chở quý vị vào thứ Ba, đón lúc 9:45.",
      nextStep: "Bước tiếp theo gợi ý",
      nextStepText: "Nhắc tôi vào tối thứ Hai.",
      offered: "Chỉ mới đề nghị",
      offeredText: "Sam có thể dẫn Max theo.",
      review: "Xem lại lời nhắc",
      title: "Tóm tắt",
    },
    today: {
      goodNews: "Tin vui, do quý vị chọn",
      headlines: [
        "Thư viện mở cửa lâu hơn vào Chủ nhật",
        "Tình nguyện viên phục hồi vườn hồng của thị trấn",
        "Phà hoạt động trở lại vào mùa hè",
      ],
      note: "Thứ Hai",
      pickup: "Xác nhận Sam đón lúc 9:45",
      title: "Chào buổi sáng, Ruth",
      waiting: "Đang chờ quý vị",
      weather: "Thời tiết",
      weatherValue: "58°F, mưa nhẹ",
    },
  },
  promise: {
    howSharingWorks: "Cách chia sẻ hoạt động",
    leftImageAlt:
      "Bản khắc axit một ông lão đọc sách, có cậu bé ngồi trên đùi, bên cạnh chiếc bàn nhỏ.",
    leftImageCaption:
      "Jean-Jacques de Boissieu, Ông lão đọc sách cùng cậu bé, 1770.",
    promises: [
      "Chúng tôi sẽ không bao giờ gửi điều gì quý vị chưa đọc và duyệt. Nếu tin nhắn thay đổi sau khi quý vị duyệt, chúng tôi sẽ hỏi lại.",
      "Gia đình có thể ở gần mà không làm thay quý vị. Quý vị chọn người tin cậy được xem gì, như lịch hẹn hay đưa đón, và trong bao lâu. Họ không bao giờ có thể gửi, duyệt hay chi tiêu thay quý vị.",
      "Khi điều gì đó chỉ là thực hành, chúng tôi nói rõ. Khi có sự cố, chúng tôi cho quý vị biết chuyện gì đã xảy ra, rằng không có gì bị mất, và cần làm gì tiếp theo.",
      "Và chúng tôi sẽ không bao giờ nói một tin nhắn là an toàn. Chúng tôi chỉ ra dấu hiệu cảnh báo và để quý vị quyết định.",
    ],
    rightImageAlt:
      "Một bức điện tín Western Union năm 1959, đánh máy chữ in hoa, có đóng dấu và ghi chú viết tay.",
    rightImageCaption:
      "Một bức điện tín Western Union, 1959. Mỗi chữ đều quan trọng, và có người ký nhận.",
    sharing:
      "Thay đổi hoặc ngừng chia sẻ bất cứ lúc nào, trong Nhóm tin cậy của quý vị.",
    signature: "Trợ giúp hằng ngày. Quý vị quyết định.",
    tab: "Lời hứa của chúng tôi",
    title: "Những điều LifeLink sẽ không bao giờ làm",
  },
  questions: {
    imageAlt:
      "Claude Monet, Ao hoa súng: một cây cầu nhỏ màu xanh bắc qua ao phủ đầy hoa súng.",
    imageCaption: "Claude Monet, Ao hoa súng, 1900.",
    intro:
      "Câu trả lời cho những điều mọi người hỏi nhiều nhất, tất cả trên trang này.",
    items: [
      {
        answer:
          "Gia đình, email và một lịch hẹn mẫu, để quý vị thử mọi thứ. Không có gì thật được gửi đi, và mọi kết quả đều được ghi là Thực hành.",
        question: "Chế độ Thực hành là gì?",
      },
      {
        answer:
          "Được. Hãy nói điều quý vị cần, và LifeLink có thể đọc to câu trả lời với tốc độ quý vị chọn.",
        question: "Tôi có thể nói thay vì gõ không?",
      },
      {
        answer:
          "Không. Họ chỉ thấy những gì quý vị chia sẻ và không bao giờ có thể gửi, duyệt hay chi tiêu thay quý vị.",
        question: "Gia đình có thể làm thay tôi không?",
      },
      {
        answer:
          "Gmail, Outlook và Google Lịch, cùng iMessage, Discord và Telegram. Mỗi tài khoản cho thấy rõ điều gì hoạt động và điều gì chưa.",
        question: "Tôi có thể kết nối những tài khoản nào?",
      },
      {
        answer:
          "Không. Nó lưu danh sách, ước tính chi phí và ngân sách, rồi để quý vị sao chép hoặc in danh sách để tự đi mua.",
        question: "LifeLink có đặt mua đồ ăn không?",
      },
      {
        answer:
          "Nó trở thành một phiên bản mới, và LifeLink sẽ nhờ quý vị duyệt phiên bản đó trước khi gửi bất cứ thứ gì.",
        question: "Nếu tôi sửa tin nhắn thì sao?",
      },
      {
        answer:
          "Không. Đã gửi, đã trả lời và đã xác nhận là các bước riêng, và LifeLink nói rõ bằng lời quý vị đang ở bước nào.",
        question: "“Đã gửi” có giống “đã thống nhất” không?",
      },
      {
        answer:
          "Nó chỉ ra các dấu hiệu cảnh báo và một bước tiếp theo an toàn hơn. Nó không bao giờ hứa một tin nhắn là an toàn.",
        question: "Nó có thể nói một tin nhắn là an toàn không?",
      },
      {
        answer:
          "Solitaire thì có, và ván chơi được lưu trên thiết bị này. Tin nhắn cần có kết nối.",
        question: "Không có internet thì có dùng được không?",
      },
      {
        answer:
          "Quý vị sẽ thấy chuyện gì đã xảy ra, rằng không có gì bị mất, và cần làm gì tiếp theo.",
        question: "Nếu có sự cố thì sao?",
      },
    ],
    tab: "Câu hỏi",
    title: "Câu hỏi",
  },
  scamCheck: {
    beCareful: "Hãy cẩn thận với tin nhắn này.",
    checkMessage: "Kiểm tra một tin nhắn",
    example: "Ví dụ",
    examples: {
      call: {
        label: "Một cuộc gọi",
        nextStep: "Cúp máy và gọi cho cháu bằng số điện thoại quý vị đã có.",
        received:
          "Người gọi nói cháu của quý vị đang gặp rắc rối và cần gửi tiền ngay hôm nay.",
        signs: [
          "Đòi tiền gấp.",
          "Bảo quý vị giữ bí mật cuộc gọi.",
          "Muốn trả bằng thẻ quà tặng hoặc chuyển khoản.",
        ],
      },
      email: {
        label: "Một email",
        nextStep:
          "Gọi ngân hàng theo số in trên thẻ của quý vị. Đừng trả lời email này.",
        received:
          "Tài khoản ngân hàng của quý vị đã bị khóa. Hãy xác nhận thông tin hôm nay để tránh bị đóng tài khoản.",
        signs: [
          "Đe dọa đóng tài khoản của quý vị.",
          "Yêu cầu xác nhận thông tin cá nhân.",
          "Địa chỉ người gửi không khớp với ngân hàng của quý vị.",
        ],
      },
      letter: {
        label: "Một lá thư",
        nextStep:
          "Tự tìm hiểu công ty trao giải trước khi trả tiền hoặc gửi bất cứ thứ gì.",
        received: "Quý vị đã trúng $5,000. Hãy gửi $40 phí xử lý để nhận giải.",
        signs: [
          "Phải trả tiền trước khi nhận được gì.",
          "Quý vị không hề tham gia cuộc thi nào.",
          "Không có cách nào kiểm tra ai đã gửi.",
        ],
      },
      text: {
        label: "Một tin nhắn",
        nextStep:
          "Tự mở ứng dụng hoặc trang web của công ty giao hàng. Đừng dùng đường liên kết này.",
        received:
          "Bưu kiện của quý vị đang chờ. Hãy trả $1.99 phí giao lại trong 30 phút: parcel-redeliver.co/pay",
        signs: [
          "Hối thúc quý vị: trả trong 30 phút.",
          "Yêu cầu thanh toán qua một đường liên kết.",
          "Đường liên kết không phải trang của công ty giao hàng.",
        ],
      },
    },
    intro:
      "Dán một tin nhắn, chọn một email, chụp ảnh một lá thư hoặc kiểm tra cuộc gọi bằng loa ngoài. LifeLink chỉ ra các dấu hiệu cảnh báo và gợi ý bước tiếp theo an toàn. Nó không bao giờ nói một tin nhắn là an toàn.",
    kinds: "Các loại tin nhắn có thể kiểm tra",
    panelTitle: "Kiểm tra lừa đảo",
    saferStep: "Bước tiếp theo an toàn hơn",
    tab: "Kiểm tra lừa đảo",
    title: "Không chắc một tin nhắn là thật?",
    whatItLooksFor: "Nó tìm những gì",
  },
  solitaire: {
    boardDescription:
      "Một ván Solitaire Klondike đang chơi. Lá tám bích được chuyển lên lá chín cơ.",
    controls: ["Hoàn tác", "Gợi ý", "Ván mới"],
    intro:
      "Klondike với những lá bài lớn, rõ ràng. Chạm vào một lá để di chuyển, hoặc chơi bằng bàn phím. Hoàn tác và gợi ý luôn chỉ cách một lần bấm, và ván chơi được lưu trên thiết bị này, kể cả khi không có internet.",
    noAccount: "Không cần tài khoản.",
    play: "Chơi Solitaire",
    saved: "Ván chơi đã lưu trên thiết bị này",
    titleLine1: "Một ván Solitaire",
    titleLine2: "thư thái",
  },
  start: {
    alreadyHaveOne: "Quý vị sẽ tạo một tài khoản. Đã có tài khoản?",
    defaultRequest: "Sam có thể chở tôi đến lịch hẹn vào thứ Ba không?",
    intro:
      "Hãy nói với LifeLink điều quý vị cần, rồi đọc trọn tin nhắn trước khi có gì được gửi. Muốn xem thử trước? Quý vị có thể thử với tin nhắn mẫu.",
    myFamily: "Gia đình của tôi",
    request: "Yêu cầu của quý vị",
    sampleFamily: "Gia đình mẫu",
    seeDraft: "Xem bản nháp",
    signIn: "Đăng nhập",
    titleLine1: "Bắt đầu với",
    titleLine2: "một yêu cầu",
    tryWith: "Thử với",
    whatHelp: "Quý vị cần giúp gì?",
  },
};

export { landing };
