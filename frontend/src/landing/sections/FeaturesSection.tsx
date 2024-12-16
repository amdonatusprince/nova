import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const FeaturesSection: React.FC = () => {
  return (
    <Section>
      <SectionHeader>
        <Overline>Features</Overline>
        <Title>Everything you need to succeed in DeFi</Title>
        <Description>
          Nova provides powerful tools for trading, staking, and managing your assets on opBNB.
        </Description>
      </SectionHeader>

      <Grid>
        <FeatureCard
          icon={<LiquidityIcon />}
          title="Concentrated Liquidity"
          description="Maximize your returns with capital-efficient liquidity pools and dynamic fee structures."
        />
        <FeatureCard
          icon={<StakingIcon />}
          title="One-Click Staking"
          description="Stake your opBNB tokens easily and earn rewards while supporting network security."
        />
        <FeatureCard
          icon={<AnalyticsIcon />}
          title="Real-Time Analytics"
          description="Track your portfolio performance with professional-grade analytics and insights."
        />
      </Grid>
    </Section>
  );
};

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <CardContainer
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
  >
    <IconWrapper>{icon}</IconWrapper>
    <CardTitle>{title}</CardTitle>
    <CardDescription>{description}</CardDescription>
  </CardContainer>
);

const Section = styled.section`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 24px;
`;

const SectionHeader = styled.div`
  text-align: center;
  max-width: 680px;
  margin: 0 auto 40px;
`;

const Overline = styled.div`
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #4F46E5;
  margin-bottom: 12px;
`;

const Title = styled.h2`
  font-size: 42px;
  font-weight: 700;
  line-height: 1.2;
  color: #1d004f;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const Description = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: #374151;
  font-weight: 400;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CardContainer = styled(motion.div)`
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  transition: all 0.2s ease;

  &:hover {
    border-color: #D1D5DB;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  margin-bottom: 16px;
  color: #4F46E5;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1d004f;
  margin-bottom: 8px;
`;

const CardDescription = styled.p`
  font-size: 16px;
  line-height: 1.5;
  color: #374151;
  font-weight: 400;
`;

// Simple SVG Icons
const LiquidityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
    <path d="M2 17L12 22L22 17" />
    <path d="M2 12L12 17L22 12" />
  </svg>
);

const StakingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L19 21L12 17L5 21L12 2Z" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 20V10" />
    <path d="M12 20V4" />
    <path d="M6 20V14" />
  </svg>
);
