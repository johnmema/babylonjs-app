import React, { useRef, useEffect } from "react";
import * as BABYLON from "babylonjs";
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

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
      BABYLON.SceneLoader.ImportMesh(
        "",
        "https://raw.githubusercontent.com/johnmema/babylonjs-app/master/src/models/",
        "aerobatic_plane.glb",
        scene
      );
      engine.runRenderLoop(() => {
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
