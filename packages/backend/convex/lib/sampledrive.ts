/**
 * The sample Google Drive every practice account sees. Contents are invented
 * for practice; pictures are served by the web app from /practice.
 */
import { DAY, HOUR } from "./time";

const DOCUMENT = "application/vnd.google-apps.document";
const SPREADSHEET = "application/vnd.google-apps.spreadsheet";
const FOLDER = "application/vnd.google-apps.folder";
const PDF = "application/pdf";
const SVG = "image/svg+xml";

type PracticeContent =
  | { alt: string; src: string; type: "image" }
  | { text: string; type: "text" };

interface PracticeFile {
  content: PracticeContent;
  mimeType: string;
  modifiedAt: number;
  name: string;
}

const text = (...paragraphs: string[]): PracticeContent => ({
  text: paragraphs.join("\n\n"),
  type: "text",
});

const picture = (src: string, alt: string): PracticeContent => ({
  alt,
  src,
  type: "image",
});

const MEDICATION_LIST = text(
  "MEDICATION LIST\nKeep a printed copy on the refrigerator and one in my purse. Bring this list to every appointment.",
  "Last reviewed with Dr. Anita Patel at Riverside Family Medicine.",
  "MORNING (with breakfast, around 8:00)\n• Lisinopril 10 mg, 1 tablet. For blood pressure. Take even if I feel fine.\n• Metformin 500 mg, 1 tablet. For blood sugar. Take with food so my stomach does not get upset.\n• Vitamin D3 1000 IU, 1 soft gel.\n• Baby aspirin 81 mg, 1 tablet. Dr. Patel said to keep taking it unless a surgeon tells me to stop.",
  "MIDDAY (with lunch, around 12:30)\n• Metformin 500 mg, 1 tablet.\n• Calcium with vitamin D, 1 chewable. Do not take at the same time as the thyroid pill.",
  "EVENING (around 6:00)\n• Atorvastatin 20 mg, 1 tablet. For cholesterol.\n• Metformin 500 mg, 1 tablet with dinner.",
  "BEDTIME (around 10:00)\n• Levothyroxine 50 mcg, 1 tablet. Moved to bedtime in March because mornings were too crowded. Take on an empty stomach, at least 3 hours after dinner.\n• Eye drops (latanoprost), 1 drop in each eye.",
  "AS NEEDED\n• Acetaminophen 500 mg, up to 2 tablets every 6 hours for knee pain. No more than 6 tablets in a day.\n• Saline nasal spray for dry air in winter.",
  "ALLERGIES AND REACTIONS\n• Penicillin: hives (1987). Tell every new doctor and pharmacist.\n• Codeine: made me very dizzy and sick to my stomach.\n• Shellfish: mild itching. Avoid.",
  "PHARMACY\nMain Street Pharmacy, 410 Main Street. Phone (555) 010-0123. Refills can be ordered by phone with the number on the bottle. Ask for Maria, she knows my list.\nMail-order pharmacy sends the atorvastatin and levothyroxine every 90 days. Order 2 weeks before running out.",
  "QUESTIONS FOR MY NEXT VISIT\n1. Can I stop the calcium chewable if my bone scan looks good?\n2. Is it safe to take the new allergy pill Linda suggested with my blood pressure medicine?\n3. Should the eye drops be at bedtime or in the morning?\n4. My ankles swell in the evening. Is that the lisinopril?",
  "WHAT I DO IF I MISS A DOSE\nIf I remember within a few hours, I take it. If it is almost time for the next one, I skip it. I never take two at once. When unsure, I call the pharmacy."
);

