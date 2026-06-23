import SlideShell from './SlideShell.jsx';
import { getInteractionComponent, getCheckComponent } from './interactionRegistry.js';

/**
 * Renders a single slide by dispatching on its type:
 *  - check slides -> the matching check component (validates the answer)
 *  - content slides -> the interactive visual for its component key
 *
 * `onReady` marks a content slide satisfied; `onResult(correct)` reports a
 * check outcome. Keyed by slideId upstream so state resets between slides.
 */
export default function SlideRenderer({ slide, onReady, onResult }) {
  if (slide.isCheck) {
    const Check = getCheckComponent(slide.checkConfig?.validationMode);
    return (
      <SlideShell slide={slide}>
        <Check slide={slide} onResult={onResult} />
      </SlideShell>
    );
  }

  const Interaction = getInteractionComponent(slide.interactionComponentKey);
  return (
    <SlideShell slide={slide}>
      <Interaction slide={slide} onReady={onReady} />
    </SlideShell>
  );
}
