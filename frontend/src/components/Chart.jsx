import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { connect } from "echarts";

export default function Chart({ historical, simulatedPaths }) {
  if (!historical || historical.length === 0) return null;

  const baseColors = [
    "#3c7cdcff",
    "#2CA97E",
    "#a616caff",
    "#E45B5B",
    "#8C6ADE",
    "#E07B39",
    "#D6619C",
    "#28B3A7",
    "#6673E0",
    "#3658f0ff",
  ];

  simulatedPaths = Array.isArray(simulatedPaths) ? simulatedPaths : [];

  const historicalLabels = historical.map((h) => h.open_time.split("T")[0]);
  const historicalData = historical.map((h) => h.close);
  const allPrices = [
    ...historicalData,
    ...simulatedPaths.flat(),
  ].filter((v) => typeof v === "number" && !isNaN(v));

  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const padding = (maxPrice - minPrice) * 0.1;
  const dynamicMin = minPrice - padding;
  const dynamicMax = maxPrice + padding;

  const maxSimulatedLength = Math.max(
    0,
    ...simulatedPaths.map((path) => path.length)
  );

  const lastDate = new Date(historical[historical.length - 1].open_time);
  const futureLabels =
    maxSimulatedLength > 0
      ? Array.from({ length: maxSimulatedLength }, (_, i) => {
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + i + 1);
        return nextDate.toISOString().split("T")[0];
      })
      : [];
  const labels = [...historicalLabels, ...futureLabels];

  const series = useMemo(
    () => [
      {
        name: "Historical",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(128, 185, 255, 0.3)" },
              { offset: 1, color: "rgba(100, 170, 255, 0.05)" },
            ],
          },
        },
        lineStyle: { width: 3, color: baseColors[0] },
        itemStyle: { color: baseColors[0] },
        emphasis: {
          focus: "series",
          lineStyle: { width: 3 },
          itemStyle: { color: "#93C5FD" },
        },
        data: historicalData,
      },
      ...simulatedPaths.map((path, idx) => ({
        name: idx + 1,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 4,
        connectNulls: false,
        lineStyle: {
          width: 1.5,
          type: "dashed",
          color: baseColors[(idx + 1) % baseColors.length],
        },
        emphasis: {
          focus: "series",
          lineStyle: { width: 2 },
        },
        data: [
          ...new Array(historicalData.length - 1).fill(null),
          historicalData[historicalData.length - 1],
          ...path,
        ],
      })),
    ],
    [historicalData, simulatedPaths]
  );

  const options = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: { backgroundColor: "#0b2140ff" },
        },
        backgroundColor: "#1f2937",
        textStyle: { color: "#E5E7EB", fontSize: 12 },
        borderWidth: 0,
      },
      grid: {
        top: 20,
        left: window.innerWidth < 480 ? 5 : 5,
        right: 5,
        bottom: 60,
        containLabel: true,
      },


      xAxis: {
        type: "category",
        data: labels,
        axisLabel: {
          color: "#111827",
          fontSize: window.innerWidth < 480 ? 9 : 10,
          rotate: window.innerWidth < 480 ? -5 : -20,
          interval: "auto",
        },
        axisLine: { show: true },
        axisTick: { show: false },
      },

      yAxis: {
        type: "value",
        axisLabel: {
          color: "#111827",
          fontSize: window.innerWidth < 480 ? 9 : 11,
          formatter: (value) => value.toLocaleString(),
        },
        splitLine: {
          show: true,
          lineStyle: { color: "#D1D5DB", type: "dashed" },
        },
        min: dynamicMin,
        max: dynamicMax,
      },

      dataZoom: [
        { type: "inside", throttle: 30 },
        {
          type: "slider",
          height: window.innerWidth < 480 ? 12 : 20,
          bottom: window.innerWidth < 480 ? 5 : 20,
          handleSize: window.innerWidth < 480 ? 10 : 20,
          borderColor: "transparent",
          backgroundColor: "rgba(22,38,63,0.87)",
          fillerColor: "rgba(133,170,222,0.24)",
          handleColor: "#172e49ff",
        },
      ]
      ,

      series,
      animationDuration: 600,
    }),
    [labels, series, dynamicMin, dynamicMax]
  );

  return (
    <>
      <div className="w-full h-[65vh] sm:h-[70vh] md:h-[75vh] rounded-2xl bg-transparent p-2">
        <ReactECharts
          option={options}
          style={{ width: "100%", height: "100%" }}
          opts={{ renderer: "canvas" }}
          notMerge={true}
          lazyUpdate={true}
        />

      </div>


    </>
  );
}
