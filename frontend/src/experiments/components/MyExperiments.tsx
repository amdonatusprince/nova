import { useEffect, useState } from 'react';
import { Address } from 'viem';
import { usePublicClient } from 'wagmi';
import experiment from '../experiment.json'
import { Spinner } from '@/home/components/StakeCard';

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

const EXPERIMENTS_ADDRESS = '0x7032EA7efDe6cb37c558812D304d95Db9590D41E';

export const MyExperiments = ({ address }: MyExperimentsProps) => {
  const [userExperiments, setUserExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchUserExperiments = async () => {
      if (!publicClient || !address) return;

      try {
        // Get Transfer events for mints
        const events = await publicClient.getContractEvents({
          address: EXPERIMENTS_ADDRESS as `0x${string}`,
          abi: experiment,
          eventName: 'Transfer',
          args: {
            from: '0x0000000000000000000000000000000000000000'
          },
          fromBlock: 0n,
        });

        const fetchedExperiments = [];

        for (const event of events) {
          try {
            const tokenId = (event as any).args.tokenId;
            const tokenURI = (await publicClient.readContract({
              address: EXPERIMENTS_ADDRESS as `0x${string}`,
              abi: experiment,
              functionName: 'tokenURI',
              args: [tokenId],
            })) as string;

            try {
              const response = await fetch(`https://${tokenURI}`);
              const metadata = await response.json();
              
              // Only include experiments where researcher matches connected address
              if (metadata.researcher.toLowerCase() === address.toLowerCase()) {
                fetchedExperiments.push({
                  id: Number(tokenId),
                  ...metadata,
                });
              }
            } catch (fetchError) {
              console.log(`Skipping token ${tokenId} - Unable to fetch metadata:`, fetchError);
              continue; // Skip to next token
            }
          } catch (error) {
            console.log(`Skipping token ${(event as any).args.tokenId}:`, error);
            continue; // Skip to next token
          }
        }

        setUserExperiments(fetchedExperiments);
      } catch (error) {
        console.error('Error fetching user experiments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserExperiments();
  }, [publicClient, address]);

  if (!address) {
    return (
      <div className="text-center py-10">
        Please connect your wallet to view your experiments
      </div>
    );
  }

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-10 space-y-4">
      <Spinner className="w-8 h-8" />
      <p>Loading your experiments...</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {userExperiments.map((experiment) => (
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