const CARE_PLAN = text(
  "EMERGENCY CONTACTS AND CARE PLAN",
  "In an emergency, call 911 first. Then call the people below in this order until someone answers.",
  "1. Sam Rivera (son), mobile (555) 555-0142. Lives 15 minutes away. Has a key to the house.\n2. Linda Rivera (daughter), mobile (555) 555-0177, email linda.rivera@example.com. Lives in Albany. Handles insurance questions.\n3. Marcus Rivera (grandson), mobile (555) 555-0190. College student, best reached by text.\n4. Neighbor: Dolores Chen, 14 Maple Court, (555) 555-0111. Has a spare key and knows where my medicines are.",
  "DOCTORS\n• Primary care: Dr. Anita Patel, Riverside Family Medicine, 2100 River Road, Suite 4. (555) 010-0188.\n• Eye doctor: Dr. James Okafor, Clearview Eye Care. (555) 010-0145.\n• Cardiologist: Dr. Helen Moss, Valley Heart Center. (555) 010-0166.\n• Dentist: Dr. Ruiz, Bright Smiles Dental. (555) 010-0133.",
  "HEALTH CONDITIONS\nHigh blood pressure, type 2 diabetes (controlled with pills), underactive thyroid, glaucoma (early), arthritis in the left knee. Pacemaker: no. Hearing aids: yes, both ears, extra batteries in the kitchen drawer.",
  "WHAT TO BRING TO THE HOSPITAL\n• My purse: photo ID, Medicare card, supplemental insurance card, this care plan.\n• The medication list on the refrigerator.\n• Glasses, hearing aids and charger, phone and charger.\n• A sweater. Hospitals are always cold.",
  "MY WISHES\nMy health care proxy is Linda Rivera. The signed form is in the blue folder in the desk, top drawer, and Dr. Patel's office has a copy. I have a living will in the same folder. I would like my pastor, Reverend Ellis at Grace Community Church, to be called if I am in the hospital for more than a day.",
  "PETS\nBiscuit (beagle, 9 years old). Eats twice a day, one cup of the food in the green bag. Dolores or Sam can take him. His vet is Dr. Lang at Maple Animal Clinic, (555) 010-0150.",
  "HOUSE\nWater shut-off valve is in the basement, behind the furnace, red handle. Circuit breaker box is in the garage on the left wall. The furnace company is Comfort Heating, (555) 010-0177, account number is on the sticker on the furnace."
);

const APPLE_PIE = text(
  "GRANDMA ROSE'S APPLE PIE\nMakes one 9-inch pie. Serves 8. This is the one everyone asks for at Thanksgiving.",
  "CRUST (makes top and bottom)\n• 2 1/2 cups all-purpose flour\n• 1 teaspoon salt\n• 1 tablespoon sugar\n• 1 cup (2 sticks) cold unsalted butter, cut into small cubes\n• 6 to 8 tablespoons ice water",
  "FILLING\n• 6 to 7 medium apples, about 3 pounds. Use a mix: half Granny Smith, half Honeycrisp.\n• 3/4 cup sugar\n• 2 tablespoons flour\n• 1 teaspoon cinnamon\n• 1/4 teaspoon nutmeg\n• A pinch of salt\n• 1 tablespoon lemon juice\n• 2 tablespoons butter, cut in small pieces\n• 1 egg beaten with 1 tablespoon milk, for brushing the top",
  "MAKING THE CRUST\n1. Whisk flour, salt and sugar in a large bowl.\n2. Work in the cold butter with a pastry cutter or two forks until it looks like coarse crumbs with some pea-sized pieces.\n3. Sprinkle the ice water a tablespoon at a time, stirring with a fork, until the dough holds together when pinched.\n4. Divide in two, flatten into disks, wrap, and chill at least 1 hour. Overnight is fine.",
  "MAKING THE FILLING\n5. Peel, core and slice the apples about 1/4 inch thick.\n6. Toss with sugar, flour, cinnamon, nutmeg, salt and lemon juice. Let sit 15 minutes while you roll the crust.",
  "PUTTING IT TOGETHER\n7. Heat the oven to 425°F with a baking sheet on the bottom rack to catch drips.\n8. Roll one disk to a 12-inch circle and fit into the pie plate.\n9. Pile in the apples, mounding them in the middle. Dot with butter.\n10. Roll the second disk and lay it on top. Trim, fold the edges under, and crimp with your fingers or a fork.\n11. Cut 4 or 5 slits in the top. Brush with the egg wash and sprinkle with a little sugar.",
  "BAKING\n12. Bake 20 minutes at 425°F, then lower to 375°F and bake 35 to 45 minutes more, until the crust is deep golden and the juice bubbles through the slits.\n13. If the edges brown too fast, cover them with strips of foil.\n14. Cool at least 2 hours so the filling sets. It is worth the wait.",
  "NOTES FROM ME\nMom always added a handful of raisins. Sam hates raisins, so I stopped. Linda likes it with sharp cheddar on the side, the way Grandpa did. Freezes well before baking: wrap tightly and bake from frozen, adding 20 minutes."
);

