import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import v from './viz.module.css';

/**
 * A token that supports BOTH pointer drag-and-drop and tap/keyboard selection.
 *
 * - Drag it onto any element carrying a `data-dropzone="<value>"` attribute and
 *   `onDrop(id, value)` fires.
 * - A plain click/Enter/Space (no drag) fires `onTap(id)` - the accessible
 *   fallback for keyboard and touch users.
 */
export default function DragChip({ id, label, image, className = '', disabled = false, onTap, onDrop }) {
  const startRef = useRef(null);
  const movedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const [pos, setPos] = useState(null);
  const [dragging, setDragging] = useState(false);

  // Always clear gesture state. Safe to call multiple times (idempotent), which
  // matters because pointerup, lostpointercapture, and pointercancel can all
  // fire for a single gesture.
  function endGesture() {
    startRef.current = null;
    movedRef.current = false;
    setDragging(false);
    setPos(null);
  }

  function handleDown(e) {
    if (disabled) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    movedRef.current = false;
    // Capture so we keep receiving move/up even if the finger leaves the chip.
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* capture is best-effort */
    }
  }

  function handleMove(e) {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (!movedRef.current && Math.hypot(dx, dy) > 6) {
      movedRef.current = true;
      setDragging(true);
    }
    if (movedRef.current) setPos({ x: e.clientX, y: e.clientY });
  }

  function handleUp(e) {
    const moved = movedRef.current;
    const wasActive = Boolean(startRef.current);
    endGesture();
    if (!wasActive || !moved) return; // a plain tap -> let onClick handle it
    suppressClickRef.current = true;
    // The ghost has pointer-events:none, so elementFromPoint returns the real
    // drop target painted under the pointer.
    const under = document.elementFromPoint(e.clientX, e.clientY);
    const zone = under?.closest('[data-dropzone]');
    if (zone) onDrop?.(id, zone.getAttribute('data-dropzone'));
  }

  // Touch/small-device safety net: the browser can interrupt a pointer gesture
  // (scroll, OS gesture, element reflow) by firing pointercancel /
  // lostpointercapture instead of pointerup. Without resetting here, the drag
  // ghost would be stranded on screen and the chip would feel "stuck".
  function handleCancel() {
    // On a normal pointerup, handleUp already cleared startRef; the
    // lostpointercapture that follows must not undo its work.
    if (!startRef.current) return;
    if (movedRef.current) suppressClickRef.current = true;
    endGesture();
  }

  function handleClick() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (!disabled) onTap?.(id);
  }

  const content = (
    <>
      {image && (
        <img src={image} alt="" className={v.chipImage} draggable="false" />
      )}
      <span>{label}</span>
    </>
  );

  return (
    <>
      <button
        type="button"
        className={`${className} ${image ? v.chipWithImage : ''} ${dragging ? v.dragSource : ''}`}
        style={{ touchAction: 'none' }}
        disabled={disabled}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleCancel}
        onLostPointerCapture={handleCancel}
        onClick={handleClick}
      >
        {content}
      </button>
      {dragging &&
        pos &&
        createPortal(
          <span className={`${className} ${image ? v.chipWithImage : ''} ${v.dragGhost}`} style={{ left: pos.x, top: pos.y }} aria-hidden="true">
            {content}
          </span>,
          document.body,
        )}
    </>
  );
}
