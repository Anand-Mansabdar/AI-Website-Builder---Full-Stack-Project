import React from "react";
import { Loader2Icon } from "lucide-react";
const Loading = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2Icon className="animate-spin text-zinc-950" size={26} />
    </div>
  );
};

export default Loading;
