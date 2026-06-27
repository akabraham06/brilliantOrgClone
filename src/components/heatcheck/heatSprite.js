import * as THREE from 'three';

/**
 * Soft round radial-gradient sprite shared by the Heat Check 3D scenes (ember
 * particles + core/volumetric glows). White-hot center fading through warm gold
 * to a transparent ember edge, so additive blending reads as a glowing flame.
 * Generated on a tiny offscreen canvas — no network assets.
 */
export function makeSpriteTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,221,150,0.85)');
  g.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
