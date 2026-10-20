interface ProductDescriptionProps {
  text: string;
}

export function ProductDescription({ text }: ProductDescriptionProps) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const bullet = /^(?:[•*-]|\d+[.)])\s+/;

  if (lines.length > 0 && lines.every((line) => bullet.test(line))) {
    return (
      <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted marker:text-accent">
        {lines.map((line, index) => <li key={index}>{line.replace(bullet, "")}</li>)}
      </ul>
    );
  }

  return <p className="mt-2.5 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted">{text}</p>;
}
