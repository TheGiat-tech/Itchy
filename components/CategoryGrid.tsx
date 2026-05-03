import Link from "next/link";

const categories = [
  {
    id: "cockroaches",
    label: "תיקנים",
    emoji: "🪳",
    description: "תיקן אמריקאי, גרמני, מזרחי, פסי-חום ועוד",
  },
  {
    id: "flying-insects",
    label: "חרקים מעופפים",
    emoji: "🦟",
    description: "יתושים, זבובים, עש המקלחת ועוד",
  },
  {
    id: "biting-bloodsucking",
    label: "עוקצים ומוצצי דם",
    emoji: "🩸",
    description: "פשפש מיטה, פרעושים, קרציות, קרדיות ועוד",
  },
  {
    id: "ants",
    label: "נמלים",
    emoji: "🐜",
    description: "כל סוגי הנמלים",
  },
  {
    id: "rodents",
    label: "מכרסמים",
    emoji: "🐀",
    description: "עכברים וחולדות",
  },
  {
    id: "pantry-pests",
    label: "מזיקי מזווה ורכוש",
    emoji: "🦗",
    description: "עש בגדים, חיפושיות מזווה וחרקי רכוש",
  },
  {
    id: "spiders",
    label: "עכבישים ועקרבים",
    emoji: "🕷️",
    description: "ששן חום, אלמנה שחורה, עקרב צהוב ועוד",
  },
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/pests?category=${cat.id}`}
          className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-green-200 transition-all text-center"
        >
          <div className="text-4xl mb-2">{cat.emoji}</div>
          <h3 className="font-bold text-gray-800 group-hover:text-green-700 transition-colors">
            {cat.label}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
        </Link>
      ))}
    </div>
  );
}
