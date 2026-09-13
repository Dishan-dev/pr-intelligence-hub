export type MediaLead = {
  id: string;
  name: string;
  category: "Newspaper" | "Magazine" | "Digital media" | "TV" | "Radio" | "Photography" | "Webcast";
  email?: string[];
  phone?: string;
  whatsapp?: string;
  contact?: string;
  address?: string;
  bestApproach?: string;
  priority?: "High" | "Medium-High" | "Medium";
  source?: string;
  note?: string;
  status: "Not contacted";
};

const lead = (
  id: string,
  name: string,
  category: MediaLead["category"],
  email?: string[],
  phone?: string,
  contact?: string,
  note?: string,
  extra: Partial<Pick<MediaLead, "whatsapp" | "address" | "bestApproach" | "priority" | "source" | "note">> = {},
): MediaLead => ({ id, name, category, email, phone, contact, note, status: "Not contacted", ...extra });

export const MEDIA_LEADS: MediaLead[] = [
  lead("MED-001", "Daily News", "Newspaper", ["dgm.adv@lakehouse.lk"], "077 422 6712", "Chinthana Yapa, DGM Marketing"),
  lead("MED-002", "Sunday Observer", "Newspaper", ["advmanager.suo@lakehouse.lk"], "077 738 7632 / 011 242 9361", "Sudath Rajasingha, DGM Marketing"),
  lead("MED-003", "Ceylon Today", "Newspaper", undefined, "011 756 6566"),
  lead("MED-004", "Arteculate", "Magazine", ["aisha@arteculate.asia"]),
  lead("MED-005", "The Island", "Newspaper", ["dananjayaw@unl.upali.lk"], "071 454 3001"),
  lead("MED-006", "GoodPR", "Digital media", ["info@thegoodpr.com"], "077 779 9511"),
  lead("MED-007", "Newswave", "Digital media", ["admin@newswave.lk"], "011 249 7500"),
  lead("MED-008", "Ada Derana", "Digital media", undefined, "011 530 0700"),
  lead("MED-009", "The Morning", "Newspaper", ["shalindra.sales@liberty.lk", "harshanakuruwita1@gmail.com"], "077 871 8019", "Marketing Manager"),
  lead("MED-010", "Daily Mirror", "Newspaper", ["nistharcassim@gmail.com"], "077 788 0155", "Channa Jayasinghe, Sales & Marketing Manager"),
  lead("MED-011", "Asian Mirror", "Digital media", ["finance@asianmirror.lk"], "011 281 4449"),
  lead("MED-012", "Daily FT", "Newspaper", ["channaj@wijeya.lk"], "077 788 0155", "Channa Jayasinghe, Sales & Marketing Manager"),
  lead("MED-013", "Sunday Times", "Newspaper", ["renuka.sada@gmail.com"], "011 242 3258 / 011 232 8889"),
  lead("MED-014", "Havelock Magazine", "Magazine", ["capitalmediaholdings@gmail.com"], "011 259 0590 / 074 316 9144"),
  lead("MED-015", "Clicks.lk", "Digital media", ["clickslkofficial@gmail.com"], "076 638 5405"),
  lead("MED-016", "Colombo Beacon", "Digital media"),
  lead("MED-017", "Ceylon 365", "Digital media", ["ayomal.gunasekara@aiesec.net"]),
  lead("MED-018", "Hackathons.lk", "Digital media"),
  lead("MED-019", "Media Valent", "Digital media", ["mediaalent@gmail.com"]),
  lead("MED-020", "Pulse", "Digital media", undefined, "077 340 2860", "Kavindya, Marketing Executive"),
  lead("MED-021", "Maharaja - TV1, Sirasa, Yes FM and Y FM", "TV"),
  lead("MED-022", "FM Derana", "Radio"),
  lead("MED-023", "Sun FM", "Radio", ["ralston@asianbroadcasting.lk"]),
  lead("MED-024", "Kiss FM", "Radio"),
  lead("MED-025", "Hiru FM", "Radio"),
  lead("MED-026", "Y FM", "Radio", ["yfm@mbc.maharaja.lk"], "011 592 7927"),
  lead("MED-027", "Yes FM", "Radio", ["yes101crew.yesfm@maharaja.lk"], "075 500 0101"),
  lead("MED-028", "TNL Radio", "Radio", ["uditha@tnlradio.com"], "011 766 9966"),
  lead("MED-029", "Lite FM", "Radio", undefined, "077 478 8128", undefined, "Phone marked invalid in the workbook"),
  lead("MED-030", "Red FM", "Radio"),
  lead("MED-031", "Chokolaate", "Magazine", ["marketing@chokolaate.net"], "077 087 8564"),
  lead("MED-032", "Wijaya Newspapers", "Newspaper", ["channaj@wijeya.lk"], "077 788 0155"),
  lead("MED-033", "LMD", "Magazine", ["corporate@lmd.lk"], "011 259 9600"),
  lead("MED-034", "Emerging Media", "Digital media", ["thushari@emergingmedia.lk"], "077 350 4550"),
  lead("MED-035", "Atom Media", "Digital media", ["biz@atomedia.lk"], "011 738 9900"),
  lead("MED-036", "Xtream Youth", "Digital media", ["admin@xy.lk"], "077 215 4941"),
  lead("MED-037", "Let Me Know", "Digital media", ["sujanj.official@gmail.com"], "071 497 8666"),
  lead("MED-038", "Rupavahini", "TV", ["dg@rupavahini.lk"], "071 913 2111", "Chamara"),
  lead("MED-039", "ITN", "TV", ["mbibnews@gmail.com"], "071 033 2290", "Mahinde Bibile"),
  lead("MED-040", "Ninety Six Photography", "Photography", ["info@ninetysix.lk"], "077 770 3490 / 077 880 7758"),
  lead("MED-041", "Now You See Me", "Photography", ["info@nysm.lk"], "077 498 5935"),
  lead("MED-042", "SL WebCast", "Webcast", ["info@slwebcast.com"], "074 310 0312"),
  lead("MED-043", "Hiru TV", "TV", ["md@asiabroadcasting.lk"], undefined, "Shashikala"),
  lead("MED-044", "Sirasa TV", "TV", ["asokadias@cmg.lk"], "077 311 2316", "Asoka / Manoj from News"),
  lead("MED-045", "Charana TV", "TV", ["info@charanatv.lk"], "077 659 5778", "Koshala, Head of Marketing / Channa Jayasinghe, GM Sales & Marketing"),
  lead("MED-046", "Swarnavahini", "TV", ["info@swarnavahini.lk"], "071 063 4422", "Nandana"),
  lead("MED-047", "EyeviewSL", "Digital media", ["eyeview.srilanka@gmail.com"], undefined, "Asiri Abhayaratne, Assistant GM - Marketing & Sales"),
  lead("MED-048", "ITN News", "TV", ["yourstory@itv.com"], "011 279 6455", "Sudharman Radaliyagoda, DGM - News & Current Affairs"),
  lead("MED-049", "Lakhanda FM", "Radio", ["lakhandaonline@gmail.com"], "011 277 5001", "Ravi Siriwardane, DGM"),
  lead("MED-050", "Radio Sri Lanka", "Radio", ["info@slbcmail.lk"], "011 269 7491"),
  lead("MED-051", "FM Ruhuna", "Radio", ["info@slbcmail.lk"], "011 269 7491"),
  lead("MED-052", "Dinamina", "Newspaper", ["dinamina.advt@lakehouse.lk"], "077 422 6712", "Chinthana Yapa, DGM Marketing"),
  lead("MED-053", "Lankadeepa", "Newspaper", ["channaj@wijeya.lk"], "077 788 0155", "Channa Jayasinghe, Sales & Marketing Manager"),
  lead("MED-054", "Studyway.lk", "Digital media", ["marketing.studyway@gmail.com"], "076 031 7477 / 011 766 2626"),
  lead("MED-055", "LankaPuwat", "Digital media", ["lankapuvath@gmail.com"], "011 242 9429"),
  lead("MED-056", "LankaTalks", "Digital media", ["admin@lanlkatalk.com"], "077 789 5848", undefined, "Email spelling should be verified"),
  lead("MED-057", "AdaDerana Business", "Digital media", ["hameez@adaderana.lk"], "077 284 1080", "Mohamed Hameez, Marketing Executive"),
  lead("MED-058", "Newswire Sri Lanka", "Digital media", ["editor@newswire.lk", "roshen@newswire.lk"], undefined, undefined, undefined, { whatsapp: "+94 77 009 7284", bestApproach: "Send a press release or pitch a youth-leadership story", priority: "High", source: "Newswire contact page" }),
  lead("MED-059", "Echelon Magazine", "Magazine", ["hello@capitalmedia.lk"], "+94 11 257 3001", undefined, undefined, { address: "15 Station Road, Colombo 03", bestApproach: "Pitch youth entrepreneurship, leadership, innovation or employability stories", priority: "High", source: "Echelon contact page" }),
  lead("MED-060", "CEO Magazine Sri Lanka", "Magazine", ["hello@ceo.lk"], undefined, undefined, undefined, { address: "No. 347, R. A. De Mel Mawatha, Colombo 03", bestApproach: "Pitch interviews with young leaders, entrepreneurs, AIESEC alumni or senior LC representatives", priority: "High", source: "CEO Magazine Sri Lanka" }),
  lead("MED-061", "Lanka Business Online", "Digital media", ["lbonews@gmail.com", "ranjan@lbo.lk"], "+94 11 450 (official page contact begins with this number)", "Editorial / Publisher", undefined, { bestApproach: "Youth entrepreneurship, international internship, employability or startup-related stories", priority: "High", source: "Lanka Business Online contact page" }),
  lead("MED-062", "Startup Sri Lanka", "Digital media", undefined, undefined, "Official website contact form", undefined, { address: "Gampaha, Sri Lanka", bestApproach: "Student entrepreneurship, youth innovation, IDEALIZE and Global Entrepreneurship Week activities", priority: "High", source: "Startup Sri Lanka" }),
  lead("MED-063", "ReadMe Sri Lanka", "Digital media", undefined, undefined, "Write for ReadMe submission route / @readmelk", undefined, { address: "Colombo", bestApproach: "Technology projects, student startups, IDEALIZE, innovation competitions and international technology opportunities", priority: "High", source: "ReadMe Sri Lanka" }),
  lead("MED-064", "News 1st", "TV", ["contact@newsfirst.lk"], "+94 11 479 2700", undefined, undefined, { address: "45/3 Braybrooke Street, Colombo 02", bestApproach: "Major youth events, community projects, international delegations and nationally relevant stories", priority: "High", source: "News 1st", note: "Separate newsroom entry point within the Maharaja network; fax: +94 11 479 2733" }),
  lead("MED-065", "ThePapare", "Digital media", ["editor@thepapare.com", "info@thepapare.com"], undefined, "Editorial / General contact", undefined, { bestApproach: "Sports-related volunteer projects, Aquatics, university engagement and youth-event coverage", priority: "Medium-High", source: "ThePapare" }),
  lead("MED-066", "Groundviews", "Digital media", ["editors@groundviews.org"], undefined, undefined, undefined, { bestApproach: "SDGs, community development, youth participation, social impact and international volunteering stories", priority: "Medium-High", source: "Groundviews contact listing" }),
  lead("MED-067", "Colombo Telegraph", "Digital media", ["colombotelegraph@gmail.com"], undefined, undefined, undefined, { bestApproach: "Opinion pieces or nationally relevant youth, governance and social-impact stories", priority: "Medium", source: "Colombo Telegraph advertising contact" }),
  lead("MED-068", "News.lk", "Digital media", ["editor@news.lk", "dg@dgi.gov.lk"], "+94 11 366 3040 / +94 11 251 5759", "Editorial / General", undefined, { address: "163 Kirulapone Avenue, Colombo 05", bestApproach: "Nationally relevant youth-development, SDG or government-linked programmes", priority: "Medium-High", source: "News.lk contact page" }),
  lead("MED-069", "Business Lanka Magazine", "Magazine", undefined, "+94 11 230 0705-11, extension 320", "Upul Galappaththi", undefined, { address: "Sri Lanka Export Development Board, 42 Nawam Mawatha, Colombo 02", bestApproach: "Youth entrepreneurship, export-oriented startups, innovation and business-development initiatives", priority: "Medium-High", source: "Business Lanka Magazine" }),
  lead("MED-070", "Department of Government Information - New Media Unit", "Digital media", ["editor@news.lk", "info@dgi.gov.lk"], "+94 11 366 3040 / +94 11 251 5759", "New Media Unit", undefined, { address: "163 Kirulapone Avenue, Colombo 05", bestApproach: "National youth initiatives involving ministries, government institutions or public-interest programmes", priority: "Medium", source: "Department of Government Information" }),
];
