import React, { useRef, useEffect } from "react";
import * as BABYLON from "babylonjs";
import GrassTexture from "./textures/grass.png";

const FlyingCircle: React.FC = () => {
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
    var body = BABYLON.MeshBuilder.CreateCylinder(
      "body",
      {
        height: 3,
        diameterTop: 1,
        diameterBottom: 1,
        tessellation: 6,
        subdivisions: 1,
      },
      scene
    );
    var arm = BABYLON.MeshBuilder.CreateCylinder(
      "arm",
      {
        height: 0.8,
        diameterTop: 0.2,
        diameterBottom: 1,
        tessellation: 6,
        subdivisions: 1,
      },
      scene
    );
    arm.position.y = 1.9;
    var wing = BABYLON.MeshBuilder.CreateBox(
      "arm",
      {
        height: 0.5,
        width: 1,
        depth: 4,
      },
      scene
    );
    wing.position.y = 0.4;
    var pilot = BABYLON.Mesh.MergeMeshes([body, arm, wing], true);

    var flip = Math.PI / 2;
    var axis = new BABYLON.Vector3(0, 0, 1);
    pilot!.rotate(axis, flip, BABYLON.Space.WORLD);

    const pilotSpeed = 0.2;
    let x = getX(20, 20);
    let z = getZ(20, 20);

    const changeDirection = () => {
      scene.registerBeforeRender(() => {
        // Update x and z for continuous movement
        if (pilot!.intersectsPoint(new BABYLON.Vector3(x, 0, z))) {
          x = getX(7, 42);
          z = getZ(8, 41);

          var CoR_At = new BABYLON.Vector3(x, 0, z);
          // var axisLine = BABYLON.MeshBuilder.CreateLines(
          //   "axisLine",
          //   {
          //     points: [
          //       pilot.position.add(axis.scale(-50)),
          //       CoR_At.add(axis.scale(50)),
          //     ],
          //   },
          //   scene
          // );

          pilot!.lookAt(new BABYLON.Vector3(0, z, 0));
        }

        // console.log(pilot.rotation);
        pilot!.translate(
          new BABYLON.Vector3(
            x - pilot!.position.x,
            0,
            z - pilot!.position.z
          ).normalize(),
          pilotSpeed,
          BABYLON.Space.WORLD
        );
      });
    };
    changeDirection();
  }

  const createScene = function (
    engine: BABYLON.Engine,
    canvas: HTMLCanvasElement
  ) {
    const scene = new BABYLON.Scene(engine);

    const light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    light.intensity = 0.7;

    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0));

    const camera = new BABYLON.ArcRotateCamera(
      "Camera",
      Math.PI / 1.4,
      Math.PI / 2.8,
      30,
      new BABYLON.Vector3(0, 0, 0),
      scene
    );
    camera.attachControl(canvas, true);

    const ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 10, scene);
    ground.position.y = -4.5;

    var backgroundMaterial = new BABYLON.BackgroundMaterial(
      "backgroundMaterial",
      scene
    );
    backgroundMaterial.diffuseTexture = new BABYLON.Texture(
      GrassTexture,
      scene
    );
    ground.material = backgroundMaterial;
    pilot(scene);
    return scene;
  };

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100vh" }} />;
};

export default FlyingCircle;
