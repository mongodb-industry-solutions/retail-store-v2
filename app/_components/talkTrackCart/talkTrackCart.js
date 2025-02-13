import { useState } from "react";
import InfoWizard from '../InfoWizard/InfoWizard'
import { cartPage } from "@/lib/talkTrack";

const TalkTrackCart = () => {
    const [openHelpModal, setOpenHelpModal] = useState(false);

    return (
        <div className='w-100 d-flex flex-row-reverse pt-5'>
            <InfoWizard
                open={openHelpModal}
                setOpen={setOpenHelpModal}
                tooltipText="Talk track!"
                iconGlyph="Wizard"
                sections={cartPage}
                openModalIsButton={true}
            />
        </div>
    )
}

export default TalkTrackCart