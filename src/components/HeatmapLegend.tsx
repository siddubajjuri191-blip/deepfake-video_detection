export default function HeatmapLegend() {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3">
      <span className="font-medium text-slate-400">Activation intensity:</span>
      <div className="flex items-center gap-1">
        <div className="w-20 h-3 rounded" style={{
          background: "linear-gradient(to right, #00f, #0ff, #0f0, #ff0, #f00)"
        }} />
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />
          Low
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-yellow-500 inline-block" />
          Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" />
          High
        </span>
      </div>
      <span className="ml-auto text-slate-600">Red regions = suspicious facial areas</span>
    </div>
  );
}
