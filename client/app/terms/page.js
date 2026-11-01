export const metadata = {
  title: "Terms & Disclaimer",
};

export default function TermsPage() {
  return (
    <section className="section legal">
      <h1>Terms & Disclaimer</h1>
      <p className="muted">Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. Demo project</h2>
      <p>
        <strong>Roamly</strong> is a demonstration web application built for
        educational and portfolio purposes. It is not a real vacation-rental
        marketplace and offers no real bookings, no real hosts, and no real
        properties.
      </p>

      <h2>2. No affiliation with Airbnb</h2>
      <p>
        The visual style of this app is inspired by modern short-stay rental
        platforms. Roamly is <strong>not affiliated with, endorsed by, or
        connected to Airbnb, Inc.</strong> in any way. All trademarks belong to
        their respective owners.
      </p>

      <h2>3. Payments are simulated</h2>
      <p>
        All payments are processed through <strong>Razorpay in Test Mode</strong>.
        No real credit card, UPI, or bank account is ever charged. The
        &ldquo;confirmation&rdquo; and &ldquo;refund&rdquo; shown here are
        simulated. Do not enter real card details.
      </p>

      <h2>4. No warranty</h2>
      <p>
        This software is provided &ldquo;as is&rdquo;, without warranty of any
        kind. The author is not liable for any damages arising from its use.
      </p>

      <h2>5. Data</h2>
      <p>
        Any account you create on the demo may be deleted at any time. Do not
        reuse a real password. The author does not sell or share your data.
      </p>

      <h2>6. Contact</h2>
      <p>
        For questions about this project, open an issue on the GitHub
        repository.
      </p>
    </section>
  );
}