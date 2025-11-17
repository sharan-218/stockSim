import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";

function convertToHeatmap(simulatedPaths, buckets = 40) {
    if (!simulatedPaths || simulatedPaths.length === 0)
        return { heatmap: [], xLabels: [], yLabels: [] };

    const maxLen = Math.max(...simulatedPaths.map((p) => p.length));
    const flat = simulatedPaths.flat();

    const min = Math.min(...flat);
    const max = Math.max(...flat);

    const bucketSize = (max - min) / buckets;

    const yLabels = Array.from({ length: buckets }, (_, i) =>
        Math.round(min + i * bucketSize)
    );

    const xLabels = Array.from({ length: maxLen }, (_, i) => `Day ${i + 1}`);

    const heatmap = Array.from({ length: maxLen * buckets }, (_, idx) => {
        const day = Math.floor(idx / buckets);
        const bucket = idx % buckets;
        return [day, bucket, 0];
    });

    simulatedPaths.forEach((path) => {
        path.forEach((value, day) => {
            const bucketIndex = Math.floor((value - min) / bucketSize);
            if (bucketIndex >= 0 && bucketIndex < buckets) {
                const index = day * buckets + bucketIndex;
                heatmap[index][2] += 1;
            }
        });
    });

    return { heatmap, xLabels, yLabels };
}

export default function HeatMap({ simulatedPaths, bucketCount = 40 }) {
    const { heatmap, xLabels, yLabels } = useMemo(
        () => convertToHeatmap(simulatedPaths, bucketCount),
        [simulatedPaths, bucketCount]
    );

    const options = {
        tooltip: { position: "top" },
        animation: false,

        grid: {
            top: 20,
            bottom: 70,
            left: 60,
            right: 20,
            containLabel: true,
        },

        xAxis: {
            type: "category",
            data: xLabels,
            axisLabel: { rotate: 45, fontSize: 9 },
            splitArea: { show: true },
        },

        yAxis: {
            type: "category",
            data: yLabels,
            axisLabel: {
                fontSize: 9,
                formatter: (v) => v.toLocaleString(),
            },
            splitArea: { show: true },
        },

        visualMap: {
            min: 0,
            max: simulatedPaths.length,
            calculable: true,
            orient: "horizontal",
            left: "center",
            bottom: 10,
            inRange: {
                color: [
                    '#30123b',
                    '#482878',
                    '#3e4ab8',
                    '#2c7ef7',
                    '#1ebef0',
                    '#38e5c6',
                    '#8ff7a8',
                    '#d8fd9b',
                    '#f9f871'
                ]
            }
        }
        ,

        series: [
            {
                type: "heatmap",
                data: heatmap,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 8,
                        shadowColor: "rgba(0,0,0,0.3)",
                    },
                },
            },
        ],
    };

    return (
        <div className="w-full h-[60vh] rounded-xl" >
            <ReactECharts option={options} style={{ width: "100%", height: "100%" }} />
        </div >
    );
}
