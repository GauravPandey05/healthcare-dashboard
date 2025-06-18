import { useState, useCallback, useEffect, useRef } from 'react';
import { PieChart as RechartsChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sector } from 'recharts';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
    percentage?: number;
  }>;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export const PieChart: React.FC<PieChartProps> = ({ 
  data,
  height = 300,
  innerRadius = 0,
  outerRadius = 80
}) => {
  // Track hidden items
  const [hiddenItems, setHiddenItems] = useState<Record<string, boolean>>({});
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Filter data to only show visible items
  const visibleData = data.filter(item => !hiddenItems[item.name]);
  
  // When data changes, ensure we reset active state
  useEffect(() => {
    setActiveIndex(undefined);
  }, [data]);

  // Reset active state when hidden items change
  useEffect(() => {
    setActiveIndex(undefined);
  }, [hiddenItems]);

  // Use safer key generation for items
  const getUniqueKey = (name: string, index: number) => {
    return `segment-${index}-${name.replace(/\s+/g, '-')}`;
  };
  
  // Shorten long names for better display
  const shortenName = (name: string): string => {
    if (!name) return '';
    if (name.length <= 10) return name;
    
    // For insurance types and other common terms
    const commonAbbreviations: Record<string, string> = {
      'Medicare': 'Medicare',
      'Medicaid': 'Medicaid',
      'Private Insurance': 'Private',
      'Self-pay': 'Self-pay',
      'Other Insurance': 'Other',
    };
    
    if (commonAbbreviations[name]) {
      return commonAbbreviations[name];
    }
    
    // If it's two words, abbreviate the second word
    if (name.includes(' ')) {
      const parts = name.split(' ');
      if (parts.length === 2) {
        return `${parts[0]} ${parts[1].charAt(0)}.`;
      }
    }
    
    // Default: truncate with ellipsis
    return name.substring(0, 8) + '..';
  };
  
  // Custom legend rendering with values and percentages
  const renderCustomizedLegend = useCallback((props: any) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
        {data.map((entry, index) => {
          const isHidden = hiddenItems[entry.name];
          const displayName = shortenName(entry.name);
          
          return (
            <li 
              key={getUniqueKey(entry.name, index)}
              className={`inline-flex items-center cursor-pointer mx-2`}
              onClick={() => {
                setActiveIndex(undefined); // Reset active state
                setHiddenItems(prev => ({
                  ...prev,
                  [entry.name]: !prev[entry.name]
                }));
              }}
            >
              <span 
                className="inline-block w-3 h-3 mr-1" 
                style={{ backgroundColor: entry.color }}
              />
              <span 
                className={`text-xs text-gray-800 ${isHidden ? 'line-through opacity-50' : ''}`}
              >
                {/* Show shortened name, value and percentage */}
                {displayName} 
              </span>
            </li>
          );
        })}
      </ul>
    );
  }, [data, hiddenItems]);
  
  // Custom label for each pie section
  const renderCustomizedLabel = useCallback((props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, outerRadius, fill, percent, name } = props;
    
    // Only show labels for sections with sufficient percentage (avoid clutter)
    if (percent < 0.02) return null; // Skip small segments
    
    const sin = Math.sin(-midAngle * RADIAN);
    const cos = Math.cos(-midAngle * RADIAN);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none"/>
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none"/>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>
          {`${shortenName(name)} ${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  }, []);
  
  // Active shape when hovering over pie sections
  const renderActiveShape = useCallback((props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, value
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      {innerRadius > 0 && (
        <>
          <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#333" fontSize={12} fontWeight="bold">
            {payload.name}
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" fill="#666" fontSize={12}>
            {value}
          </text>
        </>
      )}
    </g>
  );
}, []);


  // Better mouse handlers with timeout to prevent hover issues
  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    // Add a small delay to make the transition smoother
    setTimeout(() => {
      setActiveIndex(undefined);
    }, 50);
  };
  
  // Add a click handler to the container
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if the click is on the container and not on a chart element
    if (e.target === e.currentTarget) {
      setActiveIndex(undefined);
    }
  };
  
  return (
    <div 
      ref={chartRef} 
      onClick={handleContainerClick} 
      className="relative"
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsChart onMouseLeave={handleMouseLeave}>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={visibleData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {visibleData.map((entry, index) => (
              <Cell 
                key={getUniqueKey(entry.name, index)} 
                fill={entry.color} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number, name: string) => [
              `${value} (${data.find(d => d.name === name)?.percentage}%)`, 
              name
            ]}
          />
          <Legend 
            content={renderCustomizedLegend}
            verticalAlign="bottom" 
            align="center"
          />
        </RechartsChart>
      </ResponsiveContainer>
    </div>
  );
};