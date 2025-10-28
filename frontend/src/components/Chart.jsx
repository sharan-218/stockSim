import React, { useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";

export default function Chart({ historical, simulatedPaths }) {
  if (!historical || historical.length === 0) return null;

  const baseColors = [
    "#60A5FA", "#34D399", "#FBBF24", "#F87171",
    "#A78BFA", "#FB923C", "#F472B6", "#2DD4BF",
    "#818CF8", "#FCD34D"
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
  const containerRef = useRef(null);
  const [chartHeight, setChartHeight] = useState(() => {
   
    if (typeof window === "undefined") return 500;
    const w = window.innerWidth;
    if (w < 420) return 280;      
    if (w < 768) return 340;       
    if (w < 1200) return 450;      
    return 560;                 
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const computeHeight = () => {
      const width = containerRef.current?.clientWidth ?? window.innerWidth;
      if (width < 420) return 280;
      if (width < 640) return 320;
      if (width < 900) return 420;
      if (width < 1200) return 520;
      return 640;
    };

    let ro;
    const setH = () => setChartHeight(computeHeight());

    try {
      if (containerRef.current && typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => setH());
        ro.observe(containerRef.current);
      } else {
        window.addEventListener("resize", setH);
      }
    } catch (e) {
      window.addEventListener("resize", setH);
    }

    setH();

    return () => {
      if (ro && containerRef.current) ro.disconnect();
      window.removeEventListener("resize", setH);
    };
  }, []);

  const options = {
    chart: {
      type: "line",
      height: chartHeight,
      background: "transparent",
      foreColor: "#A6ADBB",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, easing: "easeinout", speed: 500 },
    },
    stroke: {
      curve: "smooth",
      width: 1.5,
      dashArray: [0, ...simulatedPaths.map(() => 5)],
    },
    markers: {
      size: 3,
      hover: { size: 4 },
    },
    xaxis: {
      categories: labels,
      labels: {
        rotate: -15,
        style: { colors: "#A6ADBB", fontSize: chartHeight < 350 ? "9px" : "12px" },
        hideOverlappingLabels: true,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tickPlacement: "on",
    },
    yaxis: {
      labels: {
        formatter: (value) => parseFloat(value),
        style: { colors: "#A6ADBB", fontSize: chartHeight < 350 ? "9px" : "12px" },
      },
      tickAmount: chartHeight < 350 ? 4 : 6,
    },
    tooltip: {
      theme: "dark",
      shared: false,
      intersect: true,
      style: { fontSize: chartHeight < 350 ? "11px" : "13px", fontFamily: "Inter, sans-serif" },
    },
    legend: {
      position: chartHeight < 350 ? "bottom" : "top",
      horizontalAlign: chartHeight < 350 ? "center" : "left",
      fontSize: chartHeight < 350 ? "10px" : "12px",
      labels: { colors: "#D1D5DB", useSeriesColors: true },
    },
    grid: {
      borderColor: "#374151",
      strokeDashArray: 6,
      padding: {
        top: chartHeight < 350 ? 4 : 8,
        right: 6,
        bottom: chartHeight < 350 ? 2 : 8,
        left: chartHeight < 350 ? 2 : 8,
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: { height: chartHeight }, 
          xaxis: { labels: { show: false } }, 
        },
      },
    ],
  };

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl"
      style={{
        padding: chartHeight < 350 ? "6px" : "8px", 
        transition: "padding 200ms ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.cursor = "crosshair")}
      onMouseLeave={(e) => (e.currentTarget.style.cursor = "default")}
    >
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={chartHeight}
      />
    </div>
  );
}
