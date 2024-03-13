"use client";
import { LineChart, List, ListItem } from "@tremor/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { map } from "zod";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const valueFormatter = (number: number) =>
  `${Intl.NumberFormat("us").format(number).toString()}`;

const statusColor = {
  Temperature: "bg-blue-500",
  Hudmidity: "bg-violet-500",
};

export type LineChartCardProps = {
  seconds: number;
  temperature: number;
  pressure: number;
  hudmidity: number;
  gas: number;
};

export function LineChartCard({ data }: { data: LineChartCardProps[] }) {
  const firstSummary = [
    {
      name: "temperature",
      value:
        data.flatMap((d) => d.temperature).reduce((a, b) => a + b, 0) /
        data.length,
      suffix: "°C",
    },
    {
      name: "hudmidity",
      value:
        data.flatMap((d) => d.hudmidity).reduce((a, b) => a + b, 0) /
        data.length,
      suffix: "%",
    },
    {
      name: "gas",
      value:
        data.flatMap((d) => d.gas).reduce((a, b) => a + b, 0) / data.length,
      suffix: "‰",
    },
  ];

  const secondSummary = [
    {
      name: "pressure",
      value:
        data.flatMap((d) => d.pressure).reduce((a, b) => a + b, 0) /
        data.length,
      suffix: "hPa",
    },
  ];

  return (
    <div className="flex gap-2">
      <Card className="relative flex h-full w-96 flex-col">
        <CardHeader>
          <CardTitle>Graph</CardTitle>
          <CardDescription>View the graphs</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart
            data={data}
            index="seconds"
            categories={["temperature", "hudmidity", "gas"]}
            colors={["red", "green", "violet"]}
            valueFormatter={valueFormatter}
            showLegend={false}
            showYAxis={true}
            startEndOnly={false}
            showXAxis={false}
            className="mt-6 h-32"
          />
          <List className="mt-2 grid gap-4">
            <h2>Averages</h2>
            <div>
              {firstSummary.map((item) => (
                <ListItem key={item.name}>
                  <div className="flex items-center space-x-2">
                    <span
                      className={classNames(
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        statusColor[item.name],
                        "h-0.5 w-3",
                      )}
                      aria-hidden={true}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="dark:text-dark-tremor-content-strong font-medium text-tremor-content-strong">
                    {valueFormatter(item.value)} {item.suffix}
                  </span>
                </ListItem>
              ))}
            </div>
          </List>
        </CardContent>
      </Card>

      <Card className="relative flex h-full w-96 flex-col">
        <CardHeader>
          <CardTitle>Graph</CardTitle>
          <CardDescription>View the graphs</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart
            data={data}
            index="seconds"
            categories={["pressure"]}
            colors={["red"]}
            valueFormatter={valueFormatter}
            showLegend={false}
            showYAxis={true}
            showXAxis={false}
            startEndOnly={true}
            className="mt-6 h-32"
          />
          <List className="mt-2 grid gap-4">
            <h2>Averages</h2>
            <div>
              {secondSummary.map((item) => (
                <ListItem key={item.name}>
                  <div className="flex items-center space-x-2">
                    <span
                      className={classNames(
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        statusColor[item.name],
                        "h-0.5 w-3",
                      )}
                      aria-hidden={true}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="dark:text-dark-tremor-content-strong font-medium text-tremor-content-strong">
                    {valueFormatter(item.value)} {item.suffix}
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
