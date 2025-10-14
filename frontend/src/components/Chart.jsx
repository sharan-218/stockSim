import React from "react";
import ReactApexChart from "react-apexcharts";

export default function Chart({ historical, simulatedPaths }) {
  if (!historical || historical.length === 0) return null;

  // Dark mode vibrant colors
  const baseColors = [
    "#60A5FA", // blue-400
    "#34D399", // emerald-400
    "#FBBF24", // amber-400
    "#F87171", // red-400
    "#A78BFA", // violet-400
    "#FB923C", // orange-400
    "#F472B6", // pink-400
    "#2DD4BF", // teal-400
    "#818CF8", // indigo-400
    "#FCD34D"  // yellow-400
  ];

  simulatedPaths = Array.isArray(simulatedPaths) ? simulatedPaths : [];

  const historicalLabels = historical.map((h) => h.open_time.split("T")[0]);
  const lastDate = new Date(historical[historical.length - 1].open_time);

  const futureLength = simulatedPaths[0]?.length || 0;
  const futureLabels = Array.from({ length: futureLength }, (_, i) => {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i + 1);
    return nextDate.toISOString().split("T")[0];
  });

  const labels = [...historicalLabels, ...futureLabels];
  const historicalData = historical.map((h) => h.close);

  const series = [
    {
      name: "Historical",
      data: historicalData,
      color: baseColors[0],
    },
    ...simulatedPaths.map((path, idx) => ({
      name: `Simulated ${idx + 1}`,
      data: [historicalData[historicalData.length - 1], ...path],
      color: baseColors[(idx + 1) % baseColors.length],
    })),
  ];

  const options = {
    chart: {
      type: "line",
      height: 500,
      background: "transparent",
      foreColor: "#A6ADBB",
      toolbar: { show: true },
      zoom: { enabled: true },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 750,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
    },
    stroke: {
      curve: "smooth",
      width: 1.5,
      dashArray: [0, ...simulatedPaths.map(() => 5)],
    },
    markers: {
      size: 3,
      hover: { size: 2.5 },
    },
    xaxis: {
      categories: labels,
      labels: { 
        rotate: -15, 
        style: { 
          colors: "#A6ADBB", 
          fontSize: "12px" 
        } 
      },
      axisBorder: { show: true, color: "#374151" },
      axisTicks: { show: true, color: "#374151" },
      crosshairs: { show: true, stroke: { color: "#4B5563" } },
    },
    yaxis: {
      labels: { 
        style: { 
          colors: "#A6ADBB", 
          fontSize: "12px" 
        } 
      },
      axisBorder: { show: true, color: "#374151" },
      axisTicks: { show: true, color: "#374151" },
    },
    tooltip: {
      theme: "dark",
      shared: false,
      intersect: true,
      x: { format: "yyyy-MM-dd" },
      y: {
        formatter: (val) => val.toFixed(2),
      },
      marker: { show: true },
      style: { fontSize: "13px", fontFamily: "Inter, sans-serif" },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: { 
        colors: "#D1D5DB", 
        useSeriesColors: true 
      },
    },
    grid: {
      borderColor: "#374151",
      strokeDashArray: 10,
      xaxis: {
        lines: { show: false }
      },
      yaxis: {
        lines: { show: true }
      },
      row: { 
        colors: ["#1F2937", "transparent"], 
        opacity: 0.5 
      },
      column: { 
        colors: ["transparent"], 
        opacity: 0.5 
      },
    },
  };

  return (
    <div
      className="p-4 rounded-2xl"
      onMouseEnter={(e) => (e.currentTarget.style.cursor = "crosshair")}
      onMouseLeave={(e) => (e.currentTarget.style.cursor = "default")}
    >
      <ReactApexChart options={options} series={series} type="line" height={500} />
    </div>
  );
}