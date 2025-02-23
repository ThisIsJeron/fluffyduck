
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CampaignMetricsProps {
  timeScale: "day" | "week";
  setTimeScale: (scale: "day" | "week") => void;
  data: any;
}

export function CampaignMetrics({ timeScale, setTimeScale, data }: CampaignMetricsProps) {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Performance Metrics</h3>
        <div className="space-x-2">
          <Button
            variant={timeScale === "day" ? "default" : "outline"}
            onClick={() => setTimeScale("day")}
          >
            1 Day
          </Button>
          <Button
            variant={timeScale === "week" ? "default" : "outline"}
            onClick={() => setTimeScale("week")}
          >
            1 Week
          </Button>
        </div>
      </div>
      
      <div className="w-full h-[250px]">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="views" stroke="#8884d8" />
            <Line type="monotone" dataKey="likes" stroke="#82ca9d" />
            <Line type="monotone" dataKey="comments" stroke="#ffc658" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
