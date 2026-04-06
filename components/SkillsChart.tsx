import React from 'react';
import { 
  ResponsiveContainer, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Tooltip,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { Skill } from '../types';
import { motion } from 'motion/react';

interface SkillsChartProps {
  skills: Skill[];
  color: string;
  isLightMode?: boolean;
}

const SkillsChart: React.FC<SkillsChartProps> = ({ skills, color, isLightMode = false }) => {
  const radarData = skills.map(skill => ({
    subject: skill.name,
    A: skill.proficiency || 80,
    fullMark: 100,
  }));

  const radialData = skills.map((skill, index) => ({
    name: skill.name,
    uv: skill.proficiency || 80,
    fill: color,
    opacity: 1 - (index * 0.1)
  })).slice(0, 6); // Limit to top 6 for radial bar to keep it clean

  if (skills.length === 0) return null;

  const gridColor = isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  const tickColor = isLightMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
  const tooltipBg = isLightMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.9)';
  const tooltipBorder = isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  const tooltipText = isLightMode ? '#000' : '#fff';

  return (
    <div className="w-full space-y-12 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Radar Chart */}
        <div className="h-[300px] glass rounded-[32px] p-4 border border-white/5">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-center mb-4 opacity-50">Skill Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
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

        {/* Radial Bar Chart */}
        <div className="h-[300px] glass rounded-[32px] p-4 border border-white/5">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-center mb-4 opacity-50">Proficiency Levels</h3>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="10%" 
              outerRadius="80%" 
              barSize={10} 
              data={radialData}
            >
              <RadialBar
                label={{ position: 'insideStart', fill: tickColor, fontSize: 8 }}
                background
                dataKey="uv"
              />
              <Tooltip 
                contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px' }}
                itemStyle={{ color: tooltipText }}
              />
              <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '10px' }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Skill Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((skill, index) => (
          <motion.div 
            key={skill.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-end">
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest">{skill.name}</h4>
                {skill.description && (
                  <p className="text-[10px] text-slate-500 line-clamp-1">{skill.description}</p>
                )}
              </div>
              <span className="text-xs font-mono font-bold" style={{ color }}>{skill.proficiency}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${skill.proficiency}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SkillsChart;
