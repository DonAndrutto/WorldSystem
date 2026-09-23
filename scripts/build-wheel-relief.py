#!/usr/bin/env python3
"""The wheel of life, made from its photographs.

Reads the reference photographs in assets/wheel-reference/ and writes what the
wheel view draws with: the relief cut into layers as WebP images in
assets/wheel/, and wheel-relief.js, which says where each image goes, where the
rims, spokes and dividers of the real wheel are, and where the hot and the cold
hells lie on it.

    pip install opencv-python-headless numpy scipy
    python3 scripts/build-wheel-relief.py

What it does, in order:

1. Finds the four gold rings on the whole-wall photograph — the hub's rim, the
   karma ring's rim, the inner rim of the twelve panels and the outer rim —
   and fits each with an ellipse. They are nearly circles, but not concentric:
   the relief stands out from the wall and the camera was below it, so the
   nearer rings are carried upward. The drawing puts them back on one centre
   with a radial warp that interpolates between the four, and leaves the wall
   and Yama outside the rim as they are.
2. Registers each close-up onto the whole photograph with SIFT features and a
   homography, warps it through the same correction, and lays it over the
   whole at three drawing units to the pixel, feathered at its edges.
3. Measures the six spokes and the twelve dividers of the rim on the corrected
   image, from rough seeds.
4. Separates the wall from the relief by its colour, and cuts the relief into
   the layers the view stands at different depths: the figures painted on the
   wall beyond Yama's reach, Yama's body, the wheel, its gold frame, and in
   front of it all his head, hands and feet.
5. Finds the red lattice of the hot hells and the ice of the cold, which the
   entries divide into eight rows each.

Every step is deterministic: run it twice and it writes the same files.
"""
import json
import pathlib

import cv2
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
REF = ROOT / 'assets' / 'wheel-reference'
OUT = ROOT / 'assets' / 'wheel'
MODULE = ROOT / 'wheel-relief.js'

W, H = 1320, 1740            # the drawing's frame: the whole photograph's own
C = (660.0, 866.0)           # the wheel's centre, once it is round again
SM = 3                       # master resolution, pixels per drawing unit
SB = 1.5                     # the layers' base images
SD = 3                       # detail patches, where a close-up has more to give
HUB_GUESS = (658, 822)       # where the hub is on the uncorrected photograph

CLOSEUPS = ['yama-gods', 'humans', 'pretas-cold-hells', 'hub-karma']
SPOKE_SEEDS = [-120, -61.3, -12.6, 35.5, 142.5, 191]
DIVIDER_SEEDS = [270, 299, 326, 356, 26, 57, 90, 121.5, 153, 182.5, 213, 241.5]

# The pieces that stand in front of the wheel, traced off the corrected image.
FRONT = {
    'head': [(632, 2), (700, 2), (722, 26), (762, 26), (800, 40), (818, 92), (850, 108), (872, 148),
             (882, 192), (872, 232), (866, 262), (882, 300), (872, 340), (800, 352), (760, 356),
             (722, 362), (704, 380), (612, 380), (596, 362), (560, 356), (520, 352), (450, 340),
             (440, 300), (454, 262), (448, 232), (438, 192), (448, 148), (470, 108), (502, 92),
             (520, 40), (558, 26), (598, 26)],
    'hand_l': [(158, 642), (148, 560), (160, 505), (182, 470), (194, 440), (200, 418), (214, 414),
               (226, 428), (232, 470), (244, 478), (266, 452), (284, 438), (294, 450), (288, 500),
               (302, 522), (304, 560), (292, 596), (270, 604), (254, 584), (240, 604), (232, 642)],
    'foot_l': [(42, 1200), (90, 1188), (112, 1204), (172, 1214), (250, 1230), (292, 1262), (322, 1322),
               (336, 1392), (332, 1442), (300, 1452), (268, 1432), (228, 1382), (170, 1362),
               (120, 1372), (84, 1362), (58, 1322), (46, 1262)],
}
FRONT['hand_r'] = [(W - x, y) for x, y in FRONT['hand_l']]
FRONT['foot_r'] = [(W - x, y) for x, y in FRONT['foot_l']]

