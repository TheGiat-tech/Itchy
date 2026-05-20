"use client";

import { useMemo, useState } from "react";

type Candidate =
  | "mosquito"
  | "aedes"
  | "bedbug"
  | "flea"
  | "fire_ant"
  | "other_ant"
  | "tick"
  | "bee_wasp"
  | "spider"
  | "scabies"
  | "lice"
  | "bird_mites"
  | "rodent_mites"
  | "biting_midgies"
  | "jellyfish"
  | "sea_scratch"
  | "chemical_irritation"
  | "plant_irritation"
  | "dermatitis"
  | "unknown";

type ScoreMap = Partial<Record<Candidate, number>>;

type AnswerOption = {
  id: string;
  label: string;
  scores?: ScoreMap;
  redFlag?: boolean;
  redFlagMessage?: string;
};

type Question = {
  id: string;
  title: string;
  subtitle?: string;
  multiple?: boolean;
  showIf?: (answers: Answers) => boolean;
  options: AnswerOption[];
};

type Answers = Record<string, string[]>;

type CandidateInfo = {
  label: string;
  short: string;
  check: string[];
  warning?: string;
  articleUrl?: string;
  actionLabel?: string;
  actionUrl?: string;
  recurringAdvice: string;
};

type CandidateVisual = {
  badge: string;
  tone: string;
  panel: string;
  text: string;
};

const candidateVisuals: Record<Candidate, CandidateVisual> = {
  mosquito: { badge: "מעופף", tone: "bg-violet-50 border-violet-200", panel: "from-violet-950 to-slate-950", text: "text-violet-200" },
  aedes: { badge: "יום", tone: "bg-violet-50 border-violet-200", panel: "from-violet-950 to-slate-950", text: "text-violet-200" },
  bedbug: { badge: "מיטה", tone: "bg-rose-50 border-rose-200", panel: "from-rose-950 to-slate-950", text: "text-rose-200" },
  flea: { badge: "חיות", tone: "bg-amber-50 border-amber-200", panel: "from-amber-950 to-slate-950", text: "text-amber-200" },
  fire_ant: { badge: "שורף", tone: "bg-orange-50 border-orange-200", panel: "from-orange-950 to-slate-950", text: "text-orange-200" },
  other_ant: { badge: "נמלים", tone: "bg-orange-50 border-orange-200", panel: "from-orange-950 to-slate-950", text: "text-orange-200" },
  tick: { badge: "שטח", tone: "bg-emerald-50 border-emerald-200", panel: "from-emerald-950 to-slate-950", text: "text-emerald-200" },
  bee_wasp: { badge: "עוקץ", tone: "bg-yellow-50 border-yellow-200", panel: "from-yellow-950 to-slate-950", text: "text-yellow-200" },
  spider: { badge: "בודד", tone: "bg-slate-50 border-slate-200", panel: "from-slate-950 to-gray-950", text: "text-slate-200" },
  scabies: { badge: "עור", tone: "bg-pink-50 border-pink-200", panel: "from-pink-950 to-slate-950", text: "text-pink-200" },
  lice: { badge: "שיער", tone: "bg-sky-50 border-sky-200", panel: "from-sky-950 to-slate-950", text: "text-sky-200" },
  bird_mites: { badge: "יונים", tone: "bg-cyan-50 border-cyan-200", panel: "from-cyan-950 to-slate-950", text: "text-cyan-200" },
  rodent_mites: { badge: "מכרסמים", tone: "bg-stone-50 border-stone-200", panel: "from-stone-950 to-slate-950", text: "text-stone-200" },
  biting_midgies: { badge: "לחות", tone: "bg-teal-50 border-teal-200", panel: "from-teal-950 to-slate-950", text: "text-teal-200" },
  jellyfish: { badge: "ים", tone: "bg-blue-50 border-blue-200", panel: "from-blue-950 to-slate-950", text: "text-blue-200" },
  sea_scratch: { badge: "שפשוף", tone: "bg-blue-50 border-blue-200", panel: "from-blue-950 to-slate-950", text: "text-blue-200" },
  chemical_irritation: { badge: "ריסוס", tone: "bg-red-50 border-red-200", panel: "from-red-950 to-slate-950", text: "text-red-200" },
  plant_irritation: { badge: "צמח", tone: "bg-lime-50 border-lime-200", panel: "from-lime-950 to-slate-950", text: "text-lime-200" },
  dermatitis: { badge: "גירוי", tone: "bg-pink-50 border-pink-200", panel: "from-pink-950 to-slate-950", text: "text-pink-200" },
  unknown: { badge: "לא ברור", tone: "bg-gray-50 border-gray-200", panel: "from-gray-950 to-slate-950", text: "text-gray-200" },
};

