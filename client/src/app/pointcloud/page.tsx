import { PointCloudCard } from "~/components/PointCloud";
import { CardTitle } from "~/components/ui/card";

export default function PointCloud() {
  return (
    <main>
      <div className="flex flex-col gap-4 p-4">
        <CardTitle className="text-4xl">Point Cloud</CardTitle>
        <div className="h-screen w-screen ">
          <PointCloudCard />
        </div>
      </div>
    </main>
  );
}