# What is painted on the wall outside Yama's reach. These are paintings, flat on
# the wall, so they are kept whole within these outlines rather than cut out of
# it: the wall under them is the photograph's own, and they sit on it seamlessly.
BEYOND = [
    [(0, 0), (336, 0), (336, 116), (300, 126), (252, 146), (214, 172), (188, 200), (168, 232), (0, 238)],
    [(866, 0), (1320, 0), (1320, 238), (1104, 238), (1060, 212), (1012, 180), (962, 150), (928, 136), (900, 110), (866, 100)],
    [(1226, 238), (1320, 238), (1320, 350), (1226, 350)],
    [(398, 14), (470, 14), (470, 80), (398, 80)],
    [(812, 12), (864, 12), (864, 70), (812, 70)],
]


def log(*a):
    print(*a, flush=True)


# ── 1. the rings ─────────────────────────────────────────────────────────────
def gold_mask(img, loose=False):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    if loose:
        return (h >= 12) & (h <= 34) & (s >= 60) & (v >= 110)
    return (h >= 14) & (h <= 32) & (s >= 90) & (v >= 150)


def ray_runs(gold, a, cx, cy, rmax=640, step=0.1):
    t = np.deg2rad(a)
    rs = np.arange(0, rmax, step)
    xs = np.round(cx + np.cos(t) * rs).astype(int)
    ys = np.round(cy + np.sin(t) * rs).astype(int)
    ok = (xs >= 0) & (xs < gold.shape[1]) & (ys >= 0) & (ys < gold.shape[0])
    on = np.zeros(len(rs), bool)
    on[ok] = gold[ys[ok], xs[ok]]
    out, start = [], None
    for r, v in zip(rs, on):
        if v and start is None:
            start = r
        if not v and start is not None:
            out.append((start, r - step))
            start = None
    return out


def fit_ellipse(pts):
    arr = np.array(pts, np.float32)
    keep = np.ones(len(arr), bool)
    e = None
    for it in range(6):
        e = cv2.fitEllipse(arr[keep])
        (ex, ey), (ma, mi), ang = e
        c, s = np.cos(np.deg2rad(ang)), np.sin(np.deg2rad(ang))
        d = arr - np.array([ex, ey])
        xr, yr = d[:, 0] * c + d[:, 1] * s, -d[:, 0] * s + d[:, 1] * c
        rr = np.sqrt((xr / (ma / 2)) ** 2 + (yr / (mi / 2)) ** 2)
        keep = np.abs(rr - 1) < (0.02 if it > 2 else 0.05)
    return e


def fit_rings(whole):
    gold = gold_mask(whole)
    cx, cy = HUB_GUESS
    pts = {'hub': [], 'karma': [], 'realm': [], 'outer': []}
    realm_r = {}
    for a10 in range(0, 3600, 15):
        a = a10 / 10
        if min(a % 30, 30 - a % 30) < 4:      # off the dividers of the rim
            continue
        rs = ray_runs(gold, a, cx, cy)
        t = np.deg2rad(a)
        at = lambda r: (cx + np.cos(t) * r, cy + np.sin(t) * r)
        for s, e in rs:
            w, m = e - s, (s + e) / 2
            if 2 <= w <= 10 and 45 < m < 66:
                pts['hub'].append(at(m))
            if 2 <= w <= 10 and 100 < m < 128:
                pts['karma'].append(at(m))
        inner = [(s, e) for s, e in rs if s > 380 and 3 <= e - s <= 11]
        if inner:
            s, e = inner[0]
            pts['realm'].append(at((s + e) / 2))
            realm_r[a] = (s + e) / 2
            outer = [(s2, e2) for s2, e2 in rs if realm_r[a] + 60 < s2 < realm_r[a] + 110 and 3 <= e2 - s2 <= 14]
            if outer:
                s2, e2 = outer[0]
                pts['outer'].append(at((s2 + e2) / 2))
    return {k: fit_ellipse(v) for k, v in pts.items()}


RING_ORDER = ['hub', 'karma', 'realm', 'outer']


