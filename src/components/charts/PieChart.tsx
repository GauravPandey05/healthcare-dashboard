import React, { useState } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 300,
  innerRadius = 60,
  outerRadius = 80,
}) => {
  const [hiddenItems, setHiddenItems] = useState<{[key: string]: boolean}>({});

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Generate default colors if not provided
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const handleLegendClick = (entry: any) => {
    setHiddenItems(prev => ({
      ...prev,
      [entry.name]: !prev[entry.name]
    }));
  };

  // Filter out hidden items for the chart
  const visibleData = data.filter(item => !hiddenItems[item.name]);

  const renderCustomizedLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <li 
            key={`item-${index}`} 
            className="flex items-center cursor-pointer" 
            onClick={() => handleLegendClick(entry)}
          >
            <span 
              className="inline-block w-3 h-3 mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span 
              className={`text-xs ${hiddenItems[entry.value] ? 'line-through text-gray-400' : 'text-gray-700'}`}
            >
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <Pie
          data={visibleData}
          cx="50%"
          cy="50%"
          labelLine={false}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {visibleData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color || COLORS[index % COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`${value}`, 'Value']}
          contentStyle={{
            backgroundColor: '#FFF',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        />
        <Legend 
          content={renderCustomizedLegend}
          verticalAlign="bottom"
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};