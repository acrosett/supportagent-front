

export function calculateDigestCost(textSizeKb: any){
      const cost = textSizeKb * 0.01
      return Math.max(0, Number.isFinite(cost) ? parseFloat(cost.toFixed(2)) : 0)
}