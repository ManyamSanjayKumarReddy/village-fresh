export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
        <p className="font-heading text-base font-semibold text-primary">Village Fresh</p>
        <p>Made by hand in a village kitchen, delivered fresh across Chennai.</p>
        <p>&copy; {new Date().getFullYear()} Village Fresh. All rights reserved.</p>
      </div>
    </footer>
  );
}
