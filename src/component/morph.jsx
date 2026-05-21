import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import "../styles/Morph.css";

const COUNT = 12000;
  const apiUrl = import.meta.env.VITE_API_URL;

const API_URL = apiUrl;
function Morph({ onResult, onError, onLoading }) {
  const containerRef = useRef(null);
  const morphToTextRef = useRef(null);

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let scene;
    let camera;
    let renderer;
    let particles;
    let animationId;
    let activeTween;

    const state = {
      current: "sphere",
    };

    function sphericalDistribution(i) {
      const phi = Math.acos(-1 + (2 * i) / COUNT);
      const theta = Math.sqrt(COUNT * Math.PI) * phi;

      return {
        x: 8 * Math.cos(theta) * Math.sin(phi),
        y: 8 * Math.sin(theta) * Math.sin(phi),
        z: 8 * Math.cos(phi),
      };
    }

    function createParticles() {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(COUNT * 3);
      const colors = new Float32Array(COUNT * 3);

      for (let i = 0; i < COUNT; i++) {
        const point = sphericalDistribution(i);

        positions[i * 3] = point.x + (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 2] = point.z + (Math.random() - 0.5) * 0.5;

        const color = new THREE.Color();
        const depth = Math.sqrt(point.x ** 2 + point.y ** 2 + point.z ** 2) / 8;

        color.setHSL(0.5 + depth * 0.2, 0.7, 0.4 + depth * 0.3);

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);
    }

    function createTextPoints(value) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const fontSize = 100;
      const padding = 20;

      ctx.font = `bold ${fontSize}px Arial`;

      const textMetrics = ctx.measureText(value);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;

      canvas.width = textWidth + padding * 2;
      canvas.height = textHeight + padding * 2;

      ctx.fillStyle = "white";
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(value, canvas.width / 2, canvas.height / 2);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const points = [];

      for (let i = 0; i < pixels.length; i += 4) {
        const pixelIsVisible = pixels[i] > 128;
        const shouldUsePixel = Math.random() < 0.35;

        if (pixelIsVisible && shouldUsePixel) {
          const x = (i / 4) % canvas.width;
          const y = Math.floor(i / 4 / canvas.width);

          points.push({
            x: (x - canvas.width / 2) / (fontSize / 10),
            y: -(y - canvas.height / 2) / (fontSize / 10),
          });
        }
      }

      return points;
    }

    function animateTo(targetPositions) {
      if (activeTween) {
        activeTween.kill();
      }

      const positions = particles.geometry.attributes.position.array;
      const startPositions = Float32Array.from(positions);

      const progress = {
        value: 0,
      };

      activeTween = gsap.to(progress, {
        value: 1,
        duration: 2.4,
        ease: "power2.inOut",
        onUpdate: function () {
          for (let i = 0; i < positions.length; i++) {
            positions[i] =
              startPositions[i] +
              (targetPositions[i] - startPositions[i]) * progress.value;
          }

          particles.geometry.attributes.position.needsUpdate = true;
        },
      });
    }

    morphToTextRef.current = function (value) {
      if (!particles) {
        return;
      }

      if (!value) {
        return;
      }

      state.current = "text";

      const textPoints = createTextPoints(value);
      const targetPositions = new Float32Array(COUNT * 3);

      gsap.to(particles.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5,
      });

      for (let i = 0; i < COUNT; i++) {
        if (i < textPoints.length) {
          targetPositions[i * 3] = textPoints[i].x;
          targetPositions[i * 3 + 1] = textPoints[i].y;
          targetPositions[i * 3 + 2] = 0;
        } else {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 20 + 10;

          targetPositions[i * 3] = Math.cos(angle) * radius;
          targetPositions[i * 3 + 1] = Math.sin(angle) * radius;
          targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
      }

      animateTo(targetPositions);
    };

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    camera.position.z = 25;

    renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000);

    container.appendChild(renderer.domElement);

    createParticles();

    function animate() {
      animationId = requestAnimationFrame(animate);

      if (particles && state.current === "sphere") {
        particles.rotation.y += 0.002;
      }

      renderer.render(scene, camera);
    }

    function handleResize() {
      const currentContainer = containerRef.current;

      if (!currentContainer) {
        return;
      }

      camera.aspect = currentContainer.clientWidth / currentContainer.clientHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(
        currentContainer.clientWidth,
        currentContainer.clientHeight
      );
    }

    window.addEventListener("resize", handleResize);

    animate();

    return function cleanup() {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);

      if (activeTween) {
        activeTween.kill();
      }

      if (particles) {
        particles.geometry.dispose();
        particles.material.dispose();
        scene.remove(particles);
      }

      renderer.dispose();

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  function getPredictionFromData(data) {
    let prediction = "UNKNOWN";

    if (data.prediction) {
      prediction = data.prediction;
    } else if (data.predicted_label) {
      prediction = data.predicted_label;
    } else if (data.label) {
      prediction = data.label;
    } else if (data.result) {
      prediction = data.result;
    }

    return prediction;
  }

  function getButtonText() {
    if (loading) {
      return "Checking...";
    }

    return "Create";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const cleanText = text.trim();

    if (!cleanText) {
      return;
    }

    setLoading(true);

    if (onLoading) {
      onLoading(true);
    }

    if (onError) {
      onError("");
    }

    if (onResult) {
      onResult(null);
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: cleanText,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      const prediction = getPredictionFromData(data);
      const finalPrediction = prediction.toUpperCase();

      if (onResult) {
        onResult(data);
      }

      if (onError) {
        onError("");
      }

      morphToTextRef.current(finalPrediction);
    } catch (err) {
      if (onError) {
        onError("Could not connect to the FastAPI backend.");
      }
    } finally {
      setLoading(false);

      if (onLoading) {
        onLoading(false);
      }
    }
  }

  return (
    <section className="morph-page">
      <div ref={containerRef} className="morph-canvas" />

      <form className="input-container" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <input
            type="text"
            value={text}
            placeholder="Type something..."
            onChange={(e) => setText(e.target.value)}
          />

          <button id="typeBtn" type="submit" disabled={loading}>
            <span className="button-content">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span>{getButtonText()}</span>
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}

export default Morph;
