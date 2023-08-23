import React, { useRef, useEffect } from "react";
import * as BABYLON from "babylonjs";

const FlyingBoxScene = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const createScene = () => {
      const engine = new BABYLON.Engine(canvasRef.current, true);
      const scene = new BABYLON.Scene(engine);

      // Create a camera
      const camera = new BABYLON.ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 2,
        5,
        new BABYLON.Vector3(0, 0, 0),
        scene
      );
      camera.attachControl(canvasRef.current, true);

      // Create a light
      const light = new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
      );

      // Create a ground plane
      const ground = BABYLON.MeshBuilder.CreateGround(
        "ground",
        { width: 50, height: 50 },
        scene
      );

      // Create a flying box
      const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);
      const waypoints = [
        new BABYLON.Vector3(0, 1, 0), // Start above the ground
        new BABYLON.Vector3(-10, 1, 10),
        new BABYLON.Vector3(20, 1, 10),
        new BABYLON.Vector3(-10, 1, 10),
        // Add more waypoints as needed
      ];
      let currentWaypointIndex = 0;

      const moveTowardsWaypoint = () => {
        if (currentWaypointIndex >= waypoints.length) return;

        const currentWaypoint = waypoints[currentWaypointIndex];
        const direction = currentWaypoint.subtract(box.position);
        const distance = direction.length();

        if (distance > 0.1) {
          direction.normalize();
          const movementSpeed = 0.1; // Adjust this for desired movement speed
          box.position.addInPlace(direction.scale(movementSpeed));
        } else {
          // Calculate a new target point behind the box for the U-turn
          const behindPoint = box.position.subtract(direction.scale(2)); // Adjust the factor for the U-turn radius
          waypoints[currentWaypointIndex] = behindPoint;

          currentWaypointIndex++;
        }
      };

      engine.runRenderLoop(() => {
        moveTowardsWaypoint();
        scene.render();
      });

      return scene;
    };

    const scene = createScene();
    return () => scene.dispose();
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100vh" }} />;
};

export default FlyingBoxScene;
