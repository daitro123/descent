import * as THREE from 'three';
import { setUpFullscreenButton } from './fullscreen';
import { startRenderingPrototype } from './prototype-rendering';
import { createStats } from './stats';

const canvas = document.querySelector<HTMLCanvasElement>('#game')!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });

const stats = createStats(document.querySelector<HTMLElement>('#stats')!, renderer);

setUpFullscreenButton(document.querySelector<HTMLElement>('#fullscreen')!);

// PROTOTYPE (throwaway): the scene is the 2D-sprites vs pixelated-3D comparison for now.
void startRenderingPrototype(canvas, renderer, stats);
