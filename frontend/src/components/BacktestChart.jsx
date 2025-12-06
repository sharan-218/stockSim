
import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

export default function BacktestChart({ returns }) {
    const [option, setOption] = useState({});

    useEffect(() => {
        if (!returns || returns.length === 0) return;

        const data = returns.map((v, i) => [i, v]);

        setOption({
            backgroundColor: "transparent",

            title: {
                text: "",
            },

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

            animationDuration: 200,
            animationEasing: "cubicOut",

            grid: {
                left: "20%",
                right: "0%",
                top: "6%",
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
                data: returns.map((_, i) => i),
                axisLabel: {
                    color: "var(--color-text-tertiary)",
                    fontSize: 10,
                },
                axisLine: {
                    lineStyle: { color: "var(--color-border-secondary)" },
                },
            },

            yAxis: {
                type: "value",
                axisLabel: {
                    color: "var(--color-text-tertiary)",
                },
                axisLine: {
                    lineStyle: { color: "var(--color-border-secondary)" },
                },
                splitLine: {
                    lineStyle: { color: "rgba(148,163,184,0.15)" },
                },
                scale: true,
            },

            series: [
                {
                    name: "Portfolio Equity",
                    type: "line",
                    data,
                    smooth: true,
                    showSymbol: false,
                    symbolSize: 4,
                    color: "#10b981",
                    lineStyle: {
                        width: 2.4,
                        shadowColor: "rgba(16,185,129,0.25)",
                        shadowBlur: 10,
                        shadowOffsetY: 5,
                    },
                    areaStyle: {
                        opacity: 0.25,
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: "rgba(16,185,129,0.35)" },
                            { offset: 1, color: "rgba(16,185,129,0.02)" },
                        ]),
                    },
                },
            ],
        });
    }, [returns]);

    return (
        <ReactECharts
            option={option}
            style={{ height: "420px", width: "100%" }}
            notMerge={true}
            lazyUpdate={true}
        />
    );
}
