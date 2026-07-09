import { TriangleAlert } from "lucide-react";

interface ErrorContainerProps {
  message: string;
}

const ErrorContainer = ({ message }: ErrorContainerProps) => {
  return (
    <div className="mt-5 md:mt-8">
      <div className="flex h-[400px] w-full flex-col items-center justify-center bg-white rounded-[10px]">
        <TriangleAlert className="text-red-500" />
        <h3 className="mt-2 text-black/70">{message}</h3>
      </div>
    </div>
  );
};

export default ErrorContainer;