const candidateData: Record<Candidate, CandidateInfo> = {
  mosquito: {
    label: "יתוש רגיל",
    short: "מתאים לעקיצות מגרדות באזורים חשופים, בעיקר בערב/לילה או ליד מים עומדים.",
    check: [
      "בדקו מים עומדים בתחתיות עציצים, דליים, מרזבים וניקוז.",
      "בדקו אם יש חלונות פתוחים, רשתות קרועות או כניסה ממרפסת.",
      "שימו לב אם העקיצות מופיעות בעיקר אחרי שהייה בחוץ בערב.",
    ],
    articleUrl: "/articles/mosquito",
    actionLabel: "לפתרונות אפשריים",
    actionUrl: "/shop",
    recurringAdvice:
      "מומלץ לייבש מקורות מים עומדים סביב הבית. אם המטרד חוזר, ניתן לשקול פתרונות הפחתה כמו רשתות, מאווררים, קטלנים מתאימים או ייעוץ מקצועי.",
  },
  aedes: {
    label: "יתוש הנמר האסייתי",
    short: "מתאים לעקיצות ביום, לעיתים סביב חצרות, עציצים, מים עומדים ואזורים עירוניים.",
    check: [
      "ייבשו תחתיות עציצים, דליים קטנים, צעצועים עם מים וניקוזים.",
      "בדקו אם העקיצות קורות גם בשעות היום ולא רק בלילה.",
      "חפשו מקורות מים קטנים מאוד סביב הבית והחצר.",
    ],
    articleUrl: "/articles/asian-tiger-mosquito",
    actionLabel: "לפתרונות אפשריים",
    actionUrl: "/shop",
    recurringAdvice:
      "יתוש זה פעיל ביום ודורש מעט מאוד מים כדי להתרבות. ייבוש מקורות מים הוא קריטי, ובמטרד חוזר ניתן לשקול פתרונות הרחקה סביבתיים או ייעוץ מקצועי.",
  },
  bedbug: {
    label: "פשפש המיטה",
    short: "מתאים לעקיצות שמופיעות בבוקר, בקו או בקבוצה, בעיקר באזורים שנחשפו בזמן שינה.",
    check: [
      "בדקו תפרי מזרן, ראש מיטה, מסגרת מיטה ושקעי חשמל קרובים.",
      "חפשו כתמי דם קטנים או נקודות שחורות על המצעים והמזרן.",
      "בדקו אם העקיצות חוזרות כמה לילות ברצף.",
    ],
    articleUrl: "/articles/bed-bugs",
    actionLabel: "למידע על בדיקה מקצועית",
    actionUrl: "/contact",
    recurringAdvice:
      "פשפש המיטה הוא מזיק עקשן. מומלץ לא לדחות ולבצע בדיקה מקצועית או להשתמש בערכת ניטור כדי לאמת את הנגיעות לפני שהיא מתפשטת.",
  },
  flea: {
    label: "פרעושים",
    short: "מתאים לעקיצות קטנות ומגרדות, בעיקר בקרסוליים וברגליים, במיוחד כשיש כלב/חתול או חיות רחוב.",
    check: [
      "בדקו אם חיית המחמד מתגרדת.",
      "בדקו שטיחים, ספות, מיטות של בעלי חיים ואזורים שבהם החיה רובצת.",
      "שימו לב אם העקיצות מרוכזות בקרסוליים ושוקיים.",
    ],
    articleUrl: "/articles/flea",
    actionLabel: "לפתרונות אפשריים",
    actionUrl: "/shop",
    recurringAdvice:
      "מומלץ לטפל בחיות המחמד בתכשירים וטרינריים ולשאוב את הבית ביסודיות. אם הבעיה חוזרת, ייתכן שנדרש טיפול סביבתי מקצועי.",
  },
  fire_ant: {
    label: "נמלת האש הקטנה",
    short: "מתאים לעקיצה שורפת או כואבת, לעיתים אחרי חשיפה לדשא/גינה, עם אפשרות לשלפוחית או פצעון לבן.",
    check: [
      "בדקו קיני נמלים בגינה, בדשא, ליד שבילים ועציצים.",
      "שימו לב אם הייתה תחושת שריפה מיידית.",
      "בדקו אם הופיעו שלפוחיות או פצעונים קטנים לאחר מכן.",
    ],
    warning: "אם יש קוצר נשימה, סחרחורת או נפיחות בפנים — יש לפנות מיד לעזרה רפואית.",
    articleUrl: "/articles/fire-ant",
    actionLabel: "לפתרונות אפשריים",
    actionUrl: "/shop",
    recurringAdvice:
      "שימוש בפיתיון ייעודי יכול לעזור משמעותית, אך במפגע חוזר או נרחב מומלץ לפנות למדביר מוסמך לבדיקה וטיפול.",
  },
  other_ant: {
    label: "נמלים אחרות",
    short: "מתאים לעקיצות או נשיכות מקומיות, בעיקר בגינה, מטבח, מרפסת או ליד מזון.",
    check: [
      "בדקו שבילי נמלים בבית, במטבח, במרפסת ובקרבת עציצים.",
      "בדקו אם יש מזון פתוח או סדקים שדרכם נמלים נכנסות.",
      "שימו לב אם העקיצה קרתה בזמן ישיבה על דשא או ליד אדמה.",
    ],
    articleUrl: "/articles/ants",
    actionLabel: "לפתרונות אפשריים",
    actionUrl: "/shop",
    recurringAdvice:
      "מומלץ לאתר את מקור המשיכה, כמו מזון או מים, ולאטום חריצים. ניתן לשקול שימוש בפיתיונות ג'ל מותאמים לשימוש ביתי.",
  },
  tick: {
    label: "קרצייה",
    short: "מתאים לחשיפה לשטח, עשבים, חיות או קרצייה שנראתה מחוברת לעור.",
    check: [
      "בדקו את כל הגוף, כולל מאחורי האוזניים, קפלי עור, שיער ומפשעה.",
      "שימו לב אם יש אודם מתרחב או סימן טבעתי.",
      "אם הייתה קרצייה מחוברת או הופיעו חום/חולשה — פנו לרופא.",
    ],
    warning: "קרצייה עם חום, חולשה, כאבי שרירים או פריחה מתרחבת מחייבת ייעוץ רפואי.",
    articleUrl: "/articles/ticks",
    actionLabel: "למידע על בדיקה מקצועית",
    actionUrl: "/contact",
    recurringAdvice:
      "יש להקפיד על טיפול מונע קבוע לחיות המחמד. בחצרות נגועות מומלץ להתייעץ עם מדביר לגבי טיפול סביבתי.",
  },
  bee_wasp: {
    label: "דבורה / צרעה",
    short: "מתאים לעקיצה אחת עם כאב חד מיידי, נפיחות מקומית ולעיתים עוקץ שנשאר בעור.",
    check: [
      "בדקו אם נשאר עוקץ בעור והסירו אותו בזהירות אם ניתן.",
      "חפשו קן פעיל באזור, כמו ארגז תריס, עצים, גגות או מחסן.",
      "עקבו אחרי נפיחות חריגה או תגובה אלרגית.",
    ],
    warning: "תגובה אלרגית לעקיצת דבורה או צרעה עלולה להיות מסוכנת ודורשת טיפול רפואי דחוף.",
    articleUrl: "/articles/honey-bee",
    actionLabel: "למידע על בדיקה מקצועית",
    actionUrl: "/contact",
    recurringAdvice:
      "אם מדובר בדבורים, מומלץ לפנות לגורם מקצועי להעתקה בטוחה. אם מדובר בצרעות, אין לטפל לבד — מומלץ להיעזר במדביר מוסמך.",
  },
  spider: {
    label: "עכביש",
    short: "אפשרות קיימת בעיקר כשיש עקיצה אחת, כאב מקומי, מחסן/בגדים/נעליים — אך הרבה מקרים שמיוחסים לעכביש הם לא באמת עכביש.",
    check: ["בדקו בגדים, נעליים, מחסן, פינות חשוכות וארגזים.", "שימו לב אם יש כאב מחמיר, מוגלה או אודם מתפשט.", "אם האזור מחמיר משמעותית — פנו לרופא."],
    articleUrl: "/articles/spiders",
    actionLabel: "למידע נוסף",
    actionUrl: "/articles/spiders",
    recurringAdvice: "לרוב אין צורך בהדברה אלא בניטור, ניקיון, סדר ושאיבת קורים. אם מופיעים סימנים חוזרים או כאב חריג, מומלץ להתייעץ עם גורם מתאים.",
  },
  scabies: {
    label: "סקביאס / גרדת",
    short: "פחות עקיצה בודדת ויותר גירוד חזק, בעיקר בלילה, בין אצבעות, פרקי ידיים, מותניים וקפלי עור.",
    check: ["בדקו אם עוד בני בית מתגרדים.", "שימו לב אם הגירוד חזק במיוחד בלילה.", "בחשד לגרדת צריך אבחון וטיפול רפואי."],
    articleUrl: "/articles/scabies",
    actionLabel: "למידע רפואי כללי",
    actionUrl: "/articles/scabies",
    recurringAdvice: "מדובר בבעיה רפואית של העור ולא במפגע שמדביר יכול לפתור. יש לפנות לרופא עור לאבחון וטיפול מתאים.",
  },
  lice: {
    label: "כינים",
    short: "מתאים בעיקר לגרד באזור עם שיער, קרקפת או עורף.",
    check: ["בדקו קרקפת, מאחורי האוזניים ועורף.", "חפשו ביצים קטנות הדבוקות לשיער.", "בדקו אם יש הדבקה במסגרת משפחתית או בית ספרית."],
    articleUrl: "/articles/lice",
    actionLabel: "למידע נוסף",
    actionUrl: "/articles/lice",
    recurringAdvice: "יש לטפל באמצעות מסרק צפוף ותכשירים ייעודיים מבית מרקחת, ולבדוק גם בני משפחה נוספים.",
  },
  bird_mites: {
    label: "קרדיות ציפורים / יונים",
    short: "מתאים לעקיצות בבית כשיש תוכים, קן יונים, ציפורים במסתור כביסה, גג או חלון.",
    check: ["בדקו אם יש קן יונים או ציפורים ליד חלון, מסתור כביסה, גג או מזגן.", "בדקו כלוב תוכים או אזור שבו ציפורים שהו.", "שימו לב אם העקיצות התחילו אחרי עזיבת קן או ניקוי אזור ציפורים."],
    articleUrl: "/articles/bird-mites",
    actionLabel: "למידע על בדיקה מקצועית",
    actionUrl: "/contact",
    recurringAdvice: "מומלץ לאתר קן ציפורים סמוך ולטפל במקור הבעיה. במפגע חוזר, כדאי לפנות למדביר או לגורם מקצועי מתאים לניקוי, חיטוי ומניעת חזרה.",
  },
  rodent_mites: {
    label: "קרדיות מכרסמים",
    short: "מתאים לעקיצות בבית עם סימני עכברים/חולדות או מכרסמים מחמד.",
    check: ["בדקו סימני מכרסמים: גללים, רעשים, כרסום או ריח.", "בדקו כלובים של אוגרים/ארנבים/מכרסמים.", "אם יש פעילות מכרסמים בבית — צריך לטפל במקור."],
    articleUrl: "/articles/rodent-mites",
    actionLabel: "למידע על בדיקה מקצועית",
    actionUrl: "/contact",
    recurringAdvice: "כדי לפתור את בעיית הקרדיות, צריך לטפל קודם במקור — פעילות מכרסמים. במפגע חוזר מומלץ לפנות למדביר מוסמך לטיפול שורש.",
  },
  biting_midgies: {
    label: "ברחשים / זבובונים עוקצים",
    short: "מתאים לעקיצות קטנות ומגרדות בחוץ, ליד לחות, דשא, צמחייה, ים או תאורה בלילה.",
    check: ["בדקו תאורה חזקה בחצר או במרפסת בלילה.", "בדקו אזורי לחות, צמחייה צפופה ודשא.", "שימו לב אם העקיצות מופיעות בעיקר בחוץ ולא בתוך הבית."],
    articleUrl: "/articles/biting-midges",
    actionLabel: "לפתרונות אפשריים",
    actionUrl: "/shop",
    recurringAdvice: "שימוש במאווררים, רשתות ותכשירי הרחקה יכול להפחית את המטרד. בחצרות עם לחות וצמחייה צפופה, כדאי לשקול טיפול סביבתי.",
  },
  jellyfish: {
    label: "צריבת מדוזה",
    short: "מתאים לצריבה מיידית בתוך המים או אחרי יציאה מהים, במיוחד אם הסימן נראה כמו קו/פסים.",
    check: ["בדקו אם הסימן נראה קווי או כמו פסים.", "שימו לב אם הייתה צריבה מיידית ולא גירוד רגיל.", "אם יש כאב חריג, חולשה, בחילה או תגובה קשה — פנו לרופא."],
    warning: "צריבה משמעותית בים עם תסמינים כלליים מחייבת ייעוץ רפואי.",
    articleUrl: "/articles/jellyfish-sting",
    actionLabel: "למידע נוסף",
    actionUrl: "/articles/jellyfish-sting",
    recurringAdvice: "זה לרוב אירוע נקודתי. יש לעקוב אחרי הצריבה, להימנע משפשוף, ולפנות לרופא אם מופיעים כאב חריג, חולשה, קושי נשימה או החמרה.",
  },
  sea_scratch: {
    label: "שריטה מסלע / שפשוף ים",
    short: "מתאים לכאב או סימן אחרי ים, סלעים, שובר גלים או מגע מכני — לא בהכרח עקיצה.",
    check: ["בדקו אם הייתם ליד סלעים, שובר גלים או קרקעית מחוספסת.", "בדקו אם הסימן נראה כמו שריטה, חתך או שפשוף.", "אם יש קוץ, כאב חזק או חשד לזיהום — פנו לבדיקה."],
    articleUrl: "/articles/sea-scratch",
    actionLabel: "למידע נוסף",
    actionUrl: "/articles/sea-scratch",
    recurringAdvice: "יש לשטוף ולחטא את האזור היטב ולעקוב. אם הכאב מחמיר, מופיעה מוגלה או יש חשד לקוץ/זיהום — מומלץ לפנות לבדיקה רפואית.",
  },
  chemical_irritation: {
    label: "גירוי מחומר ריסוס / הדברה",
    short: "מתאים לאודם, צריבה או גירוי שהחלו לאחר ביצוע הדברה בבית, בבניין או שימוש בתרסיס ביתי.",
    check: ["בדקו האם היה ריסוס בבית, בגינה, בבניין או אצל שכן.", "בדקו אם הגירוי מופיע באזורים שנגעו במשטחים מרוססים.", "אווררו את המקום ופעלו לפי הוראות התכשיר."],
    articleUrl: "/articles/pesticide-irritation",
    actionLabel: "למידע נוסף",
    actionUrl: "/articles/pesticide-irritation",
    recurringAdvice: "מומלץ לאוורר היטב את החלל, לשטוף משטחים במידת הצורך ולעקוב. במקרה של תגובה חריפה או החמרה, פנו לרופא.",
  },
  plant_irritation: {
    label: "גירוי מצמח / אדמה / דשן",
    short: "מתאים לאחר עציצים חדשים, עבודה בגינה, אדמה, קומפוסט או מגע עם צמחייה.",
    check: ["בדקו אם הובאו עציצים, אדמה, דשן או קומפוסט לאחרונה.", "שימו לב אם הגירוי באזורים שנגעו בצמחייה.", "בדקו גם חרקים קטנים סביב אדמה לחה."],
    articleUrl: "/articles/plant-irritation",
    actionLabel: "למידע נוסף",
    actionUrl: "/articles/plant-irritation",
    recurringAdvice: "ברוב המקרים מדובר בגירוי חולף. בעבודה בגינה מומלץ להשתמש בכפפות ובבגדים מגנים, ולשטוף היטב אזורים שנחשפו לצמחייה או אדמה.",
  },
  dermatitis: {
    label: "אלרגיה / דרמטיטיס / גירוי עור",
    short: "ייתכן שלא מדובר בעקיצה כלל, אלא בתגובת עור לחומר כביסה, צמח, זיעה, תכשיר או גורם אלרגני.",
    check: ["בדקו אם החלפתם סבון, אבקת כביסה, קרם, בושם או חומר ניקוי.", "שימו לב אם אין תבנית עקיצות ברורה.", "אם הפריחה מתפשטת או מחמירה — פנו לרופא."],
    articleUrl: "/articles/skin-irritation",
    actionLabel: "למידע נוסף",
    actionUrl: "/articles/skin-irritation",
    recurringAdvice: "במידה שהפריחה ממשיכה או מתפשטת ללא סימן ברור לחרקים בבית, כדאי לפנות לרופא עור לאבחון רפואי מדויק.",
  },
  unknown: {
    label: "לא מספיק מידע",
    short: "התשובות לא מצביעות בבירור על גורם אחד. ייתכן שנדרש זמן או מידע נוסף.",
    check: ["צלמו את הסימנים כדי לעקוב אחר שינויים.", "בדקו מיטה, בעלי חיים, מים עומדים, עציצים והאם זה חוזר בלילה.", "אם יש החמרה, כאב, חום או מוגלה — פנו לרופא."],
    actionLabel: "למידע נוסף",
    actionUrl: "/articles/what-bit-me",
    recurringAdvice: "אם הסימנים ממשיכים להופיע ללא הסבר, מומלץ לבצע סריקה מסודרת של הבית והסביבה, ובמידת הצורך להתייעץ עם איש מקצוע.",
  },
};

