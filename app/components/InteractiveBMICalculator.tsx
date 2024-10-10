'use client'

import { useState, useEffect, useRef } from 'react'
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

export default function InteractiveBMICalculator() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [heightUnit, setHeightUnit] = useState('cm')
  const [weightUnit, setWeightUnit] = useState('kg')
  const [bmi, setBMI] = useState<number | null>(null)
  const [targetWeight, setTargetWeight] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const calculateBMI = (heightVal: number, weightVal: number) => {
    let heightInMeters: number
    let weightInKg: number

    if (heightUnit === 'cm') {
      heightInMeters = heightVal / 100
    } else {
      heightInMeters = heightVal * 0.0254 // Convert inches to meters
    }

    if (weightUnit === 'kg') {
      weightInKg = weightVal
    } else {
      weightInKg = weightVal * 0.453592 // Convert lbs to kg
    }
    
    if (heightInMeters <= 0 || weightInKg <= 0) {
      return null
    }

    return weightInKg / (heightInMeters * heightInMeters)
  }

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    const calculatedBMI = calculateBMI(parseFloat(height), parseFloat(weight))
    setBMI(calculatedBMI)
    setTargetWeight(parseFloat(weight))
  }

  const getAssessment = (bmiValue: number) => {
    if (bmiValue < 18.5) {
      return 'You are underweight. Consider gaining some weight.'
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      return 'Your weight is normal. Good job!'
    } else if (bmiValue >= 25 && bmiValue < 30) {
      return 'You are overweight. Consider losing some weight.'
    } else {
      return 'You are obese. It\'s recommended to consult with a healthcare professional.'
    }
  }

  const handleWeightChange = (newWeight: number) => {
    setTargetWeight(newWeight)
  }

  const handleReset = () => {
    setHeight('')
    setWeight('')
    setBMI(null)
    setTargetWeight(null)
    if (svgRef.current) {
      while (svgRef.current.firstChild) {
        svgRef.current.removeChild(svgRef.current.firstChild)
      }
    }
  }

  useEffect(() => {
    if (bmi !== null && targetWeight !== null && svgRef.current) {
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
      const markerX = (Math.min(bmi, 40) / 40) * (width - 2 * padding) + padding
      marker.setAttribute('cx', markerX.toString())
      marker.setAttribute('cy', (height / 2).toString())
      marker.setAttribute('r', '5')
      marker.setAttribute('fill', 'black')
      svg.appendChild(marker)

      // Draw target BMI marker
      const targetBMI = calculateBMI(parseFloat(height), targetWeight)
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
  }, [bmi, targetWeight, height, heightUnit, weightUnit])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Interactive BMI Calculator</CardTitle>
        <CardDescription>Calculate your BMI and see how weight changes affect it.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <div className="flex space-x-2">
              <Input
                id="height"
                type="number"
                placeholder={`Enter your height in ${heightUnit}`}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
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
            <div className="flex space-x-2">
              <Input
                id="weight"
                type="number"
                placeholder={`Enter your weight in ${weightUnit}`}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
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
          <div className="flex space-x-2">
            <Button type="submit" className="flex-grow">Calculate BMI</Button>
            <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
          </div>
        </form>
        {bmi !== null && targetWeight !== null && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-secondary rounded-md">
              <p className="font-semibold">Your BMI: {bmi.toFixed(1)}</p>
              <p className="mt-2">{getAssessment(bmi)}</p>
            </div>
            <div>
              <Label htmlFor="target-weight">Adjust target weight</Label>
              <Slider
                id="target-weight"
                min={Math.max(1, parseFloat(weight) - 50)}
                max={parseFloat(weight) + 50}
                step={0.1}
                value={[targetWeight]}
                onValueChange={(value) => handleWeightChange(value[0])}
              />
            </div>
            <div>
              <svg ref={svgRef} width="100%" height="60" />
            </div>
            <div>
              <p>Target Weight: {targetWeight.toFixed(1)} {weightUnit}</p>
              <p>Target BMI: {calculateBMI(parseFloat(height), targetWeight)?.toFixed(1)}</p>
              <p>Weight Difference: {(targetWeight - parseFloat(weight)).toFixed(1)} {weightUnit}</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Get Personalized Health Plan</Button>
              </DialogTrigger>
              <DialogContent>
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