def ring_radius(e):
    return (e[1][0] + e[1][1]) / 4


def rho(e, th):
    (ex, ey), (ma, mi), ang = e
    a, b = ma / 2, mi / 2
    phi = th - np.deg2rad(ang)
    return a * b / np.sqrt((b * np.cos(phi)) ** 2 + (a * np.sin(phi)) ** 2)


def warp_maps(rings, w, h, scale):
    """For every pixel of the corrected image, the photograph's pixel it shows."""
    rk = [ring_radius(rings[k]) for k in RING_ORDER]
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float64)
    u, v = xs / scale, ys / scale
    dx, dy = u - C[0], v - C[1]
    r, th = np.hypot(dx, dy), np.arctan2(dy, dx)
    cxs = [rings[k][0][0] for k in RING_ORDER]
    cys = [rings[k][0][1] for k in RING_ORDER]
    rhos = [rho(rings[k], th) for k in RING_ORDER]
    px, py = np.zeros_like(u), np.zeros_like(u)
    m = r <= rk[0]
    s = rhos[0] / rk[0]
    px[m] = cxs[0] + np.cos(th[m]) * r[m] * s[m]
    py[m] = cys[0] + np.sin(th[m]) * r[m] * s[m]
    for i in range(3):
        m = (r > rk[i]) & (r <= rk[i + 1])
        t = (r[m] - rk[i]) / (rk[i + 1] - rk[i])
        cx = cxs[i] + (cxs[i + 1] - cxs[i]) * t
        cy = cys[i] + (cys[i + 1] - cys[i]) * t
        rr = rhos[i][m] + (rhos[i + 1][m] - rhos[i][m]) * t
        px[m], py[m] = cx + np.cos(th[m]) * rr, cy + np.sin(th[m]) * rr
    # past the rim, the outer ring's shift fades out over 200 units
    m = r > rk[3]
    ex = np.clip((r[m] - rk[3]) / 200, 0, 1)
    rr = rhos[3][m] + (r[m] - rk[3])
    wx, wy = cxs[3] + np.cos(th[m]) * rr, cys[3] + np.sin(th[m]) * rr
    px[m], py[m] = wx * (1 - ex) + u[m] * ex, wy * (1 - ex) + v[m] * ex
    return px.astype(np.float32), py.astype(np.float32), rk


# ── 2. the close-ups ─────────────────────────────────────────────────────────
def register(whole, closeup):
    sift = cv2.SIFT_create(nfeatures=20000)
    g0, g1 = cv2.cvtColor(whole, cv2.COLOR_BGR2GRAY), cv2.cvtColor(closeup, cv2.COLOR_BGR2GRAY)
    k0, d0 = sift.detectAndCompute(g0, None)
    k1, d1 = sift.detectAndCompute(g1, None)
    pairs = cv2.BFMatcher().knnMatch(d1, d0, k=2)
    good = [a for a, b in pairs if a.distance < 0.72 * b.distance]
    src = np.float32([k1[a.queryIdx].pt for a in good])
    dst = np.float32([k0[a.trainIdx].pt for a in good])
    hom, inl = cv2.findHomography(src, dst, cv2.RANSAC, 3.0)
    return hom, len(good), int(inl.sum())


def compose(whole, rings):
    px, py, rk = warp_maps(rings, W * SM, H * SM, SM)
    master = cv2.remap(whole, px, py, cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE).astype(np.float32)
    detail = {}
    for name in CLOSEUPS:
        img = cv2.imread(str(REF / (name + '.jpg')))
        hom, n, inl = register(whole, img)
        log(f'  {name}: {inl} of {n} matches agree')
        hi = np.linalg.inv(hom)
        z = hi[2, 0] * px + hi[2, 1] * py + hi[2, 2]
        cx = ((hi[0, 0] * px + hi[0, 1] * py + hi[0, 2]) / z).astype(np.float32)
        cy = ((hi[1, 0] * px + hi[1, 1] * py + hi[1, 2]) / z).astype(np.float32)
        h, w = img.shape[:2]
        # the yama-gods crop carries a strip of an app's interface at its left edge
        left = 70 if name == 'yama-gods' else 0
        inside = ((cx >= left) & (cx < w - 1) & (cy >= 0) & (cy < h - 1)).astype(np.uint8)
        warped = cv2.remap(img, cx, cy, cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT).astype(np.float32)
        wgt = np.clip(cv2.distanceTransform(inside, cv2.DIST_L2, 5) / 40.0, 0, 1)
        master = master * (1 - wgt[..., None]) + warped * wgt[..., None]
        detail[name] = wgt
    return np.clip(master, 0, 255).astype(np.uint8), detail, rk


