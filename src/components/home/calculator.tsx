"use client"

import { useState } from "react"

export function Calculator() {
  const [price, setPrice] = useState(50000)
  const [sales, setSales] = useState(20)

  const revenue = price * sales
  const fee = revenue * 0.12
  const net = revenue - fee
  const annual = net * 12

  return (
    <div className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-3xl p-8 md:p-12">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Sliders */}
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-baseline mb-3">
              <label className="text-sm font-mono opacity-70">PRECIO DEL CURSO</label>
              <span className="font-display text-2xl tabular-nums">${price.toLocaleString("es-AR")}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="200000"
              step="5000"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-primary-foreground/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-primary-foreground [&::-webkit-slider-thumb]:cursor-grab"
              style={{ background: `linear-gradient(to right, rgba(11,15,13,0.6) ${((price - 10000) / 190000) * 100}%, rgba(11,15,13,0.2) ${((price - 10000) / 190000) * 100}%)` }}
            />
          </div>
          <div>
            <div className="flex justify-between items-baseline mb-3">
              <label className="text-sm font-mono opacity-70">VENTAS POR MES</label>
              <span className="font-display text-2xl tabular-nums">{sales}</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={sales}
              onChange={(e) => setSales(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-primary-foreground/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-primary-foreground [&::-webkit-slider-thumb]:cursor-grab"
              style={{ background: `linear-gradient(to right, rgba(11,15,13,0.6) ${((sales - 1) / 99) * 100}%, rgba(11,15,13,0.2) ${((sales - 1) / 99) * 100}%)` }}
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div>
            <div className="text-xs font-mono opacity-70 mb-1">FACTURACIÓN MENSUAL</div>
            <div className="font-display text-4xl tabular-nums">${revenue.toLocaleString("es-AR")}</div>
          </div>
          <div>
            <div className="text-xs font-mono opacity-70 mb-1">COMISIÓN ESQALA (12%)</div>
            <div className="font-display text-2xl tabular-nums opacity-70">-${fee.toLocaleString("es-AR")}</div>
          </div>
          <div className="border-t border-primary-foreground/20 pt-4">
            <div className="text-xs font-mono opacity-70 mb-1">GANANCIA NETA MENSUAL</div>
            <div className="font-display text-5xl tabular-nums">${net.toLocaleString("es-AR")}</div>
          </div>
          <div>
            <div className="text-xs font-mono opacity-70 mb-1">PROYECCIÓN ANUAL</div>
            <div className="font-display text-3xl tabular-nums">${annual.toLocaleString("es-AR")}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
