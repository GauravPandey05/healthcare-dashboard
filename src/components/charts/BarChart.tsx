import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface BarConfig {
  dataKey: string;
  name: string;
  color: string;
  yAxisId?: string; // Add this optional property
}

interface BarChartProps {
  data: any[];
  bars: BarConfig[];
  xAxisKey: string;
  height?: number;
  showYAxisRight?: boolean; // Optional prop to show right Y-axis
}

export const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  bars, 
  xAxisKey, 
  height = 300,
  showYAxisRight = false 
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis yAxisId="left" />
        {showYAxisRight && <YAxis yAxisId="right" orientation="right" />}
        <Tooltip />
        <Legend />
        {bars.map((bar, index) => (
          <Bar
            key={index}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={bar.color}
            yAxisId={bar.yAxisId || "left"} // Use provided yAxisId or default to "left"
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};