# ── 3. spokes and dividers ───────────────────────────────────────────────────
def measure_angles(master):
    goldish = cv2.GaussianBlur(gold_mask(master, loose=True).astype(np.float32), (0, 0), 2)

    def score(a, r0, r1):
        t = np.deg2rad(a)
        rs = np.arange(r0, r1, 1.0)
        xs = ((C[0] + np.cos(t) * rs) * SM).astype(int)
        ys = ((C[1] + np.sin(t) * rs) * SM).astype(int)
        return goldish[ys, xs].mean()

    def refine(a0, r0, r1):
        angs = np.arange(a0 - 5, a0 + 5, 0.05)
        sc = np.array([score(a, r0, r1) for a in angs])
        best = sc.max()
        near = np.arange(angs[sc.argmax()] - 3, angs[sc.argmax()] + 3, 0.05)
        ns = np.array([score(a, r0, r1) for a in near])
        on = near[ns >= best * 0.9]
        return round(float((on.min() + on.max()) / 2), 2)

    spokes = [refine(a, 140, 410) for a in SPOKE_SEEDS]
    dividers = [refine(a, 442, 496) for a in DIVIDER_SEEDS]
    norm = lambda a: round(((a + 180) % 360) - 180, 2)
    return [norm(a) for a in spokes], [norm(a) for a in dividers]


