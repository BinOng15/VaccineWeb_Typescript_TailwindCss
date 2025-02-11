import React from "react";
import Lottie from "lottie-react";
import animationData from "../assets/48akEhxRhY.json";

interface LoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
}

const Loading: React.FC<LoadingProps> = ({ isLoading, children }) => {
  return (
    <div className={`relative overflow-auto ${isLoading ? "no-scroll" : ""}`}>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-100 z-50 pointer-events-none">
          <div style={{ marginLeft: "10%" }}>
            <Lottie
              animationData={animationData}
              style={{ height: 700, width: 700 }}
            />
          </div>
        </div>
      )}
      <div className={isLoading ? "pointer-events-none" : ""}>{children}</div>
    </div>
  );
};

export default Loading;
