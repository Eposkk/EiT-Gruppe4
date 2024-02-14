import { LineChartCard } from "~/components/Graphs";
import { PointCloudCard } from "~/components/PointCloud";

import { Manager } from "socket.io-client";
import { BarChartCard } from "~/components/BarChart";
import { CardTitle } from "~/components/ui/card";

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
      <div className="flex flex-col gap-4 p-4">
        <CardTitle className="text-4xl">Mars Sensor Dashboard</CardTitle>
        <div className="flex flex-wrap gap-4 ">
          <PointCloudCard />
          <LineChartCard />
          <BarChartCard />
          <LineChartCard />
          <BarChartCard />
          <LineChartCard />
          <BarChartCard />
        </div>
      </div>
    </main>
  );
}
