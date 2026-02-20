export default function StepInfo() {
  const steps = [
    { num: 1, label: "Upload EEG" },
    { num: 2, label: "Upload Face" },
    { num: 3, label: "Get Results" },
  ];

  return (
    <div className="steps">
      {steps.map((s, i) => (
        <div key={s.num} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {i > 0 && <span className="step-arrow">→</span>}
          <div className="step">
            <span className="step-num">{s.num}</span>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
