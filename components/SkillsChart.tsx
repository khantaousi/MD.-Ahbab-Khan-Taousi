import React from 'react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';
import { Skill } from '../types';

interface SkillsChartProps {
  skills: Skill[];
  color: string;
  isLightMode?: boolean;
}

const SkillsChart: React.FC<SkillsChartProps> = ({ skills, color, isLightMode = false }) => {
  const data = skills.map(skill => ({
    subject: skill.name,
    A: skill.proficiency || 80,
    fullMark: 100,
  }));

  if (data.length === 0) return null;

  const gridColor = isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  const tickColor = isLightMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
  const tooltipBg = isLightMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.9)';
  const tooltipBorder = isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  const tooltipText = isLightMode ? '#000' : '#fff';

  return (
    <div className="w-full h-[300px] mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke={gridColor} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px' }}
            itemStyle={{ color: tooltipText }}
          />
          <Radar name="Proficiency" dataKey="A" stroke={color} fill={color} fillOpacity={0.5} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillsChart;
