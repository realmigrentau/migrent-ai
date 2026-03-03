import { useState, useMemo } from "react";

interface CalculatorInputs {
  rooms: number;
  weeklyRate: number;
  occupancy: number;
}

interface CalculatorOutputs {
  monthlyRevenue: number;
  migrentFee: number;
  annualRevenue: number;
  annualTakeHome: number;
  monthlyTakeHome: number;
}

export function useCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    rooms: 4,
    weeklyRate: 500,
    occupancy: 90,
  });

  const outputs = useMemo<CalculatorOutputs>(() => {
    const weeksPerMonth = 4.33;
    const monthlyRevenue = inputs.rooms * inputs.weeklyRate * weeksPerMonth * (inputs.occupancy / 100);
    const migrentFee = inputs.rooms * 99;
    const annualRevenue = monthlyRevenue * 12;
    const annualTakeHome = annualRevenue - migrentFee;
    const monthlyTakeHome = annualTakeHome / 12;

    return {
      monthlyRevenue: Math.round(monthlyRevenue),
      migrentFee,
      annualRevenue: Math.round(annualRevenue),
      annualTakeHome: Math.round(annualTakeHome),
      monthlyTakeHome: Math.round(monthlyTakeHome),
    };
  }, [inputs]);

  const updateInput = (key: keyof CalculatorInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return { inputs, outputs, updateInput };
}
