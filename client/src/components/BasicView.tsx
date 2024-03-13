"use client";
import { LineChartCard, LineChartCardProps } from "~/components/Graphs";
import { PointCloudCard } from "~/components/PointCloud";
import { Cloud, Droplets, Thermometer } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { AirQualityData, ParticleGraphCard } from "./ParticleGraph";

export default function BasicView() {
  const [data, setData] = useState<LineChartCardProps[]>([]);
  const [particleData, setParticleData] = useState<AirQualityData[]>([]);
  const [vertices, setVertices] = useState<Float32Array>(new Float32Array());
  const sensorBaseTimeRef = useRef<number | null>(null);
  const pc = useRef<RTCPeerConnection>();

  useEffect(() => {
    // Function to handle incoming LiDAR data
    pc.current = new RTCPeerConnection();
    const handleSensorDataChannelMessage = (event: any) => {
      var dec = new TextDecoder();
      const data = JSON.parse(dec.decode(event.data));

      if (sensorBaseTimeRef.current === null) {
        sensorBaseTimeRef.current = data.seconds;
      }

      setData((existingData) => {
        const baseTime = sensorBaseTimeRef.current;
        const currentData = {
          seconds: (data.seconds - baseTime).toFixed(2) as unknown as number,
          hudmidity: data.humidity as number,
          temperature: data.temperature as number,
          pressure: data.pressure as number,
          gas: (data.gas as number) / 1000,
        } as LineChartCardProps;

        console.log("existing_data", existingData);

        const index = existingData.find(
          (item) => item.seconds === currentData.seconds,
        );

        if (!index) {
          return [...existingData, currentData];
        } else {
          return existingData;
        }
      });
      setParticleData((existingData) => {
        console.log("existing Particle data", existingData);
        const particleData = data["particles"];
        const baseTime = sensorBaseTimeRef.current;
        const currentData = {
          seconds: (data.seconds - baseTime).toFixed(2) as unknown as number,
          "pm10 standard": particleData["pm10 standard"],
          "pm25 standard": particleData["pm25 standard"],
          "pm100 standard": particleData["pm100 standard"],
          "pm10 env": particleData["pm10 env"],
          "pm25 env": particleData["pm25 env"],
          "pm100 env": particleData["pm100 env"],
          "particles 03um": particleData["particles 03um"],
          "particles 05um": particleData["particles 05um"],
          "particles 10um": particleData["particles 10um"],
          "particles 25um": particleData["particles 25um"],
          "particles 50um": particleData["particles 50um"],
          "particles 100um": particleData["particles 100um"],
        } as AirQualityData;
        return [...existingData, currentData];
      });
    };

    const handleLidarDataChannelMessage = (event: any) => {
      //console.log(event.data);
      const points = new Float32Array(event.data);

      setVertices(() => points.map((p) => p * 0.6));
    };

    // Function to set up the data channel
    const setupSensorDataChannel = () => {
      if (!pc.current) return;
      const sensorsDataChannel = pc.current.createDataChannel("sensor_data");
      sensorsDataChannel.onmessage = handleSensorDataChannelMessage;
      console.log("setupSensorDataChannel");
    };

    const setupLidarDataChannel = () => {
      if (!pc.current) return;
      const lidarDataChannel = pc.current.createDataChannel("lidar_scan");
      lidarDataChannel.onmessage = handleLidarDataChannelMessage;
    };

    // Function to initiate or respond to negotiation
    const negotiate = async () => {
      try {
        if (!pc.current) return;
        pc.current.onnegotiationneeded = async () => {
          if (!pc.current) return;
          const offer = await pc.current.createOffer();
          await pc.current.setLocalDescription(offer);

          const response = await fetch("http://10.22.34.141:8080/offer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sdp: pc.current.localDescription?.sdp,
              type: pc.current.localDescription?.type,
            }),
          });

          console.log("Got response", response);

          const answer = await response.json();
          await pc.current.setRemoteDescription(
            new RTCSessionDescription(answer),
          );
        };
      } catch (error) {
        console.error("Failed to negotiate:", error);
      }
    };

    setupLidarDataChannel();
    setupSensorDataChannel();

    negotiate();

    return () => {
      if (!pc.current) return;
      pc.current.close();
    };
  }, []);

  return (
    <main>
      <div className="flex flex-col gap-4 p-4">
        <CardTitle className="text-4xl">Mars Sensor Dashboard</CardTitle>
        <div className="flex flex-wrap gap-4 ">
          <PointCloudCard setVertices={setVertices} vertices={vertices} />
          <LineChartCard data={data} />
          <ParticleGraphCard data={particleData} />
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-4">
                <Cloud /> Current Weather
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="grid gap-4">
                <p className="flex gap-4">
                  {" "}
                  <Thermometer />
                  Current Tempreature: {data[data.length - 1]?.temperature}
                </p>

                <p className="flex gap-4">
                  {" "}
                  <Droplets /> Current Hudmitity:{" "}
                  {data[data.length - 1]?.hudmidity}
                </p>
                <p></p>
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
