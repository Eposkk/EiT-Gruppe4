"use client";
import { BarChart } from "@tremor/react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

const data = [
  {
    date: "Jan 23",
    "This Year": 68560,
    "Last Year": 28560,
  },
  {
    date: "Feb 23",
    "This Year": 70320,
    "Last Year": 30320,
  },
  {
    date: "Mar 23",
    "This Year": 80233,
    "Last Year": 70233,
  },
  {
    date: "Apr 23",
    "This Year": 55123,
    "Last Year": 45123,
  },
  {
    date: "May 23",
    "This Year": 56000,
    "Last Year": 80600,
  },
  {
    date: "Jun 23",
    "This Year": 100000,
    "Last Year": 85390,
  },
  {
    date: "Jul 23",
    "This Year": 85390,
    "Last Year": 45340,
  },
  {
    date: "Aug 23",
    "This Year": 80100,
    "Last Year": 70120,
  },
  {
    date: "Sep 23",
    "This Year": 75090,
    "Last Year": 69450,
  },
  {
    date: "Oct 23",
    "This Year": 71080,
    "Last Year": 63345,
  },
  {
    date: "Nov 23",
    "This Year": 61210,
    "Last Year": 100330,
  },
  {
    date: "Dec 23",
    "This Year": 60143,
    "Last Year": 45321,
  },
];

function valueFormatter(number: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    notation: "compact",
    compactDisplay: "short",
    style: "currency",
    currency: "USD",
  });

  return formatter.format(number);
}

export function BarChartCard() {
  const [showComparison, setShowComparison] = useState(false);
  return (
    <>
      <Card className="relative flex h-full w-96 flex-col">
        <CardHeader>
          <CardTitle>Graph</CardTitle>
          <CardDescription>View the graphs</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart
            data={data}
            index="date"
            categories={
              showComparison ? ["Last Year", "This Year"] : ["This Year"]
            }
            colors={showComparison ? ["cyan", "blue"] : ["blue"]}
            valueFormatter={valueFormatter}
            yAxisWidth={45}
            className="mt-6 hidden h-60 sm:block"
          />
          <BarChart
            data={data}
            index="date"
            categories={
              showComparison ? ["Last Year", "This Year"] : ["This Year"]
            }
            colors={showComparison ? ["cyan", "blue"] : ["blue"]}
            valueFormatter={valueFormatter}
            showYAxis={false}
            className="mt-4 h-56 sm:hidden"
          />
          <Separator />
          <div className="mb-2 flex items-center space-x-3">
            <Switch
              id="comparison"
              onCheckedChange={() => setShowComparison(!showComparison)}
            />
            <Label htmlFor="comparison">Show same period last year</Label>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
