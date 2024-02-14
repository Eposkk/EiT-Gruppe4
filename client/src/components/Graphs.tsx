"use client";
import { LineChart, List, ListItem } from "@tremor/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const data = [
  { seconds: "1707913538", Temperature: -2, Pressure: 1025, Precipitation: 0 },
  { seconds: "1707917138", Temperature: 6, Pressure: 1014, Precipitation: 0.1 },
  { seconds: "1707920738", Temperature: 33, Pressure: 1035, Precipitation: 0 },
  {
    seconds: "1707924338",
    Temperature: -4,
    Pressure: 1006,
    Precipitation: 0.5,
  },
  {
    seconds: "1707927938",
    Temperature: 22,
    Pressure: 1034,
    Precipitation: 2.0,
  },
  { seconds: "1707931538", Temperature: 8, Pressure: 1005, Precipitation: 0 },
  { seconds: "1707935138", Temperature: 35, Pressure: 971, Precipitation: 0 },
  { seconds: "1707938738", Temperature: 30, Pressure: 981, Precipitation: 0 },
  { seconds: "1707942338", Temperature: 9, Pressure: 1019, Precipitation: 0 },
  { seconds: "1707945938", Temperature: 20, Pressure: 961, Precipitation: 0 },
  {
    seconds: "1707949538",
    Temperature: 13,
    Pressure: 1030,
    Precipitation: 0.2,
  },
  {
    seconds: "1707953138",
    Temperature: 13,
    Pressure: 1023,
    Precipitation: 0.2,
  },
  { seconds: "1707956738", Temperature: 26, Pressure: 996, Precipitation: 0.1 },
  { seconds: "1707960338", Temperature: 6, Pressure: 1009, Precipitation: 0 },
  {
    seconds: "1707963938",
    Temperature: -7,
    Pressure: 1046,
    Precipitation: 0.5,
  },
  { seconds: "1707967538", Temperature: -6, Pressure: 976, Precipitation: 0 },
  { seconds: "1707971138", Temperature: 1, Pressure: 984, Precipitation: 0 },
  { seconds: "1707974738", Temperature: 33, Pressure: 967, Precipitation: 0.1 },
  { seconds: "1707978338", Temperature: 9, Pressure: 971, Precipitation: 0 },
  { seconds: "1707981938", Temperature: 21, Pressure: 1014, Precipitation: 0 },
  { seconds: "1707985538", Temperature: 6, Pressure: 1003, Precipitation: 0 },
  { seconds: "1707989138", Temperature: 18, Pressure: 995, Precipitation: 0 },
  { seconds: "1707992738", Temperature: 5, Pressure: 1017, Precipitation: 1.0 },
  { seconds: "1707996338", Temperature: 15, Pressure: 1030, Precipitation: 0 },
];

const summary = [
  {
    name: "Temperature",
    value:
      data.flatMap((d) => d.Temperature).reduce((a, b) => a + b, 0) /
      data.length,
  },
  {
    name: "Pressure",
    value:
      data.flatMap((d) => d.Pressure).reduce((a, b) => a + b, 0) / data.length,
  },
  {
    name: "Precipitation",
    value:
      data.flatMap((d) => d.Precipitation).reduce((a, b) => a + b, 0) /
      data.length,
  },
];

const valueFormatter = (number: number) =>
  `${Intl.NumberFormat("us").format(number).toString()}`;

const statusColor = {
  Organic: "bg-blue-500",
  Sponsored: "bg-violet-500",
  Affiliate: "bg-fuchsia-500",
};

export function LineChartCard() {
  return (
    <>
      <Card className="relative flex h-full w-96 flex-col">
        <CardHeader>
          <CardTitle>Graph</CardTitle>
          <CardDescription>View the graphs</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart
            data={data}
            index="seconds"
            categories={["Temperature", "Pressure", "Precipitation"]}
            colors={["blue", "violet", "fuchsia"]}
            valueFormatter={valueFormatter}
            showLegend={false}
            showYAxis={false}
            startEndOnly={true}
            className="mt-6 h-32"
          />
          <List className="mt-2 grid gap-4">
            <h2>Averages</h2>
            <div>
              {summary.map((item) => (
                <ListItem key={item.name}>
                  <div className="flex items-center space-x-2">
                    <span
                      className={classNames(
                        statusColor[item.name],
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
    </>
  );
}
