'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group"
import { Slider } from "@/app/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog"

const BMI_CATEGORIES = [
  { min: 0, max: 18.5, color: '#3b82f6', label: 'Underweight' },
  { min: 18.5, max: 25, color: '#22c55e', label: 'Normal' },
  { min: 25, max: 30, color: '#eab308', label: 'Overweight' },
  { min: 30, max: 100, color: '#ef4444', label: 'Obese' },
]

interface BMIData {
  height: number;
  weight: number;
  bmi: number | null;
}

export default function Component() {
  const [heightInput, setHeightInput] = useState('')
  const [weightInput, setWeightInput] = useState('')
  const [heightUnit, setHeightUnit] = useState('cm')
  const [weightUnit, setWeightUnit] = useState('kg')
  const [bmiData, setBmiData] = useState<BMIData>({ height: 0, weight: 0, bmi: null })
  const [targetWeight, setTargetWeight] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const convertToMetric = useCallback((value: number, unit: string): number => {
    if (unit === 'cm' || unit === 'kg') return value;
    if (unit === 'in') return value * 2.54; // inches to cm
    if (unit === 'lb') return value * 0.453592; // lbs to kg
    return value;
  }, [])

  const calculateBMI = useCallback((height: number, weight: number): number | null => {
    const heightInMeters = height / 100;
    if (heightInMeters <= 0 || weight <= 0) return null;
    return weight / (heightInMeters * heightInMeters);
  }, [])

  const handleCalculate = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const height = convertToMetric(parseFloat(heightInput), heightUnit)
    const weight = convertToMetric(parseFloat(weightInput), weightUnit)
    const bmi = calculateBMI(height, weight)
    setBmiData({ height, weight, bmi })
    setTargetWeight(weight)
  }, [heightInput, weightInput, heightUnit, weightUnit, convertToMetric, calculateBMI])

  const getAssessment = (bmiValue: number) => {
    if (bmiValue < 18.5) return 'You are underweight. Consider gaining some weight.'
    if (bmiValue < 25) return 'Your weight is normal. Good job!'
    if (bmiValue < 30) return 'You are overweight. Consider losing some weight.'
    if (bmiValue > 35) return 'Bitch You Fat. Move Your Ass And Do Somthing About It.'
    
        }

  const handleWeightChange = (newWeight: number[]) => {
    setTargetWeight(newWeight[0])
  }

  const handleReset = () => {
    setHeightInput('')
    setWeightInput('')
    setBmiData({ height: 0, weight: 0, bmi: null })
    setTargetWeight(null)
    if (svgRef.current) {
      while (svgRef.current.firstChild) {
        svgRef.current.removeChild(svgRef.current.firstChild)
      }
    }
  }

  useEffect(() => {
    if (bmiData.bmi !== null && targetWeight !== null && svgRef.current) {
      const svg = svgRef.current
      const width = svg.clientWidth
      const height = 60
      const padding = 10

      // Clear previous content
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild)
      }

      // Draw BMI categories
      BMI_CATEGORIES.forEach(category => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        const startX = (category.min / 40) * (width - 2 * padding) + padding
        const endX = (Math.min(category.max, 40) / 40) * (width - 2 * padding) + padding
        rect.setAttribute('x', startX.toString())
        rect.setAttribute('y', '0')
        rect.setAttribute('width', (endX - startX).toString())
        rect.setAttribute('height', height.toString())
        rect.setAttribute('fill', category.color)
        svg.appendChild(rect)

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.setAttribute('x', ((startX + endX) / 2).toString())
        text.setAttribute('y', (height / 2).toString())
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('dominant-baseline', 'middle')
        text.setAttribute('fill', 'white')
        text.setAttribute('font-size', '12')
        text.textContent = category.label
        svg.appendChild(text)
      })

      // Draw current BMI marker
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      const markerX = (Math.min(bmiData.bmi, 40) / 40) * (width - 2 * padding) + padding
      marker.setAttribute('cx', markerX.toString())
      marker.setAttribute('cy', (height / 2).toString())
      marker.setAttribute('r', '5')
      marker.setAttribute('fill', 'black')
      svg.appendChild(marker)

      // Draw target BMI marker
      const targetBMI = calculateBMI(bmiData.height, targetWeight)
      if (targetBMI !== null) {
        const targetMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        const targetMarkerX = (Math.min(targetBMI, 40) / 40) * (width - 2 * padding) + padding
        targetMarker.setAttribute('cx', targetMarkerX.toString())
        targetMarker.setAttribute('cy', (height / 2).toString())
        targetMarker.setAttribute('r', '5')
        targetMarker.setAttribute('fill', 'white')
        targetMarker.setAttribute('stroke', 'black')
        targetMarker.setAttribute('stroke-width', '2')
        svg.appendChild(targetMarker)
      }
    }
  }, [bmiData, targetWeight, calculateBMI])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl text-center">Interactive BMI Calculator</CardTitle>
        <CardDescription className="text-center">Calculate your BMI and see how weight changes affect it.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Input
                id="height"
                type="number"
                placeholder={`Enter your height in ${heightUnit}`}
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                required
                className="flex-grow"
              />
              <RadioGroup 
                value={heightUnit} 
                onValueChange={setHeightUnit}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="cm" id="cm" />
                  <Label htmlFor="cm">cm</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="in" id="in" />
                  <Label htmlFor="in">in</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight</Label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Input
                id="weight"
                type="number"
                placeholder={`Enter your weight in ${weightUnit}`}
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                required
                className="flex-grow"
              />
              <RadioGroup 
                value={weightUnit} 
                onValueChange={setWeightUnit}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="kg" id="kg" />
                  <Label htmlFor="kg">kg</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="lb" id="lb" />
                  <Label htmlFor="lb">lb</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button type="submit" className="flex-grow">Calculate BMI</Button>
            <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
          </div>
        </form>
        {bmiData.bmi !== null && targetWeight !== null && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-secondary rounded-md">
              <p className="font-semibold text-center">Your BMI: {bmiData.bmi.toFixed(1)}</p>
              <p className="mt-2 text-center">{getAssessment(bmiData.bmi)}</p>
            </div>
            <div>
              <Label htmlFor="target-weight" className="block mb-2">Adjust target weight</Label>
              <Slider
                id="target-weight"
                min={Math.max(1, bmiData.weight - 50)}
                max={bmiData.weight + 50}
                step={0.1}
                value={[targetWeight]}
                onValueChange={handleWeightChange}
              />
            </div>
            <div className="overflow-x-auto">
              <svg ref={svgRef} width="100%" height="60" />
            </div>
            <div className="space-y-1 text-sm">
              <p>Target Weight: {targetWeight.toFixed(1)} {weightUnit}</p>
              <p>Target BMI: {calculateBMI(bmiData.height, targetWeight)?.toFixed(1)}</p>
              <p>Weight Difference: {(targetWeight - bmiData.weight).toFixed(1)} {weightUnit}</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Get Personalized Health Plan</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Upgrade to Premium</DialogTitle>
                  <DialogDescription>
                    Get a personalized health plan based on your BMI, including custom meal plans and exercise routines.
                  </DialogDescription>
                </DialogHeader>
                <Button className="w-full">Subscribe for $9.99/month</Button>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}