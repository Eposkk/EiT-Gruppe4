"use client";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import "./scene.css";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { randInt } from "three/src/math/MathUtils.js";

const CustomGeometryParticles = ({ count, shape, distance }: SceneProps) => {
  // Generate our positions attributes array
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    console.log(shape);
    if (shape === "box") {
      for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 2;
        const y = (Math.random() - 0.5) * 2;
        const z = (Math.random() - 0.5) * 2;

        positions.set([x, y, z], i * 3);
      }
    }

    if (shape === "sphere") {
      for (let i = 0; i < count; i++) {
        const theta = THREE.MathUtils.randFloatSpread(360);
        const phi = THREE.MathUtils.randFloatSpread(360);

        const x = distance * Math.sin(theta) * Math.cos(phi);
        const y = distance * Math.sin(theta) * Math.sin(phi);
        const z = distance * Math.cos(theta);

        positions.set([x, y, z], i * 3);
      }
    }
    return positions;
  }, [count, shape, distance]);

  useEffect(() => {
    if (points.current) {
      points.current.geometry.attributes.position.needsUpdate = true;
    }
  }, [particlesPosition]);

  const points = useRef<THREE.Points>();
  return (
    <points ref={points} key={count}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#5786F5"
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

// Define the type for shape
type ShapeType = "box" | "sphere";

type SceneProps = {
  shape: ShapeType;
  count: number;
  distance: number;
};

export const PointCloudCard = () => {
  const [state, setState] = useState<SceneProps>({
    shape: "sphere",
    count: 20000,
    distance: 5,
  });

  const shapes: ShapeType[] = ["box", "sphere"];

  return (
    <Card className="relative flex h-full w-96 flex-col">
      <CardHeader>
        <CardTitle>Point Cloud</CardTitle>
        <CardDescription>View the cloud</CardDescription>
      </CardHeader>
      <CardContent>
        <Canvas className="flex-grow" camera={{ position: [1.5, 1.5, 1.5] }}>
          <ambientLight intensity={0.5} />
          <CustomGeometryParticles {...state} />
          <OrbitControls autoRotate />
        </Canvas>
      </CardContent>
      <CardFooter className="grid w-96 gap-2">
        <div className="flex gap-4">
          <Button
            onClick={() => {
              setState({
                shape: randInt(0, 1) === 0 ? "box" : "sphere",
                count: randInt(1000, 1000000),
                distance: randInt(1, 10),
              });
            }}
          >
            Randomize
          </Button>
          <Button
            variant={"destructive"}
            onClick={() => {
              setState({
                shape: "sphere",
                count: 20000,
                distance: 5,
              });
            }}
          >
            Reset
          </Button>
        </div>
        {state.shape === "sphere" && (
          <div>
            <Label htmlFor="distance">{state.distance}</Label>
            <Slider
              id="distance"
              defaultValue={[state.distance]}
              max={10}
              step={0.01}
              onValueChange={(e) => {
                setState({
                  ...state,
                  distance: e[0] ?? 0,
                });
                console.log(e[0]);
              }}
            />
          </div>
        )}

        <div>
          <Label htmlFor="count"></Label>
          <Input
            id="count"
            type="number"
            value={state.count}
            max={1000000}
            step={1000}
            onChange={(e) =>
              setState({
                ...state,
                count: parseInt(e.target.value),
              })
            }
          />
        </div>
        <div>
          <Select
            onValueChange={(e) => {
              setState({
                ...state,
                shape: e as ShapeType,
              });
            }}
            value={state.shape}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue defaultValue={state.shape} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Shapes</SelectLabel>
                {shapes.map((shape) => (
                  <SelectItem key={shape} value={shape}>
                    {shape}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardFooter>
    </Card>
  );
};
