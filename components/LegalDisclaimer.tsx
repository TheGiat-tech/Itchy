export const LEGAL_DISCLAIMER_TEXT =
  "המידע מוגש כהמלצה בלבד. איצ'י היא פלטפורמת מידע ואינה מספקת שירותי הדברה בעצמה. כל שירותי ההדברה מבוצעים על ידי קבלנים מוסמכים עצמאיים.";

interface Props {
  className?: string;
}

export default function LegalDisclaimer({ className }: Props) {
  return <p className={className}>{LEGAL_DISCLAIMER_TEXT}</p>;
}