const VISIT_NOTES = text(
  "NOTES FROM MY VISIT WITH DR. PATEL — SEPTEMBER",
  "Linda came with me and took notes on her phone. These are her notes, cleaned up.",
  "WHY I WENT\nRegular six-month check-up. Also asked about my left knee, the ankle swelling in the evenings, and feeling more tired than usual in the afternoons.",
  "WHAT THE DOCTOR SAID\nBlood pressure was 132 over 78. She said that is good for my age and to keep doing what I am doing. My A1C (the 3-month blood sugar number) came back at 6.9, a little better than last time (7.2). She wants it under 7, so that counts as a win.",
  "The ankle swelling is probably from sitting a lot in the afternoon, not from the pills. She suggested putting my feet up for 20 minutes after lunch, and walking a little more. If it gets worse, or only one ankle swells, or it hurts, call the office right away.",
  "The tiredness may be the thyroid. She ordered a blood test (TSH). I can go to the lab any morning this week, no appointment needed, and I do not have to fast for this one.",
  "KNEE\nArthritis is a bit worse. She does not think I need surgery. She is sending a referral for physical therapy, twice a week for six weeks. The therapy office will call me to schedule. She said acetaminophen is fine; avoid ibuprofen because of my blood pressure and kidneys.",
  "VACCINES\nGot the flu shot today in the left arm. I am due for the new COVID booster next month at the pharmacy. Shingles vaccine is done (both doses). Pneumonia vaccine is up to date.",
  "CHANGES TO MEDICINES\nNo changes. Keep everything the same. She will decide about the calcium after my bone density scan in January.",
  "THINGS I NEED TO DO\n☐ Lab test for thyroid this week.\n☐ Wait for the physical therapy office to call. If they have not called in a week, call Dr. Patel's office.\n☐ COVID booster at Main Street Pharmacy in October.\n☐ Book the next check-up for March. The front desk said to call in January because the March schedule is not open yet.\n☐ Bone density scan in January (referral already sent).",
  "NEXT APPOINTMENT\nMarch. Call in January to book."
);

const LETTER_TO_SAM = text(
  "Dear Sam,",
  "I have been meaning to write this down for a while, and your birthday seemed like the right time. You are forty this year. I keep saying it out loud to see if it sounds true, and it still does not.",
  "I remember the morning you were born. It was snowing so hard that your father put chains on the tires to get us to the hospital, and you arrived before the snowplow made it to our street. The nurse said you had the loudest cry on the floor. You have always known how to make yourself heard, and I mean that as a compliment.",
  "When you were seven you decided to build a tree house with no help from anyone. It took you the whole summer, and it leaned to the left the entire time, but you were so proud of it. You slept in it every Friday night until the weather turned cold. I used to watch your flashlight through the kitchen window and wonder what you were thinking about up there.",
  "I know the last few years have not always been easy, with the move, your father's illness, and everything that came after. You carried more than your share, and you did it without being asked. Driving me to appointments, fixing the back steps, calling every Sunday even when you were tired. I see all of it, and I am grateful for all of it.",
  "I want you to know how proud I am of the man you have become. You are a patient father to Marcus, a good friend to the people around you, and a better son than I could have hoped for. Your father would say the same, though he would probably say it with a joke first.",
  "There are a few things I would like you to have someday. Your father's watch is in the top drawer of the dresser, in the small wooden box. The photo albums from the lake house are in the hall closet. And the recipe for the apple pie is in the Family recipes folder on my computer, so you have no excuse not to make it at Thanksgiving.",
  "Happy birthday, my dear. I love you more than this letter can say.",
  "Mom"
);