const questions: Question[] = [
  {
    id: "red_flags",
    title: "לפני הכל: האם יש סימן מדאיג?",
    subtitle: "אם אין סימן מדאיג — אפשר להמשיך לשאלון. הכלי אינו מחליף ייעוץ רפואי.",
    multiple: true,
    options: [
      { id: "breathing", label: "קוצר נשימה / נפיחות בפנים, שפתיים או לשון", redFlag: true, redFlagMessage: "חשד לתגובה אלרגית חריפה. יש לפנות לטיפול רפואי מיידי." },
      { id: "fever", label: "חום, חולשה חזקה, כאבי שרירים או כאב ראש חריג", redFlag: true, redFlagMessage: "תסמינים מערכתיים לאחר עקיצה או גירוי דורשים בדיקת רופא." },
      { id: "spreading", label: "אודם שמתפשט מהר / פס אדום מהעקיצה / מוגלה", redFlag: true, redFlagMessage: "חשד לזיהום או תגובה חריגה. מומלץ לפנות לרופא." },
      { id: "severe_sea", label: "צריבה בים עם כאב חזק מאוד, בחילה, חולשה או קושי נשימה", redFlag: true, redFlagMessage: "צריבה ימית משמעותית עם תסמינים כלליים מחייבת בדיקה רפואית." },
      { id: "sensitive_person", label: "מדובר בילד קטן, אישה בהריון, אדם מבוגר או אדם עם מערכת חיסון מוחלשת", redFlag: true, redFlagMessage: "במקרים רגישים מומלץ להתייעץ עם רופא גם אם התגובה נראית קלה." },
      { id: "none", label: "אין אף אחד מאלה" },
    ],
  },
  {
    id: "main_context",
    title: "היכן התרחש או התגלה האירוע?",
    options: [
      { id: "home", label: "בתוך הבית", scores: { bedbug: 2, flea: 1, mosquito: 1, bird_mites: 1, rodent_mites: 1 } },
      { id: "yard", label: "בחצר, בגינה או במרפסת", scores: { mosquito: 2, aedes: 2, fire_ant: 2, biting_midgies: 2, other_ant: 1 } },
      { id: "sea", label: "בים או בחוף הים", scores: { jellyfish: 3, sea_scratch: 2, biting_midgies: 1, aedes: 1 } },
      { id: "park", label: "בפארק, שטח פתוח או דשא", scores: { mosquito: 2, fire_ant: 2, tick: 2, biting_midgies: 2 } },
      { id: "woke_up", label: "התעוררתי עם עקיצות בבוקר", scores: { bedbug: 5, flea: 2, mosquito: 1, scabies: 1 } },
      { id: "unknown", label: "לא יודע/ת", scores: { unknown: 2 } },
    ],
  },
  {
    id: "time",
    title: "מתי שמתם לב לראשונה?",
    options: [
      { id: "day", label: "במהלך היום", scores: { aedes: 3, fire_ant: 1, biting_midgies: 1 } },
      { id: "night", label: "בלילה", scores: { mosquito: 3, bedbug: 2, biting_midgies: 1 } },
      { id: "morning", label: "מיד כשקמתי מהשינה", scores: { bedbug: 5, flea: 1 } },
      { id: "evening_outside", label: "אחרי שהייה בחוץ בשעות הערב", scores: { mosquito: 5, biting_midgies: 2 } },
      { id: "after_sea", label: "לאחר חזרה מהים / בריכה / חוף", scores: { jellyfish: 3, sea_scratch: 2, biting_midgies: 1 } },
      { id: "not_sure", label: "לא בטוח/ה", scores: { unknown: 1 } },
    ],
  },
  {
    id: "home_rooms",
    title: "במידה וזה בבית — באילו חדרים?",
    showIf: (answers) => hasAny(answers, "main_context", ["home", "woke_up", "unknown"]),
    options: [
      { id: "bedroom_only", label: "בעיקר בחדר השינה", scores: { bedbug: 5, mosquito: 1 } },
      { id: "several_bedrooms", label: "במספר חדרי שינה", scores: { bedbug: 3, mosquito: 2, flea: 1 } },
      { id: "living_room", label: "בסלון / סביב הספה", scores: { flea: 3, bedbug: 2, bird_mites: 1 } },
      { id: "kids_room", label: "בחדר הילדים", scores: { bedbug: 2, flea: 1, mosquito: 1, lice: 1 } },
      { id: "kitchen", label: "במטבח", scores: { other_ant: 2, chemical_irritation: 1 } },
      { id: "whole_house", label: "בכל הבית", scores: { flea: 3, mosquito: 2, chemical_irritation: 2, dermatitis: 1 } },
      { id: "near_window", label: "בעיקר בקרבת חלונות / מרפסת", scores: { mosquito: 3, biting_midgies: 2 } },
    ],
  },
  {
    id: "bed_signs",
    title: "האם מצאתם סימנים הקשורים למיטה?",
    showIf: (answers) => hasAny(answers, "main_context", ["home", "woke_up", "unknown"]),
    multiple: true,
    options: [
      { id: "blood", label: "כתמי דם קטנים על המצעים", scores: { bedbug: 5 } },
      { id: "black_dots", label: "נקודות שחורות קטנות על המזרן או המצעים", scores: { bedbug: 5 } },
      { id: "line_cluster", label: "עקיצות המסודרות בקו רציף או קבוצה צפופה", scores: { bedbug: 4, flea: 1 } },
      { id: "repeats", label: "זה חוזר על עצמו מספר לילות ברצף", scores: { bedbug: 5, flea: 2, mosquito: 1 } },
      { id: "partner", label: "גם אדם נוסף שישן בבית נעקץ", scores: { bedbug: 3, flea: 2, mosquito: 1, scabies: 2 } },
      { id: "none", label: "אין סימנים כאלה", scores: { unknown: 1 } },
    ],
  },
  {
    id: "yard_conditions",
    title: "במידה וזה בחצר — מה מאפיין את האזור?",
    showIf: (answers) => hasAny(answers, "main_context", ["yard", "park", "unknown"]),
    multiple: true,
    options: [
      { id: "night_light", label: "יש תאורת לילה פעילה", scores: { mosquito: 2, biting_midgies: 3 } },
      { id: "standing_water", label: "יש תחתיות עציצים, דליים או מים עומדים", scores: { mosquito: 5, aedes: 4 } },
      { id: "grass", label: "אזור עם דשא חי", scores: { fire_ant: 3, tick: 1, biting_midgies: 1 } },
      { id: "many_plants", label: "צמחייה סבוכה או אזור לח", scores: { mosquito: 2, biting_midgies: 3, plant_irritation: 1 } },
      { id: "ants_seen", label: "הבחנתי בנמלים באזור", scores: { fire_ant: 3, other_ant: 3 } },
      { id: "street_cats", label: "יש חתולי רחוב או בעלי חיים מסתובבים", scores: { flea: 3, tick: 1 } },
      { id: "none", label: "אין מאפיינים מיוחדים", scores: { unknown: 1 } },
    ],
  },
  {
    id: "sea_context",
    title: "במידה וזה בים — היכן בדיוק?",
    showIf: (answers) => hasAny(answers, "main_context", ["sea"]),
    options: [
      { id: "in_water", label: "בזמן השהייה בתוך המים", scores: { jellyfish: 5, sea_scratch: 1 } },
      { id: "after_water", label: "מיד לאחר היציאה מהמים", scores: { jellyfish: 4, sea_scratch: 2 } },
      { id: "on_sand", label: "על החול", scores: { biting_midgies: 3, aedes: 2, flea: 1 } },
      { id: "near_rocks", label: "בקרבת סלעים או שובר גלים", scores: { sea_scratch: 5, jellyfish: 1 } },
      { id: "evening_beach", label: "בשעות הערב על החוף", scores: { mosquito: 3, biting_midgies: 3, aedes: 1 } },
      { id: "not_sure", label: "לא בטוח/ה", scores: { unknown: 1 } },
    ],
  },
  {
    id: "sea_feeling",
    title: "איך התחושה הופיעה בים?",
    showIf: (answers) => hasAny(answers, "main_context", ["sea"]),
    options: [
      { id: "burning_now", label: "תחושת צריבה מיידית", scores: { jellyfish: 6 } },
      { id: "scratch_pain", label: "כאב הדומה לשריטה", scores: { sea_scratch: 5 } },
      { id: "itch_only", label: "גירוד הדומה לעקיצה רגילה", scores: { mosquito: 2, biting_midgies: 3, aedes: 1 } },
      { id: "lines", label: "הופעת סימן קווי או פסים על העור", scores: { jellyfish: 6, sea_scratch: 1 } },
      { id: "one_cut", label: "סימן בודד של חתך או שפשוף", scores: { sea_scratch: 5 } },
    ],
  },
  {
    id: "new_items",
    title: "האם בוצעו שינויים בבית או בגינה לאחרונה?",
    multiple: true,
    options: [
      { id: "new_plants_home", label: "הכנסת עציצים חדשים לבית", scores: { plant_irritation: 3, biting_midgies: 2, other_ant: 1 } },
      { id: "new_plants_yard", label: "פיזור קומפוסט, דשן או אדמה בגינה", scores: { plant_irritation: 3, biting_midgies: 2, aedes: 2, fire_ant: 1 } },
      { id: "new_furniture", label: "הכנסת רהיט יד שנייה, מזרן או ספה", scores: { bedbug: 5, flea: 2 } },
      { id: "travel_hotel", label: "חזרה משהות במלון, צימר או חופשה", scores: { bedbug: 4, mosquito: 1 } },
      { id: "clean_storage", label: "ניקיון מחסן, טיפול בארגזים או בגדים ישנים", scores: { spider: 3, rodent_mites: 2, dermatitis: 1 } },
      { id: "none", label: "לא בוצע כל שינוי חריג", scores: { unknown: 1 } },
    ],
  },
  {
    id: "animals",
    title: "האם קיימים בעלי חיים בקרבת מקום?",
    multiple: true,
    options: [
      { id: "dog", label: "כלב מחמד", scores: { flea: 3, tick: 1 } },
      { id: "cat", label: "חתול מחמד", scores: { flea: 3, tick: 1 } },
      { id: "pet_itching", label: "חיית המחמד מתגרדת לאחרונה", scores: { flea: 5 } },
      { id: "birds", label: "ציפורים או תוכים בבית", scores: { bird_mites: 5 } },
      { id: "pigeons_nest", label: "קן יונים ליד החלון, הגג או מסתור הכביסה", scores: { bird_mites: 6 } },
      { id: "rodents_pet", label: "מכרסמים כחיית מחמד, כמו אוגר או ארנב", scores: { rodent_mites: 4, flea: 1 } },
      { id: "rodents_signs", label: "סימנים לנוכחות עכברים או חולדות", scores: { rodent_mites: 5, flea: 2 } },
      { id: "none", label: "אין בעלי חיים בסביבה", scores: { unknown: 1 } },
    ],
  },
  {
    id: "pesticide",
    title: "האם נעשה שימוש בחומרי הדברה לאחרונה?",
    multiple: true,
    options: [
      { id: "home_pest_control", label: "בוצעה הדברה מקצועית בתוך הבית", scores: { chemical_irritation: 3, bedbug: 1, flea: 1 } },
      { id: "yard_spray", label: "בוצע ריסוס בחצר או בגינה", scores: { chemical_irritation: 4, plant_irritation: 1, fire_ant: 1 } },
      { id: "building_spray", label: "בוצעה הדברה בבניין, חדר מדרגות או אצל שכן", scores: { chemical_irritation: 2, mosquito: 1 } },
      { id: "home_spray", label: "השתמשנו בתרסיס ביתי לחרקים", scores: { chemical_irritation: 5, dermatitis: 2 } },
      { id: "pet_treatment", label: "בוצע טיפול נגד פרעושים לחיית המחמד", scores: { flea: 2, chemical_irritation: 2 } },
      { id: "none", label: "לא בוצעה הדברה כלל", scores: { unknown: 1 } },
    ],
  },
  {
    id: "bite_count",
    title: "כמה עקיצות או סימנים מופיעים כרגע?",
    options: [
      { id: "one", label: "סימן אחד בודד", scores: { bee_wasp: 3, spider: 2, tick: 2, sea_scratch: 1 } },
      { id: "few", label: "מספר קטן, 2–3 סימנים", scores: { mosquito: 2, flea: 1, bedbug: 1, fire_ant: 1 } },
      { id: "many_one_area", label: "כמות גדולה המרוכזת באזור אחד", scores: { flea: 3, bedbug: 3, fire_ant: 2, bird_mites: 2 } },
      { id: "many_areas", label: "כמות גדולה המפוזרת במספר אזורים", scores: { mosquito: 3, flea: 3, scabies: 2, dermatitis: 2 } },
      { id: "not_sure", label: "קשה לקבוע", scores: { unknown: 1 } },
    ],
  },
  {
    id: "body_location",
    title: "באילו אזורים בגוף הופיעו הסימנים?",
    multiple: true,
    options: [
      { id: "ankles", label: "קרסוליים ושוקיים", scores: { flea: 5, mosquito: 2, fire_ant: 1 } },
      { id: "arms", label: "ידיים וזרועות חשופות", scores: { mosquito: 2, bedbug: 2, biting_midgies: 1 } },
      { id: "face_neck", label: "פנים וצוואר", scores: { mosquito: 2, bedbug: 3, lice: 1 } },
      { id: "back_belly", label: "גב, בטן או מותניים", scores: { bedbug: 3, scabies: 2, dermatitis: 1 } },
      { id: "skin_folds", label: "קפלי עור ובין האצבעות", scores: { scabies: 5 } },
      { id: "hair", label: "אזור הקרקפת או אזור שעיר", scores: { lice: 5, tick: 1 } },
      { id: "whole_body", label: "פיזור נרחב על כל הגוף", scores: { mosquito: 2, flea: 2, dermatitis: 3, scabies: 2 } },
    ],
  },
  {
    id: "feeling",
    title: "מהי התחושה הדומיננטית באזור הסימן?",
    options: [
      { id: "itch", label: "גירוד מציק", scores: { mosquito: 3, flea: 3, bedbug: 3, scabies: 3, bird_mites: 2 } },
      { id: "sharp_pain", label: "כאב חד שהופיע באופן מיידי", scores: { bee_wasp: 5, fire_ant: 2, spider: 1 } },
      { id: "burning", label: "תחושת צריבה או שריפה", scores: { fire_ant: 4, jellyfish: 3, chemical_irritation: 3, plant_irritation: 1 } },
      { id: "swelling", label: "נפיחות מקומית משמעותית", scores: { bee_wasp: 3, mosquito: 2, fire_ant: 1 } },
      { id: "worse_pain", label: "כאב שהולך ומחמיר או מקרין חום", scores: { spider: 2, bee_wasp: 1, unknown: 2 } },
      { id: "barely", label: "כמעט ואינו מורגש אלא במגע", scores: { tick: 2, unknown: 1 } },
    ],
  },
  {
    id: "appearance",
    title: "כיצד נראה הסימן מבחינה ויזואלית?",
    multiple: true,
    options: [
      { id: "red_bumps", label: "בליטות אדומות וקטנות", scores: { mosquito: 2, flea: 2, bedbug: 2, bird_mites: 2 } },
      { id: "line", label: "ערוך בשורה או בקו ישר", scores: { bedbug: 5, jellyfish: 2 } },
      { id: "cluster", label: "מקבץ צפוף של סימנים", scores: { bedbug: 3, flea: 3, fire_ant: 2 } },
      { id: "white_pustule", label: "הופעת שלפוחית קטנה או מוגלה לבנה במרכז", scores: { fire_ant: 5 } },
      { id: "ring", label: "טבעת אדומה שהולכת ומתרחבת סביב העקיצה", scores: { tick: 6 } },
      { id: "scratch_line", label: "מראה המזכיר שריטה או שפשוף", scores: { sea_scratch: 5, plant_irritation: 1 } },
      { id: "rash", label: "פריחה רחבה ללא נקודות חדירה ברורות", scores: { dermatitis: 5, chemical_irritation: 3, scabies: 1 } },
    ],
  },
];

