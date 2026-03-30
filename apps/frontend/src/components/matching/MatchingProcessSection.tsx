export function MatchingProcessSection() {
  return (
    <section className="bg-sky-50 py-16 px-6 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight mb-2">Structured Matching Process</h2>
      <p className="text-lg text-gray-600 mb-12">AI-assisted scoring combined with manual expert verification</p>
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 text-left items-start">
        <div className="bg-sky-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-5">
            <h3 className="text-lg font-bold text-gray-800 m-0">Proposal Scoring Breakdown</h3>
            <span className="shrink-0 bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded">Top Match</span>
          </div>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-10 rounded-full bg-slate-300 shrink-0" aria-hidden />
            <div>
              <span className="block text-base font-bold text-gray-800">Dr. Sarah Chen</span>
              <span className="block text-xs text-gray-500">AI & Machine Learning</span>
            </div>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Overall Match Score</span>
            <span className="text-base font-bold text-gray-800">91%</span>
          </div>
          <div className="h-2 bg-white/80 rounded-full overflow-hidden mb-5">
            <span className="block h-full bg-blue-600 rounded-full w-[91%]" />
          </div>
          <div className="flex flex-col gap-3 mb-5">
            {[
              { label: 'Topic Alignment', value: 94 },
              { label: 'Depth Match', value: 88 },
              { label: 'Outcome Alignment', value: 92 },
            ].map(({ label, value }) => (
              <div key={label} className="grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: '1fr auto', gridTemplateRows: 'auto auto' }}>
                <span className="text-xs text-gray-600">{label}</span>
                <span className="text-xs font-semibold text-gray-800 text-right">{value}%</span>
                <div className="h-1.5 bg-white/80 rounded-full overflow-hidden col-span-2">
                  <span className="block h-full bg-blue-600 rounded-full" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm leading-normal text-gray-600 m-0">
            Strong match based on L4 technical depth requirement and enterprise AI focus. Expert has delivered 12 similar sessions with 4.8/5.0 rating.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-2">Multi-Factor Scoring</h4>
            <p className="text-[15px] leading-normal text-gray-600 m-0">Every proposal is evaluated across topic relevance, technical depth capability, audience fit, engagement approach, and budget alignment.</p>
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-2">Manual Verification</h4>
            <p className="text-[15px] leading-normal text-gray-600 m-0">All experts are manually reviewed before joining. Profiles include verified credentials, past session evidence, and client feedback.</p>
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-2">Transparent Process</h4>
            <p className="text-[15px] leading-normal text-gray-600 m-0">View detailed scoring breakdowns and understand exactly why each expert is ranked. No hidden algorithms or black-box matching.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