const MONTHLY_BILLS = text(
  "MONTHLY BILLS (spreadsheet)",
  "Bill · Due day · Usual amount · How I pay · Status this month\nElectric (Valley Power) · 12th · about $85 · Automatic from checking · Paid Oct 12\nGas heat (Comfort Gas) · 15th · $40 summer, $140 winter · Automatic · Paid Oct 15\nWater and sewer (Town) · 20th · about $55 every 3 months · Check by mail · Due in November\nPhone and internet (Lightwave) · 28th · $89.99 · Automatic · Coming up\nCell phone (family plan) · 3rd · $25 to Sam · Sam pays, I send him $25 · Sent Oct 3\nHome insurance (Harbor Mutual) · March 1 · $1,140 yearly · Check · Paid in March\nCar insurance · Every 6 months, April and October · $410 · Online · Paid Oct 2\nProperty tax · January 31 and July 31 · $1,850 each · Check to Town Hall · Next in January\nSupplemental health insurance · 1st · $189 · Automatic · Paid Oct 1\nNewspaper · 1st · $18 · Card · Paid\nStreaming (TV) · 9th · $11.99 · Card · Paid",
  "NOTES\nLightwave raised the price $5 in September. Ask Marcus to call them about the senior discount.\nIf a bill looks wrong, do not pay it right away. Call Linda first.\nNever give bank details over the phone to someone who called me. Call the number on the bill instead."
);

const BIRTHDAYS = text(
  "BIRTHDAYS AND ANNIVERSARIES (spreadsheet)",
  "Name · Date · Notes\nMarcus · January 9 · Likes gift cards for the bookstore\nDolores (neighbor) · February 21 · Lemon cake\nLinda · March 14 · Send a card, she keeps them all\nWedding anniversary (me and Robert) · April 30 · Visit the lake\nSam · May 2 · 40 this year! Letter is in Drive\nEmma (Linda's daughter) · June 18 · Turning 12, loves horses\nReverend Ellis · July 7 · Card from the whole Bible study group\nLinda and Paul's anniversary · August 22\nMe · September 30\nBiscuit (the dog) · October 1 · Extra treat\nCousin Margaret · November 11 · Call, she does not do email\nTom (Sam's wife's father) · December 5"
);

const VOLUNTEER = text(
  "GRACE COMMUNITY CHURCH — VOLUNTEER SCHEDULE (spreadsheet)",
  "Week of · Job · With · Time\nOctober 26 · Welcome table · Dolores · 9:30 to 10:30 AM\nNovember 2 · Coffee hour · Bev and Frank · after the 10:00 service\nNovember 9 · Off\nNovember 16 · Food pantry sorting · Youth group · 1:00 to 3:00 PM\nNovember 23 · Thanksgiving baskets packing · Everyone · 10:00 AM to noon\nNovember 30 · Off (at Linda's for Thanksgiving weekend)\nDecember 7 · Welcome table · Dolores · 9:30 to 10:30 AM\nDecember 14 · Christmas pageant costumes · Sunday school teachers · 2:00 PM",
  "Questions go to the church office, (555) 010-0102."
);

const THANKSGIVING = text(
  "THANKSGIVING AT LINDA'S",
  "Travel: Sam drives me up on Wednesday, November 26. Leave at 10:00 AM to beat traffic. About 3 hours with one stop.",
  "What I am bringing: two apple pies (bake Tuesday), the cranberry relish, and the good serving spoon Linda always borrows.",
  "Packing list\n• Medicines for 5 days plus 2 extra days, in the weekly pill box\n• Hearing aid charger\n• Walking shoes and the knee brace\n• Warm sweater and slippers\n• Gift for Emma (the horse book)\n• Phone charger",
  "Biscuit stays with Dolores. Drop him off Tuesday evening with his food and the blue blanket.",
  "Coming home Sunday, November 30. Linda will drive me halfway and Sam will meet us at the diner in Hudson."
);