const phaseLabels = ["בטיחות", "מקור", "סביבה", "סימן", "תוצאה"];

function hasAny(answers: Answers, questionId: string, optionIds: string[]) {
  const selected = answers[questionId] || [];
  return selected.some((id) => optionIds.includes(id));
}

function getVisibleQuestions(answers: Answers) {
  return questions.filter((question) => !question.showIf || question.showIf(answers));
}

function getQuestionPhase(questionId: string) {
  if (questionId === "red_flags") return "בדיקת בטיחות";
  if (["main_context", "time", "home_rooms", "bed_signs", "yard_conditions", "sea_context", "sea_feeling"].includes(questionId)) return "בדיקת סביבה";
  if (["new_items", "animals", "pesticide"].includes(questionId)) return "גורמי סיכון";
  return "מראה ותחושה";
}

function optionBadge(optionId: string, label: string) {
  if (optionId.includes("home") || label.includes("בית") || label.includes("חדר")) return "בית";
  if (optionId.includes("yard") || label.includes("גינה") || label.includes("חצר") || label.includes("דשא")) return "חצר";
  if (optionId.includes("sea") || label.includes("ים") || label.includes("חוף")) return "ים";
  if (label.includes("כלב") || label.includes("חתול") || label.includes("חיית")) return "חיה";
  if (label.includes("מיטה") || label.includes("שינה") || label.includes("מזרן")) return "שינה";
  if (label.includes("כאב") || label.includes("צריבה") || label.includes("שריפה")) return "תחושה";
  if (label.includes("אדום") || label.includes("שלפוחית") || label.includes("טבעת")) return "סימן";
  if (label.includes("לא") || label.includes("בטוח")) return "?";
  return "בדיקה";
}