# ── 4. the layers ────────────────────────────────────────────────────────────
def wall_mask(master):
    """The blue wall, at master resolution: blue, and reachable from the edge
    of the photograph — or a large pocket of blue low on the wall, enclosed by
    the scarves under the wheel."""
    small = cv2.resize(master, (W, H), interpolation=cv2.INTER_AREA)
    hsv = cv2.cvtColor(cv2.GaussianBlur(small, (5, 5), 0), cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    # the wall's blue sits at a hue of 105 or so; the cloths hanging under the
    # wheel are a greener blue, at 100, and are not wall
    blue = ((h >= 102) & (h <= 117) & (s >= 80)).astype(np.uint8)
    yy, xx = np.mgrid[0:H, 0:W]
    blue[np.hypot(xx - C[0], yy - C[1]) < 512] = 0
    # the pale ledge at the foot of the wall, either side of the bowl's foot
    blue[(yy > 1684) & ((xx < 540) | (xx > 790))] = 1
    # the head of the wall is in shadow, nearly black, and its hue is noise
    dark = (v < 58) & (yy < 330) & ~((h <= 12) | (h >= 165)) | (v < 32) & (yy < 330)
    blue[dark & (np.hypot(xx - C[0], yy - C[1]) >= 512)] = 1
    n, lab, st, cen = cv2.connectedComponentsWithStats(blue, 8)
    edge = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
    edge.discard(0)
    keep = set(edge)
    for i in range(1, n):
        if i not in keep and st[i, 4] >= 300 and cen[i][1] > 1100:
            keep.add(i)
    wall = np.isin(lab, list(keep)).astype(np.uint8)
    wall = cv2.morphologyEx(wall, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    wall = cv2.morphologyEx(wall, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    # specks of relief left standing alone on the wall are noise in the photograph
    n, lab, st, _ = cv2.connectedComponentsWithStats(1 - wall, 8)
    for i in range(1, n):
        if st[i, 4] < 60:
            wall[lab == i] = 1
    # up to master resolution with a soft edge
    big = cv2.resize(wall.astype(np.float32), (W * SM, H * SM), interpolation=cv2.INTER_LINEAR)
    return np.clip((big - 0.25) / 0.5, 0, 1)


def poly_mask(polys, scale, shape, feather=1.2):
    m = np.zeros(shape, np.uint8)
    for p in polys:
        cv2.fillPoly(m, [np.round(np.array(p) * scale).astype(np.int32)], 255, cv2.LINE_AA)
    m = m.astype(np.float32) / 255
    return cv2.GaussianBlur(m, (0, 0), feather) if feather else m


def disc_mask(r, scale, shape, feather=1.2):
    m = np.zeros(shape, np.uint8)
    cv2.circle(m, (int(C[0] * scale), int(C[1] * scale)), int(r * scale), 255, -1, cv2.LINE_AA)
    return cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), feather)


def frame_zone(rk, spokes, dividers, shape):
    """Where the gold of the frame can be: the four rims and the radial bars."""
    z = np.zeros(shape, np.uint8)
    cx, cy = int(C[0] * SM), int(C[1] * SM)
    for r, half in zip(rk, [5, 5.5, 7, 8]):
        cv2.circle(z, (cx, cy), int(r * SM), 255, int(2 * half * SM))
    def bar(a, r0, r1, half):
        t = np.deg2rad(a)
        n = np.array([-np.sin(t), np.cos(t)]) * half
        p0 = np.array([C[0] + np.cos(t) * r0, C[1] + np.sin(t) * r0])
        p1 = np.array([C[0] + np.cos(t) * r1, C[1] + np.sin(t) * r1])
        cv2.fillPoly(z, [np.round(np.array([p0 + n, p1 + n, p1 - n, p0 - n]) * SM).astype(np.int32)], 255)
    for a in spokes:
        bar(a, rk[1], rk[2], 7)
    for a in dividers:
        bar(a, rk[2], rk[3], 7)
    bar(-90, rk[0], rk[1], 3)
    bar(90, rk[0], rk[1], 3)
    return z > 0


def export(name, rgb, alpha, scale):
    """Crop to what is there, scale, and write a WebP with its alpha."""
    ys, xs = np.nonzero(alpha > 0.02)
    x0, x1 = xs.min() // SM, (xs.max() + SM) // SM
    y0, y1 = ys.min() // SM, (ys.max() + SM) // SM
    x0, y0 = max(0, int(x0) - 1), max(0, int(y0) - 1)
    x1, y1 = min(W, int(x1) + 1), min(H, int(y1) + 1)
    crop = rgb[y0 * SM:y1 * SM, x0 * SM:x1 * SM]
    a = (alpha[y0 * SM:y1 * SM, x0 * SM:x1 * SM] * 255).astype(np.uint8)
    rgba = np.dstack([crop, a])
    size = (int(round((x1 - x0) * scale)), int(round((y1 - y0) * scale)))
    if scale != SM:
        rgba = cv2.resize(rgba, size, interpolation=cv2.INTER_AREA)
    # colour under fully transparent pixels is never seen: flatten it, so it costs nothing
    rgba[rgba[..., 3] == 0, :3] = 0
    path = OUT / (name + '.webp')
    cv2.imwrite(str(path), rgba, [cv2.IMWRITE_WEBP_QUALITY, 84])
    log(f'  {name}.webp  {size[0]}×{size[1]}  {path.stat().st_size // 1024} KB')
    return {'href': f'assets/wheel/{name}.webp', 'x': x0, 'y': y0, 'w': x1 - x0, 'h': y1 - y0}


# ── 5. the hells ─────────────────────────────────────────────────────────────
def region_polygon(mask1x, min_area=2000):
    m = cv2.morphologyEx(mask1x.astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17)))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    c = max(cs, key=cv2.contourArea)
    c = cv2.approxPolyDP(c, 2.5, True)
    return [[int(p[0][0]), int(p[0][1])] for p in c]


