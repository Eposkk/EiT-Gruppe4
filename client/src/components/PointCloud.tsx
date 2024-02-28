"use client";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { Manager } from "socket.io-client";

const CustomGeometryParticles = ({
  vertices,
  setVertices,
}: {
  vertices: Float32Array;
  setVertices: Dispatch<SetStateAction<Float32Array>>;
}) => {
  const meshRef = useRef();

  const points = useRef<THREE.Points>();

  return (
    //@ts-ignore
    <points ref={points} key={vertices.length}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={vertices.length / 3}
          array={vertices}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#008000"
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

export const PointCloudCard = ({
  vertices,
  setVertices,
}: {
  vertices: Float32Array;
  setVertices: Dispatch<SetStateAction<Float32Array>>;
}) => {
  return (
    <Card className="relative flex h-full w-auto flex-col">
      <CardHeader>
        <CardTitle>Point Cloud</CardTitle>
        <CardDescription>View the cloud</CardDescription>
      </CardHeader>
      <CardContent>
        <Canvas className="flex-grow" camera={{ position: [1.5, 1.5, 1.5] }}>
          <ambientLight intensity={0.5} />
          <CustomGeometryParticles
            setVertices={setVertices}
            vertices={vertices}
          />
          <OrbitControls />
        </Canvas>
      </CardContent>
      {/*
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
      </CardFooter>*/}
    </Card>
  );
};
