import * as THREE from 'three';
import { setUpFullscreenButton } from './fullscreen';
import { startScene } from './scene';
import { createStats } from './stats';

const canvas = document.querySelector<HTMLCanvasElement>('#game')!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });

const stats = createStats(document.querySelector<HTMLElement>('#stats')!, renderer);

setUpFullscreenButton(document.querySelector<HTMLElement>('#fullscreen')!);

void startScene(canvas, renderer, stats);
