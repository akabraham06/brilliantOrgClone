import styles from './SlideShell.module.css';

/**
 * Per-slide layout: concept title + concise copy on top, the interactive area
 * below, and the slide instructions as helper text. The interaction/check
 * component is passed as children.
 */
export default function SlideShell({ slide, children }) {
  return (
    <article className={styles.slide}>
      <div className={styles.text}>
        <h2 className={styles.concept}>{slide.subtitle}</h2>
        {slide.bodyText && <p className={styles.body}>{slide.bodyText}</p>}
      </div>

      <div className={styles.stage}>{children}</div>

      {slide.instructions && (
        <p className={styles.instructions}>
          <span className={styles.instructionsIcon} aria-hidden="true">
            &#9755;
          </span>
          {slide.instructions}
        </p>
      )}
    </article>
  );
}
