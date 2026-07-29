import { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useSessionsData } from '../lib/useSessionsData';

// Fixed categorical order/colors from the validated palette — slot identity
// must stay stable across charts, never reassigned when a category is absent.
const DISCIPLINE_COLORS = {
  'top-rope': '#2a78d6',
  lead: '#eb6834',
  boulder: '#1baf7a',
};

const VENUE_COLORS = {
  indoor: '#2a78d6',
  outdoor: '#eb6834',
};

function countBy(climbs, key) {
  const counts = {};
  for (const climb of climbs) {
    const value = climb[key];
    if (!value) continue;
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

function toChartData(counts, colorMap) {
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    color: colorMap[name] ?? '#898781',
  }));
}

const RADIAN = Math.PI / 180;

// Text uses neutral ink, never the slice's own color — identity comes from
// the colored wedge + legend swatch, not from coloring the label text.
function renderSliceLabel({ cx, cy, midAngle, outerRadius, percent, name }) {
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#52514e"
      fontSize={12}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function ClimbPieChart({ title, data }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={renderSliceLabel}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} climbs`, name]} />
          <Legend formatter={(value) => <span className="text-gray-600">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard() {
  const { sessions, loading, error } = useSessionsData();

  const climbs = useMemo(() => {
    const all = [];
    for (const session of sessions) {
      for (const climb of session.climbs ?? []) {
        all.push({
          ...climb,
          discipline: session.discipline,
          venue_type: session.venue_type,
        });
      }
    }
    return all;
  }, [sessions]);

  const disciplineData = useMemo(
    () => toChartData(countBy(climbs, 'discipline'), DISCIPLINE_COLORS),
    [climbs]
  );
  const venueData = useMemo(
    () => toChartData(countBy(climbs, 'venue_type'), VENUE_COLORS),
    [climbs]
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      </div>
    );
  }

  if (climbs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
        <p className="text-gray-500">Log some sessions to see your stats!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ClimbPieChart title="Discipline split" data={disciplineData} />
        <ClimbPieChart title="Venue split" data={venueData} />
      </div>
    </div>
  );
}
