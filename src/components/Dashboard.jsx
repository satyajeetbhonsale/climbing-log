import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSessionsData } from '../lib/useSessionsData';
import { FRENCH_SPORT, FONT, COLOR } from '../lib/grades';
import { formatLabel } from '../lib/labels';

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

const SEND_TYPE_COLORS = {
  onsight: '#2a78d6',
  flash: '#eb6834',
  redpoint: '#1baf7a',
  attempt: '#eda100',
  fall: '#e34948',
};

const SEND_TYPE_ORDER = ['onsight', 'flash', 'redpoint', 'attempt', 'fall'];

const GRADE_ORDER = {
  french_sport: FRENCH_SPORT,
  font: FONT,
  color: COLOR,
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
    name: formatLabel(name),
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

const DISCIPLINE_ORDER = ['top-rope', 'lead', 'boulder'];
const SYSTEM_ORDER = ['font', 'color', 'french_sport'];

function buildPyramids(climbs) {
  const groups = {};
  for (const climb of climbs) {
    const { discipline, grade_system: gradeSystem, grade, send_type: sendType } = climb;
    if (!discipline || !gradeSystem || !grade) continue;

    const key = `${discipline}|${gradeSystem}`;
    if (!groups[key]) groups[key] = { discipline, gradeSystem, countsByGrade: {} };

    const counts = groups[key].countsByGrade[grade] ?? {};
    counts[sendType] = (counts[sendType] ?? 0) + 1;
    groups[key].countsByGrade[grade] = counts;
  }

  const systemsByDiscipline = {};
  for (const g of Object.values(groups)) {
    (systemsByDiscipline[g.discipline] ??= new Set()).add(g.gradeSystem);
  }

  return Object.values(groups)
    .sort((a, b) => {
      const disciplineDiff =
        DISCIPLINE_ORDER.indexOf(a.discipline) - DISCIPLINE_ORDER.indexOf(b.discipline);
      if (disciplineDiff !== 0) return disciplineDiff;
      return SYSTEM_ORDER.indexOf(a.gradeSystem) - SYSTEM_ORDER.indexOf(b.gradeSystem);
    })
    .map((g) => {
      const gradeOrder = GRADE_ORDER[g.gradeSystem] ?? [];
      const data = gradeOrder
        .filter((grade) => g.countsByGrade[grade])
        .map((grade) => ({ grade, ...g.countsByGrade[grade] }));

      const showSystem = systemsByDiscipline[g.discipline].size > 1;
      const title = showSystem
        ? `${formatLabel(g.discipline)} (${formatLabel(g.gradeSystem)})`
        : formatLabel(g.discipline);

      return { key: `${g.discipline}-${g.gradeSystem}`, title, data };
    });
}

function GradePyramidChart({ title, data }) {
  const presentSendTypes = useMemo(() => {
    const present = new Set();
    for (const row of data) {
      for (const key of Object.keys(row)) {
        if (key !== 'grade') present.add(key);
      }
    }
    return SEND_TYPE_ORDER.filter((s) => present.has(s));
  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barSize={24}>
          <CartesianGrid vertical={false} stroke="#e1e0d9" />
          <XAxis
            dataKey="grade"
            tick={{ fill: '#898781', fontSize: 12 }}
            axisLine={{ stroke: '#c3c2b7' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#898781', fontSize: 12 }}
            axisLine={{ stroke: '#c3c2b7' }}
            tickLine={false}
          />
          <Tooltip
            formatter={(value, name) => [`${value} climbs`, formatLabel(name)]}
            labelFormatter={(grade) => `Grade ${grade}`}
          />
          <Legend formatter={(value) => <span className="text-gray-600">{formatLabel(value)}</span>} />
          {presentSendTypes.map((sendType, index) => (
            <Bar
              key={sendType}
              dataKey={sendType}
              stackId="grade"
              fill={SEND_TYPE_COLORS[sendType]}
              radius={index === presentSendTypes.length - 1 ? [4, 4, 0, 0] : 0}
            />
          ))}
        </BarChart>
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
  const pyramids = useMemo(() => buildPyramids(climbs), [climbs]);

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

      {pyramids.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Grade pyramids</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pyramids.map((p) => (
              <GradePyramidChart key={p.key} title={p.title} data={p.data} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
