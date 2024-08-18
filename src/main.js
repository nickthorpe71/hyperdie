import * as THREE from 'three';

// Basic scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting for better visibility
const ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

// Dice setup
const diceSize = 1;
const diceGeometry = new THREE.BoxGeometry(diceSize, diceSize, diceSize);
const diceMaterials = [
  new THREE.MeshPhongMaterial({ color: 0xeeeeee, map: createTextTexture('1') }),
  new THREE.MeshPhongMaterial({ color: 0xeeeeee, map: createTextTexture('2') }),
  new THREE.MeshPhongMaterial({ color: 0xeeeeee, map: createTextTexture('3') }),
  new THREE.MeshPhongMaterial({ color: 0xeeeeee, map: createTextTexture('4') }),
  new THREE.MeshPhongMaterial({ color: 0xeeeeee, map: createTextTexture('5') }),
  new THREE.MeshPhongMaterial({ color: 0xeeeeee, map: createTextTexture('6') }),
];

const dice = new THREE.Mesh(diceGeometry, diceMaterials);
dice.position.set(0, 2, 0); // Start the dice slightly above the ground
scene.add(dice);

// Add a floor
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = - Math.PI / 2;
scene.add(floor);

// Camera positioning
camera.position.set(0, 3, 5);
camera.lookAt(0, 0, 0);

// Raycaster and mouse for interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isDragging = false;
let dragStartRotation;
let dragCurrentRotation;
let velocity = new THREE.Vector3(0, 0, 0);
let angularVelocity = new THREE.Vector3(0, 0, 0);
let gravity = new THREE.Vector3(0, -0.02, 0); // Gravity vector

// Function to create textures with numbers
function createTextTexture(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'black';
  context.font = 'bold 200px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  return new THREE.CanvasTexture(canvas);
}

// Mouse down event to start dragging
window.addEventListener('mousedown', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(dice);
  if (intersects.length > 0) {
    isDragging = true;
    dragStartRotation = new THREE.Vector3(dice.rotation.x, dice.rotation.y, dice.rotation.z);
    velocity.set(0, 0, 0);
    angularVelocity.set(0, 0, 0);
  }
});

// Mouse move event to update rotation while dragging
window.addEventListener('mousemove', (event) => {
  if (isDragging) {
    const deltaX = event.movementX / window.innerWidth * Math.PI * 2;
    const deltaY = event.movementY / window.innerHeight * Math.PI * 2;
    dice.rotation.x = dragStartRotation.x + deltaY;
    dice.rotation.y = dragStartRotation.y + deltaX;
  }
});

// Mouse up event to release the dice
window.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    angularVelocity.set(
      (Math.random() - 0.5) * 0.05, // Reduced initial angular velocity
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05
    );
    velocity.set(
      (Math.random() - 0.5) * 0.05, // Reduced initial velocity
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05
    );
  }
});

// Render loop
function animate() {
  requestAnimationFrame(animate);

  // Apply gravity when not dragging
  if (!isDragging) {
    velocity.add(gravity);
    dice.position.add(velocity);

    // Simulate rolling by adding angular velocity
    dice.rotation.x += angularVelocity.x;
    dice.rotation.y += angularVelocity.y;
    dice.rotation.z += angularVelocity.z;
    
    angularVelocity.multiplyScalar(0.98); // Simulate friction

    // Check for collision with the floor
    if (dice.position.y - diceSize / 2 <= 0) {
      dice.position.y = diceSize / 2;
      velocity.y *= -0.3; // More energy loss on bounce to prevent high jumps
      angularVelocity.multiplyScalar(0.8); // Dampen rotation more on bounce
    }

    // Dampen velocities to simulate friction and air resistance
    velocity.multiplyScalar(0.99);
  }

  renderer.render(scene, camera);
}

animate();
