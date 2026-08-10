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
  if (trace.id.startsWith("base-damage-research-")) {
    return `${trace.id.includes("skana") ? "Skana" : "Karak"} Wiki 研究基础伤害公式`;
  }

  if (trace.id.startsWith("faction-damage-research-")) {
    return `${trace.id.includes("skana") ? "Skana" : "Karak"} Wiki 研究派系伤害公式`;
  }

  const match = /^capacity-slot-(\d+)-(.+)$/.exec(trace.id);
  if (!match) {
    return `${trace.id} 公式`;
  }

  const slotNumber = Number(match[1]) + 1;
  const modName = match[2] === "serration" ? "Serration" : match[2];
  return `槽位 ${slotNumber} ${modName} 容量公式`;
}

function multiplierGroupName(trace: FormulaTrace): string {
  if (trace.multiplierGroup === "base-damage-additive") {
    return "基础伤害加算区";
  }

  if (trace.multiplierGroup === "faction-damage-additive") {
    return "派系伤害加算区";
  }

  return trace.stage === "capacity" ? "容量乘区" : trace.stage;
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

      {evaluation.researchPreview ? (
        <section
          className={styles.preview}
          aria-labelledby="damage-research-preview-heading"
        >
          <h3 id="damage-research-preview-heading">
            研究预览（不计入正式伤害）
          </h3>
          <p>{evaluation.researchPreview.weaponName}</p>
          <dl>
            <div>
              <dt>基础伤害</dt>
              <dd>基础伤害 {evaluation.researchPreview.baseDamage}</dd>
            </div>
            <div>
              <dt>Mod 后预览</dt>
              <dd>
                Mod 后预览 {evaluation.researchPreview.moddedBaseDamage}
              </dd>
            </div>
            {evaluation.researchPreview.damageAfterFaction !== undefined ? (
              <div>
                <dt>派系乘区后预览</dt>
                <dd>
                  派系乘区后预览{" "}
                  {evaluation.researchPreview.damageAfterFaction}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

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
              <span>{multiplierGroupName(trace)}</span>
              <span>
                {trace.verification === "verified"
                  ? "已验证"
                  : "未通过游戏实测"}
              </span>
            </header>
            <code className={styles.expression}>{trace.expression}</code>
            {trace.source ? (
              <a
                className={styles.formulaSource}
                href={trace.source.url}
                target="_blank"
                rel="noreferrer"
              >
                公式来源
              </a>
            ) : null}
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
