import React, { useEffect, useState } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useMediaQuery } from 'react-responsive';

interface LineChartProps {
  data: any[];
  lines: {
    key: string;
    name: string;
    color: string;
  }[];
  xAxisKey: string;
  title?: string;
  height?: number;
  showGrid?: boolean;
}

export const LineChart = ({
  data,
  lines,
  xAxisKey,
  title,
  height = 300,
  showGrid = true,
}: LineChartProps) => {
  const [chartData, setChartData] = useState(data);
  const isMobile = useMediaQuery({ maxWidth: 640 });
  
  // For mobile, reduce data points if there are too many
  useEffect(() => {
    if (isMobile && data.length > 6) {
      // Sample fewer data points for mobile
      const sampled = data.filter((_, index) => index % 3 === 0 || index === data.length - 1);
      setChartData(sampled);
    } else {
      setChartData(data);
    }
  }, [isMobile, data]);

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-base font-medium text-gray-700 mb-2">{title}</h3>}
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />}
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                fontSize: '12px'
              }}
              formatter={(value: number) => [`${value}`, '']}
              labelFormatter={(label) => `${label}`}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};