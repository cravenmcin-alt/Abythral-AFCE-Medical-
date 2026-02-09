
import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { DomainMetric } from '../types';
import { COLORS } from '../constants';

interface Props {
  data: DomainMetric[];
}

const ConstraintRadar: React.FC<Props> = ({ data }) => {
  const chartData = data.map(d => ({
    subject: d.domain,
    A: d.flexibility,
    B: d.rigidity,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-[350px] bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">State-Space Flexibility Map</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke={COLORS.border} />
          <PolarAngleAxis dataKey="subject" stroke={COLORS.textMuted} fontSize={10} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Flexibility"
            dataKey="A"
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.5}
          />
          <Radar
            name="Rigidity"
            dataKey="B"
            stroke={COLORS.secondary}
            fill={COLORS.secondary}
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConstraintRadar;
