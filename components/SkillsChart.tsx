import React from 'react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';
import { Skill } from '../types';

interface SkillsChartProps {
  skills: Skill[];
  color: string;
}

const SkillsChart: React.FC<SkillsChartProps> = ({ skills, color }) => {
  const data = skills.map(skill => ({
    subject: skill.name,
    A: skill.proficiency || 80,
    fullMark: 100,
  }));

  if (data.length === 0) return null;

  return (
    <div className="w-full h-[300px] mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Radar name="Proficiency" dataKey="A" stroke={color} fill={color} fillOpacity={0.5} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillsChart;
