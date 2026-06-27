import AvatarLoader from '../avatar/AvatarLoader.jsx';

/**
 * Lightweight, theme-aware placeholder shown while a code-split interaction
 * chunk loads. Features the learner's equipped avatar with a friendly bobbing
 * loader; all motion is stilled under prefers-reduced-motion (handled in CSS).
 */
export default function InteractionFallback() {
  return <AvatarLoader variant="inline" size={84} label="Loading interactive" />;
}
