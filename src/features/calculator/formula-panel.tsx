import type {
  BuildEvaluation,
  FormulaTrace,
  WikiSourceRef,
} from "@/core/model";

import styles from "./formula-panel.module.css";

interface FormulaPanelProps {
  readonly evaluation: BuildEvaluation;
}

function sourceName(source: WikiSourceRef): string {
  return source.label.replace("WARFRAME Wiki — ", "");
}

function traceName(trace: FormulaTrace): string {
  const match = /^capacity-slot-(\d+)-(.+)$/.exec(trace.id);
  if (!match) {
    return `${trace.id} 公式`;
  }

  const slotNumber = Number(match[1]) + 1;
  const modName = match[2] === "serration" ? "Serration" : match[2];
  return `槽位 ${slotNumber} ${modName} 容量公式`;
}

export function FormulaPanel({ evaluation }: FormulaPanelProps) {
  return (
    <section className={styles.panel} aria-labelledby="formula-panel-heading">
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>FORMULA TRACE</p>
          <h2 id="formula-panel-heading">计算公式</h2>
        </div>
        <p className={styles.status} role="status">
          {evaluation.isComplete ? "当前容量结果完整" : "结果不完整"}
        </p>
      </header>

      {evaluation.issues.length > 0 ? (
        <div className={styles.issues}>
          {evaluation.issues.map((issue, index) => (
            <p
              className={styles.issue}
              key={`${issue.code}-${issue.slotIndex ?? "build"}-${index}`}
              role="alert"
              aria-label={issue.message}
            >
              {issue.message}
            </p>
          ))}
        </div>
      ) : null}

      <div className={styles.traces}>
        {evaluation.trace.map((trace) => (
          <article
            className={styles.trace}
            key={trace.id}
            aria-label={traceName(trace)}
          >
            <header className={styles.traceHeader}>
              <span>{trace.stage === "capacity" ? "容量乘区" : trace.stage}</span>
              <span>{trace.verification === "verified" ? "已验证" : "未验证"}</span>
            </header>
            <code className={styles.expression}>{trace.expression}</code>
            <dl className={styles.operands}>
              {trace.operands.map((operand) => (
                <div
                  className={styles.operand}
                  key={`${trace.id}-${operand.label}`}
                >
                  <dt>{operand.label}</dt>
                  <dd>
                    {operand.label}：{operand.value}
                    {operand.sourceRef ? (
                      <a
                        href={operand.sourceRef.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {sourceName(operand.sourceRef)}
                      </a>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
