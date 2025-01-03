import styled from '@emotion/styled';
import Image from 'next/image';
import Link from 'next/link';

import componentsImage from '@/assets/componentss.png';
import { NovaButton } from '@/components/NovaButton';
import { SpaceGroteskFont } from '@/styles/fonts';

export const StakingSection: React.FC = () => {
  return (
    <Wrapper>
      <Container>
        <Title>
          Complete <br />
          Management <br />
          of <strong>Staking</strong> <br />
          Products
        </Title>
        <Description>
          Manage assets, delegations, <br />
          and liquidity all in one place.
        </Description>

        <ButtonWrapper>
          <Link href="/account/0x56855Cc20f5A6745e88F5d357014a540AB081671">
            <NovaButton className="primary">Visit Demo Profile</NovaButton>
          </Link>
        </ButtonWrapper>

        <ComponentsImage src={componentsImage} alt="" placeholder="blur" />
      </Container>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  padding: 0 20px 160px;
  width: 100%;
  display: flex;
`;
const Container = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 1000px;
  padding: 40px 40px 150px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  border-radius: 16px;
  background: linear-gradient(180deg, #fffdec 0%, #84f 100%);
  gap: 18px;

  position: relative;
  z-index: 0;
`;
const Title = styled.h2`
  color: #1d004f;
  text-shadow: 0px 7.644px 31.213px #d4bcff;
  font-family: ${SpaceGroteskFont.style.fontFamily};
  font-size: 45.864px;
  font-style: normal;
  font-weight: 500;
  line-height: 105%; /* 48.157px */
  letter-spacing: -3.21px;
  text-transform: uppercase;
`;
const Description = styled.p`
  color: #7628ff;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 120%; /* 19.2px */
`;
const ButtonWrapper = styled.div`
  display: flex;
  position: relative;
`;

const ComponentsImage = styled(Image)`
  width: 716px;
  height: 587px;
  position: absolute;
  right: -88px;
  bottom: -96px;
  z-index: -1;
  object-fit: contain;
  
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    position: relative;
    right: 0;
    bottom: 0;
  }
`;