const GARDEN = text(
  "GARDEN NOTES",
  "Tomatoes did best by the south fence again. Plant Early Girl and Sun Gold next year, skip the big beefsteaks, they split.",
  "Roses: prune in late March when the forsythia blooms. The yellow one by the mailbox needs more sun; ask Sam to cut back the maple branch.",
  "Bulbs to plant in late October: 30 daffodils along the walk, 20 tulips by the porch. The squirrels ate most of last year's tulips, so try planting them with chicken wire over the top.",
  "Herbs: the basil did not like the rain. Rosemary comes inside in November, put it in the kitchen window.",
  "Ideas for spring: raised bed so I do not have to kneel. Marcus said he could build one over spring break."
);

const PT_EXERCISES = text(
  "HOME EXERCISE PROGRAM — VALLEY PHYSICAL THERAPY (PDF)",
  "Do these once a day. Stop if you feel sharp pain. Mild soreness is okay.",
  "1. Heel slides. Lying on your back, slowly bend the left knee by sliding the heel toward you, then straighten. 10 times, 2 sets.",
  "2. Quad sets. Sitting with your leg straight, tighten the muscle on top of the thigh and press the back of the knee down. Hold 5 seconds. 10 times.",
  "3. Seated knee extension. Sitting in a sturdy chair, straighten the left knee and hold 3 seconds, then lower slowly. 10 times, 2 sets.",
  "4. Sit to stand. From a firm chair with arms, stand up using your legs as much as you can, then sit down slowly. 8 times.",
  "5. Standing marching. Holding the kitchen counter, march in place for 1 minute.",
  "Ice the knee for 15 minutes afterward if it feels sore. Next visit: Thursday at 2:00 PM."
);

const MEDICARE_NOTICE = text(
  "MEDICARE SUMMARY NOTICE — JULY TO SEPTEMBER (PDF)",
  "This is not a bill.",
  "Your deductible status: you have met your Part B deductible for this year.",
  "Claims in this period\n• Riverside Family Medicine, Sept 9: office visit, flu shot. Amount Medicare paid: $142.18. You may be billed: $28.44 (your supplemental insurance should cover this).\n• Quest lab, Sept 12: thyroid blood test. Medicare paid: $18.40. You may be billed: $0.00.\n• Clearview Eye Care, Aug 4: eye exam, pressure check. Medicare paid: $96.10. You may be billed: $24.02.",
  "If you see a service you did not get, call 1-800-MEDICARE. Never give your Medicare number to someone who calls you unexpectedly."
);

const DOCUMENTS_LOCATION = text(
  "WHERE MY IMPORTANT PAPERS ARE",
  "Blue folder, desk top drawer: health care proxy, living will, copy of the will, list of bank accounts (account names only, no passwords).",
  "Fireproof box in the bedroom closet: original will, house deed, car title, Robert's death certificate, marriage certificate, my birth certificate, passport.",
  "Lawyer: Ms. Diane Ford, Ford & Associates, (555) 010-0199. She has the original will on file too.",
  "Bank: Riverside Savings, branch on Main Street. Linda is on the checking account as a joint owner.",
  "Life insurance policy: Harbor Life, policy papers in the fireproof box. Beneficiaries are Sam and Linda.",
  "Tax returns for the last seven years are in the Tax documents folder here in Drive and paper copies in the basement file cabinet."
);

const BOOK_CLUB = text(
  "BOOK CLUB LIST",
  "Read this year: The Lincoln Highway (loved it), Lessons in Chemistry (fun), Demon Copperhead (hard but good).",
  "Next meeting: second Tuesday at the library, 2:00 PM. Bring the large-print copy back.",
  "Books I want to suggest: Tom Lake, The Covenant of Water, and something funny for the holidays."
);

