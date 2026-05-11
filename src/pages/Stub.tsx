export function StubPage({ title, message }: { title: string; message: string }) {
  return (
    <div className="px-4 lg:px-6 py-12 max-w-2xl">
      <h1 className="heading text-2xl sm:text-3xl mb-2">{title}</h1>
      <p className="text-text-secondary">{message}</p>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="px-4 lg:px-6 py-16 text-center">
      <div className="text-6xl mb-2">🎲</div>
      <h1 className="heading text-2xl mb-2">Page not found</h1>
      <p className="text-text-secondary">
        That page is not in our demo lobby.
      </p>
    </div>
  );
}
