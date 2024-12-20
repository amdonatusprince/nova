import { NextPage } from 'next';
import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { useAccount } from 'wagmi';
import { Notification } from '@/components/Notification';
import { ExperimentForm } from './components/ExperimentForm';
import { ExperimentsList } from './components/ExperimentsList';
import { MyExperiments } from './components/MyExperiments';
import { Toaster } from 'react-hot-toast';

const ExperimentsPage: NextPage = () => {
  const { address } = useAccount();

  return (
    <>
      <Toaster position="bottom-right" />
      <Notification />
      <main className="mt-[100px] flex flex-col w-full max-w-[1000px] mx-auto px-4">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-white p-1 mb-4">
            <Tab className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected 
                ? 'bg-[#5d00ff] text-white'
                : 'text-gray-700 hover:bg-gray-100'}`
            }>
              Submit Experiment
            </Tab>
            <Tab className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected 
                ? 'bg-[#5d00ff] text-white'
                : 'text-gray-700 hover:bg-gray-100'}`
            }>
              All Experiments
            </Tab>
            <Tab className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected 
                ? 'bg-[#5d00ff] text-white'
                : 'text-gray-700 hover:bg-gray-100'}`
            }>
              My Experiments
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <ExperimentForm />
            </Tab.Panel>
            <Tab.Panel>
              <ExperimentsList experiments={[]} />
            </Tab.Panel>
            <Tab.Panel>
              <MyExperiments address={address} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </main>

      <style global jsx>{`
        html {
          background: #f1eef4;
        }
      `}</style>
    </>
  );
};

export default ExperimentsPage;
