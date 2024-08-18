import * as THREE from 'three';

// Initialize scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Tesseract vertices in 4D space
const vertices = [
  [-1, -1, -1, -1], [1, -1, -1, -1], [-1, 1, -1, -1], [1, 1, -1, -1],
  [-1, -1, 1, -1], [1, -1, 1, -1], [-1, 1, 1, -1], [1, 1, 1, -1],
  [-1, -1, -1, 1], [1, -1, -1, 1], [-1, 1, -1, 1], [1, 1, -1, 1],
  [-1, -1, 1, 1], [1, -1, 1, 1], [-1, 1, 1, 1], [1, 1, 1, 1]
];

// Edges connecting vertices
const edges = [
  [0, 1], [0, 2], [0, 4], [0, 8],
  [1, 3], [1, 5], [1, 9], [2, 3],
  [2, 6], [2, 10], [3, 7], [3, 11],
  [4, 5], [4, 6], [4, 12], [5, 7],
  [5, 13], [6, 7], [6, 14], [7, 15],
  [8, 9], [8, 10], [8, 12], [9, 11],
  [9, 13], [10, 11], [10, 14], [11, 15],
  [12, 13], [12, 14], [13, 15], [14, 15]
];

// Function to project 4D points to 3D
function project4D([x, y, z, w]) {
  const distance = 2; // Adjust this for different projection effects
  const factor = distance / (distance - w);
  return [x * factor, y * factor, z * factor];
}

// Create lines from projected vertices
edges.forEach(([i, j]) => {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(...project4D(vertices[i])),
    new THREE.Vector3(...project4D(vertices[j]))
  ]);
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffffff }));
  scene.add(line);
});

// Camera positioning
camera.position.z = 5;

// Render loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate tesseract by rotating each vertex (simple rotation for demonstration)
  vertices.forEach(vertex => {
    const temp = vertex[0];
    vertex[0] = vertex[0] * Math.cos(0.01) - vertex[3] * Math.sin(0.01);
    vertex[3] = temp * Math.sin(0.01) + vertex[3] * Math.cos(0.01);
  });

  // Update lines based on new vertex positions
  scene.children.forEach((line, index) => {
    const [i, j] = edges[index];
    line.geometry.setFromPoints([
      new THREE.Vector3(...project4D(vertices[i])),
      new THREE.Vector3(...project4D(vertices[j]))
    ]);
  });

  renderer.render(scene, camera);
}

animate();
