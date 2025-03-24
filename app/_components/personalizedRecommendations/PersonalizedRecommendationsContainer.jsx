import React, {useState} from 'react'
import './personalizedRecommendations.css'
import { Container } from 'react-bootstrap'
import PRList from './PRList';
import InfoWizard from '../InfoWizard/InfoWizard';
import { landingPagePersonalizedRecommendations } from '@/lib/talkTrack';

const sections = [
  {
    id: 1,
    title: 'Because you bought X product',
    query: 'db.products.find({})'
  },
  {
    id: 2,
    title: 'Buy again',
    query: 'db.products.find({})'
  }

]
const PersonalizedRecommendationsContainer = () => {
    const [openHelpModal, setOpenHelpModal] = useState(false);

  return (
    <Container className='personalizedRecommendationsContainer'>
      <div className='d-flex flex-row-reverse w-100'>
      <InfoWizard
        open={openHelpModal}
        setOpen={setOpenHelpModal}
        tooltipText="Talk track!"
        iconGlyph="Wizard"
        sections={landingPagePersonalizedRecommendations}
        openModalIsButton={true}
      />
      </div>
      <PRList sections={sections} />
    </Container>
  )
}

export default PersonalizedRecommendationsContainer