const FOLDER_CONTENTS_TAX = text(
  "In this folder:\n• 2025 tax return (PDF)\n• 2025 1099-R from the pension (PDF)\n• 2025 Social Security statement SSA-1099 (PDF)\n• Property tax receipts 2025 (photo)\n• Charitable donations 2025 (spreadsheet)"
);

const FOLDER_CONTENTS_RECIPES = text(
  "In this folder:\n• Grandma Rose's apple pie\n• Cranberry relish\n• Robert's chili\n• Lemon cake for Dolores\n• Sunday pot roast"
);

const FOLDER_CONTENTS_REUNION = text(
  "In this folder:\n• 48 photos from the Rivera family reunion at the lake, July\n• Group photo (the good one, everyone is looking)\n• Video of Marcus and Emma's canoe race"
);

const MONTHS_OF_PAPERWORK = 24;

const monthLabel = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

const dayLabel = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

const currency = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

const dollars = (cents: number): string => currency.format(cents / 100);

/** One month of scanned paperwork: a bank statement, a power bill, and two pharmacy receipts. */
const paperworkFor = (now: number, monthsAgo: number): PracticeFile[] => {
  const statementAt = now - (monthsAgo * 30 + 2) * DAY;
  const billAt = now - (monthsAgo * 30 + 9) * DAY;
  const month = monthLabel.format(statementAt);
  const electric = 6200 + ((monthsAgo * 1337) % 4100);
  const balance = 412_000 + ((monthsAgo * 7919) % 90_000);

  const receipts = [11, 24].map((dayOfMonth, index) => {
    const at = now - (monthsAgo * 30 + 30 - dayOfMonth) * DAY;
    const copay = [500, 1000, 0, 1500][(monthsAgo + index) % 4] ?? 0;

    return {
      content: text(
        `MAIN STREET PHARMACY — RECEIPT\n${dayLabel.format(at)}`,
        index === 0
          ? "Atorvastatin 20 mg, 90 tablets\nLevothyroxine 50 mcg, 90 tablets"
          : "Lisinopril 10 mg, 90 tablets\nMetformin 500 mg, 270 tablets",
        `Your copay: ${dollars(copay)}\nPaid with card ending 4417. Keep for your records.`
      ),
      mimeType: PDF,
      modifiedAt: at,
      name: `Pharmacy receipt, ${dayLabel.format(at)}.pdf`,
    };
  });

  return [
    {
      content: text(
        `RIVERSIDE SAVINGS — CHECKING STATEMENT\n${month}`,
        `Starting balance: ${dollars(balance)}\nDeposits: Social Security ${dollars(198_400)}, pension ${dollars(86_250)}\nWithdrawals and payments: ${dollars(271_900 + electric)}\nEnding balance: ${dollars(balance + 284_650 - 271_900 - electric)}`,
        "Questions about this statement? Call the branch at (555) 010-0140. Riverside Savings will never ask for your password by phone or email."
      ),
      mimeType: PDF,
      modifiedAt: statementAt,
      name: `Bank statement, ${month}.pdf`,
    },
    {
      content: text(
        `VALLEY POWER — ELECTRIC BILL\n${month}`,
        `Amount due: ${dollars(electric)}\nDue on the 12th. Paid automatically from checking.`,
        "To report an outage, call (555) 010-0170."
      ),
      mimeType: PDF,
      modifiedAt: billAt,
      name: `Electric bill, ${month}.pdf`,
    },
    ...receipts,
  ];
};

/** Two years of scanned paperwork, so the practice Drive is large enough to scroll through. */
const practicePaperwork = (now: number): PracticeFile[] =>
  Array.from({ length: MONTHS_OF_PAPERWORK }, (_, index) =>
    paperworkFor(now, index + 1)
  ).flat();

