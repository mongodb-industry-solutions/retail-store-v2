import { FontSize } from '@leafygreen-ui/button'
import Card from '@leafygreen-ui/card'
import { H3 } from '@leafygreen-ui/typography'
import React from 'react'
import SectionHeader from './SectionHeader'

const NBAProcessLogs = () => {
  return (
    <Card className="mt-2">
        <div className='mb-2'>
            <H3 className={'text-center'} style={{fontSize:'20px'}}>Next Best Action Process</H3>
        </div>
      <SectionHeader
        title="Agent reasoning"
        learnMoreElement={
          <p className="m-0">Shows how the agent is processing information and making decisions in real time</p>
        }
      />
    <br></br>
    <SectionHeader
        title="Next Best Action decisions"
        learnMoreElement={
          <p className="m-0">The Next Best Action outputted by the agent</p>
        }
      />
    </Card>
  )
}

export default NBAProcessLogs