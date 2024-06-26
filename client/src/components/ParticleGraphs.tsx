import React from "react";
import { LineChart, List, ListItem } from "@tremor/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { getColorForIndex } from "~/utils/getColorForIndex";

export type AirQualityData = {
  seconds: number;
  "pm10 env": number;
  "pm25 env": number;
  "pm100 env": number;
  "particles 03um": number;
  "particles 05um": number;
  "particles 10um": number;
  "particles 25um": number;
  "particles 50um": number;
  "particles 100um": number;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const valueFormatter = (number: number) =>
  `${Intl.NumberFormat("us").format(number).toString()}`;

const statusColor = (name: string) => {
  // Placeholder logic for color mapping, adjust as needed
  const baseColors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-green-500",
    "bg-red-500",
    "bg-yellow-500",
  ];
  return baseColors[Math.floor(Math.random() * baseColors.length)];
};

export function ParticleGraphCard({ data }: { data: AirQualityData[] }) {
  if (data.length === 0) {
    // Render a placeholder or a loading indicator
    return <div>Loading...</div>;
  }

  type AirQualityKeys = keyof Omit<AirQualityData, "seconds">;

  const airQualityKeys: AirQualityKeys[] = Object.keys(data[0]).filter(
    (key): key is AirQualityKeys => key !== "seconds",
  );

  const colors = airQualityKeys.map((_, index) => getColorForIndex(index));

  const envSummary = [
    {
      name: "pm10 env",
      value:
        data.flatMap((d) => d["pm10 env"]).reduce((a, b) => a + b, 0) /
        data.length,
    },
    {
      name: "pm25 env",
      value:
        data.flatMap((d) => d["pm25 env"]).reduce((a, b) => a + b, 0) /
        data.length,
    },
    {
      name: "pm100 env",
      value:
        data.flatMap((d) => d["pm100 env"]).reduce((a, b) => a + b, 0) /
        data.length,
    },
  ];

  const particleSummary = [
    {
      name: "particles 03um",
      value:
        data.flatMap((d) => d["particles 03um"]).reduce((a, b) => a + b, 0) /
        data.length,
    },
    {
      name: "particles 05um",
      value:
        data.flatMap((d) => d["particles 05um"]).reduce((a, b) => a + b, 0) /
        data.length,
    },
    {
      name: "particles 10um",
      value:
        data.flatMap((d) => d["particles 10um"]).reduce((a, b) => a + b, 0) /
        data.length,
    },
    {
      name: "particles 25um",
      value:
        data.flatMap((d) => d["particles 25um"]).reduce((a, b) => a + b, 0) /
        data.length,
    },
    {
      name: "particles 50um",
      value:
        data.flatMap((d) => d["particles 50um"]).reduce((a, b) => a + b, 0) /
        data.length,
    },
    {
      name: "particles 100um",
      value:
        data.flatMap((d) => d["particles 100um"]).reduce((a, b) => a + b, 0) /
        data.length,
    },
  ];

  return (
    <div className="flex gap-4">
      <Card className="relative flex h-full w-96 flex-col">
        <CardHeader>
          <CardTitle>Environmental Particulate Matter Levels</CardTitle>
          <CardDescription>
            This graph displays the concentration of particulate matter (PM10,
            PM2.5, and PM100) in the environment, measuring the presence of
            particles with diameters of 10, 2.5, and 100 micrometers
            respectively. Values are indicative of air quality and potential
            health impacts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart
            data={data}
            index="seconds"
            categories={["pm10 env", "pm25 env", "pm100 env"]}
            colors={colors}
            valueFormatter={valueFormatter}
            showLegend={false}
            showYAxis={true}
            startEndOnly={true}
            className="mt-6 h-32"
          />
          <List className="mt-2 grid gap-4">
            <h2>Averages</h2>
            <div>
              {envSummary.map((item) => (
                <ListItem key={item.name}>
                  <div className="flex items-center space-x-2">
                    <span
                      className={classNames(
                        `bg-${getColorForIndex(envSummary.findIndex((val) => val.name === item.name))}-500`,
                        "h-0.5 w-3",
                      )}
                      aria-hidden={true}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="dark:text-dark-tremor-content-strong font-medium text-tremor-content-strong">
                    {valueFormatter(item.value)}
                  </span>
                </ListItem>
              ))}
            </div>
          </List>
        </CardContent>
      </Card>
      <Card className="relative flex h-full w-96 flex-col">
        <CardHeader>
          <CardTitle>Airborne Particle Size Distribution</CardTitle>
          <CardDescription>
            This graph shows the detailed distribution of airborne particles by
            size, ranging from ultrafine (0.3μm) to coarse (100μm). It provides
            insights into the variety of particulate matter present in the air.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart
            data={data}
            index="seconds"
            categories={[
              "particles 03um",
              "particles 05um",
              "particles 10um",
              "particles 25um",
              "particles 50um",
              "particles 100um",
            ]}
            colors={colors}
            valueFormatter={valueFormatter}
            showLegend={false}
            showYAxis={true}
            startEndOnly={true}
            className="mt-6 h-32"
          />
          <List className="mt-2 grid gap-4">
            <h2>Averages</h2>
            <div>
              {particleSummary.map((item) => (
                <ListItem key={item.name}>
                  <div className="flex items-center space-x-2">
                    <span
                      className={classNames(
                        `bg-${getColorForIndex(particleSummary.findIndex((val) => val.name === item.name))}-500`,
                        "h-0.5 w-3",
                      )}
                      aria-hidden={true}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="dark:text-dark-tremor-content-strong font-medium text-tremor-content-strong">
                    {valueFormatter(item.value)}
                  </span>
                </ListItem>
              ))}
            </div>
          </List>
        </CardContent>
      </Card>
    </div>
  );
}
