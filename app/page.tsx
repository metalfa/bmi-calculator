import InteractiveBMICalculator from '@/app/components/InteractiveBMICalculator'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <InteractiveBMICalculator />
    </main>
  )
}