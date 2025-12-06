// src/components/PriceChart.jsx
import React from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

export default function PriceChart({ closes, sma }) {
    const option = {
        backgroundColor: "transparent",

        tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(30, 41, 59, 0.85)",
            borderColor: "rgba(255,255,255,0.1)",
            textStyle: { color: "#fff" },
            axisPointer: {
                type: "cross",
                label: {
                    backgroundColor: "rgba(15,23,42,0.9)",
                },
            },
        },

        legend: {
            data: ["Close", "SMA"],
            top: 0,
            textStyle: { color: "var( --color-text-primary)", fontSize: 11 },
        },

        grid: {
            left: "20%",
            right: "0%",
            top: "14%",
            bottom: "16%",
        },

        dataZoom: [
            { type: "inside" },
            {
                type: "slider",
                height: 25,
                bottom: 0,
                borderColor: "rgba(148,163,184,0.3)",
                handleStyle: { color: "rgba(15,23,42,0.8)" },
            },
        ],

        xAxis: {
            type: "category",
            autoScale: true,
            data: closes?.map((_, i) => i) ?? [],
            axisLine: { lineStyle: { color: "var(--color-border-secondary)" } },
            axisLabel: { color: "var(--color-text-tertiary)", fontSize: 10 },
        },

        yAxis: {
            type: "value",
            axisLine: { lineStyle: { color: "var(--color-border-secondary)" } },
            axisLabel: { color: "var(--color-text-tertiary)" },
            splitLine: {
                lineStyle: { color: "rgba(148,163,184,0.15)" },
            },
            scale: true,
        },

        series: [
            {
                name: "Close",
                type: "line",
                data: closes ?? [],
                smooth: true,
                connectNulls: false,
                showSymbol: false,
                color: "#2563eb",
                lineStyle: {
                    width: 2.2,
                },
                areaStyle: {
                    opacity: 0.25,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "rgba(37,99,235,0.32)" },
                        { offset: 1, color: "rgba(37,99,235,0.03)" },
                    ]),
                },
                animationDuration: 200,
            },
            {
                name: "SMA",
                type: "line",
                data: sma ?? [],
                smooth: true,
                showSymbol: false,
                color: "#f59e0b",
                lineStyle: {
                    width: 2,
                    type: "dashed",
                },
                animationDuration: 200,
            },
        ],
    };

    return (
        <ReactECharts
            option={option}
            style={{ height: "420px", width: "100%" }}
            notMerge={true}
            lazyUpdate={true}
        />
    );
}
