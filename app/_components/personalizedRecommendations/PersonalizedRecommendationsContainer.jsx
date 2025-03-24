import React from 'react'
import './personalizedRecommendations.css'
import { Container } from 'react-bootstrap'
import PRList from './PRList';

const sections = [
    {
        id: 1,
        title: 'Because you bought X product'
    },
    {
        id: 2,
        title: 'Buy again'
    }

]
const PersonalizedRecommendationsContainer = () => {

  return (
    <Container className='personalizedRecommendationsContainer'>
        <PRList sections={sections}/>    
    </Container>
  )
}

export default PersonalizedRecommendationsContainer