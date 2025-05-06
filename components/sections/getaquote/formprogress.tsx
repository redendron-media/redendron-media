interface FormProgressProps {
  currentStep: number
  totalSteps?: number
}

const stages = ['01. About You', '02. About Your Project', '03. About Your Budget']

export default function FormProgress({ currentStep }: FormProgressProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 sm:gap-2 mb-10 w-full">
      {stages.map((stage, index) => {
        const isActive = index + 1 === currentStep
        const isCompleted = index + 1 < currentStep

        return (
          <div
            key={stage}
            className="flex items-center w-full last:w-fit"
          >
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Dot shown only on lg and above */}
              <span
                className={`text-base lg:text-xs font-semibold uppercase whitespace-nowrap text-center ${
                  isActive ? 'text-black' : 'text-gray-400'
                }`}
              >
                {stage}
              </span>
            </div>

            {/* Connector line — stretch based on available space */}
            {index !== stages.length - 1 && (
              <div
                className={`hidden sm:block h-[2px] flex-1 mx-2 ${
                  index + 1 < currentStep ? 'bg-black' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
