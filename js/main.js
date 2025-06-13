// js/main.js


import * as THREE from 'three';
// Use the FBXLoader provided by the Three.js examples via the import map
// This avoids missing local dependency errors when running the simulation
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';


// --- SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue
scene.fog = new THREE.Fog(0xd3d3d3, 100, 1500); // Key element: Dense fog

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('simulation-container').appendChild(renderer.domElement);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xcccccc, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 300, 500);
scene.add(directionalLight);

// --- ASSET LOADING ---
const loader = new FBXLoader(); // Use FBXLoader
let plane; // We will store our plane model here

loader.load(
    'models/AirplaneForFreefbx.fbx', // The exact path to your file
    // This runs on SUCCESS
    (fbx) => {
        console.log('SUCCESS: The model has loaded!'); // <-- ADD THIS
        plane = fbx;
        // FBX models can have very different scales. You WILL need to adjust this!
        // Start with a small value and increase it.
        plane.scale.set(0.05, 0.05, 0.05);
        scene.add(plane);
        setupTimeline();
    },

    // This runs DURING loading
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded'); // <-- ADD THIS
    },

    // This runs on ERROR
    (error) => {
        console.error('ERROR: Something went wrong while loading the model.', error); // <-- ADD THIS
    });
// Load terrain, runway, etc. similarly
// For simplicity, let's create a ground plane
const groundGeometry = new THREE.PlaneGeometry(10000, 10000);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x556B2F }); // Olive green
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
scene.add(ground);

// Placeholder for eyewitness camera position
const eyewitnessPosition = new THREE.Vector3(100, 20, -1500);

// js/main.js (continued)

let timelineEvents;
let flightPath;

function setupTimeline() {
    // --- TIMELINE DATA (Based on final 60 seconds of flight) ---
    // Positions are in (x, y, z). Y is altitude. Z is distance to runway.
    timelineEvents = [
        { time: 0, desc: "T-60s: Plane is on final approach, aligned with the runway but still high." },
        { time: 30, desc: "T-30s: Crew continues descent in dense fog, below minimum safe altitude." },
        { time: 50, desc: "T-10s: The aircraft is now critically low, flying just above the ground." },
        { time: 55, desc: "T-5s: Impact with trees and a high-voltage power line." },
        { time: 60, desc: "T-0s: The aircraft impacts the ground and breaks apart." }
    ];

    // --- FLIGHT PATH (A CatmullRomCurve3 for a smooth path) ---
    flightPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 300, -5000),  // Start: T-60s, High and far
        new THREE.Vector3(0, 150, -2500),  // Mid: T-30s, Descending
        new THREE.Vector3(10, 30, -500),   // Critically low, slight deviation
        new THREE.Vector3(15, 20, -200),   // IMPACT with powerlines (simulated)
        new THREE.Vector3(20, 5, 0)        // Final crash point
    ]);

    // Create a visual line for debugging the path
    const points = flightPath.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const curveObject = new THREE.Line(geometry, material);
    // scene.add(curveObject); // Uncomment to see the path

    animate(); // Start the animation loop
}

// js/main.js (continued)

const timelineSlider = document.getElementById('timeline-slider');
const eventDescription = document.getElementById('event-description');

let cameraMode = 'follow-cam'; // Default camera

function animate() {
    requestAnimationFrame(animate);

    // Get value from slider (0 to 1)
    const time = parseFloat(timelineSlider.value) / 100.0; 

    // Update plane position along the flight path
    if (plane && flightPath) {
        const position = flightPath.getPointAt(time);
        plane.position.copy(position);

        // Make the plane look where it's going
        const tangent = flightPath.getTangentAt(time).normalize();
        const lookAtPosition = position.clone().add(tangent);
        plane.lookAt(lookAtPosition);
    }
    
    // Update UI text
    updateDescription(time * 60);

    // Update camera
    updateCamera();

    renderer.render(scene, camera);
}

function updateDescription(seconds) {
    let currentEvent = timelineEvents[0].desc;
    for (const event of timelineEvents) {
        if (seconds >= event.time) {
            currentEvent = event.desc;
        }
    }
    eventDescription.textContent = currentEvent;
}

function updateCamera() {
    if (!plane) return;

    if (cameraMode === 'follow-cam') {
        const offset = new THREE.Vector3(-50, 20, -100);
        camera.position.copy(plane.position).add(offset);
        camera.lookAt(plane.position);
    } else if (cameraMode === 'tower-cam') {
        camera.position.set(200, 100, -50); // Fixed position near runway
        camera.lookAt(plane.position);
    } else if (cameraMode === 'eyewitness-cam') {
        camera.position.copy(eyewitnessPosition);
        camera.lookAt(plane.position);
    }
}


// --- EVENT LISTENERS ---
document.getElementById('tower-cam').addEventListener('click', () => { cameraMode = 'tower-cam'; });
document.getElementById('follow-cam').addEventListener('click', () => { cameraMode = 'follow-cam'; });
document.getElementById('eyewitness-cam').addEventListener('click', () => { cameraMode = 'eyewitness-cam'; });

// Disclaimer logic
document.getElementById('agree-button').addEventListener('click', () => {
    document.getElementById('disclaimer').style.display = 'none';
});