import { Graphs } from "~/components/Graphs";
import Scene from "~/components/PointCloud";

import { Manager } from "socket.io-client";

type LidarData = number[];

export default function HomePage() {
  const manager = new Manager("localhost:5000", {
    autoConnect: true,
  });

  const socket = manager.socket("/"); // main namespace
  socket.on("connect", () => {
    console.log("connected");
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
  });

  socket.on("lidar", (data: LidarData) => {
    console.log("lidar data", data);
  });

  return (
    <main>
      <div className="flex gap-4 p-4">
        <Scene />
        <Graphs />
      </div>
    </main>
  );
}
