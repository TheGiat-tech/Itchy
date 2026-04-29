import Link from "next/link";

const categories = [
  {
    id: "insects",
    label: "חרקים",
    emoji: "🪲",
    description: "תיקנים, נמלים, קרציות ועוד",
  },
  {
    id: "rodents",
    label: "מכרסמים",
    emoji: "🐀",
    description: "עכברים, חולדות ועוד",
  },
  {
    id: "birds",
    label: "ציפורים",
    emoji: "🐦",
    description: "יונים, צרעות ועוד",
  },
  {
    id: "arachnids",
    label: "עכבישאים",
    emoji: "🕷️",
    description: "עכבישים, עקרבים, קרדיות",
  },
  {
    id: "flies",
    label: "זבובים ויתושים",
    emoji: "🦟",
    description: "זבובי בית, יתושים, זבובי פירות",
  },
  {
    id: "other",
    label: "אחרים",
    emoji: "🐌",
    description: "שבלולים, שרצים ועוד",
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
