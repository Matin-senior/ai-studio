import React, { useEffect } from "react";
import Routes from "./Routes";

function App() {
  useEffect(() => {
    const preventDefaultForExternalFiles = (e) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault(); // جلوگیری از آپلود یا باز شدن فایل خارجی
      }
    };

    window.addEventListener("dragover", preventDefaultForExternalFiles);
    window.addEventListener("drop", preventDefaultForExternalFiles);

    return () => {
      window.removeEventListener("dragover", preventDefaultForExternalFiles);
      window.removeEventListener("drop", preventDefaultForExternalFiles);
    };
  }, []);

  return <Routes />;
}

export default App;
