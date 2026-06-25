import { Suspense } from 'react';
import SlideShell from './SlideShell.jsx';
import InteractionFallback from './InteractionFallback.jsx';
import { getInteractionComponent, getCheckComponent } from './interactionRegistry.js';

/**
 * Renders a single slide by dispatching on its type:
 *  - check slides -> the matching check component (validates the answer)
 *  - content slides -> the interactive visual for its component key
 *
 * Interaction components are code-split (React.lazy) in the registry, so the
 * content branch renders them inside a <Suspense> boundary with a lightweight,
 * theme-aware loading placeholder.
 *
 * `onReady` marks a content slide satisfied; `onResult(correct)` reports a
 * check outcome. Keyed by slideId upstream so state resets between slides.
 */
export default function SlideRenderer({
  slide,
  onReady,
  onResult,
  registerNextIntercept,
  savedState,
  onSaveState,
}) {
  if (slide.isCheck) {
    const Check = getCheckComponent(slide.checkConfig?.validationMode);
    return (
      <SlideShell slide={slide}>
        <Suspense fallback={<InteractionFallback />}>
          <Check slide={slide} onResult={onResult} savedState={savedState} onSaveState={onSaveState} />
        </Suspense>
      </SlideShell>
    );
  }

  const Interaction = getInteractionComponent(slide.interactionComponentKey);
  return (
    <SlideShell slide={slide}>
      <Suspense fallback={<InteractionFallback />}>
        <Interaction
          slide={slide}
          onReady={onReady}
          registerNextIntercept={registerNextIntercept}
          savedState={savedState}
          onSaveState={onSaveState}
        />
      </Suspense>
    </SlideShell>
  );
}
