export const formatNumber = (value) => {
        if (window.innerWidth > 640) return value;
        if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(2) + "M";
        if (Math.abs(value) >= 1_000) return (value / 1_000) + "k";
        return value;
    };