import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { NovaButton } from '@/components/NovaButton';
import { Spinner } from '@/home/components/StakeCard';
import { PinataSDK } from 'pinata-web3';
import { useWalletClient, useAccount, usePublicClient } from 'wagmi';
import experiment from '../experiment.json'

interface Attribute {
  trait_type: string;
  value: string;
}

interface ExperimentFormData {
  name: string;
  description: string;
  image: FileList;  
  paperLink: string;
  attributes: Attribute[];
}

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY!,
});

const EXPERIMENTS_ADDRESS = '0x7032EA7efDe6cb37c558812D304d95Db9590D41E';

export const ExperimentForm = () => {
  const { register, handleSubmit, reset } = useForm<ExperimentFormData>();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };

  const onSubmit = async (data: ExperimentFormData) => {
    const toastId = toast.loading('Uploading to IPFS...');
    setIsLoading(true);
    
    try {
      // 1. Upload image to IPFS
      const imageFile = data.image[0] as File;
      if (!imageFile) throw new Error('No image selected');

      const imageUpload = await pinata.upload.file(imageFile);
      const imageUrl = `https://teal-special-manatee-535.mypinata.cloud/ipfs/${imageUpload.IpfsHash}`;

      // 2. Create and upload metadata
      const metadata = {
        name: data.name,
        description: data.description,
        image: imageUrl,
        attributes: attributes,
        paperLink: data.paperLink,
        researcher: address
      };

      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' });

      const metadataUpload = await pinata.upload.file(metadataFile);
      const tokenUri = `teal-special-manatee-535.mypinata.cloud/ipfs/${metadataUpload.IpfsHash}`;

      // Mint NFT using walletClient
      if (!walletClient || !address) {
        throw new Error('Wallet not connected');
      }

      toast.loading('Minting your experiment NFT...', { id: toastId });
      
      const tx = await walletClient.writeContract({
        address: EXPERIMENTS_ADDRESS,
        abi: experiment,
        functionName: 'mint',
        args: [address, tokenUri],
      });

      toast.loading('Waiting for transaction confirmation...', { id: toastId });
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: tx });

      console.log('Transaction receipt:', receipt);
      toast.success('Experiment submitted and NFT minted successfully!', { id: toastId });

      // Reset form
      reset(); // React Hook Form's reset
      setAttributes([]); // Reset attributes
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit experiment', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Experiment Name
        </label>
        <input
          {...register('name')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Image
        </label>
        <input
          type="file"
          accept="image/*"
          {...register('image')}
          className="mt-1 block w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Research Paper Link
        </label>
        <input
          {...register('paperLink')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attributes
        </label>
        {attributes.map((attr, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              placeholder="Property"
              value={attr.trait_type}
              onChange={(e) => {
                const newAttrs = [...attributes];
                newAttrs[index].trait_type = e.target.value;
                setAttributes(newAttrs);
              }}
              className="w-1/2 rounded-md border border-gray-300 px-3 py-2"
            />
            <input
              placeholder="Value"
              value={attr.value}
              onChange={(e) => {
                const newAttrs = [...attributes];
                newAttrs[index].value = e.target.value;
                setAttributes(newAttrs);
              }}
              className="w-1/2 rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        ))}
        <NovaButton
          type="button"
          onClick={addAttribute}
          className="mt-2"
        >
          Add Attribute
        </NovaButton>
      </div>

      <NovaButton 
        type="submit" 
        className="w-full primary"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Spinner className="w-5 h-5" />
            <span>Submitting...</span>
          </div>
        ) : (
          'Submit Experiment'
        )}
      </NovaButton>
    </form>
  );
}; 