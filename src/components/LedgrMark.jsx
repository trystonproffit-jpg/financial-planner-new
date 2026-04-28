function LedgrMark({ className = "", label = "Ledgr" }) {
  return (
    <div className={`ledgr-mark ${className}`.trim()} aria-label={label} role="img">
      <span className="ledgr-mark-grid" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className="ledgr-mark-word">{label}</span>
    </div>
  );
}

export default LedgrMark;
