export default function Footer({ asOfDate }: { asOfDate: string }) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-6 mt-12">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
        <p>
          Points+ measures scoring relative to league average (100), adjusted for
          opponent defense and pace.
        </p>
        <p className="mt-1">
          Data as of {asOfDate} &middot; Minimum 10 games &middot; Minimum 12 MPG
          &middot; ACC, Big East, Big Ten, Big 12, SEC
        </p>
      </div>
    </footer>
  );
}
