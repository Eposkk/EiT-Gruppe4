import { LineChartCard } from "~/components/Graphs";
import { PointCloudCard } from "~/components/PointCloud";

import { Manager } from "socket.io-client";
import { BarChartCard } from "~/components/BarChart";
import { CardTitle } from "~/components/ui/card";

type LidarData = number[];

export default function HomePage() {
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
