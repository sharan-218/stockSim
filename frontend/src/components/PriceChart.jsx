import React from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { formatNumber } from "../utils/formatter";

export default function PriceChart({ closes, indicators = {} }) {
    const isSmall = window.innerWidth < 420;

    const indicatorKeys = Object.keys(indicators || {});

    const colorPalette = [
        "#f59e0b",
        "#10b981",
        "#ef4444",
        "#8b5cf6",
        "#14b8a6",
        "#b60027ff",
        "#6366f1",
    ];

    const priceMin = Math.min(...closes);
    const priceMax = Math.max(...closes);
    const priceRange = Math.max(priceMax - priceMin, 1);


    const dynamicSeries = indicatorKeys.map((key, index) => {
        const raw = indicators[key] ?? [];

        const indMin = Math.min(...raw);
        const indMax = Math.max(...raw);
        const indRange = Math.max(indMax - indMin, 0.0001);

        const scaleFactor = (priceRange / indRange) * 0.6;

        const scaledData = raw.map((v) =>
            v === null || v === undefined ? null : (v - indMin) * scaleFactor + priceMin
        );

        return {
            name: key.toUpperCase(),
            type: "line",
            data: scaledData,
            smooth: false,
            showSymbol: false,
            color: colorPalette[index % colorPalette.length],
            lineStyle: { width: 1 },
            animationDuration: 200,
        };
    });

    const option = {
        backgroundColor: "transparent",

        tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(30, 41, 59, 0.85)",
            borderColor: "rgba(255,255,255,0.1)",
            textStyle: { color: "#fff" },
            axisPointer: {
                type: "cross",
                label: { backgroundColor: "rgba(15,23,42,0.9)" },
            },
        },

        legend: {
            data: ["CLOSE", ...indicatorKeys.map((k) => k.toUpperCase())],
            top: 0,
            textStyle: { color: "#000", fontSize: 11 },
        },

        grid: {
            containLabel: true,
            left: isSmall ? 10 : 15,
            right: 10,
            top: "14%",
            bottom: "6%",
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
            data: closes.map((_, i) => i),
            axisLine: { lineStyle: { color: "var(--color-border-secondary)" } },
            axisLabel: { color: "var(--color-text-tertiary)", fontSize: 10 },
        },

        yAxis: {
            type: "value",
            axisLine: { lineStyle: { color: "var(--color-border-secondary)" } },
            axisLabel: {
                color: "var(--color-text-tertiary)",
                formatter: (v) => formatNumber(v),
            },
            splitLine: {
                lineStyle: { color: "rgba(148,163,184,0.15)" },
            },
            scale: true,
        },

        series: [
            {
                name: "CLOSE",
                type: "line",
                data: closes,
                smooth: true,
                showSymbol: false,
                color: "#2563eb",
                lineStyle: { width: 2 },
                areaStyle: {
                    opacity: 0.21,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "rgba(37,99,235,0.32)" },
                        { offset: 1, color: "rgba(37,99,235,0.03)" },
                    ]),
                },
                animationDuration: 200,
            },

            ...dynamicSeries,
        ],
    };

    return (
        <ReactECharts
            option={option}
            style={{ height: "650px", width: "100%" }}
            notMerge={true}
            lazyUpdate={true}
        />
    );
}
