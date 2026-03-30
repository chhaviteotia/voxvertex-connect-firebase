import { IconDocumentLines, IconChartWave, IconBrain } from '../icons/HowItWorksIcons'

const steps = [
  {
    Icon: IconDocumentLines,
    number: '01',
    title: 'Post Structured Requirement',
    description: 'Define event type, audience level, topic depth, and expected outcomes using our guided form.',
  },
  {
    Icon: IconChartWave,
    number: '02',
    title: 'Experts Submit Proposals',
    description: 'Qualified experts submit detailed proposals with session outlines, engagement plans, and outcomes.',
  },
  {
    Icon: IconBrain,
    number: '03',
    title: 'Review & Compare',
    description: 'Compare proposals side-by-side with scoring across topic fit, depth match, and engagement quality.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-16 px-6 text-center" id="how-it-works">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight mb-2">How It Works</h2>
      <p className="text-lg text-gray-600 mb-12">A structured process for better matches</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map(({ Icon, number, title, description }) => (
          <div key={number} className="flex flex-col items-center">
            <div className="mb-4">
              <Icon />
            </div>
            <span className="text-4xl font-bold text-blue-600 leading-none mb-3">{number}</span>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-[15px] leading-normal text-gray-600 max-w-[320px]">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
