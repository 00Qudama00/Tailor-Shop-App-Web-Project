const TAPE = Array.from({ length: 24 }, (_, i) => i + 1);

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth">
      <div className="auth-art">
        <div className="auth-logo">
          <img src="/favicon.svg" alt="" />
          Tailor Shop
        </div>
        <div className="auth-quote">
          <h2>Measurements, orders and kareegar pay in one register</h2>
          <p>Take a customer's naap once, track every suit from cutting to delivery, and know what is still owed at the end of the month.</p>
        </div>
        <div>
          <div className="tape" aria-hidden="true">
            {TAPE.map((n) => (
              <span key={n} className={n % 12 === 0 ? 'mark' : ''}>
                {n}
              </span>
            ))}
          </div>
          <div className="urdu" style={{ marginTop: 32 }}>
            ناپ، آرڈر اور حساب — سب ایک جگہ
          </div>
        </div>
      </div>

      <div className="auth-form">
        <div className="auth-box">
          <h1>{title}</h1>
          <p>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
