export default function Home() {
  return (
    <main style={{ fontFamily: "sans-serif", margin: "4rem auto", maxWidth: "40rem" }}>
      <h1>Oryzn</h1>
      <p>Oryzn provides trustworthy, immutable audit history for GitHub Projects.</p>
      <a href="/api/health">Check application health</a>
    </main>
  );
}
