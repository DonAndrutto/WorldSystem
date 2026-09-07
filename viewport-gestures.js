/* Keep camera gestures inside the scene, including its HTML number markers.
 * Menu scrolling remains native. Browser keyboard zoom is not intercepted. */
export function installViewportGestures({canvas, marks, camera, controls, invalidate}) {
  const doc = canvas.ownerDocument, win = doc.defaultView;
  const onScene = event => event.composedPath().includes(canvas)
    || event.composedPath().some(node => node === marks);
  const cancel = event => { if (event.cancelable) event.preventDefault(); };
  const touches = new Set(), markerStarts = new Map(), skipPick = new WeakSet();
  let multiple = false, gesture = null;
  canvas.style.touchAction = 'none';

  // Trackpad pinch is delivered as ctrl+wheel. Cancel page zoom without
  // stopping the event from reaching OrbitControls on the canvas.
  doc.addEventListener('wheel', event => {
    if (event.ctrlKey || onScene(event)) cancel(event);
    // Safari may emit both streams for one trackpad pinch.
    if (gesture && event.ctrlKey && onScene(event)) event.stopPropagation();
  }, {capture: true, passive: false});
  marks.addEventListener('wheel', event => {
    cancel(event);
    canvas.dispatchEvent(new win.WheelEvent('wheel', {
      bubbles: true, composed: true, cancelable: true,
      deltaX: event.deltaX, deltaY: event.deltaY, deltaMode: event.deltaMode,
      clientX: event.clientX, clientY: event.clientY, ctrlKey: event.ctrlKey
    }));
  }, {passive: false});

  doc.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' && onScene(event)) {
      touches.add(event.pointerId);
      if (touches.size > 1) {
        multiple = true;
        if (gesture) gesture.pointerDriven = true;
      }
    }
  }, true);
  // Markers sit above the canvas. Forward their gesture start to the same
  // controls; subsequent movement/up already reaches the owner document.
  marks.addEventListener('pointerdown', event => {
    const button = event.target.closest('.mk');
    if (!button) return;
    markerStarts.set(event.pointerId, {button, x: event.clientX, y: event.clientY, time: Date.now(), moved: false});
    canvas.dispatchEvent(new win.PointerEvent('pointerdown', {
      bubbles: true, composed: true, cancelable: true,
      pointerId: event.pointerId, pointerType: event.pointerType, isPrimary: event.isPrimary,
      clientX: event.clientX, clientY: event.clientY, button: event.button, buttons: event.buttons,
      ctrlKey: event.ctrlKey, shiftKey: event.shiftKey, metaKey: event.metaKey
    }));
  });
  doc.addEventListener('pointermove', event => {
    const start = markerStarts.get(event.pointerId);
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) start.moved = true;
  }, true);
  const finish = event => {
    const start = markerStarts.get(event.pointerId);
    if (start || multiple || event.type === 'pointercancel') skipPick.add(event);
    if (start && !start.moved && !multiple && event.type === 'pointerup' && Date.now() - start.time < 500) {
      // Capture may retarget pointerup to the canvas, so restore the marker tap.
      win.queueMicrotask(() => start.button.click());
    }
    markerStarts.delete(event.pointerId);
    touches.delete(event.pointerId);
    if (!touches.size) multiple = false;
  };
  doc.addEventListener('pointerup', finish, true);
  doc.addEventListener('pointercancel', finish, true);
  // A forwarded marker tap is activated above, rather than a second native click.
  marks.addEventListener('click', event => {
    if (event.isTrusted && event.detail > 0) { cancel(event); event.stopPropagation(); }
  }, true);

  // iOS fallback where native viewport pinch is still offered despite CSS.
  for (const type of ['touchstart', 'touchmove']) doc.addEventListener(type, event => {
    if (event.touches.length > 1) cancel(event);
  }, {capture: true, passive: false});
  // Safari trackpads also expose GestureEvents. Pointer-based two-finger
  // gestures already belong to OrbitControls and must not be applied twice.
  doc.addEventListener('gesturestart', event => {
    cancel(event);
    gesture = onScene(event) ? {scale: event.scale || 1, pointerDriven: touches.size >= 2} : null;
  }, {passive: false});
  doc.addEventListener('gesturechange', event => {
    cancel(event);
    if (!gesture || gesture.pointerDriven || !controls.enabled || !controls.enableZoom) return;
    const scale = event.scale;
    if (!Number.isFinite(scale) || scale <= 0) return;
    const offset = camera.position.clone().sub(controls.target);
    const distance = Math.max(controls.minDistance,
      Math.min(controls.maxDistance, offset.length() * gesture.scale / scale));
    camera.position.copy(controls.target).add(offset.setLength(distance));
    gesture.scale = scale;
    controls.update(); invalidate();
  }, {passive: false});
  doc.addEventListener('gestureend', event => { cancel(event); gesture = null; }, {passive: false});
  return {allowScenePick: event => !skipPick.has(event)};
}
