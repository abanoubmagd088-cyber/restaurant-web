import * as THREE from 'three';

// Shared color palette for the space restaurant universe
export const PALETTE = {
  cyan: new THREE.Color('#5eead4'),
  cyanGlow: new THREE.Color('#22d3ee'),
  magenta: new THREE.Color('#e879f9'),
  amber: new THREE.Color('#fbbf24'),
  deepBlue: new THREE.Color('#1e293b'),
  void: new THREE.Color('#05060d'),
  white: new THREE.Color('#e0f2fe'),
  pink: new THREE.Color('#f9a8d4'),
};

// Procedural planet texture using canvas — gives planets a believable surface
export function makePlanetTexture(
  baseColor: string,
  accentColor: string,
  bands = 6
): THREE.Texture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Latitudinal bands
  for (let i = 0; i < bands; i++) {
    const y = (i / bands) * size;
    const h = size / bands;
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, baseColor);
    grad.addColorStop(0.5, accentColor);
    grad.addColorStop(1, baseColor);
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.3 + Math.random() * 0.3;
    ctx.fillRect(0, y, size, h);
  }

  // Noise spots
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 5 + Math.random() * 30;
    ctx.fillStyle = Math.random() < 0.5 ? accentColor : baseColor;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

// Procedural glowing nebula sprite texture
export function makeGlowTexture(color = '#22d3ee'): THREE.Texture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  grad.addColorStop(0, color);
  grad.addColorStop(0.3, color + 'aa');
  grad.addColorStop(0.6, color + '33');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}
