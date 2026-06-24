import PHScale from '../../interactions/PHScale.jsx';

/** Graded pH-placement check, driven by slide.checkConfig. */
export default function PHPlacementCheck({ slide, onResult }) {
  const cfg = slide.checkConfig || {};
  return <PHScale items={cfg.items || []} graded config={cfg} onResult={onResult} />;
}
