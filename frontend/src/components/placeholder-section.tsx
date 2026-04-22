interface PlaceholderSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function PlaceholderSection({ title, description, icon }: PlaceholderSectionProps) {
  return (
    <div className="p-6">
      <div className="bg-card rounded-lg border p-12 flex flex-col items-center justify-center text-center">
        <div className="mb-4 text-muted-foreground">{icon}</div>
        <h2 className="mb-2">{title}</h2>
        <p className="text-muted-foreground max-w-md">
          {description}
        </p>
      </div>
    </div>
  );
}