def hells(master, rk, spokes):
    small = cv2.resize(master, (W, H), interpolation=cv2.INTER_AREA)
    hsv = cv2.cvtColor(cv2.GaussianBlur(small, (3, 3), 0), cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.hypot(xx - C[0], yy - C[1])
    a = np.degrees(np.arctan2(yy - C[1], xx - C[0]))
    lo, hi = spokes[3], spokes[4]                      # the hells: 35° to 142°
    inside = (r > 190) & (r < rk[2] - 4) & (a > lo + 0.8) & (a < hi - 0.8)
    # the red lattice keeps to the left of the court, the ice to the right of it
    red = inside & (a > 104) & (((h <= 9) | (h >= 170)) & (s >= 90) & (v >= 90))
    ice = inside & (a < 68) & (s <= 70) & (v >= 170)
    return region_polygon(red), region_polygon(ice)


def outlines(mask1x, min_area, eps=1.8, limit=None):
    """Every separate piece of a mask, as a simplified polygon."""
    m = (mask1x > 0.5).astype(np.uint8)
    cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cs = sorted([c for c in cs if cv2.contourArea(c) >= min_area], key=cv2.contourArea, reverse=True)[:limit]
    return [[[int(p[0][0]), int(p[0][1])] for p in cv2.approxPolyDP(c, eps, True)] for c in cs]


def yama_outlines(master, body, beyond):
    """The outlines of the parts of Yama the entries name, from their colours:
    the whole of him, the jade and the dark green scarves, the white bone
    ornaments, and the offering bowl beneath him."""
    small = cv2.resize(master, (W, H), interpolation=cv2.INTER_AREA)
    hsv = cv2.cvtColor(cv2.GaussianBlur(small, (3, 3), 0), cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    b1 = cv2.resize(body, (W, H), interpolation=cv2.INTER_AREA) > 0.5
    yy, xx = np.mgrid[0:H, 0:W]
    outside = np.hypot(xx - C[0], yy - C[1]) > 516
    k = lambda n: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (n, n))
    whole = cv2.morphologyEx(b1.astype(np.uint8), cv2.MORPH_CLOSE, k(9))
    scarf = (b1 & outside & (h >= 52) & (h <= 96) & (s >= 45) & (v >= 60)).astype(np.uint8)
    scarf = cv2.morphologyEx(cv2.morphologyEx(scarf, cv2.MORPH_OPEN, k(5)), cv2.MORPH_CLOSE, k(9))
    bone = (b1 & outside & (s <= 45) & (v >= 175)).astype(np.uint8)
    bone[(yy > 1480)] = 0                                  # the conch and the bowl's jewel are not bones
    bone = cv2.morphologyEx(cv2.morphologyEx(bone, cv2.MORPH_OPEN, k(3)), cv2.MORPH_CLOSE, k(11))
    bowl = (b1 & (yy > 1500) & (xx > 500) & (xx < 800)).astype(np.uint8)
    bowl = cv2.morphologyEx(bowl, cv2.MORPH_OPEN, k(5))
    return {
        'yama': outlines(whole, 20000, 2.5, 1),
        'scarves': outlines(scarf, 1500, 2.0),
        'bones': outlines(bone, 250, 1.6),
        'bowl': outlines(bowl, 3000, 1.6, 1)
    }


def fade_to_frame(shape, units):
    """Full inside the photograph, fading to nothing over its last `units`."""
    ys, xs = np.mgrid[0:shape[0], 0:shape[1]]
    edge = np.minimum.reduce([xs, ys, shape[1] - 1 - xs, shape[0] - 1 - ys]).astype(np.float32) / SM
    return np.clip(edge / units, 0, 1)


PAD = 2000                   # how far the wall runs on past the photograph, in units


def wall_far(near):
    """The wall past the photograph's edges, at four units to the pixel. The
    one thing that changes across it is the fall of the light, from the dark
    head of the wall to the lit blue below; so past the photograph each height
    takes the wall's median colour at that height, and the photograph's own
    wall eases into it, so that there is no edge to be seen at any zoom."""
    q = 0.25
    src = cv2.resize(near, (int(W * q), int(H * q)), interpolation=cv2.INTER_AREA).astype(np.float32)
    h0, w0 = src.shape[:2]
    prof = np.median(src, axis=1)                       # one colour for each height
    last = int(1670 * q)                                # above the pale ledge at the foot
    prof[last:] = prof[last]
    prof = cv2.GaussianBlur(prof[:, None, :], (0, 0), sigmaX=0.1, sigmaY=30)[:, 0, :]
    p = int(PAD * q)
    hh, ww = h0 + 2 * p, w0 + 2 * p
    rows = np.clip(np.arange(hh) - p, 0, h0 - 1)
    base = np.repeat(prof[rows][:, None, :], ww, axis=1)
    ys, xs = np.mgrid[0:hh, 0:ww]
    dx = np.maximum(0, np.maximum(p - xs, xs - (ww - 1 - p)))
    dy = np.maximum(0, np.maximum(p - ys, ys - (hh - 1 - p)))
    inside = np.zeros((hh, ww), np.float32)
    inside[p:p + h0, p:p + w0] = 1
    # within the photograph, its wall; easing into the profile toward its edges
    edge_in = np.minimum.reduce([xs - p, ys - p, (p + w0 - 1) - xs, (p + h0 - 1) - ys]).astype(np.float32)
    keep = (np.clip(edge_in / (150 * q), 0, 1) * inside)[..., None]
    canvas = base.copy()
    canvas[p:p + h0, p:p + w0] = src
    out = canvas * keep + base * (1 - keep)
    path = OUT / 'wall-far.webp'
    cv2.imwrite(str(path), np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_WEBP_QUALITY, 80])
    log(f'  wall-far.webp  {ww}×{hh}  {path.stat().st_size // 1024} KB')
    far = '#%02x%02x%02x' % tuple(int(c) for c in prof[-1][::-1])
    return {'href': 'assets/wheel/wall-far.webp', 'x': -PAD, 'y': -PAD, 'w': W + 2 * PAD, 'h': H + 2 * PAD}, far


