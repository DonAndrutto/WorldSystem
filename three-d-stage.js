/*!
 * three-d-stage.js — a small, dependency-light 3D stage for three.js.
 *
 * Wraps the boilerplate that every hand-built three.js scene needs — renderer,
 * camera, damped orbit controls, lighting rig, a starfield, an HTML label layer
 * that tracks 3D anchors, pointer picking and a resize-aware render loop —
 * behind one object, so the page that uses it only has to describe geometry.
 *
 * It deliberately depends on nothing but the `THREE` global (a plain UMD build
 * of three.js, r128 or later). No `examples/jsm` imports, no ES-module loading,
 * so the page still works when opened straight off disk with a `file://` URL.
 *
 * Usage:
 *
 *   const stage = ThreeDStage.create({ container: document.querySelector('#stage') });
 *   stage.root.add(someMesh);
 *   stage.register(someMesh, { id: 'meru', name: 'Mount Meru' });
 *   stage.addLabel({ anchor: someMesh, html: 'Meru', dataId: 'meru' });
 *   stage.on('select', (meta) => console.log(meta));
 *   stage.start();
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ThreeDStage = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * small helpers
   * ------------------------------------------------------------------ */

  function requireTHREE() {
    var T = (typeof window !== 'undefined' && window.THREE) || null;
    if (!T) {
      throw new Error(
        'three-d-stage: the global `THREE` was not found. Load a UMD build of ' +
        'three.js before this file.'
      );
    }
    return T;
  }

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  // Frame-rate independent exponential smoothing: the fraction of the gap that
  // is closed in `dt` seconds, given a per-second smoothing `rate`.
  function damp(current, goal, rate, dt) {
    return goal + (current - goal) * Math.exp(-rate * dt);
  }

  function shortestAngle(from, to) {
    var d = (to - from) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return from + d;
  }

  /* ------------------------------------------------------------------ *
   * Orbit — a compact, damped orbit/pan/zoom controller
   *
   * Mouse: drag to orbit, right-drag or shift-drag to pan, wheel to dolly.
   * Touch: one finger orbits, two fingers pinch to dolly and drag to pan.
   * ------------------------------------------------------------------ */

  function Orbit(camera, dom, opts) {
    var THREE = requireTHREE();
    opts = opts || {};

    this.camera = camera;
    this.dom = dom;
    this.enabled = opts.enabled !== false;
    this.enablePan = opts.enablePan !== false;

    this.minDistance = opts.minDistance != null ? opts.minDistance : 1;
    this.maxDistance = opts.maxDistance != null ? opts.maxDistance : 5000;
    this.minPolar = opts.minPolar != null ? opts.minPolar : 0.02;
    this.maxPolar = opts.maxPolar != null ? opts.maxPolar : Math.PI - 0.02;

    this.rotateSpeed = opts.rotateSpeed != null ? opts.rotateSpeed : 1;
    this.zoomSpeed = opts.zoomSpeed != null ? opts.zoomSpeed : 1;
    this.panSpeed = opts.panSpeed != null ? opts.panSpeed : 1;

    // How fast the camera catches up with its goal, per second. Higher is
    // snappier; the default reads as "heavy but responsive".
    this.damping = opts.damping != null ? opts.damping : 9;

    this.autoRotate = !!opts.autoRotate;
    this.autoRotateSpeed = opts.autoRotateSpeed != null ? opts.autoRotateSpeed : 0.08;

    this.target = new THREE.Vector3();
    this.goalTarget = new THREE.Vector3();

    var d = opts.distance != null ? opts.distance : 60;
    this.current = { radius: d, theta: opts.theta != null ? opts.theta : 0.9, phi: opts.phi != null ? opts.phi : 1.05 };
    this.goal = { radius: this.current.radius, theta: this.current.theta, phi: this.current.phi };

    this._pointers = new Map();
    this._mode = null;        // 'rotate' | 'pan' | 'pinch'
    this._last = { x: 0, y: 0 };
    this._pinchDistance = 0;
    this._dragDistance = 0;   // px travelled since pointerdown, for click detection
    this._scratch = new THREE.Vector3();
    this._panX = new THREE.Vector3();
    this._panY = new THREE.Vector3();

    this._bind();
    this.applyImmediately();
  }

  Orbit.prototype._bind = function () {
    var self = this;
    var dom = this.dom;

    this._onDown = function (e) {
      if (!self.enabled) return;
      dom.setPointerCapture && dom.setPointerCapture(e.pointerId);
      self._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      self._dragDistance = 0;

      if (self._pointers.size === 2) {
        self._mode = 'pinch';
        self._pinchDistance = self._pointerSpread();
        var mid = self._pointerMidpoint();
        self._last.x = mid.x; self._last.y = mid.y;
      } else {
        var wantsPan = self.enablePan && (e.button === 2 || e.button === 1 || e.shiftKey);
        self._mode = wantsPan ? 'pan' : 'rotate';
        self._last.x = e.clientX; self._last.y = e.clientY;
      }
    };

    this._onMove = function (e) {
      if (!self.enabled || !self._mode) return;
      if (!self._pointers.has(e.pointerId)) return;
      self._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      var rect = dom.getBoundingClientRect();
      var span = Math.max(1, Math.min(rect.width, rect.height));

      if (self._mode === 'pinch') {
        var spread = self._pointerSpread();
        if (self._pinchDistance > 0 && spread > 0) {
          self.goal.radius = clamp(
            self.goal.radius * (self._pinchDistance / spread),
            self.minDistance, self.maxDistance
          );
        }
        self._pinchDistance = spread;
        var mid = self._pointerMidpoint();
        if (self.enablePan) self._pan(mid.x - self._last.x, mid.y - self._last.y, rect);
        self._last.x = mid.x; self._last.y = mid.y;
        return;
      }

      var dx = e.clientX - self._last.x;
      var dy = e.clientY - self._last.y;
      self._dragDistance += Math.abs(dx) + Math.abs(dy);
      self._last.x = e.clientX; self._last.y = e.clientY;

      if (self._mode === 'pan') {
        self._pan(dx, dy, rect);
      } else {
        self.autoRotate = false;
        self.goal.theta -= (dx / span) * Math.PI * 2 * self.rotateSpeed;
        self.goal.phi = clamp(
          self.goal.phi - (dy / span) * Math.PI * 1.2 * self.rotateSpeed,
          self.minPolar, self.maxPolar
        );
      }
    };

    this._onUp = function (e) {
      self._pointers.delete(e.pointerId);
      dom.releasePointerCapture && dom.hasPointerCapture && dom.hasPointerCapture(e.pointerId) &&
        dom.releasePointerCapture(e.pointerId);
      if (self._pointers.size === 0) self._mode = null;
      else if (self._pointers.size === 1) {
        self._mode = 'rotate';
        var only = self._pointers.values().next().value;
        self._last.x = only.x; self._last.y = only.y;
      }
    };

    this._onWheel = function (e) {
      if (!self.enabled) return;
      e.preventDefault();
      // Normalise across the three deltaMode units browsers report.
      var unit = e.deltaMode === 1 ? 16 : (e.deltaMode === 2 ? 400 : 1);
      var factor = Math.exp((e.deltaY * unit) * 0.0012 * self.zoomSpeed);
      self.goal.radius = clamp(self.goal.radius * factor, self.minDistance, self.maxDistance);
    };

    this._onContext = function (e) { if (self.enablePan) e.preventDefault(); };

    dom.addEventListener('pointerdown', this._onDown);
    dom.addEventListener('pointermove', this._onMove);
    dom.addEventListener('pointerup', this._onUp);
    dom.addEventListener('pointercancel', this._onUp);
    dom.addEventListener('wheel', this._onWheel, { passive: false });
    dom.addEventListener('contextmenu', this._onContext);
  };

  Orbit.prototype._pointerSpread = function () {
    var pts = Array.from(this._pointers.values());
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  };

  Orbit.prototype._pointerMidpoint = function () {
    var pts = Array.from(this._pointers.values());
    if (pts.length < 2) return { x: pts[0].x, y: pts[0].y };
    return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
  };

  Orbit.prototype._pan = function (dx, dy, rect) {
    // Pan in the camera's screen plane, scaled so a pixel of drag moves the
    // target by roughly a pixel's worth of world space at the focus distance.
    var cam = this.camera;
    var height = 2 * this.goal.radius * Math.tan((cam.fov * Math.PI / 180) / 2);
    var perPixel = height / Math.max(1, rect.height) * this.panSpeed;

    cam.updateMatrixWorld();
    this._panX.setFromMatrixColumn(cam.matrixWorld, 0);
    this._panY.setFromMatrixColumn(cam.matrixWorld, 1);

    this.goalTarget.addScaledVector(this._panX, -dx * perPixel);
    this.goalTarget.addScaledVector(this._panY, dy * perPixel);
  };

  /** Jump the camera to a pose without any easing. */
  Orbit.prototype.applyImmediately = function () {
    this.current.radius = this.goal.radius;
    this.current.theta = this.goal.theta;
    this.current.phi = this.goal.phi;
    this.target.copy(this.goalTarget);
    this._place();
  };

  /**
   * Ease toward a new pose. Any field may be omitted to leave it untouched.
   * @param {{theta?:number, phi?:number, radius?:number, target?:THREE.Vector3, instant?:boolean}} view
   */
  Orbit.prototype.moveTo = function (view) {
    if (!view) return;
    if (view.theta != null) this.goal.theta = shortestAngle(this.current.theta, view.theta);
    if (view.phi != null) this.goal.phi = clamp(view.phi, this.minPolar, this.maxPolar);
    if (view.radius != null) this.goal.radius = clamp(view.radius, this.minDistance, this.maxDistance);
    if (view.target) this.goalTarget.copy(view.target);
    if (view.instant) this.applyImmediately();
  };

  Orbit.prototype._place = function () {
    var r = this.current.radius, phi = this.current.phi, theta = this.current.theta;
    var sinPhi = Math.sin(phi);
    this._scratch.set(
      r * sinPhi * Math.sin(theta),
      r * Math.cos(phi),
      r * sinPhi * Math.cos(theta)
    );
    this.camera.position.copy(this.target).add(this._scratch);
    this.camera.lookAt(this.target);
  };

  Orbit.prototype.update = function (dt) {
    if (this.autoRotate) this.goal.theta += this.autoRotateSpeed * dt;

    var rate = this.damping;
    this.current.radius = damp(this.current.radius, this.goal.radius, rate, dt);
    this.current.theta = damp(this.current.theta, this.goal.theta, rate, dt);
    this.current.phi = damp(this.current.phi, this.goal.phi, rate, dt);
    this.target.set(
      damp(this.target.x, this.goalTarget.x, rate, dt),
      damp(this.target.y, this.goalTarget.y, rate, dt),
      damp(this.target.z, this.goalTarget.z, rate, dt)
    );
    this._place();
  };

  Orbit.prototype.dispose = function () {
    var dom = this.dom;
    dom.removeEventListener('pointerdown', this._onDown);
    dom.removeEventListener('pointermove', this._onMove);
    dom.removeEventListener('pointerup', this._onUp);
    dom.removeEventListener('pointercancel', this._onUp);
    dom.removeEventListener('wheel', this._onWheel);
    dom.removeEventListener('contextmenu', this._onContext);
    this._pointers.clear();
  };

  /* ------------------------------------------------------------------ *
   * Stage
   * ------------------------------------------------------------------ */

  function Stage(options) {
    var THREE = requireTHREE();
    var opts = options || {};

    var container = opts.container;
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) throw new Error('three-d-stage: `container` is required.');
    this.container = container;
    if (getComputedStyle(container).position === 'static') container.style.position = 'relative';

    this.THREE = THREE;
    this._listeners = { select: [], hover: [], frame: [], resize: [] };
    this._pickables = [];
    this._meta = new WeakMap();
    this._labels = [];
    this._labelsVisible = true;
    this._running = false;
    this._lastTime = 0;
    this.elapsed = 0;

    /* renderer ------------------------------------------------------- */
    var renderer = new THREE.WebGLRenderer({
      antialias: opts.antialias !== false,
      alpha: !!opts.alpha,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.pixelRatio || 2));
    // three renamed its colour-space API around r152; support both spellings so
    // the module keeps working whichever build the page happens to load.
    if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    else if ('outputEncoding' in renderer && THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    /* scene ---------------------------------------------------------- */
    var scene = new THREE.Scene();
    var bg = opts.background != null ? opts.background : 0x05070f;
    if (bg !== false) scene.background = new THREE.Color(bg);
    if (opts.fog) scene.fog = new THREE.Fog(opts.fog.color != null ? opts.fog.color : bg, opts.fog.near, opts.fog.far);
    this.scene = scene;

    this.root = new THREE.Group();
    this.root.name = 'stage-root';
    scene.add(this.root);

    /* camera --------------------------------------------------------- */
    var camOpts = opts.camera || {};
    this.camera = new THREE.PerspectiveCamera(
      camOpts.fov != null ? camOpts.fov : 42,
      1,
      camOpts.near != null ? camOpts.near : 0.1,
      camOpts.far != null ? camOpts.far : 20000
    );
    scene.add(this.camera);

    /* lights --------------------------------------------------------- */
    if (opts.lights !== false) this._buildLights(opts.lights || {});

    /* starfield ------------------------------------------------------ */
    if (opts.stars !== false) this.stars = this._buildStars(opts.stars || {});

    /* controls ------------------------------------------------------- */
    this.controls = new Orbit(this.camera, renderer.domElement, opts.controls || {});

    /* label layer ---------------------------------------------------- */
    var layer = document.createElement('div');
    layer.className = 'stage-labels';
    layer.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;';
    container.appendChild(layer);
    this.labelLayer = layer;

    /* picking -------------------------------------------------------- */
    this._raycaster = new THREE.Raycaster();
    this._ndc = new THREE.Vector2();
    this._hovered = null;
    this._bindPicking();

    /* sizing --------------------------------------------------------- */
    this._bindResize();
    this.resize();
  }

  Stage.prototype._buildLights = function (cfg) {
    var THREE = this.THREE;
    var lights = new THREE.Group();
    lights.name = 'lights';

    var hemi = new THREE.HemisphereLight(
      cfg.skyColor != null ? cfg.skyColor : 0x9fb6ff,
      cfg.groundColor != null ? cfg.groundColor : 0x1a1206,
      cfg.hemiIntensity != null ? cfg.hemiIntensity : 0.55
    );
    lights.add(hemi);

    var key = new THREE.DirectionalLight(
      cfg.keyColor != null ? cfg.keyColor : 0xfff2d6,
      cfg.keyIntensity != null ? cfg.keyIntensity : 1.0
    );
    key.position.set(1, 1.35, 0.8).multiplyScalar(120);
    lights.add(key);

    var rim = new THREE.DirectionalLight(
      cfg.rimColor != null ? cfg.rimColor : 0x6f8dff,
      cfg.rimIntensity != null ? cfg.rimIntensity : 0.45
    );
    rim.position.set(-1.1, 0.4, -1).multiplyScalar(120);
    lights.add(rim);

    var fill = new THREE.AmbientLight(0xffffff, cfg.ambientIntensity != null ? cfg.ambientIntensity : 0.18);
    lights.add(fill);

    this.scene.add(lights);
    this.lights = { group: lights, hemi: hemi, key: key, rim: rim, ambient: fill };
    return this.lights;
  };

  Stage.prototype._buildStars = function (cfg) {
    var THREE = this.THREE;
    var count = cfg.count != null ? cfg.count : 1400;
    var radius = cfg.radius != null ? cfg.radius : 6000;
    var positions = new Float32Array(count * 3);
    var colors = new Float32Array(count * 3);
    var tint = new THREE.Color();

    for (var i = 0; i < count; i++) {
      // Uniform on the sphere, pushed out into a shell so the field has depth.
      var u = Math.random() * 2 - 1;
      var a = Math.random() * Math.PI * 2;
      var s = Math.sqrt(1 - u * u);
      var r = radius * (0.65 + Math.random() * 0.35);
      positions[i * 3] = r * s * Math.cos(a);
      positions[i * 3 + 1] = r * u;
      positions[i * 3 + 2] = r * s * Math.sin(a);

      tint.setHSL(0.55 + Math.random() * 0.12, 0.35 * Math.random(), 0.65 + Math.random() * 0.35);
      colors[i * 3] = tint.r; colors[i * 3 + 1] = tint.g; colors[i * 3 + 2] = tint.b;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    var mat = new THREE.PointsMaterial({
      size: cfg.size != null ? cfg.size : 12,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: cfg.opacity != null ? cfg.opacity : 0.9,
      depthWrite: false
    });
    var points = new THREE.Points(geo, mat);
    points.name = 'starfield';
    points.frustumCulled = false;
    this.scene.add(points);
    return points;
  };

  Stage.prototype._bindPicking = function () {
    var self = this;
    var dom = this.renderer.domElement;

    this._onPickMove = function (e) {
      self._ndcFromEvent(e, self._ndc);
      self._pendingHover = true;
    };

    this._onPickUp = function (e) {
      // Treat it as a click only if the pointer barely moved, so that finishing
      // an orbit drag over an object does not select it.
      if (self.controls && self.controls._dragDistance > 6) return;
      if (e.button !== undefined && e.button !== 0) return;
      self._ndcFromEvent(e, self._ndc);
      var hit = self._pick();
      self.emit('select', hit ? self._meta.get(hit.object) || null : null, hit);
    };

    dom.addEventListener('pointermove', this._onPickMove);
    dom.addEventListener('pointerup', this._onPickUp);
  };

  Stage.prototype._ndcFromEvent = function (e, out) {
    var rect = this.renderer.domElement.getBoundingClientRect();
    out.x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    out.y = -((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;
    return out;
  };

  Stage.prototype._pick = function () {
    if (!this._pickables.length) return null;
    this._raycaster.setFromCamera(this._ndc, this.camera);
    var hits = this._raycaster.intersectObjects(this._pickables, false);
    for (var i = 0; i < hits.length; i++) {
      if (hits[i].object.visible && this._visibleInTree(hits[i].object)) return hits[i];
    }
    return null;
  };

  Stage.prototype._visibleInTree = function (obj) {
    var n = obj;
    while (n) { if (!n.visible) return false; n = n.parent; }
    return true;
  };

  Stage.prototype._bindResize = function () {
    var self = this;
    this._onWindowResize = function () { self.resize(); };
    window.addEventListener('resize', this._onWindowResize);
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(function () { self.resize(); });
      this._ro.observe(this.container);
    }
  };

  Stage.prototype.resize = function () {
    var w = this.container.clientWidth || 1;
    var h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.emit('resize', { width: w, height: h });
  };

  /* --- registration ------------------------------------------------- */

  /**
   * Make an object pickable and attach the metadata handed back on select/hover.
   */
  Stage.prototype.register = function (object, meta) {
    this._meta.set(object, meta || {});
    if (this._pickables.indexOf(object) === -1) this._pickables.push(object);
    return object;
  };

  Stage.prototype.unregister = function (object) {
    var i = this._pickables.indexOf(object);
    if (i >= 0) this._pickables.splice(i, 1);
    this._meta.delete(object);
  };

  Stage.prototype.metaFor = function (object) { return this._meta.get(object) || null; };

  Stage.prototype.clearPickables = function () { this._pickables.length = 0; };

  /* --- labels ------------------------------------------------------- */

  /**
   * Attach an HTML label that tracks a 3D anchor.
   * @param {{anchor:Object|THREE.Vector3, html:string, className?:string,
   *          dataId?:string, offset?:THREE.Vector3, minDistance?:number,
   *          maxDistance?:number, priority?:number, interactive?:boolean}} opts
   *
   * Labels are decluttered every frame: higher `priority` wins a contested
   * patch of screen, and among equals the nearer one does, so a crowded model
   * stays readable instead of collapsing into overlapping text.
   */
  Stage.prototype.addLabel = function (opts) {
    var THREE = this.THREE;
    var el = document.createElement('div');
    el.className = 'stage-label' + (opts.className ? ' ' + opts.className : '');
    el.style.cssText = 'position:absolute;left:0;top:0;will-change:transform;';
    if (opts.interactive) el.style.pointerEvents = 'auto';
    el.innerHTML = opts.html || '';
    if (opts.dataId) el.dataset.id = opts.dataId;
    this.labelLayer.appendChild(el);

    var label = {
      el: el,
      anchor: opts.anchor,
      offset: opts.offset || new THREE.Vector3(),
      minDistance: opts.minDistance || 0,
      maxDistance: opts.maxDistance || Infinity,
      priority: opts.priority != null ? opts.priority : 1,
      visible: true,
      _w: null, _h: null,
      _world: new THREE.Vector3(),
      _projected: new THREE.Vector3()
    };
    this._labels.push(label);
    return label;
  };

  /** Replace a label's markup, invalidating its cached screen size. */
  Stage.prototype.setLabelHTML = function (label, html) {
    label.el.innerHTML = html;
    label._w = null;
    label._h = null;
  };

  Stage.prototype.removeLabel = function (label) {
    var i = this._labels.indexOf(label);
    if (i >= 0) this._labels.splice(i, 1);
    if (label.el && label.el.parentNode) label.el.parentNode.removeChild(label.el);
  };

  Stage.prototype.clearLabels = function () {
    while (this._labels.length) this.removeLabel(this._labels[0]);
  };

  Stage.prototype.setLabelsVisible = function (visible) {
    this._labelsVisible = !!visible;
    this.labelLayer.style.display = visible ? '' : 'none';
  };

  Stage.prototype._updateLabels = function () {
    if (!this._labelsVisible) return;
    var w = this.renderer.domElement.clientWidth;
    var h = this.renderer.domElement.clientHeight;
    var camPos = this.camera.position;
    var candidates = [];
    var i, L;

    for (i = 0; i < this._labels.length; i++) {
      L = this._labels[i];
      var anchor = L.anchor;
      if (!anchor) continue;

      if (anchor.isVector3) L._world.copy(anchor);
      else anchor.getWorldPosition(L._world);
      L._world.add(L.offset);

      var visible = L.visible;
      if (visible && anchor.isObject3D) visible = this._visibleInTree(anchor);

      var dist = camPos.distanceTo(L._world);
      if (dist < L.minDistance || dist > L.maxDistance) visible = false;

      L._projected.copy(L._world).project(this.camera);
      if (L._projected.z > 1 || L._projected.z < -1) visible = false;

      if (!visible) { L.el.style.display = 'none'; continue; }

      candidates.push({
        L: L,
        x: (L._projected.x * 0.5 + 0.5) * w,
        y: (-L._projected.y * 0.5 + 0.5) * h,
        z: L._projected.z
      });
    }

    // Place the important and the near ones first, then drop anything that
    // would land on a patch of screen already taken.
    candidates.sort(function (a, b) {
      return (b.L.priority - a.L.priority) || (a.z - b.z);
    });

    var placed = [];
    var PAD = 3;
    for (i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      L = c.L;
      var el = L.el;
      el.style.display = '';
      // Measured once per label and cached; changing the markup clears it.
      if (L._w == null) { L._w = el.offsetWidth; L._h = el.offsetHeight; }

      var x1 = c.x - L._w / 2 - PAD, x2 = c.x + L._w / 2 + PAD;
      var y1 = c.y - L._h / 2 - PAD, y2 = c.y + L._h / 2 + PAD;

      var blocked = false;
      for (var j = 0; j < placed.length; j++) {
        var p = placed[j];
        if (x1 < p[2] && x2 > p[0] && y1 < p[3] && y2 > p[1]) { blocked = true; break; }
      }
      if (blocked) { el.style.display = 'none'; continue; }

      placed.push([x1, y1, x2, y2]);
      el.style.transform = 'translate(-50%,-50%) translate(' + c.x.toFixed(1) + 'px,' + c.y.toFixed(1) + 'px)';
      el.style.zIndex = String(1000 - Math.round(c.z * 1000));
    }
  };

  /* --- views -------------------------------------------------------- */

  Stage.prototype.moveTo = function (view) { this.controls.moveTo(view); return this; };

  /** Camera distance at which a sphere of `radius` about the target just fits. */
  Stage.prototype.fitDistance = function (radius, padding) {
    var half = Math.tan((this.camera.fov * Math.PI / 180) / 2);
    var vertical = radius / half;
    var horizontal = radius / (half * Math.max(0.25, this.camera.aspect));
    return Math.max(vertical, horizontal) * (padding || 1.05);
  };

  /** Frame an object (or a Box3) so it fills a comfortable share of the view. */
  Stage.prototype.frame = function (objectOrBox, padding) {
    var THREE = this.THREE;
    var box = objectOrBox && objectOrBox.isBox3
      ? objectOrBox
      : new THREE.Box3().setFromObject(objectOrBox);
    if (box.isEmpty()) return this;
    var size = box.getSize(new THREE.Vector3());
    var center = box.getCenter(new THREE.Vector3());
    var extent = Math.max(size.x, size.y, size.z);
    var fov = this.camera.fov * Math.PI / 180;
    var radius = (extent / 2) / Math.tan(fov / 2) * (padding || 1.6);
    this.controls.moveTo({ target: center, radius: radius });
    return this;
  };

  Stage.prototype.screenPosition = function (vec3, out) {
    var THREE = this.THREE;
    var p = (out || new THREE.Vector3()).copy(vec3).project(this.camera);
    var w = this.renderer.domElement.clientWidth;
    var h = this.renderer.domElement.clientHeight;
    return { x: (p.x * 0.5 + 0.5) * w, y: (-p.y * 0.5 + 0.5) * h, z: p.z };
  };

  /* --- events ------------------------------------------------------- */

  Stage.prototype.on = function (name, fn) {
    (this._listeners[name] || (this._listeners[name] = [])).push(fn);
    return this;
  };

  Stage.prototype.off = function (name, fn) {
    var list = this._listeners[name];
    if (!list) return this;
    var i = list.indexOf(fn);
    if (i >= 0) list.splice(i, 1);
    return this;
  };

  Stage.prototype.emit = function (name) {
    var list = this._listeners[name];
    if (!list || !list.length) return;
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < list.length; i++) list[i].apply(null, args);
  };

  /* --- loop --------------------------------------------------------- */

  Stage.prototype.start = function () {
    if (this._running) return this;
    this._running = true;
    this._lastTime = performance.now();
    var self = this;
    var tick = function (now) {
      if (!self._running) return;
      self._frame = requestAnimationFrame(tick);
      // Clamp dt so a backgrounded tab does not fling the camera on return.
      var dt = Math.min((now - self._lastTime) / 1000, 0.1);
      self._lastTime = now;
      self.elapsed += dt;
      self.step(dt);
    };
    this._frame = requestAnimationFrame(tick);
    return this;
  };

  Stage.prototype.stop = function () {
    this._running = false;
    if (this._frame) cancelAnimationFrame(this._frame);
    this._frame = null;
    return this;
  };

  Stage.prototype.step = function (dt) {
    this.controls.update(dt);

    if (this._pendingHover) {
      this._pendingHover = false;
      var hit = this._pick();
      var obj = hit ? hit.object : null;
      if (obj !== this._hovered) {
        this._hovered = obj;
        this.renderer.domElement.style.cursor = obj ? 'pointer' : '';
        this.emit('hover', obj ? this._meta.get(obj) || null : null, hit);
      }
    }

    this.emit('frame', dt, this.elapsed);
    this.renderer.render(this.scene, this.camera);
    this._updateLabels();
  };

  Stage.prototype.dispose = function () {
    this.stop();
    this.clearLabels();
    this.controls.dispose();
    window.removeEventListener('resize', this._onWindowResize);
    if (this._ro) this._ro.disconnect();
    var dom = this.renderer.domElement;
    dom.removeEventListener('pointermove', this._onPickMove);
    dom.removeEventListener('pointerup', this._onPickUp);
    this.scene.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        var mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(function (m) { m.dispose(); });
      }
    });
    this.renderer.dispose();
    if (dom.parentNode) dom.parentNode.removeChild(dom);
    if (this.labelLayer.parentNode) this.labelLayer.parentNode.removeChild(this.labelLayer);
  };

  /* ------------------------------------------------------------------ *
   * geometry helpers the stage's callers keep needing
   * ------------------------------------------------------------------ */

  var shapes = {
    /** A flat annulus with an arbitrary number of sides — a square "ring" at 4. */
    ringPrism: function (innerRadius, outerRadius, height, sides, rotate) {
      var THREE = requireTHREE();
      sides = sides || 64;
      var shape = new THREE.Shape();
      var hole = new THREE.Path();
      var i, a;
      var turn = rotate || 0;
      for (i = 0; i <= sides; i++) {
        a = turn + (i / sides) * Math.PI * 2;
        var ox = Math.cos(a) * outerRadius, oy = Math.sin(a) * outerRadius;
        if (i === 0) shape.moveTo(ox, oy); else shape.lineTo(ox, oy);
      }
      for (i = 0; i <= sides; i++) {
        a = turn + (i / sides) * Math.PI * 2;
        var ix = Math.cos(a) * innerRadius, iy = Math.sin(a) * innerRadius;
        if (i === 0) hole.moveTo(ix, iy); else hole.lineTo(ix, iy);
      }
      shape.holes.push(hole);
      var geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: sides });
      geo.rotateX(-Math.PI / 2);          // extrude along +Y
      geo.translate(0, 0, 0);
      return geo;
    },

    /** A flat slab from a 2D outline given as [[x, z], ...]. */
    slab: function (points, height) {
      var THREE = requireTHREE();
      var shape = new THREE.Shape();
      // Laying the extrusion down with rotateX(-90°) sends the shape's second
      // coordinate to world -Z, so negate it here and callers can pass honest
      // [x, z] pairs without the outline coming out mirrored.
      points.forEach(function (p, i) {
        if (i === 0) shape.moveTo(p[0], -p[1]); else shape.lineTo(p[0], -p[1]);
      });
      var geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
      geo.rotateX(-Math.PI / 2);
      return geo;
    },

    /** A square (or n-sided) frustum: `sides = 4` gives Meru's tapered block. */
    frustum: function (radiusBottom, radiusTop, height, sides, rotate) {
      var THREE = requireTHREE();
      var geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, sides || 4, 1);
      if (rotate) geo.rotateY(rotate);
      return geo;
    },

    /** A horizontal disc lying in the XZ plane. */
    disc: function (radius, segments) {
      var THREE = requireTHREE();
      var geo = new THREE.CircleGeometry(radius, segments || 96);
      geo.rotateX(-Math.PI / 2);
      return geo;
    }
  };

  return {
    Stage: Stage,
    Orbit: Orbit,
    shapes: shapes,
    create: function (options) { return new Stage(options); },
    version: '1.0.0'
  };
});
