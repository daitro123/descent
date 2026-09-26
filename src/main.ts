import * as THREE from 'three';
import { setUpFullscreenButton } from './fullscreen';
// PROTOTYPE (throwaway): the touch-controls prototype stands in for the PoC scene (`./scene`)
// until "Which touch control scheme fits deliberate isometric combat?" is decided.
import { startControlsPrototype } from './prototype-controls';
import { createStats } from './stats';

const canvas = document.querySelector<HTMLCanvasElement>('#game')!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });

const stats = createStats(document.querySelector<HTMLElement>('#stats')!, renderer);

setUpFullscreenButton(document.querySelector<HTMLElement>('#fullscreen')!);

void startControlsPrototype(canvas, renderer, stats);
