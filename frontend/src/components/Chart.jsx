import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";

export default function Chart({ historical, simulatedPaths }) {
  if (!historical || historical.length === 0) return null;
const baseColors = [
  "#2C5AA0", 
  "#2CA97E", 
  "#a616caff", 
  "#E45B5B",
  "#8C6ADE", 
  "#E07B39", 
  "#D6619C", 
  "#28B3A7", 
  "#6673E0",
  "#0c1e6eff", 
]
  simulatedPaths = Array.isArray(simulatedPaths) ? simulatedPaths : [];
  const historicalLabels = historical.map((h) => h.open_time.split("T")[0]);
  const historicalData = historical.map((h) => h.close);
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
              { offset: 0, color: "rgba(96,165,250,0.3)" },
              { offset: 1, color: "rgba(96,165,250,0.05)" },
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
        name: `S${idx + 1}`,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 4,
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
          label: { backgroundColor: "#4B5563" },
        },
        backgroundColor: "#1f2937",
        textStyle: { color: "#E5E7EB", fontSize: 12 },
        borderWidth: 0,
      },
      legend: {
        top: 10,
        textStyle: { color: "#111827", fontSize: 12 },
        itemGap: 5,
      },
      grid: {
        top: 0,
        left: 0,
        bottom: 100,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: labels,
        axisLabel: {
          color: "#111827",
          rotate: -15,
          fontSize: 11,
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#111827", fontSize: 11 },
        splitLine: {
          show: true,
          lineStyle: { color: "#374151", type: "dashed" },
        },
      },
      dataZoom: [
        { type: "inside", throttle: 30 },
        {
          type: "slider",
          height: 20,
          bottom: 20,
          handleSize: 20,
          borderColor: "transparent",
          backgroundColor: "rgba(22, 38, 63, 0.87)",
          fillerColor: "rgba(133, 170, 222, 0.24)",
          handleColor: "#172e49ff",
        },
      ],
      series,
      animationDuration: 600,
      media: [
          {
              query: { maxWidth: 640 },
              option: {
                  legend: { top: 5, textStyle: { fontSize: 10 } },
                  grid: { top: 40, bottom: 30, left: 40, right: 20 },
              },
          },
          {
              query: { maxWidth: 1024 },
              option: {
                  legend: { top: 40,bottom:0,right:20, textStyle: { fontSize: 11 } },
              },
          },
      ]
    }),
    [labels, series]
  );

  return (
    <div className="w-full h-[65vh] sm:h-[70vh] md:h-[75vh] rounded-2xl bg-transparent p-2">
      <ReactECharts
        option={options}
        style={{ width: "100%", height: "100%" }}
        opts={{ renderer: "canvas" }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
}