def wall_under_relief(master, relief):
    """The photograph's wall with the relief taken off it: its own tone, dark
    at the head where the light does not reach, filled in under the relief
    from what is round it. Smooth enough to be served at two units a pixel."""
    q = 0.25
    w4, h4 = int(W * q), int(H * q)
    small = cv2.resize(master, (w4, h4), interpolation=cv2.INTER_AREA)
    hole = (cv2.resize(relief, (w4, h4), interpolation=cv2.INTER_AREA) > 0.02).astype(np.uint8)
    hole = cv2.dilate(hole, np.ones((5, 5), np.uint8))
    filled = cv2.inpaint(small, hole * 255, 6, cv2.INPAINT_TELEA)
    filled = cv2.GaussianBlur(filled, (0, 0), 1.5)
    return cv2.resize(filled, (W * SM, H * SM), interpolation=cv2.INTER_CUBIC)


def body_behind_wheel(master, body, rk):
    """What is behind the wheel is Yama's body, which the photograph never
    shows: his own maroon, measured just outside the rim, darkening toward the
    middle where the wheel would shade it most."""
    small = cv2.resize(master, (W, H), interpolation=cv2.INTER_AREA)
    hsv = cv2.cvtColor(cv2.GaussianBlur(small, (5, 5), 0), cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.hypot(xx - C[0], yy - C[1])
    band = (r > rk[3] + 10) & (r < rk[3] + 90) & (yy > 420) & (yy < 1150)
    maroon = band & ((h <= 10) | (h >= 165)) & (s >= 60) & (v >= 35) & (v <= 140)
    base = np.median(small[maroon], axis=0)
    ys, xs = np.mgrid[0:H * SM, 0:W * SM].astype(np.float32)
    rr = np.hypot(xs / SM - C[0], ys / SM - C[1])
    shade = (0.62 + 0.38 * np.clip(rr / rk[3], 0, 1))[..., None]
    fill = np.clip(base[None, None, :] * shade, 0, 255)
    inside = disc_mask(rk[3] - 14, SM, master.shape[:2], 3)[..., None]
    return (master * (1 - inside) + fill * inside).astype(np.uint8)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    whole = cv2.imread(str(REF / 'whole.jpg'))
    log('rings')
    rings = fit_rings(whole)
    for k in RING_ORDER:
        (ex, ey), (ma, mi), _ = rings[k]
        log(f'  {k}: centre ({ex:.1f}, {ey:.1f}), radius {ring_radius(rings[k]):.1f}')
    log('composing')
    master, detail, rk = compose(whole, rings)
    log('angles')
    spokes, dividers = measure_angles(master)
    log('  spokes', spokes)
    log('  dividers', dividers)

    log('layers')
    shape = master.shape[:2]
    rgb = master
    relief = 1 - wall_mask(master)
    # the photograph ends where it ends: fade the relief out over its last
    # twenty units rather than cut it off with the frame's straight edge
    frame_fade = fade_to_frame(shape, 34)
    relief = relief * frame_fade
    beyond = poly_mask(BEYOND, SM, shape, 0)
    hsv = cv2.cvtColor(master, cv2.COLOR_BGR2HSV)
    jade = ((hsv[..., 0] >= 70) & (hsv[..., 0] <= 96) & (hsv[..., 1] >= 50)).astype(np.float32)
    jade = cv2.dilate(jade, np.ones((13, 13), np.uint8))
    beyond = cv2.GaussianBlur(beyond * (1 - jade), (0, 0), 4 * SM)
    beyond = np.clip(beyond * 1.6 - 0.3, 0, 1) * frame_fade
    wheel = disc_mask(rk[3] + 8.5, SM, shape)
    front = {k: poly_mask([p], SM, shape) * relief for k, p in FRONT.items()}
    body = relief
    zone = frame_zone(rk, spokes, dividers, shape)
    gold = cv2.morphologyEx(gold_mask(master, loose=True).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)) > 0
    frame = cv2.GaussianBlur((zone & gold).astype(np.float32), (0, 0), 1.0)

    layers = []
    def layer(name, depth, parts):
        layers.append({'name': name, 'depth': depth, 'images': parts})
    near = wall_under_relief(master, relief)
    far_image, far_colour = wall_far(near)
    layer('wall', 0, [far_image])
    layer('beyond', 2, [export('beyond', rgb, beyond, SB)])
    # Behind the wheel is Yama's body, which the photograph never shows. Turned,
    # the wall would show the edge of a second wheel there; it shows his body
    # instead, filled in from its own colours round the rim.
    behind = body_behind_wheel(master, body, rk)
    layer('body', 14, [export('body', behind, body, SB)])
    wheel_images = [export('wheel', rgb, wheel, SB)]
    for name in ['hub-karma', 'humans', 'pretas-cold-hells', 'yama-gods']:
        w = cv2.erode(detail[name], np.ones((3, 3), np.uint8)) * wheel
        if w.max() > 0.5:
            wheel_images.append(export('wheel-' + name, rgb, w, SD))
    layer('wheel', 26, wheel_images)
    layer('frame', 34, [export('frame', rgb, frame, SD)])
    front_images = []
    for k in ['foot_l', 'foot_r', 'hand_l', 'hand_r']:
        front_images.append(export(k.replace('_', '-'), rgb, front[k], SB))
    front_images.append(export('head', rgb, front['head'], SD))
    layer('front', 46, front_images)

    log('hells')
    hot, cold = hells(master, rk, spokes)
    log('outlines')
    yama = yama_outlines(master, body, beyond)
    for k2, v2 in yama.items():
        log(f'  {k2}: {len(v2)} pieces, {sum(len(p) for p in v2)} points')


    data = {
        'rings': [round(r, 2) for r in rk],
        'spokes': spokes, 'dividers': dividers,
        'layers': layers, 'hot': hot, 'cold': cold,
        'front': {k: [list(p) for p in v] for k, v in FRONT.items()},
        'yama': yama,
        'wall': far_colour
    }
    body_js = json.dumps(data, separators=(',', ':'))
    MODULE.write_text(
        '/* Written by scripts/build-wheel-relief.py from the photographs in\n'
        '   assets/wheel-reference/. Do not edit: run the script again. */\n'
        'export const RELIEF = ' + body_js + ';\n')
    log('wrote', MODULE.relative_to(ROOT))


if __name__ == '__main__':
    main()
