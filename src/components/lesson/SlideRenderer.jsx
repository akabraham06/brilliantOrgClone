import { lazy, Suspense } from 'react';
import SlideShell from './SlideShell.jsx';
import InteractionFallback from './InteractionFallback.jsx';
import { getInteractionComponent, getCheckComponent } from './interactionRegistry.js';
import { aiEnabled } from '../../firebase/ai.js';
import { isFinalCheckSlide } from '../../ai/adaptiveLessonCheck.js';
import { getFreeResponseBank } from '../../data/chemistryCourse.js';

const AdaptiveLessonCheck = lazy(() => import('./checks/AdaptiveLessonCheck.jsx'));
const SkillCheck = lazy(() => import('./checks/SkillCheck.jsx'));

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
  lessonSlides,
}) {
  if (slide.isCheck) {
    // AI-managed adaptive end-check: only the lesson's final multiple-choice
    // check is swapped, and only when AI is on. It falls back to the static
    // check internally, so all other behaviour is unchanged.
    const isFinalMcq =
      aiEnabled &&
      slide.checkConfig?.validationMode === 'multipleChoice' &&
      isFinalCheckSlide(slide, lessonSlides);

    // When the final check is the MCQ and the lesson has a free-response bank,
    // run the two-section SkillCheck (free response → MCQ). Otherwise fall back
    // to the adaptive MCQ swap. Both self-gate on aiEnabled.
    const hasFreeResponse = isFinalMcq && getFreeResponseBank(slide.lessonId).length > 0;

    if (hasFreeResponse) {
      return (
        <SlideShell slide={slide}>
          <Suspense fallback={<InteractionFallback />}>
            <SkillCheck
              slide={slide}
              onResult={onResult}
              savedState={savedState}
              onSaveState={onSaveState}
              lessonSlides={lessonSlides}
            />
          </Suspense>
        </SlideShell>
      );
    }

    if (isFinalMcq) {
      return (
        <SlideShell slide={slide}>
          <Suspense fallback={<InteractionFallback />}>
            <AdaptiveLessonCheck
              slide={slide}
              onResult={onResult}
              savedState={savedState}
              onSaveState={onSaveState}
              lessonSlides={lessonSlides}
            />
          </Suspense>
        </SlideShell>
      );
    }

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
