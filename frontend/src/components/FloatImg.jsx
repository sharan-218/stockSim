import React from "react";

export default function FloatImgBg({ imgSrc, alt }) {
    return (
        <div
            className="absolute inset-0 pointer-events-none overflow-visible 
        "
        >
            <img
                src={imgSrc}
                alt={alt}
                className="
                absolute right-[10%] top-[30%] w-[300px]  sm:w-[460px] md:w-[550px] lg:w-[650px]  xl:w-[900px] opacity-[0.91] animate-float
                blur-[10px]  
            "
            />
        </div>
    );
}
