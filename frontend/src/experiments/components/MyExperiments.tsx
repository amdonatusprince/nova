import { useEffect, useState } from 'react';
import { Address } from 'viem';
import { ExperimentsList } from './ExperimentsList';

interface MyExperimentsProps {
  address?: Address;
}

interface Experiment {
  id: number;
  name: string;
  description: string;
  image: string;
  researcher: string;
  paperLink: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

export const MyExperiments = ({ address }: MyExperimentsProps) => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyExperiments = async () => {
      if (!address) return;
      
      try {
        // TODO: Fetch experiments filtered by address
        // This will use the same contract calls as ExperimentsList
        // but filtered for the current user's address
        
      } catch (error) {
        console.error('Error fetching experiments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyExperiments();
  }, [address]);

  if (!address) {
    return (
      <div className="text-center py-10">
        Please connect your wallet to view your experiments
      </div>
    );
  }

  if (isLoading) return <div>Loading...</div>;

  if (experiments.length === 0) {
    return (
      <div className="text-center py-10">
        You haven't submitted any experiments yet
      </div>
    );
  }

  return <ExperimentsList experiments={experiments} />;
}; 