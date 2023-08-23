import React, { useRef, useEffect } from "react";
import * as BABYLON from "babylonjs";
import GrassTexture from "./textures/grass.png";
const ControlledFlight: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const engine = new BABYLON.Engine(canvasRef.current, true);
      const scene = createScene(engine, canvasRef.current);
      engine.runRenderLoop(() => {
        scene.render();
      });

      return () => {
        scene.dispose();
        engine.dispose();
      };
    }
  }, []);

  function getRandomInt(min: number, max: number) {
    return Math.floor(min + Math.random() * (max + 1 - min));
  }

  const getZ = (min: number, max: number) => {
    const positiveZ = getRandomInt(min, max);
    const negativeZ = getRandomInt(-max, -min);

    return [positiveZ, negativeZ][getRandomInt(0, 1)];
  };

  const getX = (min: number, max: number) => {
    const positiveX = getRandomInt(min, max);
    const negativeX = getRandomInt(-max, -min);

    return [positiveX, negativeX][getRandomInt(0, 1)];
  };

  function pilot(scene: BABYLON.Scene) {
    // var body = BABYLON.MeshBuilder.CreateCylinder(
    //   "body",
    //   {
    //     height: 3,
    //     diameterTop: 1,
    //     diameterBottom: 1,
    //     tessellation: 6,
    //     subdivisions: 1,
    //   },
    //   scene
    // );
    // var arm = BABYLON.MeshBuilder.CreateCylinder(
    //   "arm",
    //   {
    //     height: 0.8,
    //     diameterTop: 0.2,
    //     diameterBottom: 1,
    //     tessellation: 6,
    //     subdivisions: 1,
    //   },
    //   scene
    // );
    BABYLON.SceneLoader.ImportMesh(
      "plane",
      "./models/aerobatic_plane.glb",
      "aerobatic_plane.glb",
      scene,
      (meshes) => {
        scene.createDefaultCameraOrLight(true, true, true);
        scene.createDefaultEnvironment();
      }
    );
    var wing = BABYLON.MeshBuilder.CreateBox(
      "arm",
      {
        height: 0.5,
        width: 1,
        depth: 4,
      },
      scene
    );

    // wing.position.y = 0.4;
    // var pilot = BABYLON.Mesh.MergeMeshes([arm], true);
    let pilot = BABYLON.MeshBuilder.CreateBox(
      "test",
      { size: 2, depth: 2.5 },
      scene
    );

    let pointer = BABYLON.MeshBuilder.CreateBox("pointer", { size: 1 }, scene);
    pointer.position.y = 8;
    scene.registerBeforeRender(() => {
      pointer.position = pilot!.position.add(
        pilot!.getDirection(BABYLON.Vector3.Forward().scale(1))
      );

      pointer.rotation = pilot!.rotation;
    });
    // -------- new ------------
    function getRotation(origin: any, target: any) {
      console.log(origin, target);
      let diff = target.subtract(origin);
      let distance = diff.length();
      let phi = Math.acos(diff.normalize().z); // Calculate phi using the normalized z component
      let theta = Math.atan2(diff.y, diff.x); // Calculate theta using atan2

      // Adjust theta to be in the range [0, 2*pi]
      if (theta < 0) {
        theta += 2 * Math.PI;
      }

      // Adjust phi to be in the range [-pi/2, pi/2]
      let new_phi = Math.sign(diff.x) * phi;

      return new BABYLON.Vector3(theta, new_phi, 0);
    }

    let path = new BABYLON.Path3D([
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(20, 0, 0),
      new BABYLON.Vector3(0, 0, 20),
      new BABYLON.Vector3(-20, 0, 0),
      new BABYLON.Vector3(0, 0, -20),
      new BABYLON.Vector3(20, 0, 0),
      new BABYLON.Vector3(0, 0, 0),
    ]);
    var track = BABYLON.MeshBuilder.CreateLines(
      "track",
      { points: path.path },
      scene
    );

    track.color = new BABYLON.Color3(255, 255, 255);
    let animation = new BABYLON.Animation(
      "pathFollow",
      "position",
      20,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    let rotateAnimation = new BABYLON.Animation(
      "pathFollow2",
      "rotation",
      20,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    animation.setKeys(path.path.map((value, i) => ({ frame: i * 60, value })));
    let rotateKey = path.path.flatMap((node, i) => {
      if (i != 0) {
        let value = getRotation(path.path[i - 1], node);
        return [
          { frame: i * 60 - 50, value },
          { frame: i * 60 - 10, value },
        ];
      } else {
        return [{ frame: 0, value: pilot!.position }];
      }
    });

    rotateAnimation.setKeys(rotateKey);
    wing.position.x = path.path[1].x;
    wing.position.z = path.path[1].z;

    wing.position.x = path.path[2].x;
    wing.position.z = path.path[2].z;

    pilot!.animations.push(animation);
    pilot!.animations.push(rotateAnimation);
    canvasRef.current!.onclick = () => {
      let result = scene.beginAnimation(pilot!, 0, path.path.length * 60);
      result.disposeOnEnd = true;

      result.onAnimationEnd = () => (pilot!.position = BABYLON.Vector3.Zero());
    };
  }

  const createScene = function (
    engine: BABYLON.Engine,
    canvas: HTMLCanvasElement
  ) {
    const scene = new BABYLON.Scene(engine);
    // ---------- camera --------------
    const camera = new BABYLON.ArcRotateCamera(
      "Camera",
      Math.PI / 1.4,
      Math.PI / 2.8,
      30,
      new BABYLON.Vector3(0, 0, 0),
      scene
    );
    camera.attachControl(canvas, true);

    // ----------- light -------------
    var light = new BABYLON.DirectionalLight(
      "DirectionalLight",
      new BABYLON.Vector3(50, -250, 200),
      scene
    );
    light.position = new BABYLON.Vector3(50, 250, 200);
    light.diffuse = BABYLON.Color3.White();
    light.specular = new BABYLON.Color3(0.3, 0.3, 0.3);
    light.intensity = 1.0;

    light.position = new BABYLON.Vector3(1000, 1500, 0);
    light.diffuse = BABYLON.Color3.White();
    light.specular = new BABYLON.Color3(0.3, 0.3, 0.3);
    light.intensity = 1.0;

    var csmShadowGenerator = new BABYLON.CascadedShadowGenerator(2048, light);
    csmShadowGenerator.stabilizeCascades = true;
    csmShadowGenerator.forceBackFacesOnly = true;
    csmShadowGenerator.shadowMaxZ = 100;
    csmShadowGenerator.autoCalcDepthBounds = true;
    csmShadowGenerator.lambda = 0.5;
    csmShadowGenerator.depthClamp = true;
    csmShadowGenerator.penumbraDarkness = 0.8;
    csmShadowGenerator.usePercentageCloserFiltering = true;
    csmShadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_HIGH;
    // --------------- ground ----------
    var ground = BABYLON.MeshBuilder.CreateBox(
      "ground",
      { width: 100, height: 2, depth: 100 },
      scene
    );
    ground.position.y = -4;

    var backgroundMaterial = new BABYLON.BackgroundMaterial(
      "backgroundMaterial",
      scene
    );
    backgroundMaterial.diffuseTexture = new BABYLON.Texture(
      GrassTexture,
      scene
    );
    ground.material = backgroundMaterial;
    ground.receiveShadows = true;

    pilot(scene);
    return scene;
  };

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100vh" }} />;
};

export default ControlledFlight;
