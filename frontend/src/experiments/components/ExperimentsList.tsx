import { useEffect, useState } from 'react';
import { shortenAddress } from '@/utils/address';

interface Experiment {
  id: number;
  name: string;
  description: string;
  image: string;
  researcher: string;
  paperLink: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

interface ExperimentsListProps {
  experiments: Experiment[];
}

export const ExperimentsList: React.FC<ExperimentsListProps> = ({ experiments }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch experiments from contract
    setIsLoading(false);
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {experiments.map((experiment) => (
        <div 
          key={experiment.id} 
          className="bg-white rounded-xl p-6 space-y-4"
        >
          <img 
            src={experiment.image} 
            alt={experiment.name}
            className="w-full h-48 object-cover rounded-lg" 
          />
          <div>
            <h3 className="text-xl font-bold">{experiment.name}</h3>
            <p className="text-sm text-gray-600">
              by {shortenAddress(experiment.researcher)}
            </p>
          </div>
          <p className="text-gray-700">{experiment.description}</p>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Attributes:</h4>
            <div className="grid grid-cols-2 gap-2">
              {experiment.attributes.map((attr, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 p-2 rounded"
                >
                  <span className="font-medium">{attr.trait_type}:</span>{' '}
                  <span>{attr.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <a 
            href={experiment.paperLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5d00ff] hover:underline block"
          >
            View Research Paper →
          </a>
        </div>
      ))}
    </div>
  );
}; 