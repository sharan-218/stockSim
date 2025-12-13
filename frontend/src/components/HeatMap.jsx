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
                const idx = day * buckets + bucketIndex;
                heatmap[idx][2] += 1;
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


    const showEvery = Math.max(1, Math.floor(yLabels.length / 7));

    const options = {
        tooltip: {
            formatter: (params) => {
                const [day, bucket, count] = params.data;
                return `
                    <strong>${xLabels[day]}</strong><br/>
                    Price Bucket: <b>${yLabels[bucket].toLocaleString()}</b><br/>
                    Hits: <b>${count}</b>
                `;
            }
        },

        animation: false,

        grid: {
            top: 20,
            left: 55,
            right: 20,
            bottom: 70,
            containLabel: true,
        },

        xAxis: {
            type: "category",
            data: xLabels,
            axisLabel: {
                rotate: 45,
                fontSize: 9,
                color: "#A6ADBB",
            }
        },

        yAxis: {
            type: "category",
            data: yLabels,
            axisLabel: {
                fontSize: 10,
                color: "#A6ADBB",
                formatter: (value, index) =>
                    index % showEvery === 0 ? value.toLocaleString() : "",
            },
        },

        visualMap: {
            min: 0,
            max: simulatedPaths.length,
            calculable: false,
            orient: "horizontal",
            left: "center",
            bottom: 0,
            textStyle: { color: "#A6ADBB" },
            inRange: {
                color: [
                    "#190B28",
                    "#3A1F5D",
                    "#4B3F9C",
                    "#3766D1",
                    "#2C9BEF",
                    "#00D4C5",
                    "#7CF9A6",
                    "#F6FF8E"
                ],
            },
        },

        series: [
            {
                type: "heatmap",
                data: heatmap,
                progressive: 5000,
            },
        ],
    };

    return (
        <div className="w-full">
            <ReactECharts
                option={options}
                style={{ width: "100%", height: "450px" }}
                notMerge={true}
                lazyUpdate={true}
                opts={{ renderer: "canvas" }}
            />
        </div>
    );
}
