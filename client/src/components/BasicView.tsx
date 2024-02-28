"use client";
import { LineChartCard } from "~/components/Graphs";
import { PointCloudCard } from "~/components/PointCloud";

import { BarChartCard } from "~/components/BarChart";
import { CardTitle } from "~/components/ui/card";
import { useEffect, useRef, useState } from "react";

export default function BasicView() {
  const [data, setData] = useState<any>([]);
  const [vertices, setVertices] = useState<Float32Array>(new Float32Array());

  const pc = useRef<RTCPeerConnection>();

  useEffect(() => {
    // Function to handle incoming LiDAR data
    pc.current = new RTCPeerConnection();
    const handleSensorDataChannelMessage = (event) => {
      console.log("sensor data", event);
      setData(() => JSON.parse(event.data));
    };

    const handleLidarDataChannelMessage = (event) => {
      //console.log(event.data);
      const points = new Float32Array(event.data);
      //console.log(new Float32Array(event.data.slice(0, 100))); // Inspect the first few values

      setVertices(() => points);
    };

    // Function to set up the data channel
    const setupSensorDataChannel = () => {
      const sensorsDataChannel = pc.current.createDataChannel("sensors");
      sensorsDataChannel.onmessage = handleSensorDataChannelMessage;
    };

    const setupLidarDataChannel = () => {
      const lidarDataChannel = pc.current.createDataChannel("lidar_scan");
      lidarDataChannel.onmessage = handleLidarDataChannelMessage;
    };

    // Function to initiate or respond to negotiation
    const negotiate = async () => {
      try {
        pc.current.onnegotiationneeded = async () => {
          const offer = await pc.current.createOffer();
          await pc.current.setLocalDescription(offer);

          const response = await fetch("http://10.22.33.143:8080/offer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sdp: pc.current.localDescription.sdp,
              type: pc.current.localDescription.type,
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
      pc.current.close();
    };
  }, []);

  return (
    <main>
      <div className="flex flex-col gap-4 p-4">
        <CardTitle className="text-4xl">Mars Sensor Dashboard</CardTitle>
        <div className="flex flex-wrap gap-4 ">
          <PointCloudCard setVertices={setVertices} vertices={vertices} />
          <LineChartCard />
          <BarChartCard />
          <LineChartCard />
          <BarChartCard />
          <LineChartCard />
          <BarChartCard />

          {data}
        </div>
      </div>
    </main>
  );
}
