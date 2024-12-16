import styled from '@emotion/styled';
import React, { useState } from 'react';

import { Notification } from '@/components/Notification';
import { DiagramSection } from './sections/DiagramSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { HeroSection } from './sections/HeroSection';
import { StakingSection } from './sections/StakingSection';

const LandingPage = () => {
  return (
    <>
      <Notification />
      <Container>
        <HeroSection />
        <FeaturesSection />
        <DiagramSection />
        <StakingSection />
      </Container>
      <style jsx global>{`
        html {
          background: #f1eef4;
        }
      `}</style>
    </>
  );
};

export default LandingPage;

const Container = styled.main`
  padding: 0 20px;
  width: 100%;
  max-width: 100vw;
  overflow: hidden;
  background: #f1eef4;

  display: flex;
  flex-direction: column;
  align-items: center;
`;
