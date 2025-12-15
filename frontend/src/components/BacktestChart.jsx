
import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { formatNumber } from "../utils/formatter";
export default function BacktestChart({ returns }) {
    const [option, setOption] = useState({});
    const isSmall = window.innerWidth < 420;

    useEffect(() => {
        if (!returns || returns.length === 0) return;

        const data = returns.map((v, i) => [i, v]);
        const isSmall = window.innerWidth < 480;

        setOption({
            backgroundColor: "transparent",

            animationDuration: 400,
            animationEasing: "cubicOut",

            grid: {
                containLabel: true,
                left: isSmall ? "8%" : "4%",
                right: "3%",
                top: "14%",
                bottom: "6%",
            },

            tooltip: {
                trigger: "axis",
                confine: true,
                backgroundColor: "rgba(15,18,30,0.92)",
                borderColor: "rgba(255,255,255,0.08)",
                borderWidth: 1,
                padding: 12,
                textStyle: {
                    color: "#fff",
                    fontSize: 12,
                },

                axisPointer: {
                    type: "cross",
                    snap: true,
                    lineStyle: {
                        color: "rgba(16,185,129,0.75)",
                        width: 1.3,
                    },
                    crossStyle: {
                        color: "rgba(16,185,129,0.75)",
                    },
                    label: {
                        backgroundColor: "rgba(16,185,129,0.9)",
                        borderRadius: 4,
                        padding: [5, 8],
                        color: "#fff",
                        fontSize: 11,
                    },
                },
            },

            legend: {
                top: 0,
                left: "center",
                textStyle: {
                    color: "var(--color-text-primary)",
                    fontSize: 12,
                    fontWeight: 600,
                },
                itemStyle: {
                    borderRadius: 10,
                },
                icon: "circle",
                data: ["Portfolio Equity"],
            },

            dataZoom: [
                {
                    type: "inside",
                    zoomOnMouseWheel: true,
                    moveOnMouseMove: true,
                    moveOnMouseWheel: true,
                },
                {
                    type: "slider",
                    height: 22,
                    bottom: 0,
                    backgroundColor: "rgba(148,163,184,0.12)",
                    borderColor: "rgba(148,163,184,0.25)",
                    handleStyle: {
                        color: "rgba(16,185,129,0.9)",
                        shadowColor: "rgba(0,0,0,0.25)"
                    },
                    fillerColor: "rgba(16,185,129,0.2)",
                },
            ],

            xAxis: {
                type: "category",
                data: data.map(d => d[0]),
                boundaryGap: false,
                axisLabel: {
                    color: "var(--color-text-tertiary)",
                    fontSize: isSmall ? 8 : 10,
                    interval: "auto",
                    hideOverlap: true,
                },
                axisLine: {
                    lineStyle: { color: "var(--color-border-secondary)" },
                },
            },

            yAxis: {
                type: "value",
                axisLabel: {
                    color: "var(--color-text-tertiary)",
                    formatter: (v) => formatNumber(v),
                },
                splitLine: {
                    lineStyle: {
                        color: "rgba(148,163,184,0.12)",
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: "var(--color-border-secondary)",
                    },
                },
                scale: true,
            },

            series: [
                {
                    name: "Portfolio Equity",
                    type: "line",
                    data,
                    smooth: false,
                    showSymbol: false,
                    color: "#10b981",

                    lineStyle: {
                        width: 2,
                        shadowColor: "rgba(16,185,129,0.2)",
                        shadowBlur: 15,
                        shadowOffsetY: 6,
                    },
                    areaStyle: {
                        opacity: 0.21,
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: "rgba(16,185,129,0.32)" },
                            { offset: 0.5, color: "rgba(16,185,129,0.15)" },
                            { offset: 1, color: "rgba(16,185,129,0.02)" },
                        ]),
                    },
                    emphasis: {
                        focus: "series",
                        scale: true,
                        lineStyle: {
                            width: 2,
                            shadowBlur: 25,
                            shadowColor: "rgba(16, 185, 129, 0.14)",
                        },
                    },
                },
            ],
        });
    }, [returns]);

    return (
        <ReactECharts
            option={option}
            style={{ height: "650px", width: "100%" }}
            notMerge={true}
            lazyUpdate={true}

        />
    );
}
