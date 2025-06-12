
import { RegressionTable } from "@/components/RegressionTable";

const Index = () => {
  // You can pass a regressionId prop to load specific results
  // Example: const regressionId = new URLSearchParams(window.location.search).get('id');
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Statistical Analysis Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Connect to your Python backend to run and view regression analyses
          </p>
        </div>
        
        <RegressionTable />
      </div>
    </div>
  );
};

export default Index;
