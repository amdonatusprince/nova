import styled from '@emotion/styled';
import Image from 'next/image';

import diagramImage from '@/assets/diagram.png';

export const DiagramSection: React.FC = () => {
  return (
    <Section>
      <Container>
        <SectionHeader>
          <Title>We place liquidity & onchain info where needed</Title>
          <Description>
            Our infrastructure ensures optimal liquidity distribution and real-time data access across the network.
          </Description>
        </SectionHeader>
        <DiagramImage alt="" src={diagramImage} placeholder="blur" />
      </Container>
    </Section>
  );
};

const Section = styled.section`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 24px;
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
`;

const SectionHeader = styled.div`
  text-align: center;
  max-width: 680px;
`;

const Title = styled.h2`
  font-size: 42px;
  font-weight: 700;
  line-height: 1.2;
  color: #1d004f;
  margin-bottom: 16px;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const Description = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: #374151;
`;

const DiagramImage = styled(Image)`
  margin-right: auto;
  width: 100%;
  max-width: 844px;
`;
