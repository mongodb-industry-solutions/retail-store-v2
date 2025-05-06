import React, { useState } from 'react'
import { H3 } from '@leafygreen-ui/typography';
import InfoWizard from '../InfoWizard/InfoWizard';
import PRCard from './PRCard';

const PRList = (props) => {
    const { sections } = props
    const [openHelpModal, setOpenHelpModal] = useState(false);

    return (
        <div className='PRList'>
            {
                sections.map(section => (
                    <div className='mb-4' key={section.id}>
                        <div className='d-flex mb-2'>
                            <H3 className="me-2">{section.title}</H3>
                            {
                                section.addModal &&
                                <InfoWizard
                                    open={openHelpModal}
                                    setOpen={setOpenHelpModal}
                                    tooltipText="Learn more"
                                    iconGlyph="Wizard"
                                    tabs={section.modalContentTabs}
                                    openModalIsButton={false}
                                />
                            }
                        </div>
                        <div className='scroll-container'>
                            <div className='scroll-content'>
                                {
                                    section.items.length > 0
                                        ? section.items.map((product, i) => (
                                            <PRCard key={i} product={{_id: product.productId, ...product} } />
                                        ))
                                        : 'Loading recommendations... (feature under development)'
                                }
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default PRList