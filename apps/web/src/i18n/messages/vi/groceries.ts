import type { Messages } from "../en";

const groceries: Messages["groceries"] = {
  about: (amount) => `khoảng ${amount}`,
  addItem: "Thêm món",
  addItems: "Thêm món",
  aisles: {
    bakery: "Bánh mì và bánh ngọt",
    dairy: "Sữa và trứng",
    deli: "Thực phẩm chế biến sẵn",
    drinks: "Đồ uống",
    frozen: "Đồ đông lạnh",
    household: "Đồ gia dụng",
    meat: "Thịt và cá",
    other: "Các món khác",
    pantry: "Thực phẩm khô",
    personal: "Sức khỏe và chăm sóc cá nhân",
    pets: "Thú nuôi",
    produce: "Rau và trái cây",
    snacks: "Đồ ăn nhẹ",
  },
  allInCart: "Mọi món đã có trong giỏ.",
  backToGroceries: "Quay lại Thực phẩm",
  backToLists: "Quay lại danh sách",
  budget: "Ngân sách",
  budgetInvalid:
    "Nhập số tiền như 60.00 hoặc để trống nếu không đặt ngân sách.",
  budgetLabel: "Ngân sách cho danh sách này ($)",
  cancel: "Hủy",
  chooseList: "Chọn danh sách",
  clearItemSearch: "Xóa tìm kiếm",
  copied: "Đã sao chép danh sách. Quý vị có thể dán vào tin nhắn.",
  copyAsText: "Sao chép dưới dạng văn bản",
  copyFailed: "Không sao chép được trong trình duyệt này. Hãy thử in.",
  current: "Danh sách hiện tại",
  defaultName: "Thực phẩm",
  deleteDescription: (name, current) =>
    `Thao tác này xóa vĩnh viễn “${name}” cùng mọi món, ngân sách và tùy chọn. Không thể hoàn tác.${current ? " Để giữ lại dùng sau, hãy chọn hoàn tất chuyến mua sắm." : ""}`,
  deleteList: "Xóa danh sách",
  deleteNamed: (name) => `Xóa vĩnh viễn ${name}`,
  deletePermanently: "Xóa vĩnh viễn",
  deleteTitle: "Xóa danh sách thực phẩm này?",
  deleted: (name) => `Đã xóa “${name}”.`,
  deleting: "Đang xóa…",
  detailsSaved: "Đã lưu chi tiết danh sách.",
  doneShopping: "Mua sắm xong chưa?",
  editDetails: "Sửa chi tiết",
  editListDetails: "Sửa chi tiết danh sách",
  empty: "Chưa có danh sách thực phẩm.",
  emptyWithPast:
    "Chưa có danh sách hiện tại. Tạo danh sách mới hoặc mở danh sách cũ bên dưới.",
  estimate: "Ước tính",
  estimateHelp:
    "Ước tính tổng giá cho số lượng này sau giảm giá. Nhập 0 cho món miễn phí hoặc để trống nếu chưa chắc.",
  estimateInvalid: "Nhập số tiền như 3.50 hoặc để trống phần ước tính.",
  estimatedTotal: "Tổng ước tính",
  finishHint:
    "Hoàn tất sẽ chuyển danh sách vào Danh sách cũ để quý vị dùng lại sau.",
  finishTrip: "Hoàn tất chuyến mua sắm",
  finished: (day) => `Hoàn tất ${day}`,
  finishedNote: (day) =>
    `Quý vị hoàn tất chuyến mua sắm này vào ${day}. Danh sách được giữ trong Danh sách cũ để dùng lại.`,
  finishedSuffix: (day) => ` · hoàn tất ${day}`,
  inCart: (count) => ` · ${count} trong giỏ`,
  inCartDetail: (count) => `${count} trong giỏ`,
  inCartSr: " (trong giỏ)",
  inYourCart: "Trong giỏ",
  item: "Món",
  itemCount: (count) => `${count} món`,
  itemPlaceholder: "Chuối",
  itemSearch: "Tìm món trong danh sách này",
  itemSearchCount: (shown, total) => `${shown} trên ${total} món khớp`,
  itemSearchPlaceholder: "Tìm món, ví dụ sữa",
  items: "Các món",
  itemsOn: (name) => `Các món trong ${name}`,
  itemsToBuy: "Các món cần mua",
  keepList: "Giữ danh sách",
  keepTicked: "Giữ dấu chọn",
  leftToSpend: "Số tiền còn lại",
  list: "Danh sách",
  listName: "Tên danh sách",
  listNumber: (count) => `Danh sách ${count}`,
  listPreferences: "Tùy chọn danh sách",
  lists: "Danh sách thực phẩm và ngân sách",
  loading: "Đang tải các danh sách",
  loadingPast: "Đang tải danh sách cũ",
  makeUsual: "Đặt làm danh sách thường dùng",
  makeUsualTitle: "Đặt làm danh sách thường dùng",
  missingEstimates:
    "Một số món chưa có giá ước tính nên tổng thực tế có thể cao hơn.",
  moreAbove: "Còn danh sách ở trên",
  moreBelow: "Cuộn để xem thêm danh sách",
  moveBack: "Chuyển về danh sách hiện tại",
  moveHint: "Di chuyển món chưa ở đúng chỗ.",
  moveItem: (name, direction, aisle) =>
    `Chuyển ${name} ${direction === "up" ? "lên" : "xuống"}${aisle === null ? "" : `, vào ${aisle}`}`,
  movedItem: (name, direction, aisle) =>
    `Đã chuyển ${name} ${direction === "up" ? "lên" : "xuống"}${aisle === null ? "" : `, vào ${aisle}`}.`,
  movedToPast: (name) => `Đã chuyển “${name}” vào danh sách cũ.`,
  newEmptyList: "Danh sách trống mới",
  newList: "Danh sách mới",
  noBudget: "Không đặt ngân sách",
  noGuess: "chưa ước tính",
  noMatchingItems: (query) =>
    `Không có món nào khớp với “${query}” trong danh sách này.`,
  noMatchingUnit: "Không có đơn vị phù hợp.",
  notSet: "Chưa đặt",
  notSorted: "Chưa sắp xếp",
  notes: (notes) => `Ghi chú: ${notes}`,
  nothingOnList: "Danh sách chưa có món nào.",
  nothingOnListHint:
    "Danh sách chưa có món nào. Mở Thêm món để thêm món đầu tiên.",
  openItemsHint: "Thêm món hoặc bỏ dấu chọn một món trước khi in hay sao chép.",
  overBudget: "Vượt ngân sách",
  past: {
    count: (count) => `${count} danh sách cũ`,
    empty:
      "Chưa có danh sách cũ. Khi hoàn tất chuyến mua sắm, danh sách sẽ được giữ ở đây.",
    matchCount: (shown, total) => `${shown} trên ${total} khớp`,
    noMatch: (query) =>
      `Không có danh sách cũ khớp với “${query}”. Thử tên hoặc món khác.`,
    reuse: "Dùng lại",
    reuseNamed: (name) => `Dùng lại ${name} thành danh sách mới`,
    reusing: "Đang dùng lại…",
    search: "Tìm danh sách cũ",
    searchPlaceholder: "Tên danh sách hoặc món, ví dụ sữa",
    seeAll: (count) => `Xem mọi danh sách cũ (${count})`,
    seeAllHint: "Tìm, dùng lại hoặc xóa chuyến mua sắm đã hoàn tất",
    started: (name) => `Đã tạo danh sách mới từ “${name}”.`,
    subline:
      "Các chuyến mua sắm đã hoàn tất, mới nhất trước. Dùng lại một danh sách để bắt đầu tuần này.",
    title: "Danh sách cũ",
    usualPrefix: "Danh sách thường dùng: ",
  },
  pastLists: "Danh sách cũ",
  practice: {
    subline:
      "Không còn mua sắm qua LifeLink. Quý vị vẫn có thể lưu danh sách thực phẩm, lập ngân sách, sao chép hoặc in danh sách.",
    title: "Không thể mua sắm",
  },
  preferences: "Tùy chọn, mỗi dòng một mục",
  preferencesHint:
    "Nhãn hiệu yêu thích, những thứ cần tránh hoặc nhu cầu ăn uống. Tối đa 10.",
  preferencesPlaceholder: "Ít muối nếu có thể\nNhãn hiệu cửa hàng cũng được",
  printList: "In danh sách",
  quantity: "Số lượng",
  quantityErrors: {
    positive: "Nhập số lượng lớn hơn 0.",
    whole:
      "Dùng số nguyên cho món riêng lẻ hoặc gói. Chọn khối lượng hoặc thể tích cho lượng đo lường.",
  },
  quickAdd: {
    added: (count) => `Đã thêm ${count} món.`,
    adding: "Đang thêm…",
    button: "Thêm nhanh",
    buttonTitle: "Dán danh sách món",
    description:
      "Dán danh sách từ ghi chú, tin nhắn hoặc email. Mỗi dòng thành một món, và số lượng như “2 lb” hoặc “x3” sẽ được nhận ra.",
    label: "Danh sách của bạn",
    none: "Dán hoặc gõ danh sách để xem các món ở đây.",
    placeholder: "Sữa (1 L)\n500 g thịt gà\nTrứng x12\nChuối",
    preview: (count) => `${count} món sẽ thêm`,
    submit: (count) => `Thêm ${count} món`,
    title: "Dán danh sách đi chợ",
    tooMany: (room) =>
      `Danh sách này chỉ còn chỗ cho ${room} món. Hãy bớt vài dòng hoặc bắt đầu danh sách mới.`,
  },
  receiptBar: {
    estimated: "ước tính",
    left: (amount) => ` · còn ${amount}`,
    over: (amount) => ` · vượt ${amount}`,
    see: "Xem ước tính",
    total: "tổng",
  },
  removeItem: (name) => `Xóa ${name}`,
  removed: (name) => `Đã xóa ${name}.`,
  saveDetails: "Lưu chi tiết",
  scrollList: "Cuộn danh sách để xem mọi món.",
  showAllUnits: "Hiện tất cả đơn vị",
  sortByAisle: "Sắp xếp theo quầy",
  sortFallback: {
    failed: "Trợ lý không trả lời nên đã dùng hướng dẫn có sẵn của LifeLink.",
    limit:
      "Trợ lý đã sắp xếp nhiều danh sách gần đây nên đã dùng hướng dẫn có sẵn của LifeLink.",
    unavailable: "Đã sắp xếp theo hướng dẫn có sẵn của LifeLink.",
  },
  sortNewByAisle: "Sắp xếp món mới theo quầy",
  sortedByAisle: (count) => `Đã sắp xếp ${count} món theo quầy.`,
  sorting: "Đang sắp xếp…",
  startFromThis: "Tạo danh sách mới từ danh sách này",
  startFromUsual: "Bắt đầu từ danh sách thường dùng",
  startedFrom: (name) =>
    `Đã tạo danh sách mới từ “${name}”. Bản gốc không thay đổi.`,
  stillToGet: "Còn cần lấy",
  subline: "Danh sách mua sắm và ngân sách của quý vị.",
  switchLists: "Đổi danh sách hoặc mở chuyến mua sắm cũ",
  takeWithYou: "Mang danh sách theo",
  thisIsUsual: "Đây là danh sách thường dùng của quý vị",
  tickHint:
    "Đánh dấu món khi đã cho vào giỏ. Món sẽ chuyển xuống cuối, vẫn tính vào tổng nhưng không có trong bản sao chép hoặc bản in. Dùng mũi tên để di chuyển món lên hoặc xuống. Sắp xếp theo quầy đặt món theo thứ tự thường gặp trong cửa hàng, đồ đông lạnh ở cuối.",
  title: "Thực phẩm",
  toGet: (count) => `Còn ${count} món cần lấy`,
  totalEstimate: "Tổng ước tính ($)",
  typeToSearch: "Nhập để tìm",
  undo: "Hoàn tác",
  unit: "Đơn vị",
  units: {
    "": {
      label: "Từng món",
      short: "",
    },
    L: {
      label: "Lít (L)",
      short: "L",
    },
    bag: {
      label: "Túi",
      short: "túi",
    },
    bar: {
      label: "Thanh",
      short: "thanh",
    },
    bottle: {
      label: "Chai",
      short: "chai",
    },
    box: {
      label: "Hộp",
      short: "hộp",
    },
    bunch: {
      label: "Bó",
      short: "bó",
    },
    can: {
      label: "Lon",
      short: "lon",
    },
    carton: {
      label: "Hộp giấy",
      short: "hộp giấy",
    },
    case: {
      label: "Thùng",
      short: "thùng",
    },
    clove: {
      label: "Tép",
      short: "tép",
    },
    container: {
      label: "Hộp đựng",
      short: "hộp đựng",
    },
    cup: {
      label: "Cốc",
      short: "cốc",
    },
    dozen: {
      label: "Tá",
      short: "tá",
    },
    ear: {
      label: "Bắp",
      short: "bắp",
    },
    "fl oz": {
      label: "Ao-xơ chất lỏng (fl oz)",
      short: "fl oz",
    },
    g: {
      label: "Gam (g)",
      short: "g",
    },
    gallon: {
      label: "Gallon",
      short: "gal",
    },
    head: {
      label: "Bắp, củ nguyên",
      short: "củ/bắp",
    },
    jar: {
      label: "Lọ",
      short: "lọ",
    },
    kg: {
      label: "Kilôgam (kg)",
      short: "kg",
    },
    lb: {
      label: "Pao (lb)",
      short: "lb",
    },
    loaf: {
      label: "Ổ bánh mì",
      short: "ổ",
    },
    mL: {
      label: "Mililít (mL)",
      short: "mL",
    },
    oz: {
      label: "Ao-xơ (oz)",
      short: "oz",
    },
    pack: {
      label: "Gói",
      short: "gói",
    },
    packet: {
      label: "Gói nhỏ",
      short: "gói nhỏ",
    },
    piece: {
      label: "Miếng, cái",
      short: "cái",
    },
    pint: {
      label: "Pint",
      short: "pint",
    },
    pouch: {
      label: "Túi nhỏ",
      short: "túi nhỏ",
    },
    quart: {
      label: "Quart",
      short: "quart",
    },
    roll: {
      label: "Cuộn",
      short: "cuộn",
    },
    slice: {
      label: "Lát",
      short: "lát",
    },
    stick: {
      label: "Que",
      short: "que",
    },
    tbsp: {
      label: "Thìa canh (tbsp)",
      short: "tbsp",
    },
    tsp: {
      label: "Thìa cà phê (tsp)",
      short: "tsp",
    },
    tub: {
      label: "Hộp lớn",
      short: "hộp lớn",
    },
    tube: {
      label: "Tuýp",
      short: "tuýp",
    },
  },
  unmarkAll: "Bỏ mọi dấu chọn",
  unmarkDescription: (count) =>
    `Bỏ dấu chọn ${count} món trong giỏ để danh sách sẵn sàng cho chuyến mua sắm khác.`,
  unmarkTitle: "Bỏ dấu chọn mọi món?",
  unmarking: "Đang bỏ dấu chọn…",
  useAgain: "Dùng lại danh sách này",
  usual: "Danh sách thường dùng",
  usualHint:
    "Danh sách thường dùng gồm những gì quý vị cần hầu hết các tuần. Mỗi danh sách mới có thể bắt đầu từ đây.",
  usualNoLonger: (name) => `“${name}” không còn là danh sách thường dùng.`,
  usualNow: (name) => `“${name}” hiện là danh sách thường dùng.`,
  usualOnHint: "Danh sách mới có thể bắt đầu từ đây. Nhấn lần nữa để bỏ chọn.",
  usualSr: ", danh sách thường dùng của quý vị",
  yourUsual: "Danh sách thường dùng của quý vị",
};

export { groceries };