function calculateScores(answers: Answers) {
  const scores: Record<Candidate, number> = Object.keys(candidateData).reduce(
    (acc, key) => {
      acc[key as Candidate] = 0;
      return acc;
    },
    {} as Record<Candidate, number>
  );

  for (const question of questions) {
    const selectedIds = answers[question.id] || [];

    for (const option of question.options) {
      if (!selectedIds.includes(option.id) || !option.scores) continue;

      for (const [candidate, value] of Object.entries(option.scores)) {
        scores[candidate as Candidate] += value || 0;
      }
    }
  }

  return Object.entries(scores)
    .map(([candidate, score]) => ({ candidate: candidate as Candidate, score }))
    .sort((a, b) => b.score - a.score);
}

function getRedFlags(answers: Answers) {
  const flags: string[] = [];

  for (const question of questions) {
    const selectedIds = answers[question.id] || [];

    for (const option of question.options) {
      if (selectedIds.includes(option.id) && option.redFlag) {
        flags.push(option.redFlagMessage || option.label);
      }
    }
  }

  return flags;
}

function getResultReasons(answers: Answers, candidate: Candidate) {
  const reasons: { text: string; weight: number }[] = [];

  for (const question of questions) {
    const selectedIds = answers[question.id] || [];

    for (const option of question.options) {
      const weight = option.scores?.[candidate] || 0;
      if (selectedIds.includes(option.id) && weight > 0) {
        reasons.push({ text: `${getQuestionPhase(question.id)}: ${option.label}`, weight });
      }
    }
  }

  return reasons
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)
    .map((reason) => reason.text);
}

