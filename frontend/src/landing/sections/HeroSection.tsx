import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import novaImage from '../../../public/assets/novaai.png';

export const HeroSection: React.FC = () => {
  return (
    <Section>
      <ContentColumn>
        <Title>
          The DeFi & DeSci Hub 
          for opBNB
        </Title>
        <Description>
          Trade, stake, and manage all your assets with AI powered DeFi & DeSci tools built for the opBNB ecosystem.
        </Description>
        <Link href="/home" passHref>
          <StartButton
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            Launch App
          </StartButton>
        </Link>
      </ContentColumn>
      <ImageColumn>
        <NovaImage 
          src={novaImage} 
          alt="Nova AI"
          priority
        />
      </ImageColumn>
    </Section>
  );
};

const Section = styled.section`
  max-width: 1200px;
  min-height: calc(100vh - 80px);
  margin: 0 auto;
  padding: 80px 24px 0;
  display: flex;
  align-items: center;
  gap: 48px;

  @media (max-width: 968px) {
    flex-direction: column;
    text-align: center;
    gap: 32px;
    padding-top: 40px;
  }
`;

const ContentColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  @media (max-width: 968px) {
    align-items: center;
  }
`;

const ImageColumn = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 64px;
  font-weight: 700;
  line-height: 1.1;
  color: #1d004f;
  margin-bottom: 24px;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 48px;
  }

  @media (max-width: 480px) {
    font-size: 40px;
  }
`;

const Description = styled.p`
  font-size: 20px;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 40px;
  max-width: 500px;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const StartButton = styled(motion.button)`
  background: #4F46E5;
  color: white;
  font-size: 18px;
  font-weight: 600;
  padding: 16px 32px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #4338CA;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 14px 28px;
  }
`;

const NovaImage = styled(Image)`
  width: 100%;
  height: auto;
  max-width: 400px;
  object-fit: contain;
`;
