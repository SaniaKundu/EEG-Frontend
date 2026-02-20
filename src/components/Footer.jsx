export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span className="footer-brand">© {new Date().getFullYear()} MoodMusic</span>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
}