/** Every practice file, relative to `now`. */
const practiceDriveFiles = (now: number): PracticeFile[] => [
  ...practicePaperwork(now),
  {
    content: MEDICATION_LIST,
    mimeType: DOCUMENT,
    modifiedAt: now - 3 * HOUR,
    name: "Medication list",
  },
  {
    content: picture(
      "/practice/grandkids-drawing.svg",
      "A child's crayon drawing of a yellow house with a red roof, a smiling sun, a dog, and two stick figures labeled Grandma and Emma."
    ),
    mimeType: SVG,
    modifiedAt: now - 8 * HOUR,
    name: "Emma's drawing for Grandma.svg",
  },
  {
    content: VISIT_NOTES,
    mimeType: DOCUMENT,
    modifiedAt: now - 1 * DAY,
    name: "Notes from my visit with Dr. Patel",
  },
  {
    content: CARE_PLAN,
    mimeType: DOCUMENT,
    modifiedAt: now - 2 * DAY,
    name: "Emergency contacts and care plan",
  },
  {
    content: THANKSGIVING,
    mimeType: DOCUMENT,
    modifiedAt: now - 3 * DAY,
    name: "Thanksgiving at Linda's",
  },
  {
    content: PT_EXERCISES,
    mimeType: PDF,
    modifiedAt: now - 4 * DAY,
    name: "Home exercises from physical therapy.pdf",
  },
  {
    content: VOLUNTEER,
    mimeType: SPREADSHEET,
    modifiedAt: now - 5 * DAY,
    name: "Church volunteer schedule",
  },
  {
    content: picture(
      "/practice/prescription-label.svg",
      "A practice pharmacy label for Atorvastatin 20 milligram tablets from Main Street Pharmacy, take one tablet by mouth every evening, three refills left."
    ),
    mimeType: SVG,
    modifiedAt: now - 6 * DAY,
    name: "Atorvastatin label.svg",
  },
  {
    content: picture(
      "/practice/insurance-card.svg",
      "The front of a practice health insurance card from Harbor Mutual Health showing a member name, member ID, group number, and copay amounts."
    ),
    mimeType: SVG,
    modifiedAt: now - 9 * DAY,
    name: "Insurance card (front).svg",
  },
  {
    content: MONTHLY_BILLS,
    mimeType: SPREADSHEET,
    modifiedAt: now - 12 * DAY,
    name: "Monthly bills",
  },
  {
    content: MEDICARE_NOTICE,
    mimeType: PDF,
    modifiedAt: now - 15 * DAY,
    name: "Medicare summary notice, July to September.pdf",
  },
  {
    content: GARDEN,
    mimeType: DOCUMENT,
    modifiedAt: now - 21 * DAY,
    name: "Garden notes",
  },
  {
    content: LETTER_TO_SAM,
    mimeType: DOCUMENT,
    modifiedAt: now - 26 * DAY,
    name: "Letter to Sam for his 40th",
  },
  {
    content: BOOK_CLUB,
    mimeType: DOCUMENT,
    modifiedAt: now - 30 * DAY,
    name: "Book club list",
  },
  {
    content: BIRTHDAYS,
    mimeType: SPREADSHEET,
    modifiedAt: now - 34 * DAY,
    name: "Birthdays and anniversaries",
  },
  {
    content: APPLE_PIE,
    mimeType: DOCUMENT,
    modifiedAt: now - 40 * DAY,
    name: "Grandma Rose's apple pie",
  },
  {
    content: FOLDER_CONTENTS_RECIPES,
    mimeType: FOLDER,
    modifiedAt: now - 41 * DAY,
    name: "Family recipes",
  },
  {
    content: FOLDER_CONTENTS_REUNION,
    mimeType: FOLDER,
    modifiedAt: now - 90 * DAY,
    name: "Photos from the reunion",
  },
  {
    content: DOCUMENTS_LOCATION,
    mimeType: DOCUMENT,
    modifiedAt: now - 120 * DAY,
    name: "Where my important papers are",
  },
  {
    content: FOLDER_CONTENTS_TAX,
    mimeType: FOLDER,
    modifiedAt: now - 190 * DAY,
    name: "Tax documents",
  },
];

export { DOCUMENT, FOLDER, practiceDriveFiles, SPREADSHEET };

export type { PracticeContent, PracticeFile };