function confidenceLabel(score: number, topScore: number, secondScore: number) {
  const gap = topScore - secondScore;

  if (score >= 14 && gap >= 4) return "סבירות גבוהה";
  if (score >= 9) return "סבירות בינונית";
  if (score >= 5) return "סבירות נמוכה";
  return "לא מספיק חד משמעי";
}

function percentage(score: number, topScore: number) {
  if (topScore <= 0) return 0;
  return Math.max(15, Math.min(92, Math.round((score / topScore) * 86)));
}

export default function WhatBitMeTool() {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isRecurring, setIsRecurring] = useState<boolean | null>(null);

  const visibleQuestions = useMemo(() => getVisibleQuestions(answers), [answers]);
  const currentQuestion = visibleQuestions[step];
  const redFlags = useMemo(() => getRedFlags(answers), [answers]);
  const sortedScores = useMemo(() => calculateScores(answers), [answers]);

  const topResults = sortedScores.filter((result) => result.score > 0).slice(0, 3);
  const topScore = topResults[0]?.score || 0;
  const secondScore = topResults[1]?.score || 0;

  function selectAnswer(question: Question, optionId: string) {
    setAnswers((prev) => {
      const current = prev[question.id] || [];

      if (question.multiple) {
        if (current.includes(optionId)) {
          return { ...prev, [question.id]: current.filter((id) => id !== optionId) };
        }

        if (optionId === "none") {
          return { ...prev, [question.id]: ["none"] };
        }

        return { ...prev, [question.id]: [...current.filter((id) => id !== "none"), optionId] };
      }

      return { ...prev, [question.id]: [optionId] };
    });
  }

  function nextStep() {
    if (step < visibleQuestions.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    setShowResult(true);
  }

  function prevStep() {
    if (showResult) {
      setShowResult(false);
      setIsRecurring(null);
      return;
    }

    setStep((current) => Math.max(0, current - 1));
  }

  function reset() {
    setAnswers({});
    setStep(0);
    setShowResult(false);
    setIsRecurring(null);
  }

  const selectedForCurrent = currentQuestion ? answers[currentQuestion.id] || [] : [];
  const canContinue = selectedForCurrent.length > 0;

  if (showResult) {
    const primary = topResults[0] || { candidate: "unknown" as Candidate, score: 0 };
    const primaryData = candidateData[primary.candidate];
    const visual = candidateVisuals[primary.candidate];
    const reasons = getResultReasons(answers, primary.candidate);

    return (
      <section dir="rtl" className="min-h-screen rounded-3xl bg-gradient-to-b from-orange-50 via-white to-slate-50 px-3 py-8 text-slate-950 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 text-center">
            <p className="mx-auto mb-3 inline-flex rounded-full border border-orange-200 bg-white px-4 py-1 text-xs font-bold text-orange-700 shadow-sm">
              דוח הערכה סביבתי
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">מה סביר להניח שעקץ אותך?</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              זו הערכה הסתברותית, לא אבחון ודאי. עקיצות רבות דומות זו לזו, ולכן כדאי להתייחס גם לאפשרויות הנוספות.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-white bg-white/90 p-5 shadow-xl shadow-orange-100/50 backdrop-blur md:p-7">
              {redFlags.length > 0 && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900">
                  <h2 className="mb-2 text-base font-bold">סימן שמצריך זהירות</h2>
                  <ul className="list-inside list-disc space-y-1 text-sm font-medium">
                    {redFlags.map((flag, index) => (
                      <li key={`${flag}-${index}`}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={`rounded-3xl bg-gradient-to-br ${visual.panel} p-6 text-white shadow-lg`}>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white/60">החשוד המרכזי</p>
                    <h2 className="mt-1 text-3xl font-black text-orange-400 md:text-4xl">{primaryData.label}</h2>
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                    {visual.badge}
                  </span>
                </div>

                <p className="max-w-2xl text-sm leading-relaxed text-white/75">{primaryData.short}</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs text-white/50">רמת סבירות</p>
                    <p className="mt-1 text-lg font-black">{confidenceLabel(primary.score, topScore, secondScore)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs text-white/50">התאמה יחסית</p>
                    <p className="mt-1 text-lg font-black">{percentage(primary.score, topScore)}%</p>
                  </div>
                </div>
              </div>

              {primaryData.warning && (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  <strong>חשוב:</strong> {primaryData.warning}
                </div>
              )}

              {reasons.length > 0 && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="mb-3 text-base font-black text-slate-900">למה זו התוצאה?</h3>
                  <div className="space-y-2">
                    {reasons.map((reason) => (
                      <div key={reason} className="flex gap-3 rounded-xl bg-white p-3 text-sm text-slate-700 shadow-sm">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-5">
              <div className="rounded-3xl border border-white bg-white/90 p-5 shadow-lg shadow-slate-200/50">
                <h3 className="mb-3 text-base font-black text-slate-900">מה לבדוק עכשיו?</h3>
                <div className="space-y-2">
                  {primaryData.check.map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {topResults.length > 1 && (
                <div className="rounded-3xl border border-white bg-white/90 p-5 shadow-lg shadow-slate-200/50">
                  <h3 className="mb-3 text-base font-black text-slate-900">אפשרויות נוספות</h3>
                  <div className="space-y-3">
                    {topResults.slice(1).map((result) => {
                      const data = candidateData[result.candidate];
                      const itemVisual = candidateVisuals[result.candidate];

                      return (
                        <div key={result.candidate} className={`rounded-2xl border ${itemVisual.tone} p-4`}>
                          <div className="mb-1 flex items-center justify-between gap-3">
                            <h4 className="text-sm font-black text-slate-800">{data.label}</h4>
                            <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">
                              {percentage(result.score, topScore)}%
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed text-slate-600">{data.short}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>

          <div className="mt-5 rounded-3xl border border-white bg-white/90 p-5 shadow-lg shadow-orange-100/50">
            {isRecurring === null ? (
              <div className="grid items-center gap-4 md:grid-cols-[1fr_auto]">
                <div>
                  <h3 className="text-lg font-black text-slate-900">האם זה אירוע שחוזר על עצמו?</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    אם זה חוזר, ההמשך צריך להתמקד באיתור מקור סביבתי. אם זה חד פעמי, בדרך כלל מספיק מעקב.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button onClick={() => setIsRecurring(true)} className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-slate-800">
                    כן, זה חוזר
                  </button>
                  <button onClick={() => setIsRecurring(false)} className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50">
                    מקרה חד פעמי
                  </button>
                </div>
              </div>
            ) : isRecurring === true ? (
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                <h3 className="mb-2 text-base font-black text-slate-900">הצעד הבא המומלץ</h3>
                <p className="mb-4 text-sm leading-relaxed text-slate-700">{primaryData.recurringAdvice}</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  {primaryData.articleUrl && (
                    <a href={primaryData.articleUrl} className="rounded-2xl border border-orange-300 bg-white px-5 py-3 text-center text-sm font-black text-orange-700 transition hover:bg-orange-100">
                      למדריך הזיהוי והטיפול
                    </a>
                  )}
                  {primaryData.actionUrl && (
                    <a href={primaryData.actionUrl} className="rounded-2xl bg-orange-600 px-5 py-3 text-center text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700">
                      {primaryData.actionLabel || "להמשך מידע"}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                <h3 className="mb-2 text-base font-black text-slate-900">המלצה למקרה נקודתי</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  ככל הנראה מדובר בחשיפה מקרית. מומלץ לחטא את האזור ולעקוב בימים הקרובים. אם הסימנים חוזרים, מלאו שוב את השאלון עם המידע החדש.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 flex justify-center">
            <button onClick={reset} className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-500 transition hover:text-slate-950">
              התחל שאלון מחדש
            </button>
          </div>

          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-slate-100 bg-white/80 p-4 text-center text-xs leading-relaxed text-slate-500">
            המידע המופק מכלי זה הוא מידע כללי והסתברותי בלבד ואינו מהווה תחליף לייעוץ רפואי,
            אבחון רופא או בדיקת מדביר מוסמך בשטח. בכל מקרה של החמרה, רגישות, תגובה חריגה או ספק,
            יש לפנות לגורם רפואי מתאים.
          </div>
        </div>
      </section>
    );
  }

  if (!currentQuestion) return null;

  const progress = Math.round(((step + 1) / visibleQuestions.length) * 100);
  const phase = getQuestionPhase(currentQuestion.id);
  const activePhaseIndex = currentQuestion.id === "red_flags" ? 0 : step < 3 ? 1 : step < 10 ? 2 : 3;

  return (
    <section dir="rtl" className="min-h-screen rounded-3xl bg-gradient-to-b from-orange-50 via-white to-slate-50 px-3 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <p className="mx-auto mb-3 inline-flex rounded-full border border-orange-200 bg-white px-4 py-1 text-xs font-bold text-orange-700 shadow-sm">
            כלי בדיקה ראשוני
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">מה עקץ אותי?</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            ענו על כמה שאלות וננסה להבין אם מדובר ביתוש, פשפש מיטה, פרעוש, נמלת אש, מדוזה — או אולי גירוי עור שאינו עקיצה.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-bold text-slate-600">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">הערכה תוך דקה</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">לא אבחון רפואי</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">כולל בדיקת סביבה</span>
          </div>
        </div>

        <div className="mb-5 rounded-3xl border border-white bg-white/80 p-3 shadow-lg shadow-orange-100/50 backdrop-blur">
          <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-bold text-slate-500">
            {phaseLabels.map((label, index) => (
              <div key={label} className={index <= activePhaseIndex ? "text-orange-700" : "text-slate-400"}>
                <div className={index <= activePhaseIndex ? "mx-auto mb-1 h-1.5 rounded-full bg-orange-500" : "mx-auto mb-1 h-1.5 rounded-full bg-slate-200"} />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white bg-white/90 p-5 shadow-2xl shadow-orange-100/60 backdrop-blur md:p-8">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{phase}</span>
              <span>שאלה {step + 1} מתוך {visibleQuestions.length} · {progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-l from-orange-500 to-orange-600 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-950 md:text-3xl">{currentQuestion.title}</h2>
            {currentQuestion.subtitle && <p className="mt-2 text-sm leading-relaxed text-slate-500">{currentQuestion.subtitle}</p>}
            {currentQuestion.multiple && <p className="mt-3 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">ניתן לבחור מספר תשובות</p>}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedForCurrent.includes(option.id);
              const badge = optionBadge(option.id, option.label);

              return (
                <button
                  key={option.id}
                  onClick={() => selectAnswer(currentQuestion, option.id)}
                  className={[
                    "group min-h-[72px] rounded-2xl border p-4 text-right transition-all duration-200",
                    isSelected
                      ? "border-orange-500 bg-orange-50 shadow-lg shadow-orange-100 ring-2 ring-orange-100"
                      : "border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/40 hover:shadow-md",
                  ].join(" ")}
                >
                  <span className="flex items-start gap-3">
                    <span className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black transition",
                      isSelected ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-700",
                    ].join(" ")}>{badge}</span>
                    <span className="flex-1">
                      <span className={isSelected ? "block text-sm font-black leading-relaxed text-orange-950" : "block text-sm font-bold leading-relaxed text-slate-800"}>
                        {option.label}
                      </span>
                    </span>
                    <span className={[
                      "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-black",
                      isSelected ? "border-orange-600 bg-orange-600 text-white" : "border-slate-300 bg-white text-transparent",
                    ].join(" ")}>✓</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="sticky bottom-3 z-10 mt-8 rounded-2xl border border-slate-100 bg-white/85 p-3 shadow-xl backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none">
            <div className="flex items-center justify-between gap-3">
              <button onClick={prevStep} disabled={step === 0} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-0">
                חזור
              </button>
              <button onClick={nextStep} disabled={!canContinue} className="rounded-2xl bg-slate-950 px-7 py-3 text-sm font-black text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30">
                {step === visibleQuestions.length - 1 ? "קבלת תוצאה" : "המשך"}
              </button>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-relaxed text-slate-500">
          הכלי מספק הערכה כללית בלבד. אם יש החמרה, תגובה חריגה, חום, קוצר נשימה, נפיחות בפנים או ספק — יש לפנות לייעוץ רפואי.
        </p>
      </div>
    </section>
  );
}
